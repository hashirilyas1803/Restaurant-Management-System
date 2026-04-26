# Gourmet Flow - Frontend Implementation (Milestone 4)

This directory contains the reactive frontend for Gourmet Flow. The UI utilizes a modern aesthetic with a tech-focused design to ensure logical clarity and a premium user experience.

## ✨ Key Features & Functionality
*   **State-Driven Authentication:** Integrated login/registration with persistent session management via React Context API.
*   **Interactive Table Map:** A dynamic SVG-based floor plan that fetches real-time table availability from the database to prevent overbooking.
*   **Seamless Checkout Journey:** A multi-step form handling fulfillment logic (Delivery vs. Takeaway) and secure payment method selection.
*   **Unified UI Success States:** State-driven confirmation cards that replace standard browser alerts for a polished, application-native feel.
*   **Admin Control Panel:** Specialized administrative layouts for managing system-wide orders, catering reviews, and user accounts.

## 🏗️ Architecture & Libraries
*   **React Router v6:** Implemented with **Protected Route Guards** to enforce Role-Based Access Control (RBAC).
*   **Axios Interceptors:** Centralized API service that automatically attaches JWT Bearer tokens to outbound requests and handles global 401/403 errors.
*   **Context API:** Global state management for `AuthContext` (sessions) and `CartContext` (order persistence).
*   **Lucide React:** Comprehensive technical icon system for intuitive navigation.

## ⚙️ Local Setup Instructions

### Prerequisites
*   Node.js (v18+)
*   The Backend server must be running at `localhost:3000`.

### Installation
```bash
npm install