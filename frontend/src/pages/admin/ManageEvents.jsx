import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import { fetchWithAuth } from '../../api';

const ManageEvents = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadEvents = () => {
        setLoading(true);
        fetchWithAuth('/api/caterings')
            .then((res) => {
                setEvents(res.data || []);
            })
            .catch((err) => {
                console.error(err);
                alert('Failed to load events.');
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadEvents();
    }, []);

    const updateStatus = async (id, currentStatus, newStatus) => {
        try {
            await fetchWithAuth(`/api/caterings/${id}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ status: newStatus })
            });
            loadEvents();
        } catch (err) {
            alert('Failed to update status: ' + err.message);
        }
    };

    const getAvailableTransitions = (status) => {
        switch(status) {
            case 'PENDING': return ['APPROVED', 'REJECTED', 'CHANGES_REQUESTED'];
            case 'CHANGES_REQUESTED': return ['APPROVED', 'REJECTED'];
            case 'APPROVED': return ['REJECTED'];
            default: return [];
        }
    };

    return (
        <div>
            <h1 style={{ marginBottom: '2rem' }}>Manage Events</h1>

            <Card className="glass-panel">
                {loading ? (
                    <p style={{ color: 'var(--color-text-secondary)', padding: '2rem' }}>Loading events...</p>
                ) : events.length === 0 ? (
                    <p style={{ color: 'var(--color-text-secondary)', padding: '2rem' }}>No events found.</p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                    <th style={{ padding: '1rem', color: 'var(--color-accent)' }}>ID</th>
                                    <th style={{ padding: '1rem', color: 'var(--color-accent)' }}>User</th>
                                    <th style={{ padding: '1rem', color: 'var(--color-accent)' }}>Event Title</th>
                                    <th style={{ padding: '1rem', color: 'var(--color-accent)' }}>Date & Guests</th>
                                    <th style={{ padding: '1rem', color: 'var(--color-accent)' }}>Total Budget</th>
                                    <th style={{ padding: '1rem', color: 'var(--color-accent)' }}>Status</th>
                                    <th style={{ padding: '1rem', color: 'var(--color-accent)' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {events.map((evt) => {
                                    const transitions = getAvailableTransitions(evt.status);
                                    let statusColor = 'rgba(251, 191, 36, 0.2)'; // PENDING
                                    let statusTextCol = 'var(--color-accent)';
                                    if(evt.status === 'APPROVED') { statusColor = 'rgba(76, 175, 80, 0.2)'; statusTextCol = '#4CAF50'; }
                                    if(evt.status === 'REJECTED') { statusColor = 'rgba(244, 67, 54, 0.2)'; statusTextCol = '#F44336'; }
                                    if(evt.status === 'CHANGES_REQUESTED') { statusColor = 'rgba(59, 130, 246, 0.2)'; statusTextCol = '#60A5FA'; }

                                    return (
                                        <tr key={evt.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <td style={{ padding: '1rem' }}># {evt.id}</td>
                                            <td style={{ padding: '1rem' }}>
                                                {evt.user ? `${evt.user.name} (${evt.user.email})` : `User ID: ${evt.userId}`}
                                            </td>
                                            <td style={{ padding: '1rem' }}>{evt.eventName}</td>
                                            <td style={{ padding: '1rem' }}>
                                                {new Date(evt.datetime).toLocaleDateString()} {new Date(evt.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                <div style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '0.2rem' }}>Guests: {evt.guestCount}</div>
                                            </td>
                                            <td style={{ padding: '1rem' }}>${(evt.total || 0).toFixed(2)}</td>
                                            <td style={{ padding: '1rem' }}>
                                                <span style={{ 
                                                    padding: '0.25rem 0.5rem', 
                                                    borderRadius: '4px', 
                                                    fontSize: '0.75rem', 
                                                    backgroundColor: statusColor,
                                                    color: statusTextCol
                                                }}>
                                                    {evt.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                {transitions.map(t => (
                                                    <button 
                                                        key={t}
                                                        onClick={() => updateStatus(evt.id, evt.status, t)}
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
                                                        {t.replace('_', ' ')}
                                                    </button>
                                                ))}
                                                {transitions.length === 0 && <span style={{ opacity: 0.5, fontSize: '0.8rem' }}>None</span>}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default ManageEvents;
