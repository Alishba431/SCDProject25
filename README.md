NodeVault – Secure Local Record Manager (SCD Project)

A lightweight Node.js CLI application that stores encrypted-style records (name + value) in a JSON file and logs all add/update/delete operations using an event-driven architecture.

The project is fully containerized using Docker and Docker Compose, following the requirements of Part 7.

🚀 Features

Add, list, update, delete, sort and export the records and also backup those records and display statistics.

Event emitters + logger for record actions

File-based JSON storage

Clean modular structure (db, events, main.js)

Fully Dockerized (backend + MongoDB container)

Persistent DB storage using Docker volumes

🛠 Project Structure
SCDProject25/
│── main.js
│── Dockerfile
│── docker-compose.yml
│── .env
│── package.json
│── db/
│   ├── index.js
│   ├── record.js
│   ├── file.js
│── data/
│   └── vault.json
│── events/
│   ├── index.js
│   └── logger.js

📦 Run the Application (Without Docker)
1️⃣ Install dependencies
npm install

2️⃣ Run the CLI app
node main.js
Run on server 
npm start

Build + Run Using Docker Compose
docker compose up --build -d


This command will:

✔ Build the backend image from your Dockerfile
✔ Start the backend container
✔ Start MongoDB
✔ Create persistent volumes
✔ Expose backend on port 3000

3. Verify Containers Are Running
docker compose ps


Expected result:

scdproject25-backend   Up 0.0s  0.0.0.0:3000->3000/tcp
scdproject25-mongo     Up       0.0.0.0:27017->27017/tcp

🌐 Verify Functionality in Browser

Although NodeVault is a CLI app, we added a simple Express server.
Now you can check in your browser:

http://localhost:3000
