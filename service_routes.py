"""
Service Management Routes
Provides REST API endpoints for managing application services (MQTT, InfluxDB, Node-RED, Grafana)
with port configuration and conflict detection
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
import subprocess
import psutil
import os
import json
import socket
import shutil
from pathlib import Path

router = APIRouter()

# Service configuration file path
SERVICE_CONFIG_FILE = Path("config/services.json")
SERVICE_CONFIG_FILE.parent.mkdir(exist_ok=True)

# Default service configurations
DEFAULT_SERVICES = {
    "mosquitto": {
        "name": "Mosquitto MQTT Broker",
        "port": 1883,
        "process_name": "mosquitto",
        "executable": "mosquitto",
        "config_file": "config/mosquitto.conf",
        "start_command": ["mosquitto", "-c", "config/mosquitto.conf"],
        "enabled": True,
        "auto_start": False
    },
    "influxdb": {
        "name": "InfluxDB",
        "port": 8086,
        "process_name": "influxd",
        "executable": "influxd",
        "config_file": "config/influxdb.conf",
        "start_command": ["influxd"],
        "enabled": True,
        "auto_start": False
    },
    "nodered": {
        "name": "Node-RED",
        "port": 1880,
        "process_name": "node-red",
        "executable": "node-red",
        "config_file": None,
        "start_command": ["node-red"],
        "enabled": True,
        "auto_start": False
    },
    "grafana": {
        "name": "Grafana",
        "port": 3000,
        "process_name": "grafana-server",
        "executable": "grafana-server",
        "config_file": "config/grafana.ini",
        "start_command": ["grafana-server"],
        "enabled": True,
        "auto_start": False
    }
}

class ServiceConfig(BaseModel):
    """Service configuration model"""
    port: int = Field(..., ge=1, le=65535)
    enabled: bool = True
    auto_start: bool = False
    config_file: Optional[str] = None

class ServiceStatus(BaseModel):
    """Service status information"""
    name: str
    running: bool
    pid: Optional[int] = None
    port: int
    port_available: bool
    port_conflict: Optional[Dict[str, Any]] = None
    enabled: bool
    auto_start: bool
    executable_found: bool
    config_valid: bool
    error: Optional[str] = None

class PortConflict(BaseModel):
    """Port conflict information"""
    port: int
    process_name: str
    pid: int
    service: Optional[str] = None

# Load service configuration
def load_service_config() -> Dict[str, Dict]:
    """Load service configuration from file"""
    if SERVICE_CONFIG_FILE.exists():
        try:
            with open(SERVICE_CONFIG_FILE, 'r') as f:
                config = json.load(f)
                # Merge with defaults to add any new services
                for service, defaults in DEFAULT_SERVICES.items():
                    if service not in config:
                        config[service] = defaults
                    else:
                        # Ensure all required fields exist
                        for key, value in defaults.items():
                            if key not in config[service]:
                                config[service][key] = value
                return config
        except Exception as e:
            print(f"Error loading service config: {e}")
            return DEFAULT_SERVICES.copy()
    return DEFAULT_SERVICES.copy()

def save_service_config(config: Dict[str, Dict]):
    """Save service configuration to file"""
    try:
        with open(SERVICE_CONFIG_FILE, 'w') as f:
            json.dump(config, f, indent=2)
    except Exception as e:
        print(f"Error saving service config: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to save configuration: {str(e)}")

def check_port_available(port: int) -> tuple[bool, Optional[Dict]]:
    """Check if a port is available (simplified for performance)"""
    try:
        # Try to bind to the port
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        sock.settimeout(0.1)
        sock.bind(('localhost', port))
        sock.close()
        return True, None  # Port is available
    except OSError:
        # Port is in use
        return False, {
            "port": port,
            "process_name": "Unknown",
            "pid": 0,
            "cmdline": "Port in use"
        }
    except Exception:
        # If we can't check, assume it's available
        return True, None

def find_process_by_name(name: str, process_cache: Optional[list] = None) -> Optional[psutil.Process]:
    """Find a process by name (optimized for performance)

    Args:
        name: Process name to search for
        process_cache: Optional list of processes to search through (for performance)
    """
    if process_cache is None:
        # Collect processes with minimal info for speed
        try:
            process_cache = list(psutil.process_iter(['name']))
        except Exception:
            return None

    name_lower = name.lower()
    for proc in process_cache:
        try:
            proc_info = proc.info if hasattr(proc, 'info') else proc.as_dict(['name'])
            proc_name = proc_info.get('name', '').lower()
            if name_lower in proc_name:
                return proc
        except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess, AttributeError):
            pass
    return None

def check_executable_exists(executable: str) -> bool:
    """Check if an executable exists in PATH"""
    if os.name == 'nt':  # Windows
        executable = executable if executable.endswith('.exe') else f"{executable}.exe"

    return shutil.which(executable) is not None

@router.get("/api/services/status", response_model=Dict[str, ServiceStatus])
async def get_services_status():
    """Get status of all services"""
    config = load_service_config()
    status = {}

    # Collect process list once for performance (minimal info only)
    try:
        process_cache = list(psutil.process_iter(['name']))
    except Exception:
        process_cache = None

    for service_id, service_config in config.items():
        # Check if process is running
        proc = find_process_by_name(service_config['process_name'], process_cache)
        running = proc is not None
        pid = proc.pid if proc else None

        # Check port availability
        port = service_config['port']
        port_available, port_conflict = check_port_available(port)

        # Check if executable exists
        executable_found = check_executable_exists(service_config['executable'])

        # Validate config file if specified
        config_valid = True
        if service_config.get('config_file'):
            config_valid = Path(service_config['config_file']).exists()

        # Determine error message
        error = None
        if running and not port_available and port_conflict:
            if port_conflict.get('pid') != pid:
                error = f"Port {port} conflict with {port_conflict.get('process_name', 'unknown')}"
        elif not executable_found:
            error = f"Executable '{service_config['executable']}' not found in PATH"
        elif not config_valid:
            error = f"Config file '{service_config['config_file']}' not found"

        status[service_id] = ServiceStatus(
            name=service_config['name'],
            running=running,
            pid=pid,
            port=port,
            port_available=port_available if not running else True,  # Port is "available" if we're using it
            port_conflict=port_conflict if not running and not port_available else None,
            enabled=service_config.get('enabled', True),
            auto_start=service_config.get('auto_start', False),
            executable_found=executable_found,
            config_valid=config_valid,
            error=error
        )

    return status

@router.get("/api/services/conflicts", response_model=List[PortConflict])
async def get_port_conflicts():
    """Get all port conflicts"""
    config = load_service_config()
    conflicts = []

    # Collect process list once for performance (minimal info only)
    try:
        process_cache = list(psutil.process_iter(['name']))
    except Exception:
        process_cache = None

    for service_id, service_config in config.items():
        port = service_config['port']
        available, conflict = check_port_available(port)

        if not available and conflict:
            # Check if this is one of our services
            proc = find_process_by_name(service_config['process_name'], process_cache)
            if not proc or (proc and proc.pid != conflict.get('pid')):
                conflicts.append(PortConflict(
                    port=port,
                    process_name=conflict.get('process_name', 'Unknown'),
                    pid=conflict.get('pid', 0),
                    service=service_id
                ))

    return conflicts

@router.post("/api/services/{service_id}/start")
async def start_service(service_id: str):
    """Start a service"""
    config = load_service_config()

    if service_id not in config:
        raise HTTPException(status_code=404, detail=f"Service '{service_id}' not found")

    service_config = config[service_id]

    # Check if already running
    proc = find_process_by_name(service_config['process_name'])
    if proc:
        return {"status": "already_running", "pid": proc.pid, "message": f"{service_config['name']} is already running"}

    # Check if executable exists
    if not check_executable_exists(service_config['executable']):
        raise HTTPException(
            status_code=400,
            detail=f"Executable '{service_config['executable']}' not found. Please install {service_config['name']} first."
        )

    # Check port availability
    port_available, conflict = check_port_available(service_config['port'])
    if not port_available:
        raise HTTPException(
            status_code=409,
            detail=f"Port {service_config['port']} is already in use by {conflict.get('process_name', 'unknown process')}"
        )

    # Start the service
    try:
        if os.name == 'nt':  # Windows
            # Use CREATE_NEW_PROCESS_GROUP to detach from parent
            process = subprocess.Popen(
                service_config['start_command'],
                creationflags=subprocess.CREATE_NEW_PROCESS_GROUP | subprocess.DETACHED_PROCESS,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )
        else:  # Unix/Linux
            process = subprocess.Popen(
                service_config['start_command'],
                start_new_session=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )

        # Wait a bit to ensure it started
        import time
        time.sleep(2)

        # Verify it's running
        proc = find_process_by_name(service_config['process_name'])
        if proc:
            return {
                "status": "started",
                "pid": proc.pid,
                "message": f"{service_config['name']} started successfully"
            }
        else:
            return {
                "status": "unknown",
                "message": f"{service_config['name']} may have started but could not verify process"
            }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start service: {str(e)}")

@router.post("/api/services/{service_id}/stop")
async def stop_service(service_id: str):
    """Stop a service"""
    config = load_service_config()

    if service_id not in config:
        raise HTTPException(status_code=404, detail=f"Service '{service_id}' not found")

    service_config = config[service_id]

    # Find the process
    proc = find_process_by_name(service_config['process_name'])
    if not proc:
        return {"status": "not_running", "message": f"{service_config['name']} is not running"}

    # Stop the process
    try:
        proc.terminate()
        proc.wait(timeout=10)  # Wait up to 10 seconds
        return {"status": "stopped", "message": f"{service_config['name']} stopped successfully"}
    except psutil.TimeoutExpired:
        # Force kill if it doesn't stop gracefully
        proc.kill()
        return {"status": "killed", "message": f"{service_config['name']} was force-stopped"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to stop service: {str(e)}")

@router.post("/api/services/{service_id}/restart")
async def restart_service(service_id: str):
    """Restart a service"""
    await stop_service(service_id)
    import time
    time.sleep(1)  # Wait a second between stop and start
    return await start_service(service_id)

@router.put("/api/services/{service_id}/config", response_model=Dict[str, Any])
async def update_service_config(service_id: str, new_config: ServiceConfig):
    """Update service configuration"""
    config = load_service_config()

    if service_id not in config:
        raise HTTPException(status_code=404, detail=f"Service '{service_id}' not found")

    # Check if port change would cause conflict
    if new_config.port != config[service_id]['port']:
        # Check if service is running
        proc = find_process_by_name(config[service_id]['process_name'])
        if proc:
            raise HTTPException(
                status_code=400,
                detail="Cannot change port while service is running. Please stop the service first."
            )

        # Check if new port is available
        port_available, conflict = check_port_available(new_config.port)
        if not port_available:
            raise HTTPException(
                status_code=409,
                detail=f"Port {new_config.port} is already in use by {conflict.get('process_name', 'unknown process')}"
            )

    # Update configuration
    config[service_id]['port'] = new_config.port
    config[service_id]['enabled'] = new_config.enabled
    config[service_id]['auto_start'] = new_config.auto_start
    if new_config.config_file:
        config[service_id]['config_file'] = new_config.config_file

    save_service_config(config)

    return {"status": "updated", "message": f"{config[service_id]['name']} configuration updated", "config": config[service_id]}

@router.get("/api/services/health")
async def services_health_check():
    """Get overall health status of all services"""
    config = load_service_config()
    status = await get_services_status()

    total = len(config)
    running = sum(1 for s in status.values() if s.running)
    enabled = sum(1 for s in status.values() if s.enabled)
    errors = sum(1 for s in status.values() if s.error)
    conflicts = len(await get_port_conflicts())

    return {
        "total_services": total,
        "running": running,
        "enabled": enabled,
        "errors": errors,
        "port_conflicts": conflicts,
        "health": "healthy" if errors == 0 and conflicts == 0 else "degraded" if running > 0 else "critical"
    }
