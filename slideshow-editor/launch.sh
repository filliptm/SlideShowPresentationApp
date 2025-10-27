#!/bin/bash

# Slideshow Presentation Studio Launch Script

echo "🎬 Starting Slideshow Presentation Studio..."
echo ""

# Check if frontend node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
    echo ""
fi

# Check if backend node_modules exists
if [ ! -d "../server/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd ../server && npm install && cd ../slideshow-editor
    echo ""
fi

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM

# Start backend server
echo "🔧 Starting backend server..."
cd ../server
npm start &
BACKEND_PID=$!
cd ../slideshow-editor

# Wait a moment for backend to start
sleep 2

# Start frontend dev server
echo "🚀 Starting frontend..."
echo ""
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:3001"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

npm run dev &
FRONTEND_PID=$!

# Wait for both processes
wait
