# Siraflow: Automated Payroll and Time Management System

[![Node.js](https://img.shields.io/badge/Node.js-v14%2B-brightgreen)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-Framework-blue)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-green)](https://www.mongodb.com/)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache%202.0-yellow.svg)](https://opensource.org/licenses/Apache-2.0)

Siraflow is a robust backend solution for streamlined payroll processing and employee time tracking. Designed for modern businesses, it automates salary calculations, bonus allocations, and direct disbursements via integrated mobile payment systems like Arifpay Telebirr B2C. Whether managing a small team or a larger enterprise, Siraflow ensures accuracy, security, and efficiency in handling workforce payments—reducing manual errors and saving valuable time.

At its heart, Siraflow empowers employers with real-time oversight of employee hours, automated payroll cycles (daily, weekly, or monthly), and seamless transfers to mobile wallets. Employees benefit from simple clock-in/out tools and transparent earnings tracking. By integrating authentication, data validation, and scheduled tasks, Siraflow transforms payroll from a chore into a seamless workflow.

## Features

- **User Authentication**: Secure JWT-based signup, login, and role-based access for employers and employees.
- **Company Management**: Customize settings like payment cycles, bonus multipliers, and track company-wide stats.
- **Employee Management**: Add, update, or remove employees with details including hourly rates and Telebirr mobile numbers for payouts.
- **Time Tracking**: Effortless clock-in/out with automatic calculation of regular hours, overtime, and bonuses; includes status approvals and notes.
- **Automated Payroll**: Computes salaries based on logged hours and cycles; supports bulk processing with retry mechanisms for reliability.
- **Payment Integration**: Direct B2C transfers via Arifpay Telebirr API, with webhook handling for real-time status updates (e.g., SUCCESS, PENDING, FAILED).
- **Scheduled Tasks**: Cron-like automation for payroll runs at midnight daily, Sundays weekly, or the 1st of each month; includes cleanup for old failed payments.
- **Security Measures**: Rate limiting, input sanitization, CORS, Helmet for headers, and bcrypt for password hashing.

Siraflow prioritizes user experience by separating roles—employers get full dashboard access, while employees see only their personal logs and profiles. It's ideal for businesses in regions relying on mobile money, offering a reliable, culturally attuned payroll solution.

## Tech Stack

Siraflow is built with a modern JavaScript backend stack for scalability and ease of maintenance:

- **Runtime**: Node.js (v14 or higher)
- **Framework**: Express.js for handling API routes and middleware
- **Database**: MongoDB with Mongoose for schema-based modeling
- **Authentication**: JWT for token-based auth, bcrypt for secure password hashing
- **Security**: Helmet for HTTP headers, express-rate-limit for API protection, CORS for cross-origin requests
- **Payments**: Arifpay Telebirr B2C API integration via HTTP requests
- **Scheduling**: Node-cron or similar for automated payroll and cleanup tasks
- **Other Libraries**: Joi or equivalent for input validation, Nodemon for development

The architecture follows a RESTful API design, with modular routes for authentication, company/employee management, time logs, and payments. Database models (e.g., User, Company, Employee, TimeLog, Payment) ensure structured data handling, while middleware enforces role-based access and error handling.

## Installation

To get Siraflow up and running locally:

1. **Clone the Repository**:
   ```
   git clone https://github.com/bisrat6/smartpay.git
   cd smartpay
   ```

2. **Install Dependencies**:
   ```
   npm install
   ```

3. **Set Up Environment Variables**:
   Copy `env.example` to `.env` and configure:
   ```
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   ARIFPAY_MERCHANT_KEY=your_arifpay_key
   FRONTEND_URL=your_frontend_url (for CORS)
   ARIFPAY_WEBHOOK_URL=your_webhook_endpoint
   ```

4. **Run the Server**:
   - Development mode (with auto-reload): `npm run dev`
   - Production mode: `npm start`

Ensure MongoDB is running and accessible via the `MONGO_URI`.

## Usage

Once running, interact with Siraflow via REST API endpoints. Use tools like Postman for testing.

### API Endpoints Overview

- **Authentication**:
  - `POST /api/auth/signup`: Register a new user (employer/employee).
  - `POST /api/auth/login`: Authenticate and receive JWT token.
  - `GET /api/auth/profile`: Fetch user profile (authenticated).

- **Company Management**:
  - `POST /api/company`: Create or update company settings (employer-only).
  - `GET /api/company/stats`: Retrieve company statistics.

- **Employee Management**:
  - `POST /api/employees`: Add a new employee (requires `telebirrMsisdn` in format `251XXXXXXXXX`).
  - `GET /api/employees`: List all employees.
  - `PUT /api/employees/:id`: Update employee details.
  - `DELETE /api/employees/:id`: Remove an employee.

- **Time Tracking**:
  - `POST /api/time-logs/clock-in`: Start time log.
  - `POST /api/time-logs/clock-out`: End time log and calculate duration/hours.
  - `GET /api/time-logs`: Retrieve logs (filtered by role).
  - `PUT /api/time-logs/:id/approve`: Approve log status (employer-only).

- **Payments**:
  - `POST /api/payments/process-payroll`: Initiate payroll computation and transfers.
  - `POST /api/payments/webhook/arifpay`: Handle Arifpay status updates (unauthenticated).
  - `GET /api/payments`: View payment history.

Payments follow a two-step Arifpay process: create session, then execute transfer. Supports dry-run mode for testing without real transactions. Webhooks verify signatures and update payment statuses in the database.

### Database Models

Siraflow uses Mongoose schemas for data integrity:

- **User**: `{ email, password (hashed), role ('employer'/'employee'), companyId, isActive }`
- **Company**: `{ name, paymentCycle ('daily'/'weekly'/'monthly'), bonusMultiplier, maxDailyHours }`
- **Employee**: `{ name, hourlyRate, telebirrMsisdn, position, department }`
- **TimeLog**: `{ employeeId, clockIn, clockOut, duration, regularHours, bonusHours, status ('pending'/'approved'), notes }`
- **Payment**: `{ employeeId, amount, period, status ('PENDING'/'SUCCESS'/'FAILED'), arifpayTransactionId, paymentDate, timeLogIds }`

These models support relationships (e.g., via ObjectId references) for efficient querying during payroll.


## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details. For commercial use, review the terms or contact the maintainers.
