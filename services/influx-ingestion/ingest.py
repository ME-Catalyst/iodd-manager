"""
InfluxDB Ingestion Service
Subscribes to MQTT telemetry topics and writes to InfluxDB
"""
import os
import json
import logging
import time
from datetime import datetime
from typing import Dict, Any
import paho.mqtt.client as mqtt
from influxdb_client import InfluxDBClient, Point, WritePrecision
from influxdb_client.client.write_api import SYNCHRONOUS

# Configuration
MQTT_BROKER = os.getenv('MQTT_BROKER', 'localhost:1883')
MQTT_USERNAME = os.getenv('MQTT_USERNAME', 'iodd')
MQTT_PASSWORD = os.getenv('MQTT_PASSWORD', 'mqtt123')
INFLUXDB_URL = os.getenv('INFLUXDB_URL', 'http://localhost:8086')
INFLUXDB_TOKEN = os.getenv('INFLUXDB_TOKEN', 'my-super-secret-auth-token')
INFLUXDB_ORG = os.getenv('INFLUXDB_ORG', 'greenstack')
INFLUXDB_BUCKET = os.getenv('INFLUXDB_BUCKET', 'device-telemetry')
LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')

# Setup logging
logging.basicConfig(
    level=getattr(logging, LOG_LEVEL),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# InfluxDB client
influx_client = None
write_api = None

def init_influxdb():
    """Initialize InfluxDB client"""
    global influx_client, write_api

    max_retries = 10
    retry_count = 0

    while retry_count < max_retries:
        try:
            logger.info(f"Connecting to InfluxDB at {INFLUXDB_URL} (attempt {retry_count + 1}/{max_retries})")
            influx_client = InfluxDBClient(
                url=INFLUXDB_URL,
                token=INFLUXDB_TOKEN,
                org=INFLUXDB_ORG
            )

            # Test connection
            health = influx_client.health()
            if health.status == "pass":
                logger.info(f"Connected to InfluxDB successfully (version {health.version})")
                write_api = influx_client.write_api(write_options=SYNCHRONOUS)
                return True
            else:
                logger.warning(f"InfluxDB health check failed: {health.status}")

        except Exception as e:
            retry_count += 1
            if retry_count >= max_retries:
                logger.error(f"Failed to connect to InfluxDB after {max_retries} attempts: {e}")
                return False
            logger.warning(f"Failed to connect to InfluxDB, retrying in 5 seconds... ({e})")
            time.sleep(5)

    return False

# MQTT Topics to subscribe
TOPICS = [
    ("devices/+/telemetry", 0),
]

def on_connect(client, userdata, flags, rc):
    """Callback when connected to MQTT broker"""
    if rc == 0:
        logger.info("Connected to MQTT broker successfully")
        for topic, qos in TOPICS:
            client.subscribe(topic, qos)
            logger.info(f"Subscribed to {topic} (QoS {qos})")
    else:
        logger.error(f"Failed to connect to MQTT broker. Return code: {rc}")

def on_disconnect(client, userdata, rc):
    """Callback when disconnected from MQTT broker"""
    if rc != 0:
        logger.warning(f"Unexpected disconnect from MQTT broker. Return code: {rc}")

def on_message(client, userdata, msg):
    """Callback when message received"""
    try:
        topic = msg.topic
        payload = json.loads(msg.payload.decode())

        logger.debug(f"Received message on {topic}: {payload}")

        # Extract device_id from topic (devices/<device_id>/telemetry)
        topic_parts = topic.split('/')
        if len(topic_parts) >= 3:
            device_id = topic_parts[1]
            message_type = topic_parts[2]

            if message_type == 'telemetry':
                write_to_influxdb(device_id, payload)

    except json.JSONDecodeError as e:
        logger.error(f"Failed to decode JSON payload from {msg.topic}: {e}")
    except Exception as e:
        logger.error(f"Error processing message from {msg.topic}: {e}", exc_info=True)

def write_to_influxdb(device_id: str, data: Dict[str, Any]):
    """Write telemetry data to InfluxDB"""
    if not write_api:
        logger.warning("InfluxDB not connected, skipping write")
        return

    try:
        # Get timestamp from payload or use current time
        timestamp = data.get('timestamp')
        if timestamp:
            try:
                timestamp = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
            except:
                timestamp = datetime.utcnow()
        else:
            timestamp = datetime.utcnow()

        # Create a point for each parameter in the telemetry
        points = []

        # Handle different telemetry formats
        if 'parameter' in data and 'value' in data:
            # Single parameter format
            point = Point("device_telemetry") \
                .tag("device_id", device_id) \
                .tag("parameter", data['parameter']) \
                .field("value", float(data['value'])) \
                .time(timestamp, WritePrecision.NS)

            if 'unit' in data:
                point = point.tag("unit", data['unit'])

            points.append(point)

        else:
            # Multi-parameter format - each key-value pair is a measurement
            for key, value in data.items():
                if key in ['timestamp', 'device_id']:
                    continue

                try:
                    # Try to convert to float
                    numeric_value = float(value)

                    point = Point("device_telemetry") \
                        .tag("device_id", device_id) \
                        .tag("parameter", key) \
                        .field("value", numeric_value) \
                        .time(timestamp, WritePrecision.NS)

                    points.append(point)

                except (ValueError, TypeError):
                    # If not numeric, store as string field
                    point = Point("device_metadata") \
                        .tag("device_id", device_id) \
                        .tag("attribute", key) \
                        .field("value", str(value)) \
                        .time(timestamp, WritePrecision.NS)

                    points.append(point)

        # Write points to InfluxDB
        if points:
            write_api.write(bucket=INFLUXDB_BUCKET, org=INFLUXDB_ORG, record=points)
            logger.info(f"Wrote {len(points)} points to InfluxDB for device {device_id}")

    except Exception as e:
        logger.error(f"Error writing to InfluxDB for device {device_id}: {e}", exc_info=True)

def main():
    """Main entry point"""
    logger.info("Starting InfluxDB Ingestion Service...")
    logger.info(f"MQTT Broker: {MQTT_BROKER}")
    logger.info(f"InfluxDB URL: {INFLUXDB_URL}")
    logger.info(f"InfluxDB Org: {INFLUXDB_ORG}")
    logger.info(f"InfluxDB Bucket: {INFLUXDB_BUCKET}")

    # Initialize InfluxDB
    if not init_influxdb():
        logger.error("Failed to initialize InfluxDB, exiting...")
        return

    # Parse broker address
    broker_parts = MQTT_BROKER.split(':')
    broker_host = broker_parts[0]
    broker_port = int(broker_parts[1]) if len(broker_parts) > 1 else 1883

    # Create MQTT client
    client = mqtt.Client(client_id="iodd-influx-ingestion", clean_session=False)
    client.username_pw_set(MQTT_USERNAME, MQTT_PASSWORD)
    client.on_connect = on_connect
    client.on_disconnect = on_disconnect
    client.on_message = on_message

    # Enable automatic reconnection
    client.reconnect_delay_set(min_delay=1, max_delay=120)

    # Connect to broker
    retry_count = 0
    max_retries = 10

    while retry_count < max_retries:
        try:
            logger.info(f"Connecting to MQTT broker at {broker_host}:{broker_port} (attempt {retry_count + 1}/{max_retries})")
            client.connect(broker_host, broker_port, 60)
            break
        except Exception as e:
            retry_count += 1
            if retry_count >= max_retries:
                logger.error(f"Failed to connect to MQTT broker after {max_retries} attempts: {e}")
                return
            logger.warning(f"Failed to connect, retrying in 5 seconds... ({e})")
            time.sleep(5)

    # Start loop
    try:
        logger.info("InfluxDB Ingestion Service is running...")
        client.loop_forever()
    except KeyboardInterrupt:
        logger.info("Shutting down InfluxDB Ingestion Service...")
        client.disconnect()
        if influx_client:
            influx_client.close()
    except Exception as e:
        logger.error(f"Unexpected error in main loop: {e}", exc_info=True)

if __name__ == "__main__":
    main()
