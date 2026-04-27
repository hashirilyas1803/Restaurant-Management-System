import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, CalendarDays, ShoppingBag, Users, LogOut, UserCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './AdminLayout.css';

const AdminLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { clearCart } = useCart();

    const navItems = [
        { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> },
        { name: 'Reservations', path: '/admin/reservations', icon: <CalendarDays size={20} /> },
        { name: 'Orders', path: '/admin/orders', icon: <ShoppingBag size={20} /> },
        { name: 'Events', path: '/admin/events', icon: <Users size={20} /> },
        { name: 'Users', path: '/admin/users', icon: <UserCircle size={20} /> },
    ];

    const handleLogout = () => {
        logout();
        clearCart();
        navigate('/');
    };

    return (
        <div className="admin-container">
            <aside className="admin-sidebar glass-panel">
                <div className="sidebar-header">
                    <span className="text-accent" style={{ fontWeight: 'bold', fontSize: '1.25rem' }}>Gourmet</span>Admin
                </div>
                <nav className="sidebar-nav">
                    {navItems.map(item => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
                        >
                            {item.icon}
                            <span>{item.name}</span>
                        </Link>
                    ))}
                </nav>
                <div className="sidebar-footer">
                    <button 
                        onClick={handleLogout} 
                        className="sidebar-link logout-btn"
                        style={{ 
                            background: 'transparent', 
                            border: 'none', 
                            width: '100%', 
                            cursor: 'pointer',
                            color: 'rgba(255,255,255,0.7)'
                        }}
                    >
                        <LogOut size={20} />
                        <span>Logout ({user?.name || 'Admin'})</span>
                    </button>
                </div>
            </aside>
            <main className="admin-content">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
