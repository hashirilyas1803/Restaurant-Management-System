import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, Menu, X, LogOut } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { openCart, cartCount, clearCart } = useCart();
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Reservations', path: '/reservations' },
        { name: 'Order', path: '/order' },
        { name: 'Events', path: '/events' },
        { name: 'History', path: '/history' },
    ];

    return (
        <nav className={`navbar-standard ${isScrolled ? 'scrolled' : ''}`}>
            <div className="container nav-content">
                <Link to="/" className="nav-logo">
                    Gourmet<span className="accent">Flow</span>
                </Link>

                <div className="nav-links-desktop">
                    {navLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>

                <div className="nav-actions">
                    <button className="icon-badge-btn" onClick={openCart} title="Your Cart">
                        <ShoppingBag size={22} />
                        {cartCount > 0 && <span className="badge">{cartCount}</span>}
                    </button>

                    {user ? (
                        <>
                        <div style={{color: 'var(--color-accent)', fontWeight: 'bold'}} className="desktop-only">
                            {user.name}
                        </div>
                        <button className="login-trigger" style={{background: 'transparent', border:'none', cursor:'pointer'}} onClick={() => {
                            logout();
                            clearCart();
                            navigate('/');
                        }}>
                            <LogOut size={22} />
                            <span className="desktop-only">Logout</span>
                        </button>
                        </>
                    ) : (
                        <Link to="/login" className="login-trigger">
                            <User size={22} />
                            <span className="desktop-only">Sign In</span>
                        </Link>
                    )}

                    <button className="mobile-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        {isMobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <div className={`mobile-menu-overlay ${isMobileMenuOpen ? 'open' : ''}`}>
                <div className="mobile-menu-content">
                    {navLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            {link.name}
                        </Link>
                    ))}
                    {user ? (
                        <button onClick={() => {
                            logout();
                            clearCart();
                            navigate('/');
                            setIsMobileMenuOpen(false);
                        }} style={{background:'transparent', color:'white', border:'none', fontSize:'1.2rem', textAlign:'left'}}>
                            Logout ({user.name})
                        </button>
                    ) : (
                        <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>Account</Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
