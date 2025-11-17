# Greenstack - Industrial IoT Platform Deployment Guide

## Overview

The Greenstack Industrial IoT Platform provides a complete solution for managing IO-Link and EDS devices with integrated MQTT messaging, time-series data storage, visualization, and workflow automation.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Greenstack Platform                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐          │
│  │   Frontend   │    │   Backend    │    │    Redis     │          │
│  │   (React)    │◄───┤   (FastAPI)  │◄───┤   (Cache)    │          │
│  └──────────────┘    └──────────────┘    └──────────────┘          │
│         │                    │                                       │
│         │                    ▼                                       │
│         │            ┌──────────────┐                                │
│         │            │  PostgreSQL  │                                │
│         │            │  (Database)  │                                │
│         │            └──────────────┘                                │
│         │                                                            │
│         ▼                                                            │
│  ┌──────────────────────────────────────────────────────┐          │
│  │                  MQTT Broker (Mosquitto)              │          │
│  │              Topic: devices/+/telemetry               │          │
│  │               Topic: devices/+/status                 │          │
│  └──────────────────────────────────────────────────────┘          │
│         │         │            │                                     │
│    ┌────┘         │            └────┐                                │
│    │              │                 │                                │
│    ▼              ▼                 ▼                                │
│  ┌────────┐  ┌──────────┐  ┌──────────────┐                        │
│  │ MQTT   │  │  Device  │  │   InfluxDB   │                        │
│  │ Bridge │  │  Shadow  │  │  Ingestion   │                        │
│  └────────┘  └──────────┘  └──────────────┘                        │
│      │            │                │                                 │
│      ▼            ▼                ▼                                 │
│  ┌─────────────────────┐   ┌─────────────┐                         │
│  │  Redis Pub/Sub      │   │  InfluxDB   │                         │
│  │  (Real-time sync)   │   │ (Time-series)│                        │
│  └─────────────────────┘   └─────────────┘                         │
│                                    │                                 │
│                                    ▼                                 │
│                            ┌──────────────┐                         │
│                            │   Grafana    │                         │
│                            │(Visualization)│                         │
│                            └──────────────┘                         │
│                                                                       │
│  ┌──────────────────────────────────────────────────────┐          │
│  │                     Node-RED                          │          │
│  │         (Workflow Automation & Processing)            │          │
│  └──────────────────────────────────────────────────────┘          │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

## Components

### Core Services
- **Frontend**: React-based web interface
- **Backend**: FastAPI REST API server
- **Database**: PostgreSQL for device & configuration data
- **Cache**: Redis for session management and real-time pub/sub

### IoT Services
- **MQTT Broker**: Eclipse Mosquitto for device messaging
- **MQTT Bridge**: Routes telemetry to Redis and API
- **Device Shadow**: Maintains digital twin state in Redis
- **InfluxDB Ingestion**: Stores telemetry in time-series database

### Analytics & Automation
- **InfluxDB**: Time-series database for historical telemetry
- **Grafana**: Dashboards and visualization
- **Node-RED**: Workflow automation and data processing

## Prerequisites

- Docker Engine 20.10 or later
- Docker Compose 2.0 or later
- 4GB RAM minimum (8GB recommended)
- 20GB free disk space

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/greenstack.git
cd greenstack
```

### 2. Configure Environment

Copy the example environment file and customize:

```bash
cp .env.iot.example .env.iot
```

Edit `.env.iot` and set secure passwords:

```bash
# Critical: Change these passwords!
MQTT_PASSWORD=your-secure-mqtt-password
POSTGRES_PASSWORD=your-secure-db-password
INFLUXDB_ADMIN_PASSWORD=your-secure-influx-password
INFLUXDB_TOKEN=your-super-secret-influx-token
GRAFANA_ADMIN_PASSWORD=your-secure-grafana-password
NODERED_CREDENTIAL_SECRET=your-node-red-secret
```

### 3. Start the Platform

```bash
# Start all services
docker-compose -f docker-compose.iot.yml up -d

# View logs
docker-compose -f docker-compose.iot.yml logs -f

# Check status
docker-compose -f docker-compose.iot.yml ps
```

### 4. Access the Services

| Service | URL | Default Credentials |
|---------|-----|-------------------|
| **Greenstack** | http://localhost:3000 | N/A |
| **API Docs** | http://localhost:8000/docs | N/A |
| **Grafana** | http://localhost:3001 | admin / admin123changeme |
| **Node-RED** | http://localhost:1880 | N/A |
| **InfluxDB UI** | http://localhost:8086 | admin / admin123changeme |

### 5. Verify Installation

#### Check MQTT Broker

```bash
# Subscribe to test topic
docker-compose -f docker-compose.iot.yml exec mosquitto \
  mosquitto_sub -h localhost -t "test/topic" -u iodd -P mqtt123

# In another terminal, publish a message
docker-compose -f docker-compose.iot.yml exec mosquitto \
  mosquitto_pub -h localhost -t "test/topic" -m "Hello MQTT" -u iodd -P mqtt123
```

#### Send Test Telemetry

```bash
# Publish device telemetry
docker-compose -f docker-compose.iot.yml exec mosquitto \
  mosquitto_pub -h localhost -t "devices/test-device-001/telemetry" \
  -m '{"parameter":"temperature","value":23.5,"unit":"°C"}' \
  -u iodd -P mqtt123

# Check InfluxDB received the data
docker-compose -f docker-compose.iot.yml exec influxdb \
  influx query 'from(bucket: "device-telemetry")
    |> range(start: -1h)
    |> filter(fn: (r) => r._measurement == "device_telemetry")'
```

#### View Data in Grafana

1. Open http://localhost:3001
2. Login with credentials from `.env.iot`
3. Navigate to "Dashboards" → "Device Telemetry Dashboard"
4. You should see the test telemetry data

## Service Details

### MQTT Topics

The platform uses the following MQTT topic structure:

```
devices/{device_id}/telemetry    - Device sensor readings
devices/{device_id}/status       - Device connection status
devices/{device_id}/config       - Device configuration
devices/{device_id}/command      - Commands to device
alerts/devices                   - Device alerts
nodered/status                   - Node-RED status
```

### Telemetry Data Format

#### Single Parameter Format
```json
{
  "parameter": "temperature",
  "value": 23.5,
  "unit": "°C",
  "timestamp": "2025-11-14T12:00:00Z"
}
```

#### Multi-Parameter Format
```json
{
  "temperature": 23.5,
  "pressure": 101.3,
  "humidity": 45.2,
  "timestamp": "2025-11-14T12:00:00Z"
}
```

### Device Status Format
```json
{
  "state": "connected",
  "timestamp": "2025-11-14T12:00:00Z",
  "vendor_id": 123,
  "device_id": 456
}
```

## Using Node-RED

### Accessing Node-RED

1. Open http://localhost:1880
2. The example flows are pre-loaded from `config/nodered/flows.json`

### Pre-configured Flows

The platform includes example flows for:

1. **Device Telemetry Pipeline**
   - Subscribes to `devices/+/telemetry`
   - Parses and enriches data
   - Routes by parameter type
   - Generates alerts for threshold violations

2. **Alert Generation**
   - Temperature thresholds: <10°C or >80°C
   - Pressure thresholds: <20 bar or >100 bar
   - Publishes alerts to `alerts/devices`

3. **Flow Rate Processing**
   - Calculates running averages
   - Maintains 10-sample history per device

4. **Device Status Monitoring**
   - Tracks connection state changes
   - Generates disconnect alerts

5. **Test Data Injection**
   - Manual inject nodes for testing
   - Pre-configured test messages

### Creating Custom Flows

1. Drag nodes from the palette
2. Connect to MQTT broker (pre-configured as "Greenstack MQTT")
3. Use topics matching `devices/+/telemetry` pattern
4. Deploy your flow

## Grafana Dashboards

### Pre-configured Dashboard

The "Device Telemetry Dashboard" includes:

1. **Device Telemetry Over Time**
   - Time-series line chart
   - Shows all parameters from all devices
   - Configurable time range

2. **Current Device Values**
   - Gauge visualization
   - Latest readings from last hour
   - Real-time updates

3. **Messages by Device**
   - Pie chart showing message distribution
   - Helps identify active vs. inactive devices

4. **Latest Device Parameters**
   - Table view of current values
   - Grouped by device and parameter

### Creating Custom Dashboards

1. Login to Grafana
2. Click "+" → "Create Dashboard"
3. Add panel
4. Select "InfluxDB" datasource
5. Use Flux query language:

```flux
from(bucket: "device-telemetry")
  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
  |> filter(fn: (r) => r["_measurement"] == "device_telemetry")
  |> filter(fn: (r) => r["_field"] == "value")
  |> filter(fn: (r) => r["device_id"] == "your-device-id")
  |> filter(fn: (r) => r["parameter"] == "temperature")
```

### Dashboard Variables

Create dashboard variables for dynamic filtering:

1. Go to Dashboard Settings → Variables
2. Add variable:
   - **Name**: device_id
   - **Type**: Query
   - **Query**:
   ```flux
   import "influxdata/influxdb/schema"
   schema.tagValues(bucket: "device-telemetry", tag: "device_id")
   ```

## Data Retention

### Redis TTL
- Latest telemetry: 5 minutes
- Telemetry history: 100 messages per device
- Device shadows: 24 hours

### InfluxDB Retention
- Default: 90 days (configurable in `.env.iot`)
- Change `INFLUXDB_RETENTION` to adjust

### Modifying Retention

```bash
# Connect to InfluxDB
docker-compose -f docker-compose.iot.yml exec influxdb influx

# Update retention policy
> CREATE RETENTION POLICY "one_year" ON "device-telemetry" DURATION 365d REPLICATION 1
```

## Backup & Recovery

### Backup Database

```bash
# PostgreSQL
docker-compose -f docker-compose.iot.yml exec postgres \
  pg_dump -U iodd greenstack > backup_$(date +%Y%m%d).sql

# InfluxDB
docker-compose -f docker-compose.iot.yml exec influxdb \
  influx backup /backup/influxdb_$(date +%Y%m%d)
```

### Restore Database

```bash
# PostgreSQL
cat backup_20251114.sql | docker-compose -f docker-compose.iot.yml exec -T postgres \
  psql -U iodd greenstack

# InfluxDB
docker-compose -f docker-compose.iot.yml exec influxdb \
  influx restore /backup/influxdb_20251114
```

## Monitoring & Health Checks

### Service Health

All services have health checks configured. View status:

```bash
docker-compose -f docker-compose.iot.yml ps
```

Healthy services show:
```
NAME                    STATUS              PORTS
iodd-mosquitto         Up (healthy)        0.0.0.0:1883->1883/tcp
iodd-influxdb          Up (healthy)        0.0.0.0:8086->8086/tcp
iodd-grafana           Up (healthy)        0.0.0.0:3001->3000/tcp
```

### View Logs

```bash
# All services
docker-compose -f docker-compose.iot.yml logs -f

# Specific service
docker-compose -f docker-compose.iot.yml logs -f mqtt-bridge
docker-compose -f docker-compose.iot.yml logs -f influx-ingestion
```

### MQTT Broker Stats

```bash
# Connect to Mosquitto
docker-compose -f docker-compose.iot.yml exec mosquitto sh

# View broker stats
mosquitto_sub -h localhost -t '$SYS/#' -u iodd -P mqtt123
```

## Troubleshooting

### MQTT Connection Issues

**Problem**: Services can't connect to MQTT broker

**Solution**:
```bash
# Check broker is running
docker-compose -f docker-compose.iot.yml ps mosquitto

# Verify authentication
docker-compose -f docker-compose.iot.yml exec mosquitto \
  cat /mosquitto/config/password_file

# Restart broker
docker-compose -f docker-compose.iot.yml restart mosquitto
```

### InfluxDB Connection Issues

**Problem**: Grafana can't connect to InfluxDB

**Solution**:
```bash
# Check InfluxDB health
curl http://localhost:8086/health

# Verify token in Grafana datasource matches .env.iot
docker-compose -f docker-compose.iot.yml exec grafana \
  cat /etc/grafana/provisioning/datasources/influxdb.yml

# Restart both services
docker-compose -f docker-compose.iot.yml restart influxdb grafana
```

### No Data in Grafana

**Problem**: Dashboard shows "No Data"

**Solution**:
```bash
# 1. Verify MQTT messages are being published
docker-compose -f docker-compose.iot.yml logs mqtt-bridge

# 2. Check InfluxDB ingestion service
docker-compose -f docker-compose.iot.yml logs influx-ingestion

# 3. Query InfluxDB directly
docker-compose -f docker-compose.iot.yml exec influxdb \
  influx query 'from(bucket: "device-telemetry") |> range(start: -1h)'

# 4. Check time range in Grafana dashboard
```

### Node-RED Flow Issues

**Problem**: Flows not executing

**Solution**:
```bash
# Check Node-RED logs
docker-compose -f docker-compose.iot.yml logs nodered

# Verify MQTT broker configuration in Node-RED
# Open http://localhost:1880
# Double-click MQTT node → Edit broker configuration

# Restart Node-RED
docker-compose -f docker-compose.iot.yml restart nodered
```

## Security Considerations

### Production Deployment

1. **Change All Default Passwords**
   - Update all passwords in `.env.iot`
   - Use strong, unique passwords for each service

2. **Enable TLS/SSL**
   - Configure MQTT broker with TLS
   - Use HTTPS for web interfaces
   - See `config/mosquitto/certs/` for certificate setup

3. **Network Isolation**
   - Use Docker networks to isolate services
   - Expose only necessary ports to host
   - Consider reverse proxy (nginx/traefik)

4. **Access Control**
   - Implement MQTT ACLs in `config/mosquitto/acl.conf`
   - Configure Grafana authentication
   - Enable Node-RED authentication

5. **Backup Strategy**
   - Regular automated backups
   - Off-site backup storage
   - Test restoration procedures

### MQTT ACL Configuration

Edit `config/mosquitto/acl.conf`:

```
# Admin user (full access)
user admin
topic readwrite #

# Bridge service (telemetry write)
user mqtt-bridge
topic write devices/+/telemetry
topic write devices/+/status

# Device user (device-specific access)
user device-%u
topic readwrite devices/%u/#
```

## Performance Tuning

### InfluxDB Performance

Edit `.env.iot`:

```bash
# Increase cache size for more devices
INFLUXDB_CACHE_SIZE=2GB

# Adjust retention for storage optimization
INFLUXDB_RETENTION=30d  # Reduce for less storage

# Enable downsampling for long-term storage
```

### Redis Performance

```bash
# Increase max memory
REDIS_MAX_MEMORY=2GB

# Configure eviction policy
REDIS_EVICTION_POLICY=allkeys-lru
```

### MQTT Broker Tuning

Edit `config/mosquitto/mosquitto.conf`:

```
# Increase max connections
max_connections 1000

# Adjust message size limit
message_size_limit 10485760  # 10MB

# Enable persistence for reliability
persistence true
persistence_location /mosquitto/data/
```

## Scaling

### Horizontal Scaling

For larger deployments:

1. **MQTT Broker Clustering**
   - Use MQTT bridge between multiple brokers
   - Configure shared subscriptions

2. **InfluxDB Clustering**
   - Upgrade to InfluxDB Enterprise
   - Configure clustering in `docker-compose.iot.yml`

3. **Load Balancing**
   - Add nginx/haproxy for frontend
   - Balance API requests across multiple backends

### Vertical Scaling

Adjust resource limits in `docker-compose.iot.yml`:

```yaml
services:
  influxdb:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 4G
        reservations:
          memory: 2G
```

## Integration Examples

### Python Client

```python
import paho.mqtt.client as mqtt
import json
from datetime import datetime

client = mqtt.Client()
client.username_pw_set("iodd", "mqtt123")
client.connect("localhost", 1883, 60)

# Publish telemetry
telemetry = {
    "parameter": "temperature",
    "value": 23.5,
    "unit": "°C",
    "timestamp": datetime.utcnow().isoformat()
}
client.publish("devices/sensor-001/telemetry", json.dumps(telemetry))
```

### Node.js Client

```javascript
const mqtt = require('mqtt');

const client = mqtt.connect('mqtt://localhost:1883', {
  username: 'iodd',
  password: 'mqtt123'
});

client.on('connect', () => {
  // Subscribe to telemetry
  client.subscribe('devices/+/telemetry');

  // Publish telemetry
  const telemetry = {
    parameter: 'pressure',
    value: 101.3,
    unit: 'kPa',
    timestamp: new Date().toISOString()
  };
  client.publish('devices/sensor-002/telemetry', JSON.stringify(telemetry));
});

client.on('message', (topic, message) => {
  console.log(`${topic}: ${message.toString()}`);
});
```

## Updating the Platform

```bash
# Pull latest changes
git pull origin main

# Rebuild containers
docker-compose -f docker-compose.iot.yml build

# Restart services
docker-compose -f docker-compose.iot.yml up -d

# Check for issues
docker-compose -f docker-compose.iot.yml logs -f
```

## Uninstalling

```bash
# Stop all services
docker-compose -f docker-compose.iot.yml down

# Remove volumes (WARNING: This deletes all data!)
docker-compose -f docker-compose.iot.yml down -v

# Remove images
docker-compose -f docker-compose.iot.yml down --rmi all
```

## Support & Resources

- **Documentation**: `docs/` directory
- **API Reference**: http://localhost:8000/docs (when running)
- **GitHub Issues**: Report bugs and request features
- **Example Configurations**: `config/` directory
- **Example Flows**: `config/nodered/flows.json`

## Next Steps

1. Import your IO-Link device IODDs
2. Configure your devices to publish to MQTT
3. Create custom Grafana dashboards
4. Build Node-RED automation flows
5. Set up alerting and notifications
6. Implement custom analytics

## License

See LICENSE file for details.
