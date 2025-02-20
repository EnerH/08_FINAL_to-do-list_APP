# Todo List Application with PostgreSQL 📝🐘

A full-stack todo list application with CRUD operations, featuring a Node.js backend, vanilla JavaScript frontend, and PostgreSQL database integration.

## Features ✨
- **CRUD Operations**: Create, Read, Update, and Delete tasks.
- **Modern UI**: Clean interface with Tailwind CSS and smooth animations.
- **PostgreSQL Integration**: Persistent storage with a relational database.
- **Environment Configuration**: Secure credential management using a `.env` file.
- **Responsive Design**: Works on both desktop and mobile devices.

## Installation 🛠️

### Prerequisites
- Node.js (v14+)
- PostgreSQL (v12+)
- pgAdmin 4 (recommended)

# Steps

1. ## Clone the Repository
   ```bash
   git clone https://github.com/your-username/todo-app.git
   cd todo-app

2. ## Install Dependencies
   ```bash
   npm install

3. ## Database Setup
   ```bash
   CREATE TABLE todos (
    id SERIAL PRIMARY KEY,
    task VARCHAR(255) NOT NULL,
    completed BOOLEAN DEFAULT FALSE
    );

4. ## Environment Configuration
   ```bash
    DB_HOST=localhost
    DB_USER=postgres
    DB_PASSWORD=your_postgres_password
    DB_NAME=your_database_name
    DB_PORT=5432

5. ## Runnng Apllication
   ```bash
     node server.js

6. ## Access to application
    ```bash
   http://localhost:3000

