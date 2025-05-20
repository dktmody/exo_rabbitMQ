# Distributed Calculator
A RabbitMQ-based distributed computing system for the NGI Nuclear Physics Institute.

## Prerequisites
- Node.js >= 16
- Docker >= 20
- RabbitMQ (via Docker or local installation)

## Setup
1. Clone the repository: `git clone <repo-url>`
2. Install dependencies: `npm install`
3. Start RabbitMQ: `docker-compose up -d`
4. Run components:
   - Producer: `npm run start:producer`
   - Worker: `npm run start:worker -- --op=add`
   - Consumer: `npm run start:consumer`

## Next Steps
- Implement producer, worker, and consumer logic (in progress).
