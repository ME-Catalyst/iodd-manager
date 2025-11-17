#!/bin/bash
# IODD Manager - Quick Setup Script

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                 IODD MANAGER - QUICK SETUP                  ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Check Python version
echo "✓ Checking Python installation..."
if command -v python3 &> /dev/null; then
    PYTHON_CMD=python3
elif command -v python &> /dev/null; then
    PYTHON_CMD=python
else
    echo "❌ Python is not installed. Please install Python 3.8+ first."
    exit 1
fi

echo "  Found: $($PYTHON_CMD --version)"
echo ""

# Install dependencies
echo "✓ Installing Python dependencies..."
$PYTHON_CMD -m pip install -r requirements.txt --quiet
echo "  Dependencies installed!"
echo ""

# Create desktop shortcut (optional)
read -p "Would you like to create a desktop shortcut? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    $PYTHON_CMD -m src.start --create-shortcut
    echo "  Desktop shortcut created!"
fi
echo ""

# Launch the application
echo "✓ Launching IODD Manager..."
echo ""
echo "══════════════════════════════════════════════════════════════"
echo "  The application will start in a moment..."
echo "  • API Server: http://localhost:8000"
echo "  • Web Interface: http://localhost:3000"
echo "  • API Documentation: http://localhost:8000/docs"
echo "══════════════════════════════════════════════════════════════"
echo ""

# Start the application
$PYTHON_CMD -m src.start
