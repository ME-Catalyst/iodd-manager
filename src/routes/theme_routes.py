"""
Theme Management API Routes
============================
Handles user theme customization and persistence
"""

from typing import List, Optional, Dict, Any
from datetime import datetime
import json
import sqlite3

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/api/themes", tags=["Theme Management"])

# Database path - will be set from api.py
db_path = "greenstack.db"

# Immutable brand color
BRAND_GREEN = "#3DB60F"

# Built-in theme presets
THEME_PRESETS = {
    "greenstack": {
        "id": "greenstack",
        "name": "Greenstack",
        "description": "The official Greenstack brand theme",
        "locked": True,
        "mode": "dark",
        "colors": {
            "brand": BRAND_GREEN,
            "primary": BRAND_GREEN,
            "primaryHover": "#32a00c",
            "primaryActive": "#2b8a0a",
            "secondary": "#2d5016",
            "secondaryHover": "#3a6a1c",
            "secondaryActive": "#1f3a0f",
            "accent": "#51cf66",
            "accentHover": "#70d682",
            "accentActive": "#32b84d",
            "success": "#51cf66",
            "warning": "#ffd43b",
            "error": "#ff6b6b",
            "info": "#00d4ff",
            "background": "#0a0e27",
            "backgroundSecondary": "#151935",
            "surface": "#1a1f3a",
            "surfaceHover": "#2a3050",
            "surfaceActive": "#3a4060",
            "border": "#2a3050",
            "borderSubtle": "#1f2640",
            "borderStrong": "#3a4060",
            "foreground": "#e5e7eb",
            "foregroundSecondary": "#9ca3af",
            "foregroundMuted": "#6b7280",
            "foregroundInverse": "#0a0e27",
            "overlay": "rgba(10, 14, 39, 0.8)",
            "overlayLight": "rgba(10, 14, 39, 0.5)",
        }
    },
    "forest": {
        "id": "forest",
        "name": "Forest Green",
        "description": "Deep forest theme with rich green tones",
        "locked": False,
        "mode": "dark",
        "colors": {
            "brand": BRAND_GREEN,
            "primary": "#2d5016",
            "primaryHover": "#3a6a1c",
            "primaryActive": "#1f3a0f",
            "secondary": "#1f3a0f",
            "secondaryHover": "#2d5016",
            "secondaryActive": "#152a0a",
            "accent": "#4a7c30",
            "accentHover": "#5a9c40",
            "accentActive": "#3a6c20",
            "success": "#4a7c30",
            "warning": "#d4a843",
            "error": "#c45555",
            "info": "#4a7c9c",
            "background": "#0d1a0a",
            "backgroundSecondary": "#152a0f",
            "surface": "#1f3a15",
            "surfaceHover": "#2d5020",
            "surfaceActive": "#3a6a2a",
            "border": "#2d5020",
            "borderSubtle": "#1f3a15",
            "borderStrong": "#3a6a2a",
            "foreground": "#d4e5ca",
            "foregroundSecondary": "#a3c490",
            "foregroundMuted": "#7a9c60",
            "foregroundInverse": "#0d1a0a",
            "overlay": "rgba(13, 26, 10, 0.8)",
            "overlayLight": "rgba(13, 26, 10, 0.5)",
        }
    },
    "midnight": {
        "id": "midnight",
        "name": "Midnight Green",
        "description": "Dark teal theme with deep green accents",
        "locked": False,
        "mode": "dark",
        "colors": {
            "brand": BRAND_GREEN,
            "primary": "#0a3d2c",
            "primaryHover": "#0e5240",
            "primaryActive": "#072920",
            "secondary": "#072920",
            "secondaryHover": "#0a3d2c",
            "secondaryActive": "#051d18",
            "accent": "#1a6d50",
            "accentHover": "#248d68",
            "accentActive": "#135d40",
            "success": "#1a6d50",
            "warning": "#c4a843",
            "error": "#c45555",
            "info": "#1a6d9c",
            "background": "#051d18",
            "backgroundSecondary": "#072920",
            "surface": "#0a3d2c",
            "surfaceHover": "#0e5240",
            "surfaceActive": "#126750",
            "border": "#0e5240",
            "borderSubtle": "#0a3d2c",
            "borderStrong": "#126750",
            "foreground": "#c4e5d8",
            "foregroundSecondary": "#90c4b0",
            "foregroundMuted": "#609c88",
            "foregroundInverse": "#051d18",
            "overlay": "rgba(5, 29, 24, 0.8)",
            "overlayLight": "rgba(5, 29, 24, 0.5)",
        }
    },
    "light": {
        "id": "light",
        "name": "Light Green",
        "description": "Clean light theme with green accents",
        "locked": False,
        "mode": "light",
        "colors": {
            "brand": BRAND_GREEN,
            "primary": BRAND_GREEN,
            "primaryHover": "#32a00c",
            "primaryActive": "#2b8a0a",
            "secondary": "#51cf66",
            "secondaryHover": "#70d682",
            "secondaryActive": "#32b84d",
            "accent": "#2d5016",
            "accentHover": "#3a6a1c",
            "accentActive": "#1f3a0f",
            "success": "#51cf66",
            "warning": "#ffac30",
            "error": "#ff4757",
            "info": "#0099cc",
            "background": "#ffffff",
            "backgroundSecondary": "#f9fafb",
            "surface": "#f3f4f6",
            "surfaceHover": "#e5e7eb",
            "surfaceActive": "#d1d5db",
            "border": "#d1d5db",
            "borderSubtle": "#e5e7eb",
            "borderStrong": "#9ca3af",
            "foreground": "#111827",
            "foregroundSecondary": "#4b5563",
            "foregroundMuted": "#6b7280",
            "foregroundInverse": "#ffffff",
            "overlay": "rgba(255, 255, 255, 0.9)",
            "overlayLight": "rgba(255, 255, 255, 0.7)",
        }
    }
}

# ============================================================================
# Pydantic Models
# ============================================================================

class ThemeColors(BaseModel):
    """Theme color configuration"""
    brand: str
    primary: str
    primaryHover: Optional[str] = None
    primaryActive: Optional[str] = None
    secondary: str
    secondaryHover: Optional[str] = None
    secondaryActive: Optional[str] = None
    accent: str
    accentHover: Optional[str] = None
    accentActive: Optional[str] = None
    success: str
    warning: str
    error: str
    info: str
    background: str
    backgroundSecondary: Optional[str] = None
    surface: str
    surfaceHover: Optional[str] = None
    surfaceActive: Optional[str] = None
    border: str
    borderSubtle: Optional[str] = None
    borderStrong: Optional[str] = None
    foreground: str
    foregroundSecondary: Optional[str] = None
    foregroundMuted: Optional[str] = None
    foregroundInverse: Optional[str] = None
    overlay: Optional[str] = None
    overlayLight: Optional[str] = None

class ThemeModel(BaseModel):
    """Complete theme definition"""
    id: Optional[str] = None
    name: str
    description: Optional[str] = None
    locked: bool = False
    mode: str = "dark"
    colors: ThemeColors
    preset_id: Optional[str] = None
    is_active: bool = False
    created_at: Optional[datetime] = None

class CreateThemeRequest(BaseModel):
    """Request to create a new custom theme"""
    name: str
    description: Optional[str] = None
    preset_id: Optional[str] = None
    colors: ThemeColors

class UpdateThemeRequest(BaseModel):
    """Request to update an existing theme"""
    name: Optional[str] = None
    description: Optional[str] = None
    colors: Optional[ThemeColors] = None

# ============================================================================
# Database Initialization
# ============================================================================

def init_theme_table():
    """Initialize the user_themes table if it doesn't exist"""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_themes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            preset_id TEXT,
            is_active BOOLEAN DEFAULT 0,
            theme_data TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)

    conn.commit()
    conn.close()

# ============================================================================
# Helper Functions
# ============================================================================

def validate_theme_colors(colors: Dict[str, Any]) -> bool:
    """Validate that brand color is immutable"""
    if colors.get("brand") != BRAND_GREEN:
        raise HTTPException(
            status_code=400,
            detail=f"Brand color must be {BRAND_GREEN} and cannot be changed"
        )
    return True

def get_db_connection():
    """Get database connection"""
    init_theme_table()
    return sqlite3.connect(db_path)

# ============================================================================
# API Endpoints
# ============================================================================

@router.get("/presets")
async def get_theme_presets():
    """Get all built-in theme presets"""
    return {
        "presets": list(THEME_PRESETS.values()),
        "brand_green": BRAND_GREEN
    }

@router.get("")
async def list_themes():
    """List all themes (presets + user custom themes)"""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id, name, preset_id, is_active, theme_data, created_at
        FROM user_themes
        ORDER BY created_at DESC
    """)

    user_themes = []
    for row in cursor.fetchall():
        theme_data = json.loads(row[4])
        user_themes.append({
            "id": f"custom-{row[0]}",
            "name": row[1],
            "preset_id": row[2],
            "is_active": bool(row[3]),
            "custom": True,
            **theme_data,
            "created_at": row[5]
        })

    conn.close()

    # Combine presets and user themes
    all_themes = list(THEME_PRESETS.values()) + user_themes

    return {
        "themes": all_themes,
        "brand_green": BRAND_GREEN
    }

@router.get("/active")
async def get_active_theme():
    """Get the currently active theme"""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id, name, preset_id, theme_data, created_at
        FROM user_themes
        WHERE is_active = 1
        LIMIT 1
    """)

    row = cursor.fetchone()
    conn.close()

    if row:
        theme_data = json.loads(row[3])
        return {
            "id": f"custom-{row[0]}",
            "name": row[1],
            "preset_id": row[2],
            "custom": True,
            **theme_data,
            "created_at": row[4]
        }

    # Default to greenstack preset
    return THEME_PRESETS["greenstack"]

@router.post("")
async def create_custom_theme(request: CreateThemeRequest):
    """Create a new custom theme"""
    # Validate brand color
    validate_theme_colors(request.colors.model_dump())

    conn = get_db_connection()
    cursor = conn.cursor()

    # Prepare theme data
    theme_data = {
        "description": request.description,
        "mode": "dark" if request.preset_id != "light" else "light",
        "colors": request.colors.model_dump()
    }

    cursor.execute("""
        INSERT INTO user_themes (name, preset_id, is_active, theme_data)
        VALUES (?, ?, 0, ?)
    """, (
        request.name,
        request.preset_id,
        json.dumps(theme_data)
    ))

    theme_id = cursor.lastrowid
    conn.commit()
    conn.close()

    return {
        "id": f"custom-{theme_id}",
        "name": request.name,
        "preset_id": request.preset_id,
        "custom": True,
        "is_active": False,
        **theme_data,
        "message": "Custom theme created successfully"
    }

@router.put("/{theme_id}")
async def update_theme(theme_id: str, request: UpdateThemeRequest):
    """Update an existing custom theme"""
    # Extract numeric ID
    if not theme_id.startswith("custom-"):
        raise HTTPException(status_code=400, detail="Can only update custom themes")

    try:
        numeric_id = int(theme_id.replace("custom-", ""))
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid theme ID")

    conn = get_db_connection()
    cursor = conn.cursor()

    # Get existing theme
    cursor.execute("SELECT theme_data FROM user_themes WHERE id = ?", (numeric_id,))
    row = cursor.fetchone()

    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Theme not found")

    existing_data = json.loads(row[0])

    # Update fields
    if request.name:
        cursor.execute("UPDATE user_themes SET name = ? WHERE id = ?", (request.name, numeric_id))

    if request.colors:
        validate_theme_colors(request.colors.model_dump())
        existing_data["colors"] = request.colors.model_dump()

    if request.description is not None:
        existing_data["description"] = request.description

    cursor.execute(
        "UPDATE user_themes SET theme_data = ? WHERE id = ?",
        (json.dumps(existing_data), numeric_id)
    )

    conn.commit()
    conn.close()

    return {
        "id": theme_id,
        "message": "Theme updated successfully"
    }

@router.delete("/{theme_id}")
async def delete_theme(theme_id: str):
    """Delete a custom theme"""
    if not theme_id.startswith("custom-"):
        raise HTTPException(status_code=400, detail="Can only delete custom themes")

    try:
        numeric_id = int(theme_id.replace("custom-", ""))
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid theme ID")

    conn = get_db_connection()
    cursor = conn.cursor()

    # Check if theme exists
    cursor.execute("SELECT is_active FROM user_themes WHERE id = ?", (numeric_id,))
    row = cursor.fetchone()

    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Theme not found")

    if row[0]:
        conn.close()
        raise HTTPException(status_code=400, detail="Cannot delete active theme")

    cursor.execute("DELETE FROM user_themes WHERE id = ?", (numeric_id,))
    conn.commit()
    conn.close()

    return {"message": "Theme deleted successfully"}

@router.post("/{theme_id}/activate")
async def activate_theme(theme_id: str):
    """Activate a theme (preset or custom)"""
    conn = get_db_connection()
    cursor = conn.cursor()

    # Deactivate all themes first
    cursor.execute("UPDATE user_themes SET is_active = 0")

    # Check if it's a custom theme
    if theme_id.startswith("custom-"):
        try:
            numeric_id = int(theme_id.replace("custom-", ""))
        except ValueError:
            conn.close()
            raise HTTPException(status_code=400, detail="Invalid theme ID")

        # Activate custom theme
        cursor.execute("UPDATE user_themes SET is_active = 1 WHERE id = ?", (numeric_id,))

        if cursor.rowcount == 0:
            conn.close()
            raise HTTPException(status_code=404, detail="Theme not found")

        conn.commit()

        # Get theme data
        cursor.execute("SELECT name, theme_data FROM user_themes WHERE id = ?", (numeric_id,))
        row = cursor.fetchone()
        conn.close()

        theme_data = json.loads(row[1])
        return {
            "id": theme_id,
            "name": row[0],
            "custom": True,
            **theme_data,
            "message": "Custom theme activated"
        }
    else:
        # It's a preset - just deactivate all custom themes
        conn.commit()
        conn.close()

        if theme_id not in THEME_PRESETS:
            raise HTTPException(status_code=404, detail="Preset theme not found")

        return {
            **THEME_PRESETS[theme_id],
            "message": f"Preset theme '{theme_id}' activated"
        }
