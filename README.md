# Gourmet Flow - Full-Stack Restaurant Management System

Gourmet Flow is a full-stack web application designed to streamline restaurant operations. This project serves as a comprehensive prototype for Milestone 4, integrating a Node.js/Prisma backend with a reactive Tailwind-styled frontend to deliver a complete digital hospitality experience.

## 📑 Project Structure & Documentation
This project is structured as a monorepo to maintain a clean separation between the API logic and the user interface:

*   **[Frontend Implementation](./frontend/README.md):** Built with React + Vite. Focuses on Component Architecture, Global State Management, and API Integration.
*   **[Backend Implementation](./backend/README.md):** Built with Node.js + Express + Prisma. Focuses on RBAC Security, State Machines, and Relational Database Integrity.

## 🛠️ Tech Stack
*   **Frontend:** React 18 (Vite), Tailwind CSS, Lucide Icons, Axios.
*   **Backend:** Node.js, Express.js, PostgreSQL, Prisma ORM.
*   **Security:** JWT (JSON Web Tokens), Bcrypt password hashing, Server-side Token Blacklisting.
*   **Testing:** Jest & Supertest (Integration and Unit testing).

## 👥 Team Members (Group 24)
*   **Muhammad Hashir Ilyas (26972)** - muhammadhashir.ilyas@gmail.com
*   **Zain Sharjeel (26922)** - zain.sharjil@gmail.com
*   **Ibrahim Iqbal (27085)** - ibrahimiqbal2002@yahoo.com

## ✅ Core Workflows Implemented
1.  **Table Reservations & Pre-Orders:** Interactive visual floor plan with **2-hour collision validation** and an integrated pre-order menu system.
2.  **Online Ordering (Delivery/Takeaway):** Multi-step cart and checkout flow with fulfillment type selection and mock payment gateway integration.
3.  **Catering & Event Planning:** Specialized logic for high-volume bookings featuring a **Price-per-Head calculation engine** and administrative approval pipelines.