import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, CalendarDays, ShoppingBag, Users, LogOut, Settings, UserCircle } from 'lucide-react';
import './AdminLayout.css';

const AdminLayout = () => {
    const location = useLocation();

    const navItems = [
        { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> },
        { name: 'Reservations', path: '/admin/reservations', icon: <CalendarDays size={20} /> },
        { name: 'Orders', path: '/admin/orders', icon: <ShoppingBag size={20} /> },
        { name: 'Events', path: '/admin/events', icon: <Users size={20} /> },
        { name: 'Users', path: '/admin/users', icon: <UserCircle size={20} /> },
        { name: 'Settings', path: '/admin/settings', icon: <Settings size={20} /> },
    ];

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
                    <Link to="/" className="sidebar-link">
                        <LogOut size={20} />
                        <span>Exit</span>
                    </Link>
                </div>
            </aside>
            <main className="admin-content">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
