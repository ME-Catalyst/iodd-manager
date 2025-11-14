"""
MQTT Broker Management Routes
Provides REST API endpoints for managing and monitoring the MQTT broker
"""
from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import os
import json
import asyncio
from datetime import datetime

# Try to import paho-mqtt, but make it optional
try:
    import paho.mqtt.client as mqtt
    MQTT_AVAILABLE = True
except ImportError:
    MQTT_AVAILABLE = False
    print("Warning: paho-mqtt not installed. MQTT features will be disabled.")

router = APIRouter()

# MQTT Configuration from environment
MQTT_BROKER = os.getenv('MQTT_BROKER', 'localhost')
MQTT_PORT = int(os.getenv('MQTT_PORT', '1883'))
MQTT_USERNAME = os.getenv('MQTT_USERNAME', 'iodd')
MQTT_PASSWORD = os.getenv('MQTT_PASSWORD', 'mqtt123')

# Global MQTT client for the API
mqtt_client = None
mqtt_connected = False
mqtt_messages = []  # Store recent messages
websocket_clients: List[WebSocket] = []

# Models
class PublishRequest(BaseModel):
    topic: str
    message: str
    qos: int = 0
    retain: bool = False

class SubscribeRequest(BaseModel):
    topic: str
    qos: int = 0

class UnsubscribeRequest(BaseModel):
    topic: str

# MQTT Client Setup
def setup_mqtt_client():
    """Initialize MQTT client for API operations"""
    global mqtt_client, mqtt_connected

    if not MQTT_AVAILABLE:
        return None

    if mqtt_client is not None:
        return mqtt_client

    client = mqtt.Client(client_id="iodd-manager-api", clean_session=True)

    if MQTT_USERNAME and MQTT_PASSWORD:
        client.username_pw_set(MQTT_USERNAME, MQTT_PASSWORD)

    def on_connect(client, userdata, flags, rc):
        global mqtt_connected
        if rc == 0:
            mqtt_connected = True
            print(f"API MQTT client connected to broker at {MQTT_BROKER}:{MQTT_PORT}")
        else:
            mqtt_connected = False
            print(f"Failed to connect to MQTT broker. Return code: {rc}")

    def on_disconnect(client, userdata, rc):
        global mqtt_connected
        mqtt_connected = False
        print("API MQTT client disconnected from broker")

    def on_message(client, userdata, msg):
        """Handle incoming MQTT messages and forward to websocket clients"""
        message_data = {
            'topic': msg.topic,
            'payload': msg.payload.decode('utf-8'),
            'qos': msg.qos,
            'timestamp': datetime.utcnow().isoformat()
        }

        # Store message
        mqtt_messages.append(message_data)
        # Keep only last 100 messages
        if len(mqtt_messages) > 100:
            mqtt_messages.pop(0)

        # Forward to websocket clients
        asyncio.create_task(broadcast_message(message_data))

    client.on_connect = on_connect
    client.on_disconnect = on_disconnect
    client.on_message = on_message

    try:
        # Parse broker address
        broker_host = MQTT_BROKER.split(':')[0] if ':' in MQTT_BROKER else MQTT_BROKER
        client.connect(broker_host, MQTT_PORT, 60)
        client.loop_start()
        mqtt_client = client
        return client
    except Exception as e:
        print(f"Error connecting MQTT client: {e}")
        return None

async def broadcast_message(message: Dict[str, Any]):
    """Broadcast message to all connected websocket clients"""
    disconnected_clients = []
    for ws in websocket_clients:
        try:
            await ws.send_json(message)
        except Exception:
            disconnected_clients.append(ws)

    # Remove disconnected clients
    for ws in disconnected_clients:
        if ws in websocket_clients:
            websocket_clients.remove(ws)

# API Endpoints
@router.get("/status")
async def get_broker_status():
    """Get MQTT broker status and statistics"""
    if not MQTT_AVAILABLE:
        return {
            "status": "unavailable",
            "message": "MQTT support not installed. Install paho-mqtt package.",
            "mqtt_available": False
        }

    # Try to query broker stats via $SYS topics
    return {
        "status": "running" if mqtt_connected else "disconnected",
        "mqtt_available": True,
        "broker": MQTT_BROKER,
        "mqtt_port": MQTT_PORT,
        "ws_port": 9001,  # From mosquitto.conf
        "tls_port": 8883,  # From mosquitto.conf
        "connected": mqtt_connected,
        "clients": 0,  # Would need to query $SYS/broker/clients/connected
        "topics": 0,  # Would need to track
        "messages_per_sec": 0,  # Would need to calculate
        "auth_enabled": bool(MQTT_USERNAME),
        "persistence": True,  # From mosquitto.conf
        "max_connections": "Unlimited"  # From mosquitto.conf
    }

@router.post("/publish")
async def publish_message(request: PublishRequest):
    """Publish a message to an MQTT topic"""
    if not MQTT_AVAILABLE:
        raise HTTPException(status_code=503, detail="MQTT support not available")

    if mqtt_client is None:
        setup_mqtt_client()

    if not mqtt_connected:
        raise HTTPException(status_code=503, detail="Not connected to MQTT broker")

    try:
        # Parse message as JSON if possible
        try:
            message_payload = json.loads(request.message)
            message_str = json.dumps(message_payload)
        except json.JSONDecodeError:
            message_str = request.message

        # Publish message
        result = mqtt_client.publish(
            topic=request.topic,
            payload=message_str,
            qos=request.qos,
            retain=request.retain
        )

        if result.rc == mqtt.MQTT_ERR_SUCCESS:
            return {
                "success": True,
                "topic": request.topic,
                "qos": request.qos,
                "retain": request.retain,
                "timestamp": datetime.utcnow().isoformat()
            }
        else:
            raise HTTPException(status_code=500, detail=f"Failed to publish: {result.rc}")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/subscribe")
async def subscribe_topic(request: SubscribeRequest):
    """Subscribe to an MQTT topic"""
    if not MQTT_AVAILABLE:
        raise HTTPException(status_code=503, detail="MQTT support not available")

    if mqtt_client is None:
        setup_mqtt_client()

    if not mqtt_connected:
        raise HTTPException(status_code=503, detail="Not connected to MQTT broker")

    try:
        result = mqtt_client.subscribe(request.topic, qos=request.qos)

        if result[0] == mqtt.MQTT_ERR_SUCCESS:
            return {
                "success": True,
                "topic": request.topic,
                "qos": request.qos,
                "timestamp": datetime.utcnow().isoformat()
            }
        else:
            raise HTTPException(status_code=500, detail=f"Failed to subscribe: {result[0]}")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/unsubscribe")
async def unsubscribe_topic(request: UnsubscribeRequest):
    """Unsubscribe from an MQTT topic"""
    if not MQTT_AVAILABLE:
        raise HTTPException(status_code=503, detail="MQTT support not available")

    if mqtt_client is None or not mqtt_connected:
        raise HTTPException(status_code=503, detail="Not connected to MQTT broker")

    try:
        result = mqtt_client.unsubscribe(request.topic)

        if result[0] == mqtt.MQTT_ERR_SUCCESS:
            return {
                "success": True,
                "topic": request.topic,
                "timestamp": datetime.utcnow().isoformat()
            }
        else:
            raise HTTPException(status_code=500, detail=f"Failed to unsubscribe: {result[0]}")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/clients")
async def get_connected_clients():
    """Get list of connected MQTT clients"""
    # This would require subscribing to $SYS topics or using Mosquitto's REST API
    # For now, return mock data
    return {
        "clients": [
            {
                "client_id": "iodd-mqtt-bridge",
                "ip_address": "172.18.0.5",
                "connected_at": "2025-01-14T10:30:00Z",
                "messages_sent": 1247,
                "messages_received": 523,
                "subscriptions": 3
            },
            {
                "client_id": "iodd-device-shadow",
                "ip_address": "172.18.0.6",
                "connected_at": "2025-01-14T10:30:05Z",
                "messages_sent": 0,
                "messages_received": 1247,
                "subscriptions": 4
            }
        ]
    }

@router.get("/topics")
async def get_active_topics():
    """Get list of active MQTT topics"""
    # This would require tracking subscriptions or querying broker
    # For now, return common topics
    return {
        "topics": [
            {"name": "devices/+/telemetry", "subscribers": 2, "messages": 1247},
            {"name": "devices/+/status", "subscribers": 2, "messages": 45},
            {"name": "devices/+/register", "subscribers": 1, "messages": 8},
            {"name": "devices/+/config/reported", "subscribers": 1, "messages": 12}
        ]
    }

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time MQTT message streaming"""
    await websocket.accept()
    websocket_clients.append(websocket)

    try:
        while True:
            # Keep connection alive
            await asyncio.sleep(1)
            # Could also receive commands from client here
            try:
                data = await asyncio.wait_for(websocket.receive_text(), timeout=0.1)
                # Handle any client commands if needed
            except asyncio.TimeoutError:
                pass

    except WebSocketDisconnect:
        if websocket in websocket_clients:
            websocket_clients.remove(websocket)
    except Exception as e:
        print(f"WebSocket error: {e}")
        if websocket in websocket_clients:
            websocket_clients.remove(websocket)

@router.post("/connect")
async def connect_mqtt():
    """Manually connect/reconnect to MQTT broker"""
    global mqtt_client, mqtt_connected

    if not MQTT_AVAILABLE:
        raise HTTPException(status_code=503, detail="MQTT support not available. Install paho-mqtt package.")

    try:
        if mqtt_client is not None:
            # Disconnect existing client
            mqtt_client.loop_stop()
            mqtt_client.disconnect()

        # Setup new client
        client = setup_mqtt_client()

        if client and mqtt_connected:
            return {
                "success": True,
                "message": "Connected to MQTT broker",
                "broker": MQTT_BROKER,
                "port": MQTT_PORT
            }
        else:
            raise HTTPException(status_code=503, detail="Failed to connect to MQTT broker")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Connection error: {str(e)}")

@router.post("/disconnect")
async def disconnect_mqtt():
    """Disconnect from MQTT broker"""
    global mqtt_client, mqtt_connected

    if not MQTT_AVAILABLE:
        raise HTTPException(status_code=503, detail="MQTT support not available")

    try:
        if mqtt_client is not None:
            mqtt_client.loop_stop()
            mqtt_client.disconnect()
            mqtt_connected = False
            return {
                "success": True,
                "message": "Disconnected from MQTT broker"
            }
        else:
            return {
                "success": True,
                "message": "Already disconnected"
            }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Disconnect error: {str(e)}")

@router.post("/restart")
async def restart_mqtt_connection():
    """Restart MQTT connection"""
    global mqtt_client, mqtt_connected

    if not MQTT_AVAILABLE:
        raise HTTPException(status_code=503, detail="MQTT support not available")

    try:
        # Disconnect
        if mqtt_client is not None:
            mqtt_client.loop_stop()
            mqtt_client.disconnect()
            mqtt_connected = False

        # Wait a moment
        await asyncio.sleep(1)

        # Reconnect
        client = setup_mqtt_client()

        if client and mqtt_connected:
            return {
                "success": True,
                "message": "MQTT connection restarted successfully",
                "broker": MQTT_BROKER,
                "port": MQTT_PORT
            }
        else:
            raise HTTPException(status_code=503, detail="Failed to restart MQTT connection")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Restart error: {str(e)}")

# Initialize MQTT client on module load
if MQTT_AVAILABLE:
    setup_mqtt_client()
