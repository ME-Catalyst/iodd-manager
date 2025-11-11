#!/usr/bin/env python3
"""
IODD Manager - Startup Script
==============================
Launches both the backend API and frontend web interface
"""

import os
import sys
import time
import subprocess
import webbrowser
import argparse
from pathlib import Path
import logging
import signal

import config

# Configure logging
logging.basicConfig(
    level=getattr(logging, config.LOG_LEVEL),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('IODD-Manager')

class IODDManagerLauncher:
    """Manages the startup and shutdown of IODD Manager components"""
    
    def __init__(self):
        self.processes = []
        self.project_root = Path(__file__).parent
        self.frontend_dir = self.project_root / 'frontend'
        self.api_port = config.API_PORT
        self.frontend_port = config.FRONTEND_PORT
        
    def check_dependencies(self):
        """Check if required dependencies are installed"""
        logger.info("Checking dependencies...")
        
        # Check Python packages
        required_packages = ['fastapi', 'uvicorn', 'sqlalchemy', 'jinja2']
        missing_packages = []
        
        for package in required_packages:
            try:
                __import__(package)
            except ImportError:
                missing_packages.append(package)
        
        if missing_packages:
            logger.warning(f"Missing Python packages: {', '.join(missing_packages)}")
            logger.info("Installing missing packages...")
            subprocess.run([
                sys.executable, '-m', 'pip', 'install', 
                '-r', 'requirements.txt'
            ])
        
        # Check if database exists, create if not
        db_path = self.project_root / 'iodd_manager.db'
        if not db_path.exists():
            logger.info("Initializing database...")
            from iodd_manager import StorageManager
            StorageManager()
            logger.info("Database initialized successfully")
        
        return True
    
    def start_api(self):
        """Start the FastAPI backend"""
        logger.info(f"Starting API server on port {self.api_port}...")
        
        api_process = subprocess.Popen(
            [sys.executable, 'api.py'],
            cwd=self.project_root,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        
        self.processes.append(api_process)
        
        # Wait for API to be ready
        time.sleep(2)
        
        # Check if API is running
        import requests
        try:
            response = requests.get(f"http://localhost:{self.api_port}/api/health")
            if response.status_code == 200:
                logger.info("✅ API server is running successfully")
                return True
        except:
            pass
        
        logger.warning("API server may not be ready yet")
        return False
    
    def start_frontend(self):
        """Start the frontend web server"""
        logger.info(f"Starting frontend server on port {self.frontend_port}...")
        
        # Use Python's built-in HTTP server for the Vue.js app
        frontend_process = subprocess.Popen(
            [sys.executable, '-m', 'http.server', str(self.frontend_port)],
            cwd=self.frontend_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        
        self.processes.append(frontend_process)
        
        # Wait for frontend to be ready
        time.sleep(1)
        
        logger.info(f"✅ Frontend server is running on http://localhost:{self.frontend_port}")
        return True
    
    def open_browser(self):
        """Open the web interface in the default browser"""
        url = f"http://localhost:{self.frontend_port}"

        if not config.AUTO_OPEN_BROWSER:
            logger.info(f"Auto-open browser disabled. Please open your browser and navigate to: {url}")
            return

        logger.info(f"Opening browser at {url}")

        # Wait a bit for servers to fully initialize
        time.sleep(2)

        try:
            webbrowser.open(url)
            logger.info("✅ Browser opened successfully")
        except Exception as e:
            logger.warning(f"Could not open browser automatically: {e}")
            logger.info(f"Please open your browser and navigate to: {url}")
    
    def create_desktop_shortcut(self):
        """Create a desktop shortcut for easy access"""
        desktop = Path.home() / 'Desktop'
        if not desktop.exists():
            return
        
        if sys.platform == 'win32':
            # Windows shortcut
            shortcut_path = desktop / 'IODD Manager.bat'
            with open(shortcut_path, 'w') as f:
                f.write(f'@echo off\n')
                f.write(f'cd /d "{self.project_root}"\n')
                f.write(f'python start.py\n')
            logger.info(f"✅ Desktop shortcut created: {shortcut_path}")
            
        elif sys.platform in ['darwin', 'linux']:
            # Unix-like shortcut
            shortcut_path = desktop / 'IODD_Manager.sh'
            with open(shortcut_path, 'w') as f:
                f.write('#!/bin/bash\n')
                f.write(f'cd "{self.project_root}"\n')
                f.write(f'python3 start.py\n')
            
            # Make executable
            os.chmod(shortcut_path, 0o755)
            logger.info(f"✅ Desktop shortcut created: {shortcut_path}")
    
    def shutdown(self, signum=None, frame=None):
        """Gracefully shutdown all processes"""
        logger.info("\n🛑 Shutting down IODD Manager...")
        
        for process in self.processes:
            if process.poll() is None:  # Process is still running
                process.terminate()
                try:
                    process.wait(timeout=5)
                except subprocess.TimeoutExpired:
                    process.kill()
        
        logger.info("✅ All services stopped successfully")
        sys.exit(0)
    
    def run(self, args):
        """Main startup sequence"""
        print("""
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║     ██╗ ██████╗ ██████╗ ██████╗     ███╗   ███╗ ██████╗    ║
║     ██║██╔═══██╗██╔══██╗██╔══██╗    ████╗ ████║██╔════╝    ║
║     ██║██║   ██║██║  ██║██║  ██║    ██╔████╔██║██║  ███╗   ║
║     ██║██║   ██║██║  ██║██║  ██║    ██║╚██╔╝██║██║   ██║   ║
║     ██║╚██████╔╝██████╔╝██████╔╝    ██║ ╚═╝ ██║╚██████╔╝   ║
║     ╚═╝ ╚═════╝ ╚═════╝ ╚═════╝     ╚═╝     ╚═╝ ╚═════╝    ║
║                                                              ║
║             Industrial Device Management System              ║
║                        Version 2.0                           ║
╚══════════════════════════════════════════════════════════════╝
        """)
        
        # Register signal handlers for graceful shutdown
        signal.signal(signal.SIGINT, self.shutdown)
        signal.signal(signal.SIGTERM, self.shutdown)
        
        try:
            # Check dependencies
            if not self.check_dependencies():
                logger.error("Dependency check failed")
                return 1
            
            # Start services
            if not args.frontend_only:
                if not self.start_api():
                    logger.error("Failed to start API server")
                    return 1
            
            if not args.api_only:
                if not self.start_frontend():
                    logger.error("Failed to start frontend server")
                    return 1
            
            # Create desktop shortcut on first run
            if args.create_shortcut:
                self.create_desktop_shortcut()
            
            # Open browser
            if not args.no_browser and not args.api_only:
                self.open_browser()
            
            # Print status
            print("\n" + "="*60)
            print("🚀 IODD Manager is running!")
            print("="*60)
            
            if not args.frontend_only:
                print(f"📡 API Server:     http://localhost:{self.api_port}")
                print(f"📚 API Docs:       http://localhost:{self.api_port}/docs")
            
            if not args.api_only:
                print(f"🌐 Web Interface:  http://localhost:{self.frontend_port}")
            
            print("="*60)
            print("\nPress Ctrl+C to stop all services")
            print("="*60 + "\n")
            
            # Keep the main process running
            while True:
                time.sleep(1)
                
                # Check if processes are still running
                for process in self.processes:
                    if process.poll() is not None:
                        logger.warning("A service has stopped unexpectedly")
                        self.shutdown()
                
        except KeyboardInterrupt:
            self.shutdown()
        except Exception as e:
            logger.error(f"Unexpected error: {e}")
            self.shutdown()
            return 1
        
        return 0

def main():
    """Entry point with argument parsing"""
    parser = argparse.ArgumentParser(
        description='IODD Manager - Industrial Device Management System'
    )
    
    parser.add_argument(
        '--api-only',
        action='store_true',
        help='Start only the API server'
    )
    
    parser.add_argument(
        '--frontend-only',
        action='store_true',
        help='Start only the frontend server'
    )
    
    parser.add_argument(
        '--no-browser',
        action='store_true',
        help='Do not open browser automatically'
    )
    
    parser.add_argument(
        '--api-port',
        type=int,
        default=8000,
        help='API server port (default: 8000)'
    )
    
    parser.add_argument(
        '--frontend-port',
        type=int,
        default=3000,
        help='Frontend server port (default: 3000)'
    )
    
    parser.add_argument(
        '--create-shortcut',
        action='store_true',
        help='Create desktop shortcut'
    )
    
    args = parser.parse_args()
    
    # Create and run launcher
    launcher = IODDManagerLauncher()
    launcher.api_port = args.api_port
    launcher.frontend_port = args.frontend_port
    
    return launcher.run(args)

if __name__ == '__main__':
    sys.exit(main())
