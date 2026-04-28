import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RootLayout from './layouts/RootLayout';
import Home from './pages/Home';
import Reservations from './pages/Reservations';
import Order from './pages/Order';
import Events from './pages/Events';
import Login from './pages/Login';
import Checkout from './pages/Checkout';
import History from './pages/History';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import ManageReservations from './pages/admin/ManageReservations';
import ManageOrders from './pages/admin/ManageOrders';
import ManageEvents from './pages/admin/ManageEvents';
import ManageUsers from './pages/admin/ManageUsers';
import ScrollToTop from './components/common/ScrollToTop';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';

// Placeholders
const Placeholder = ({ title }) => (
  <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
    <h1>{title}</h1>
    <p>Coming Soon</p>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            {/* Customer Routes */}
            <Route path="/" element={<RootLayout />}>
              <Route index element={<Home />} />
              <Route path="reservations" element={<Reservations />} />
              <Route path="order" element={<Order />} />
              <Route path="events" element={<Events />} />
              <Route path="login" element={<Login />} />
              <Route path="checkout" element={<Checkout />} />
              <Route path="history" element={<History />} />
              <Route path="cart" element={<Placeholder title="Your Cart" />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="reservations" element={<ManageReservations />} />
              <Route path="orders" element={<ManageOrders />} />
              <Route path="events" element={<ManageEvents />} />
              <Route path="users" element={<ManageUsers />} />
              <Route path="settings" element={<Placeholder title="Settings" />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;