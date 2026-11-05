# Base Fullstack Boilerplate

A comprehensive full-stack boilerplate designed to accelerate application development by providing a structured foundation that integrates a modern frontend, a backend API, and a relational database within a single repository.

# Overview

This project provides a starting point for building full-stack applications using a monorepo structure. It combines frontend and backend development in a single workspace, simplifying dependency management, development workflows, and project organization.

The goal of this boilerplate is to reduce initial setup time and provide a scalable structure suitable for both small projects and production-ready applications.

# Project Structure

```csharp
base-fullstack-boilerplate/
│
├── client/     # Frontend application
├── server/     # Backend API
├── package.json
└── README.md
```

- **client/:** Contains the frontend application and user interface logic.
- **server/:** Contains the backend API, business logic, and database interaction.
- Root configuration files manage shared dependencies and scripts.

# Features
- Full-stack architecture ready for development.
- Monorepo organization for frontend and backend.
- Modular and scalable structure.
- Separation of concerns between UI and API.
- Designed for rapid project initialization.

# Getting Started

## 1. Requirements
- Node.js (recommended LTS version)
- npm or compatible package manager

## 2. Installation
```bash
git clone https://github.com/Jesuspestana01/base-fullstack-boilerplate.git
cd base-fullstack-boilerplate
npm install
```

## 3. Environment Variables 
This project uses environment variables to configure server behavior, authentication, and database connection settings. **Make sure to configure them before initiating the server**.

```bash
# Server Configuration
PORT=3010
SECRET="your_jwt_secret_here"

# Database Configuration (Individual)
DB_DIALECT=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password
DB_NAME=my_database
```
**Description:**
- **PORT:** Port where the backend server runs.
- **SECRET:** Secret key used for JWT authentication.
- **DB_DIALECT:** Database engine (e.g., mysql).
- **DB_HOST:** Database host address.
- **DB_PORT:** Database port.
- **DB_USER:** Database username.
- **DB_PASSWORD:** Database password.
- **DB_NAME:** Database name.

## 3. Development
```bash
npm run dev
```
This command should start both frontend and backend in development mode.

# Customization
This boilerplate is intended as a foundation. You can adapt:

- Frontend framework or styling approach.
- Backend architecture or middleware.
- Database schema and ORM configuration.
- Deployment strategy.

# License

This project is available under the **MIT License** unless otherwise specified.
[MIT](https://choosealicense.com/licenses/mit/)
