"""
Ticket/Bug Tracking System API Routes
Handles ticket CRUD operations, comments, and CSV export
"""

from fastapi import APIRouter, HTTPException, Query, UploadFile, File
from fastapi.responses import FileResponse, StreamingResponse
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import sqlite3
import csv
import io
import os
import shutil
import zipfile
from pathlib import Path

router = APIRouter(prefix="/api/tickets", tags=["Tickets"])

DB_PATH = "iodd_manager.db"
ATTACHMENTS_DIR = Path("ticket_attachments")

# Ensure attachments directory exists
ATTACHMENTS_DIR.mkdir(exist_ok=True)


# Pydantic models for request/response
class TicketCreate(BaseModel):
    device_type: str  # 'EDS' or 'IODD'
    device_id: Optional[int] = None
    device_name: Optional[str] = None
    vendor_name: Optional[str] = None
    product_code: Optional[int] = None
    title: str
    description: Optional[str] = None
    eds_reference: Optional[str] = None
    priority: str = "medium"  # low, medium, high, critical
    category: Optional[str] = None


class TicketUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    eds_reference: Optional[str] = None
    status: Optional[str] = None  # open, in_progress, resolved, closed, wont_fix
    priority: Optional[str] = None
    category: Optional[str] = None
    assigned_to: Optional[str] = None


class CommentCreate(BaseModel):
    comment_text: str
    created_by: Optional[str] = None


def generate_ticket_number(conn):
    """Generate a unique ticket number like TICKET-0001"""
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM tickets")
    count = cursor.fetchone()[0]
    return f"TICKET-{str(count + 1).zfill(4)}"


def get_ticket_with_details(conn, ticket_id: int):
    """Get ticket with all comments and attachments"""
    cursor = conn.cursor()

    # Get ticket
    cursor.execute("""
        SELECT id, ticket_number, device_type, device_id, device_name, vendor_name,
               product_code, title, description, eds_reference, status, priority,
               category, created_at, updated_at, resolved_at, created_by, assigned_to
        FROM tickets
        WHERE id = ?
    """, (ticket_id,))

    ticket = cursor.fetchone()
    if not ticket:
        return None

    # Get comments
    cursor.execute("""
        SELECT id, comment_text, created_at, created_by
        FROM ticket_comments
        WHERE ticket_id = ?
        ORDER BY created_at ASC
    """, (ticket_id,))

    comments = cursor.fetchall()

    # Get attachments
    cursor.execute("""
        SELECT id, filename, file_size, content_type, uploaded_at
        FROM ticket_attachments
        WHERE ticket_id = ?
        ORDER BY uploaded_at DESC
    """, (ticket_id,))

    attachments = cursor.fetchall()

    return {
        'id': ticket[0],
        'ticket_number': ticket[1],
        'device_type': ticket[2],
        'device_id': ticket[3],
        'device_name': ticket[4],
        'vendor_name': ticket[5],
        'product_code': ticket[6],
        'title': ticket[7],
        'description': ticket[8],
        'eds_reference': ticket[9],
        'status': ticket[10],
        'priority': ticket[11],
        'category': ticket[12],
        'created_at': ticket[13],
        'updated_at': ticket[14],
        'resolved_at': ticket[15],
        'created_by': ticket[16],
        'assigned_to': ticket[17],
        'comments': [
            {
                'id': c[0],
                'comment_text': c[1],
                'created_at': c[2],
                'created_by': c[3]
            } for c in comments
        ],
        'attachments': [
            {
                'id': a[0],
                'filename': a[1],
                'file_size': a[2],
                'content_type': a[3],
                'uploaded_at': a[4]
            } for a in attachments
        ]
    }


@router.get("")
async def list_tickets(
    status: Optional[str] = Query(None, description="Filter by status"),
    priority: Optional[str] = Query(None, description="Filter by priority"),
    device_type: Optional[str] = Query(None, description="Filter by device type (EDS/IODD)"),
    category: Optional[str] = Query(None, description="Filter by category"),
):
    """List all tickets with optional filters"""
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA foreign_keys = ON")
    cursor = conn.cursor()

    query = """
        SELECT id, ticket_number, device_type, device_id, device_name, vendor_name,
               product_code, title, description, eds_reference, status, priority,
               category, created_at, updated_at, resolved_at, created_by, assigned_to
        FROM tickets
        WHERE 1=1
    """
    params = []

    if status:
        query += " AND status = ?"
        params.append(status)

    if priority:
        query += " AND priority = ?"
        params.append(priority)

    if device_type:
        query += " AND device_type = ?"
        params.append(device_type)

    if category:
        query += " AND category = ?"
        params.append(category)

    query += " ORDER BY created_at DESC"

    cursor.execute(query, params)
    tickets = cursor.fetchall()
    conn.close()

    return [
        {
            'id': t[0],
            'ticket_number': t[1],
            'device_type': t[2],
            'device_id': t[3],
            'device_name': t[4],
            'vendor_name': t[5],
            'product_code': t[6],
            'title': t[7],
            'description': t[8],
            'eds_reference': t[9],
            'status': t[10],
            'priority': t[11],
            'category': t[12],
            'created_at': t[13],
            'updated_at': t[14],
            'resolved_at': t[15],
            'created_by': t[16],
            'assigned_to': t[17],
        } for t in tickets
    ]


@router.get("/{ticket_id}")
async def get_ticket(ticket_id: int):
    """Get a single ticket with all comments"""
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA foreign_keys = ON")

    ticket = get_ticket_with_details(conn, ticket_id)
    conn.close()

    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    return ticket


@router.post("")
async def create_ticket(ticket: TicketCreate):
    """Create a new ticket"""
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA foreign_keys = ON")
    cursor = conn.cursor()

    now = datetime.now().isoformat()
    ticket_number = generate_ticket_number(conn)

    cursor.execute("""
        INSERT INTO tickets (
            ticket_number, device_type, device_id, device_name, vendor_name,
            product_code, title, description, eds_reference, status, priority,
            category, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        ticket_number,
        ticket.device_type,
        ticket.device_id,
        ticket.device_name,
        ticket.vendor_name,
        ticket.product_code,
        ticket.title,
        ticket.description,
        ticket.eds_reference,
        'open',
        ticket.priority,
        ticket.category,
        now,
        now
    ))

    ticket_id = cursor.lastrowid
    conn.commit()

    result = get_ticket_with_details(conn, ticket_id)
    conn.close()

    return result


@router.patch("/{ticket_id}")
async def update_ticket(ticket_id: int, update: TicketUpdate):
    """Update a ticket"""
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA foreign_keys = ON")
    cursor = conn.cursor()

    # Check if ticket exists
    cursor.execute("SELECT id, status FROM tickets WHERE id = ?", (ticket_id,))
    existing = cursor.fetchone()
    if not existing:
        conn.close()
        raise HTTPException(status_code=404, detail="Ticket not found")

    now = datetime.now().isoformat()
    updates = []
    params = []

    if update.title is not None:
        updates.append("title = ?")
        params.append(update.title)

    if update.description is not None:
        updates.append("description = ?")
        params.append(update.description)

    if update.eds_reference is not None:
        updates.append("eds_reference = ?")
        params.append(update.eds_reference)

    if update.status is not None:
        updates.append("status = ?")
        params.append(update.status)

        # If status is resolved or closed, set resolved_at
        if update.status in ('resolved', 'closed'):
            updates.append("resolved_at = ?")
            params.append(now)

    if update.priority is not None:
        updates.append("priority = ?")
        params.append(update.priority)

    if update.category is not None:
        updates.append("category = ?")
        params.append(update.category)

    if update.assigned_to is not None:
        updates.append("assigned_to = ?")
        params.append(update.assigned_to)

    if not updates:
        conn.close()
        raise HTTPException(status_code=400, detail="No fields to update")

    updates.append("updated_at = ?")
    params.append(now)
    params.append(ticket_id)

    query = f"UPDATE tickets SET {', '.join(updates)} WHERE id = ?"
    cursor.execute(query, params)
    conn.commit()

    result = get_ticket_with_details(conn, ticket_id)
    conn.close()

    return result


@router.delete("/{ticket_id}")
async def delete_ticket(ticket_id: int):
    """Delete a ticket"""
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA foreign_keys = ON")
    cursor = conn.cursor()

    cursor.execute("DELETE FROM tickets WHERE id = ?", (ticket_id,))

    if cursor.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="Ticket not found")

    conn.commit()
    conn.close()

    return {"message": "Ticket deleted successfully"}


@router.post("/{ticket_id}/comments")
async def add_comment(ticket_id: int, comment: CommentCreate):
    """Add a comment to a ticket"""
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA foreign_keys = ON")
    cursor = conn.cursor()

    # Check if ticket exists
    cursor.execute("SELECT id FROM tickets WHERE id = ?", (ticket_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Ticket not found")

    now = datetime.now().isoformat()

    cursor.execute("""
        INSERT INTO ticket_comments (ticket_id, comment_text, created_at, created_by)
        VALUES (?, ?, ?, ?)
    """, (ticket_id, comment.comment_text, now, comment.created_by))

    # Update ticket's updated_at
    cursor.execute("UPDATE tickets SET updated_at = ? WHERE id = ?", (now, ticket_id))

    conn.commit()

    result = get_ticket_with_details(conn, ticket_id)
    conn.close()

    return result


@router.get("/export/csv", response_class=None)
async def export_tickets_csv(
    status: Optional[str] = Query(None, description="Filter by status"),
    priority: Optional[str] = Query(None, description="Filter by priority"),
    device_type: Optional[str] = Query(None, description="Filter by device type"),
):
    """Export tickets to CSV"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Build query
    query = """
        SELECT t.ticket_number, t.device_type, t.device_name, t.vendor_name, t.product_code,
               t.title, t.description, t.eds_reference, t.status, t.priority, t.category,
               t.created_at, t.updated_at, t.resolved_at, t.id
        FROM tickets t
        WHERE 1=1
    """
    params = []

    if status:
        query += " AND t.status = ?"
        params.append(status)

    if priority:
        query += " AND t.priority = ?"
        params.append(priority)

    if device_type:
        query += " AND t.device_type = ?"
        params.append(device_type)

    query += " ORDER BY t.created_at DESC"

    cursor.execute(query, params)
    tickets = cursor.fetchall()

    # Create CSV
    output = io.StringIO()
    writer = csv.writer(output)

    # Write header
    writer.writerow([
        'Ticket Number', 'Device Type', 'Device Name', 'Vendor', 'Product Code',
        'Title', 'Description', 'EDS Reference', 'Status', 'Priority', 'Category',
        'Created At', 'Updated At', 'Resolved At', 'All Comments'
    ])

    # Write tickets with comments
    for ticket in tickets:
        ticket_id = ticket[14]

        # Get all comments for this ticket
        cursor.execute("""
            SELECT comment_text FROM ticket_comments
            WHERE ticket_id = ?
            ORDER BY created_at ASC
        """, (ticket_id,))

        comments = cursor.fetchall()
        all_comments = " | ".join([c[0] for c in comments])

        writer.writerow([
            ticket[0],  # ticket_number
            ticket[1],  # device_type
            ticket[2],  # device_name
            ticket[3],  # vendor_name
            ticket[4],  # product_code
            ticket[5],  # title
            ticket[6],  # description
            ticket[7],  # eds_reference
            ticket[8],  # status
            ticket[9],  # priority
            ticket[10], # category
            ticket[11], # created_at
            ticket[12], # updated_at
            ticket[13], # resolved_at
            all_comments
        ])

    conn.close()

    # Return CSV as response
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=tickets.csv"}
    )


@router.post("/{ticket_id}/attachments")
async def upload_attachment(ticket_id: int, file: UploadFile = File(...)):
    """Upload an attachment to a ticket"""
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA foreign_keys = ON")
    cursor = conn.cursor()

    # Verify ticket exists
    cursor.execute("SELECT id FROM tickets WHERE id = ?", (ticket_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Ticket not found")

    # Create ticket-specific directory
    ticket_dir = ATTACHMENTS_DIR / str(ticket_id)
    ticket_dir.mkdir(exist_ok=True)

    # Generate safe filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    safe_filename = f"{timestamp}_{file.filename}"
    file_path = ticket_dir / safe_filename

    # Save file
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")

    # Get file size
    file_size = os.path.getsize(file_path)

    # Store in database
    now = datetime.now().isoformat()
    cursor.execute("""
        INSERT INTO ticket_attachments (
            ticket_id, filename, file_path, file_size, content_type, uploaded_at
        ) VALUES (?, ?, ?, ?, ?, ?)
    """, (ticket_id, file.filename, str(file_path), file_size, file.content_type, now))

    attachment_id = cursor.lastrowid
    conn.commit()
    conn.close()

    return {
        "id": attachment_id,
        "ticket_id": ticket_id,
        "filename": file.filename,
        "file_size": file_size,
        "content_type": file.content_type,
        "uploaded_at": now
    }


@router.get("/{ticket_id}/attachments")
async def get_attachments(ticket_id: int):
    """Get all attachments for a ticket"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id, filename, file_size, content_type, uploaded_at
        FROM ticket_attachments
        WHERE ticket_id = ?
        ORDER BY uploaded_at DESC
    """, (ticket_id,))

    attachments = cursor.fetchall()
    conn.close()

    return [
        {
            "id": row[0],
            "filename": row[1],
            "file_size": row[2],
            "content_type": row[3],
            "uploaded_at": row[4]
        }
        for row in attachments
    ]


@router.get("/{ticket_id}/attachments/{attachment_id}/download")
async def download_attachment(ticket_id: int, attachment_id: int):
    """Download a specific attachment"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("""
        SELECT filename, file_path, content_type
        FROM ticket_attachments
        WHERE id = ? AND ticket_id = ?
    """, (attachment_id, ticket_id))

    result = cursor.fetchone()
    conn.close()

    if not result:
        raise HTTPException(status_code=404, detail="Attachment not found")

    filename, file_path, content_type = result

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found on disk")

    return FileResponse(
        path=file_path,
        filename=filename,
        media_type=content_type or "application/octet-stream"
    )


@router.delete("/{ticket_id}/attachments/{attachment_id}")
async def delete_attachment(ticket_id: int, attachment_id: int):
    """Delete an attachment"""
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA foreign_keys = ON")
    cursor = conn.cursor()

    # Get file path before deleting
    cursor.execute("""
        SELECT file_path FROM ticket_attachments
        WHERE id = ? AND ticket_id = ?
    """, (attachment_id, ticket_id))

    result = cursor.fetchone()
    if not result:
        conn.close()
        raise HTTPException(status_code=404, detail="Attachment not found")

    file_path = result[0]

    # Delete from database
    cursor.execute("""
        DELETE FROM ticket_attachments
        WHERE id = ? AND ticket_id = ?
    """, (attachment_id, ticket_id))

    conn.commit()
    conn.close()

    # Delete file from disk
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
    except Exception as e:
        print(f"Warning: Failed to delete file {file_path}: {e}")

    return {"message": "Attachment deleted successfully"}


@router.get("/export-with-attachments")
async def export_tickets_with_attachments(
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    device_type: Optional[str] = Query(None),
    category: Optional[str] = Query(None)
):
    """Export tickets as CSV with all attachments in a ZIP file"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Build query with filters
    query = """
        SELECT
            t.ticket_number, t.device_type, t.device_name, t.vendor_name,
            t.product_code, t.title, t.description, t.eds_reference,
            t.status, t.priority, t.category, t.created_at, t.updated_at,
            t.resolved_at, t.id
        FROM tickets t
        WHERE 1=1
    """
    params = []

    if status:
        query += " AND t.status = ?"
        params.append(status)
    if priority:
        query += " AND t.priority = ?"
        params.append(priority)
    if device_type:
        query += " AND t.device_type = ?"
        params.append(device_type)
    if category:
        query += " AND t.category = ?"
        params.append(category)

    query += " ORDER BY t.created_at DESC"

    cursor.execute(query, params)
    tickets = cursor.fetchall()

    # Create in-memory ZIP file
    zip_buffer = io.BytesIO()

    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        # Create CSV
        csv_output = io.StringIO()
        writer = csv.writer(csv_output)

        # Write header
        writer.writerow([
            'Ticket Number', 'Device Type', 'Device Name', 'Vendor', 'Product Code',
            'Title', 'Description', 'EDS Reference', 'Status', 'Priority', 'Category',
            'Created At', 'Updated At', 'Resolved At', 'Comments', 'Attachments'
        ])

        # Write tickets with comments and attachments
        for ticket in tickets:
            ticket_id = ticket[14]
            ticket_number = ticket[0]

            # Get comments
            cursor.execute("""
                SELECT comment_text FROM ticket_comments
                WHERE ticket_id = ?
                ORDER BY created_at ASC
            """, (ticket_id,))
            comments = cursor.fetchall()
            all_comments = " | ".join([c[0] for c in comments])

            # Get attachments
            cursor.execute("""
                SELECT filename, file_path FROM ticket_attachments
                WHERE ticket_id = ?
                ORDER BY uploaded_at ASC
            """, (ticket_id,))
            attachments = cursor.fetchall()

            # Add attachments to ZIP with ticket folder structure
            attachment_names = []
            for filename, file_path in attachments:
                if os.path.exists(file_path):
                    arc_name = f"{ticket_number}/{filename}"
                    zip_file.write(file_path, arc_name)
                    attachment_names.append(filename)

            all_attachments = " | ".join(attachment_names)

            writer.writerow([
                ticket[0],  # ticket_number
                ticket[1],  # device_type
                ticket[2],  # device_name
                ticket[3],  # vendor_name
                ticket[4],  # product_code
                ticket[5],  # title
                ticket[6],  # description
                ticket[7],  # eds_reference
                ticket[8],  # status
                ticket[9],  # priority
                ticket[10], # category
                ticket[11], # created_at
                ticket[12], # updated_at
                ticket[13], # resolved_at
                all_comments,
                all_attachments
            ])

        # Add CSV to ZIP
        csv_output.seek(0)
        zip_file.writestr("tickets.csv", csv_output.getvalue())

    conn.close()

    # Return ZIP file
    zip_buffer.seek(0)
    return StreamingResponse(
        iter([zip_buffer.getvalue()]),
        media_type="application/zip",
        headers={"Content-Disposition": "attachment; filename=tickets_with_attachments.zip"}
    )
