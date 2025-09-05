#!/bin/bash

# Team Retain Importer Script
# Usage: ./run_team_importer.sh <csv_file_path> [--clear-existing]

# Check if CSV file path is provided
if [ $# -eq 0 ]; then
    echo "Usage: $0 <csv_file_path> [--clear-existing]"
    echo ""
    echo "Examples:"
    echo "  $0 player-import-retain.csv                    # Import teams and retained players without clearing existing data"
    echo "  $0 player-import-retain.csv --clear-existing   # Clear existing teams and import new ones"
    echo ""
    echo "Note: Make sure to set up your environment variables (DB_HOST, DB_USER, etc.) before running"
    exit 1
fi

CSV_FILE="$1"
CLEAR_FLAG="$2"

# Check if CSV file exists
if [ ! -f "$CSV_FILE" ]; then
    echo "Error: CSV file '$CSV_FILE' not found!"
    exit 1
fi

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(dirname "$SCRIPT_DIR")"

# Change to backend directory
cd "$BACKEND_DIR"

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "Warning: .env file not found. Make sure environment variables are set."
    echo "You can copy env.example to .env and update the values."
fi

# Build the importer
echo "Building team retain importer..."
go build -o team_retain_importer scripts/team_retain_importer.go

if [ $? -ne 0 ]; then
    echo "Error: Failed to build the importer"
    exit 1
fi

# Run the importer
echo "Running team retain importer..."
if [ "$CLEAR_FLAG" = "--clear-existing" ]; then
    echo "Clearing existing team data and importing new teams..."
    ./team_retain_importer "$CSV_FILE" --clear-existing
else
    echo "Importing teams and retained players (keeping existing data)..."
    ./team_retain_importer "$CSV_FILE"
fi

# Clean up
rm -f team_retain_importer

echo "Team import process completed!"
