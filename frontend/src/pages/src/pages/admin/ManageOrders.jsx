import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import { fetchWithAuth } from '../../api';

const ManageOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const loadOrders = () => {
        setLoading(true);
        fetchWithAuth('/api/orders')
            .then((res) => {
                setOrders(res.data || []);
            })
            .catch((err) => {
                console.error(err);
                alert('Failed to load orders.');
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadOrders();
    }, []);

    const viewItems = (order) => {
        if (!order.dishes || order.dishes.length === 0) {
            alert('No items in this order.');
            return;
        }
        setSelectedOrder(order);
    };

    const updateStatus = async (id, currentStatus, newStatus) => {
        try {
            await fetchWithAuth(`/api/orders/${id}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ status: newStatus })
            });
            loadOrders(); // Refresh table
        } catch (err) {
            alert('Failed to update status: ' + err.message);
        }
    };

    const getAvailableTransitions = (status) => {
        switch(status) {
            case 'PENDING': return ['PREPARING', 'CANCELLED'];
            case 'PREPARING': return ['OUT_FOR_DELIVERY', 'CANCELLED'];
            case 'OUT_FOR_DELIVERY': return ['DELIVERED', 'CANCELLED'];
            default: return [];
        }
    };

    return (
        <div>
            <h1 style={{ marginBottom: '2rem' }}>Manage Orders</h1>

            <Card className="glass-panel">
                {loading ? (
                    <p style={{ color: 'var(--color-text-secondary)', padding: '2rem' }}>Loading orders...</p>
                ) : orders.length === 0 ? (
                    <p style={{ color: 'var(--color-text-secondary)', padding: '2rem' }}>No orders found.</p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                    <th style={{ padding: '1rem', color: 'var(--color-accent)' }}>ID</th>
                                    <th style={{ padding: '1rem', color: 'var(--color-accent)' }}>Date & Time</th>
                                    <th style={{ padding: '1rem', color: 'var(--color-accent)' }}>Type/Location</th>
                                    <th style={{ padding: '1rem', color: 'var(--color-accent)' }}>User</th>
                                    <th style={{ padding: '1rem', color: 'var(--color-accent)' }}>Total</th>
                                    <th style={{ padding: '1rem', color: 'var(--color-accent)' }}>Status</th>
                                    <th style={{ padding: '1rem', color: 'var(--color-accent)' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => {
                                    const transitions = getAvailableTransitions(order.status);
                                    return (
                                        <tr key={order.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <td style={{ padding: '1rem' }}># {order.id}</td>
                                            <td style={{ padding: '1rem' }}>
                                                {new Date(order.datetime).toLocaleDateString()} {new Date(order.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td style={{ padding: '1rem' }}>{order.type} - {order.location}</td>
                                            <td style={{ padding: '1rem' }}>
                                                {order.user ? `${order.user.name} (${order.user.phone_number})` : `User ID: ${order.userId}`}
                                            </td>
                                            <td style={{ padding: '1rem' }}>${(order.total || 0).toFixed(2)}</td>
                                            <td style={{ padding: '1rem' }}>
                                                <span style={{ 
                                                    padding: '0.25rem 0.5rem', 
                                                    borderRadius: '4px', 
                                                    fontSize: '0.75rem', 
                                                    backgroundColor: order.status === 'DELIVERED' ? 'rgba(76, 175, 80, 0.2)' : order.status === 'CANCELLED' ? 'rgba(244, 67, 54, 0.2)' : 'rgba(251, 191, 36, 0.2)',
                                                    color: order.status === 'DELIVERED' ? '#4CAF50' : order.status === 'CANCELLED' ? '#F44336' : 'var(--color-accent)'
                                                }}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                {transitions.map(t => (
                                                    <button 
                                                        key={t}
                                                        onClick={() => updateStatus(order.id, order.status, t)}
                                                        style={{
                                                            background: 'rgba(255,255,255,0.1)',
                                                            border: 'none',
                                                            color: 'white',
                                                            padding: '0.25rem 0.5rem',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer',
                                                            fontSize: '0.75rem',
                                                            transition: 'var(--transition)'
                                                        }}
                                                        onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
                                                        onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                                                    >
                                                        {t}
                                                    </button>
                                                ))}
                                                {transitions.length === 0 && <span style={{ opacity: 0.5, fontSize: '0.8rem' }}>None</span>}
                                                {order.dishes && order.dishes.length > 0 && (
                                                    <button
                                                        onClick={() => viewItems(order)}
                                                        style={{
                                                            background: 'rgba(59, 130, 246, 0.2)',
                                                            border: 'none',
                                                            color: '#60A5FA',
                                                            padding: '0.25rem 0.5rem',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer',
                                                            fontSize: '0.75rem',
                                                            transition: 'var(--transition)'
                                                        }}
                                                    >
                                                        View Items
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            {selectedOrder && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setSelectedOrder(null)}>
                    <div style={{ backgroundColor: 'var(--color-bg-secondary)', padding: '2rem', borderRadius: '8px', minWidth: '350px', maxWidth: '500px', border: '1px solid var(--glass-border)' }} onClick={e => e.stopPropagation()}>
                        <h2 style={{ marginBottom: '1.5rem', color: 'var(--color-accent)' }}>Order #{selectedOrder.id} Items</h2>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {selectedOrder.dishes.map((d, i) => (
                                <li key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <span>{d.quantity}x {d.dish.name}</span>
                                    <span>${(d.quantity * d.dish.price).toFixed(2)}</span>
                                </li>
                            ))}
                        </ul>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                            <strong>Total (from items):</strong>
                            <strong>${selectedOrder.dishes.reduce((sum, d) => sum + (d.quantity * d.dish.price), 0).toFixed(2)}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
                            <button onClick={() => setSelectedOrder(null)} style={{ background: 'var(--color-accent)', color: '#000', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageOrders;
