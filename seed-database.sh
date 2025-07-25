#!/bin/bash
 
echo "Seeding database..."
docker-compose exec backend go run scripts/seed.go
echo "Database seeded successfully!" 