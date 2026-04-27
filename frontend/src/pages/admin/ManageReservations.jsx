import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import { fetchWithAuth } from '../../api';
import { X, Trash2 } from 'lucide-react'; 

const ManageReservations = () => {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedReservation, setSelectedReservation] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState(null);

    const loadReservations = () => {
        setLoading(true);
        fetchWithAuth('/api/reservations')
            .then((res) => setReservations(res.data || []))
            .catch((err) => { console.error(err); alert('Failed to load reservations.'); })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadReservations();
    }, []);

    const viewItems = (res) => {
        if (!res.dishes || res.dishes.length === 0) return;
        setSelectedReservation(res);
    };

    return (
        <div>
            <h1 style={{ marginBottom: '2rem' }}>Manage Reservations</h1>

            <Card className="glass-panel">
                {loading ? (
                    <p style={{ color: 'var(--color-text-secondary)', padding: '2rem' }}>Loading reservations...</p>
                ) : reservations.length === 0 ? (
                    <p style={{ color: 'var(--color-text-secondary)', padding: '2rem' }}>No reservations found.</p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                    <th style={{ padding: '1rem', color: 'var(--color-accent)' }}>ID</th>
                                    <th style={{ padding: '1rem', color: 'var(--color-accent)' }}>Date & Time</th>
                                    <th style={{ padding: '1rem', color: 'var(--color-accent)' }}>Table</th>
                                    <th style={{ padding: '1rem', color: 'var(--color-accent)' }}>User</th>
                                    <th style={{ padding: '1rem', color: 'var(--color-accent)' }}>Pre-Orders Cost</th>
                                    <th style={{ padding: '1rem', color: 'var(--color-accent)' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reservations.map((res) => (
                                    <tr key={res.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '1rem' }}># {res.id}</td>
                                        <td style={{ padding: '1rem' }}>
                                            {new Date(res.datetime).toLocaleDateString()} at{' '}
                                            {new Date(res.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td style={{ padding: '1rem' }}>Table {res.table.id}</td>
                                        <td style={{ padding: '1rem' }}>
                                            {/* Depending on backend relation structure, res.user might be populated */}
                                            {res.user ? `${res.user.name} (${res.user.email})` : `User ID: ${res.userId}`}
                                        </td>
                                        <td style={{ padding: '1rem' }}>${(res.total || 0).toFixed(2)}</td>
                                        <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                            <button 
                                                onClick={() => setDeleteId(res.id)}
                                                style={{
                                                    background: 'rgba(244, 67, 54, 0.2)',
                                                    border: 'none',
                                                    color: '#F44336',
                                                    padding: '0.25rem 0.5rem',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '0.75rem',
                                                    transition: 'var(--transition)'
                                                }}
                                            >
                                                CANCEL
                                            </button>
                                            {res.dishes && res.dishes.length > 0 && (
                                                <button
                                                    onClick={() => viewItems(res)}
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
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            {selectedReservation && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setSelectedReservation(null)}>
                    <div style={{ backgroundColor: 'var(--color-bg-secondary)', padding: '2rem', borderRadius: '8px', minWidth: '350px', maxWidth: '500px', border: '1px solid var(--glass-border)' }} onClick={e => e.stopPropagation()}>
                        <h2 style={{ marginBottom: '1.5rem', color: 'var(--color-accent)' }}>Reservation #{selectedReservation.id} Pre-orders</h2>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {selectedReservation.dishes.map((d, i) => (
                                <li key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <span>{d.quantity}x {d.dish.name}</span>
                                    <span>${(d.quantity * d.dish.price).toFixed(2)}</span>
                                </li>
                            ))}
                        </ul>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                            <strong>Pre-ordered Total:</strong>
                            <strong>${selectedReservation.dishes.reduce((sum, d) => sum + (d.quantity * d.dish.price), 0).toFixed(2)}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
                            <button onClick={() => setSelectedReservation(null)} style={{ background: 'var(--color-accent)', color: '#000', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Close</button>
                        </div>
                    </div>
                </div>
            )}
            {/* --- THE MODAL (Guaranteed Centering) --- */}
            {deleteId && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.85)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999,
                    padding: '20px'
                }}>
                    <div className="glass-panel" style={{ 
                        maxWidth: '400px', 
                        width: '100%', 
                        padding: '3rem', 
                        textAlign: 'center',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        {/* Trash Icon */}
                        <div style={{ 
                            width: '64px', height: '64px', backgroundColor: 'rgba(239, 68, 68, 0.1)', 
                            borderRadius: '50%', display: 'flex', alignItems: 'center', 
                            justifyContent: 'center', margin: '0 auto 1.5rem' 
                        }}>
                            <Trash2 style={{ color: '#ef4444' }} size={32} />
                        </div>

                        <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem' }}>
                            Cancel Reservation?
                        </h2>
                        <p style={{ color: '#9ca3af', marginBottom: '2rem', fontSize: '1.1rem' }}>
                            This time slot will be released. This action cannot be undone.
                        </p>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button 
                                onClick={async () => {
                                    setIsDeleting(true);
                                    try {
                                        await fetchWithAuth(`/api/reservations/${deleteId}`, { method: 'DELETE' });
                                        setDeleteId(null);
                                        loadReservations();
                                    } catch (err) {
                                        setError(err.message);
                                    } finally {
                                        setIsDeleting(false);
                                    }
                                }}
                                className="reservation-submit-btn"
                                style={{ flex: 1, padding: '0.75rem' }}
                                disabled={isDeleting}
                            >
                                {isDeleting ? 'Working...' : 'Yes, Cancel'}
                            </button>
                            <button 
                                onClick={() => setDeleteId(null)}
                                className="reservation-submit-btn"
                                style={{ 
                                    flex: 1, 
                                    background: 'transparent', 
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    color: 'white',
                                    padding: '0.75rem'
                                }}
                            >
                                Nevermind
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- ERROR MODAL --- */}
            {error && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.85)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10000,
                    padding: '20px'
                }}>
                    <div className="glass-panel" style={{ maxWidth: '400px', width: '100%', padding: '2rem', textAlign: 'center' }}>
                        <div style={{ width: '64px', height: '64px', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                            <X style={{ color: '#ef4444' }} size={32} />
                        </div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem' }}>Failed</h2>
                        <p style={{ color: '#9ca3af', marginBottom: '1.5rem' }}>{error}</p>
                        <button 
                            onClick={() => { setError(null); setDeleteId(null); }}
                            className="reservation-submit-btn"
                            style={{ width: '100%' }}
                        >
                            Dismiss
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageReservations;
