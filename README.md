# MERN Authentication System

## Created on _Jan 21, 2025_

## Overview

This is a **MERN (MongoDB, Express, React, Node.js) authentication system** with Role-Based Access Control (
RBAC).
It includes user authentication, role management, and email verification.

## Features

- User Registration & Login
- Role-Based Access Control (RBAC)
- Email Verification (via Resend API)
- Secure Password Hashing
- Environment Configuration Handling
- RESTful API Structure
- Backend uses TypeScript

## Installation

### Prerequisites

- Node.js (v23+ recommended)
- MongoDB
- NPM or Yarn

### Setup Instructions

1. Clone the repository:
   ```sh
   git clone <repository-url>
   cd mern-auth-main
   ```
2. Install dependencies for backend:
   ```sh
   cd backend
   npm install
   ```
3. Setup environment variables:
    - Copy `sample.env` and rename it to `.env`
    - Fill in necessary values

4. Start the backend server:
   ```sh
   npm run backend
   ```

5. Install dependencies for frontend:
   ```sh
   cd ../frontend
   npm install
   ```
6. Start the frontend server:
   ```sh
   npm run frontend
   ```

## Folder Structure

```
mern-auth-main/
├── backend/
│   ├── src/
│   │   ├── config/         # Database & API configurations
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Authentication & validation middleware
│   │   ├── models/         # Database models
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # Business logic & utilities
│   │   ├── app.ts          # Express app entry point
│   │   ├── index.ts        # Main server file
│   ├── package.json
│   ├── tsconfig.json
│   ├── sample.env
│   ├── .npmrc
├── frontend/
│   ├── public/             # Static assets
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── config/         # API & query client config
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Page components
│   │   ├── App.jsx         # Main App component
│   │   ├── main.jsx        # React entry point
│   ├── package.json
│   ├── vite.config.js
│   ├── sample.env
├── README.md
```

## API Endpoints

| Endpoint                   | Method | Description                                                       |
|----------------------------|--------|-------------------------------------------------------------------|
| `/auth/register`           | POST   | Register a new user                                               |
| `/auth/login`              | POST   | Login user                                                        |
| `/auth/refresh`            | GET    | Refreshes access token if refresh token is present or not expired |
| `/auth/logout`             | GET    | Logs out the user                                                 |
| `/auth/email/verify/:code` | GET    | Verify email                                                      |
| `/auth/password/forgot`    | POST   | Forgot password mail                                              |
| `/auth/password/reset`     | POST   | Reset Password link                                               |
|                            |        |                                                                   |
| `/admin/dashboard`         | GET    | Admin Dashboard                                                   |
| `/admin/sessions`          | GET    | Manage sessions of users                                          |
| `/admin/sessions/:id`      | DELETE | Manage sessions of users                                          |
|                            |        |                                                                   |
| `/user`                    | GET    | Get Logged in user details                                        |

## Technologies Used

- **Backend**: Node.js, Express, TypeScript, MongoDB, Mongoose
- **Frontend**: React, Vite, React Query, React Router
- **Authentication**: JWT, bcrypt, express-validator
- **Email Service**: Resend API

## Contributing

Contributions are welcome! Feel free to submit a pull request.

## License

This project is licensed under the MIT License.

