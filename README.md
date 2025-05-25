Full-Stack Authentication System
A robust and secure full-stack user authentication system built with React on the frontend and Node.js (Express) on the backend, integrated with MongoDB. This project includes essential authentication features, email verification, and password reset functionalities.

Table of Contents
Features

Technologies Used

Frontend

Backend

Getting Started

Prerequisites

Installation

Environment Variables

Running the Application

Project Structure

Common Challenges & Solutions

Contributing

License

Features
This authentication system provides the following core functionalities:

User Registration: Secure creation of new user accounts.

User Login & Logout: Authenticate users and manage sessions using HTTP-only cookies.

Email Verification: Implement OTP (One-Time Password) based email confirmation for new users.

Password Reset: Allow users to securely reset forgotten passwords via email OTP.

Protected Routes: Ensure only authenticated users can access specific data or functionalities.

User Data Retrieval: Authenticated users can fetch their basic profile information.

Technologies Used
Frontend
React: A JavaScript library for building user interfaces.

React Router DOM: For declarative routing in React applications.

Axios: A promise-based HTTP client for making API requests.

React Context API: For efficient global state management.

React Toastify: For displaying clear and concise notifications (toasts).

Tailwind CSS (Assumed based on styling in JSX): A utility-first CSS framework for rapid UI development.

Backend
Node.js: JavaScript runtime environment.

Express.js: A fast, unopinionated, minimalist web framework for Node.js.

MongoDB: A NoSQL document database.

Mongoose: An ODM (Object Data Modeling) library for MongoDB and Node.js.

bcrypt.js: A library for hashing passwords securely.

jsonwebtoken (JWT): For implementing secure, token-based authentication.

Nodemailer: A module for sending emails from Node.js applications (used for OTPs).

Cookie-parser: Middleware for parsing cookies attached to the client request object.

Dotenv: For loading environment variables from a .env file.

Getting Started
Follow these steps to set up and run the project locally.

Prerequisites
Node.js (v14 or higher recommended)

MongoDB instance (local or cloud-hosted like MongoDB Atlas)

npm or yarn (package manager)

Installation
Clone the repository:

git clone <your-repo-url>
cd <your-repo-name>

Install Backend Dependencies:

cd backend # Navigate to your backend directory
npm install # or yarn install

Install Frontend Dependencies:

cd ../frontend # Navigate to your frontend directory (adjust path if different)
npm install # or yarn install

Environment Variables
Create a .env file in your backend directory with the following variables:

MONGODB_URL=your_mongodb_connection_string
JWT_SECRET=a_very_strong_secret_key_for_jwt_signing
SMTP_USER=your_brevo_smtp_username # e.g., your_email@example.com
SMTP_PASS=your_brevo_smtp_password # Brevo (Sendinblue) generated SMTP key
SENDER_EMAIL=your_sender_email@example.com
NODE_ENV=development # or production

Note: For JWT_SECRET, generate a strong, random string. For SMTP_USER and SMTP_PASS, use credentials from your email service provider (e.g., Brevo/Sendinblue SMTP settings).

Running the Application
Start the Backend Server:

cd backend
npm start # or node server.js (if your main file is server.js)

The backend server will typically run on http://localhost:4000 (or whatever port you've configured).

Start the Frontend Development Server:

cd frontend
npm start # or yarn start

The frontend application will typically open in your browser at http://localhost:5173.

Project Structure
(Assuming a typical structure, adjust if yours is different)

.
├── backend/
│   ├── config/             # Database connection, Nodemailer, Email Templates
│   │   ├── connectDB.js
│   │   ├── nodemailer.js
│   │   └── emailTemplates.js
│   ├── controllers/        # Express route handlers (authController, userController)
│   │   ├── authController.js
│   │   └── userController.js
│   ├── middleware/         # Authentication middleware (userAuth.js)
│   │   └── userAuth.js
│   ├── models/             # Mongoose schemas (usermodel.js)
│   │   └── usermodel.js
│   ├── routes/             # API routes
│   │   └── authRoutes.js
│   │   └── userRoutes.js
│   ├── .env                # Environment variables
│   ├── server.js           # Main backend server file
│   └── package.json
└── frontend/
    ├── public/
    ├── src/
    │   ├── assets/         # Images, icons
    │   ├── components/     # Reusable React components
    │   ├── context/        # React Context API for global state (AppContext.js)
    │   │   └── AppContext.js
    │   ├── pages/          # Main application pages (ResetPassword.jsx, Login, Register, etc.)
    │   │   └── ResetPassword.jsx
    │   ├── App.js
    │   ├── index.js
    │   └── ...
    ├── .env                # Frontend environment variables (e.g., VITE_BACKEND_URL)
    └── package.json

Common Challenges & Solutions
During the development of this project, specific challenges were encountered and resolved:

Cannot set properties of undefined (setting 'userId') (Backend)

Problem: Occurred in the authentication middleware (userAuth.js) when attempting to set req.userId = tokenDecode.id;. This indicated req was sometimes unexpectedly undefined or req.body was being mistakenly targeted for userId injection.

Solution: Ensured req.userId = tokenDecode.id; was used to directly attach the userId to the request object. Crucially, controllers (authController.js, userController.js) were updated to consistently retrieve userId from req.userId instead of trying to destructure from req.body (e.g., const userId = req.userId;). This resolved the req.body being undefined for userId access in subsequent steps.

TypeError: Cannot read properties of null (reading 'value') (Frontend)

Problem: Faced this in the ResetPassword.jsx component. It happened when attempting to collect OTP input values using inputRefs.current.map((e) => e.value) in onSubmitNewPassword. The OTP input fields were unmounted (null references in inputRefs.current) by the time this function was called, leading to the error.

Solution: The OTP value is now collected and stored in a dedicated collectedOtp state variable (useState) within the onSubmitOTP function (which is triggered when the OTP form is submitted). The onSubmitNewPassword function then uses this collectedOtp state directly, avoiding attempts to access unmounted DOM elements via useRef.

Contributing
Contributions are welcome! If you have suggestions for improvements or find issues, please open an issue or submit a pull request.

License
This project is open-sourced under the MIT License. See the LICENSE file for more details. (You might need to create a LICENSE file if you haven't already).
