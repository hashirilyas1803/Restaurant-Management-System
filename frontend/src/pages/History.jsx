import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../api';
import { Clock, CheckCircle, Package, Utensils, Calendar, MapPin, XCircle, Search } from 'lucide-react';
import './History.css';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import useScrollOnUpdate from '../hooks/useScrollOnUpdate';

const History = () => {
    const { user, isChecking } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('orders');
    const [orders, setOrders] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [caterings, setCaterings] = useState([]);
    const [loading, setLoading] = useState(true);
    useScrollOnUpdate(activeTab);

    useEffect(() => {
        if (isChecking) return;
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchHistory = async () => {
            setLoading(true);
            try {
                const [ordersRes, resRes, catRes] = await Promise.all([
                    fetchWithAuth('/api/orders').catch(() => ({ data: [] })),
                    fetchWithAuth('/api/reservations').catch(() => ({ data: [] })),
                    fetchWithAuth('/api/caterings').catch(() => ({ data: [] }))
                ]);
                
                // Sort by date descending
                const sortDesc = (a, b) => new Date(b.datetime) - new Date(a.datetime);
                
                setOrders((ordersRes.data || []).sort(sortDesc));
                setReservations((resRes.data || []).sort(sortDesc));
                setCaterings((catRes.data || []).sort(sortDesc));
            } catch (err) {
                console.error('Failed to fetch history', err);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [user, isChecking, navigate]);

    if (isChecking || loading) {
        return (
            <div className="history-container loading">
                <div className="spinner"></div>
            </div>
        );
    }

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const renderStatusBadge = (status) => {
        let badgeClass = 'badge-pending';
        let Icon = Clock;

        if (['DELIVERED', 'APPROVED'].includes(status)) {
            badgeClass = 'badge-success';
            Icon = CheckCircle;
        } else if (['CANCELLED', 'REJECTED'].includes(status)) {
            badgeClass = 'badge-danger';
            Icon = XCircle;
        } else if (['OUT_FOR_DELIVERY', 'PREPARING'].includes(status)) {
            badgeClass = 'badge-progress';
            Icon = Package;
        }

        return (
            <div className={`status-badge ${badgeClass}`}>
                <Icon size={14} />
                <span>{status}</span>
            </div>
        );
    };

    return (
        <div className="history-container fade-in">
            <header className="history-hero-banner">
                <div className="container banner-content">
                    <h1 className="animate-fade-up">Your <span className="accent">History</span> & Tracking</h1>
                    <p className="animate-fade-up delay-1">Track your active orders and review past experiences.</p>
                </div>
            </header>

            <div className="container history-tabs-wrapper">
                <div className="history-tabs-bar glass-panel">
                    <button 
                        className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
                        onClick={() => setActiveTab('orders')}
                    >
                        <Package size={18} /> Orders
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'reservations' ? 'active' : ''}`}
                        onClick={() => setActiveTab('reservations')}
                    >
                        <Utensils size={18} /> Reservations
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'caterings' ? 'active' : ''}`}
                        onClick={() => setActiveTab('caterings')}
                    >
                        <Calendar size={18} /> Events
                    </button>
                </div>
            </div>

            <main className="container history-content-area" style={{ marginTop: '2rem' }}>
                {/* ORDERS TAB */}
                {activeTab === 'orders' && (
                    <div className="history-grid animate-fade-in">
                        {orders.length === 0 ? (
                            <div className="empty-state">No orders found.</div>
                        ) : (
                            orders.map(order => (
                                <div key={order.id} className="history-card glass-card">
                                    <div className="card-header">
                                        <div className="id-badge">Order #{order.id}</div>
                                        {renderStatusBadge(order.status)}
                                    </div>
                                    <div className="card-body">
                                        <div className="detail-row">
                                            <Calendar size={16} /> <span>{formatDate(order.datetime)}</span>
                                        </div>
                                        <div className="detail-row">
                                            <MapPin size={16} /> <span>{order.location}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span style={{opacity: 0.6}}>Type:</span> <span style={{textTransform:'capitalize'}}>{order.type.toLowerCase()}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span style={{opacity: 0.6}}>Payment:</span> <span style={{textTransform:'capitalize'}}>{order.paymentMethod.toLowerCase()}</span>
                                        </div>
                                    </div>
                                    <div className="card-footer">
                                        <span className="total-label">Total</span>
                                        <span className="total-amount">${order.total.toFixed(2)}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* RESERVATIONS TAB */}
                {activeTab === 'reservations' && (
                    <div className="history-grid animate-fade-in">
                        {reservations.length === 0 ? (
                            <div className="empty-state">No reservations found.</div>
                        ) : (
                            reservations.map(res => (
                                <div key={res.id} className="history-card glass-card">
                                    <div className="card-header">
                                        <div className="id-badge">Reservation #{res.id}</div>
                                        <div className={`status-badge badge-success`}><CheckCircle size={14}/><span>CONFIRMED</span></div>
                                    </div>
                                    <div className="card-body">
                                        <div className="detail-row">
                                            <Calendar size={16} /> <span>{formatDate(res.datetime)}</span>
                                        </div>
                                        <div className="detail-row">
                                            <Utensils size={16} /> <span>Table {res.table.id}</span>
                                        </div>
                                    </div>
                                    {res.total > 0 && (
                                        <div className="card-footer">
                                            <span className="total-label">Pre-Order Total</span>
                                            <span className="total-amount">${res.total.toFixed(2)}</span>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* EVENTS TAB */}
                {activeTab === 'caterings' && (
                    <div className="history-grid animate-fade-in">
                        {caterings.length === 0 ? (
                            <div className="empty-state">No event bookings found.</div>
                        ) : (
                            caterings.map(cat => (
                                <div key={cat.id} className="history-card glass-card">
                                    <div className="card-header">
                                        <div className="id-badge">Event #{cat.id}</div>
                                        {renderStatusBadge(cat.status)}
                                    </div>
                                    <div className="card-body">
                                        <h3 className="event-name">{cat.eventName}</h3>
                                        <div className="detail-row">
                                            <Calendar size={16} /> <span>{formatDate(cat.datetime)}</span>
                                        </div>
                                        <div className="detail-row">
                                            <MapPin size={16} /> <span>{cat.location}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span style={{opacity: 0.6}}>Guests:</span> <span>{cat.guestCount}</span>
                                        </div>
                                    </div>
                                    <div className="card-footer">
                                        <span className="total-label">Total</span>
                                        <span className="total-amount">${cat.total.toFixed(2)}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default History;
