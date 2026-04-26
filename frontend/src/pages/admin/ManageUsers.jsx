import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import { fetchWithAuth } from '../../api';
import { useAuth } from '../../context/AuthContext';

const ManageUsers = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);

    const loadUsers = () => {
        setLoading(true);
        fetchWithAuth('/api/auth/users')
            .then(res => setUsers(res.data || []))
            .catch(err => { console.error(err); alert('Failed to load users'); })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const changeRole = async (id, newRole) => {
        if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;
        try {
            await fetchWithAuth(`/api/auth/users/${id}/role`, {
                method: 'PATCH',
                body: JSON.stringify({ role: newRole })
            });
            loadUsers();
        } catch (err) { 
            alert('Failed to change role: ' + err.message); 
        }
    };

    return (
        <div>
            <h1 style={{ marginBottom: '2rem' }}>Manage Users</h1>
            
            <Card className="glass-panel">
                {loading ? <p style={{ padding: '2rem', color: 'var(--color-text-secondary)' }}>Loading...</p> : users.length === 0 ? <p style={{ padding: '2rem' }}>No users found.</p> : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                    <th style={{ padding: '1rem', color: 'var(--color-accent)' }}>ID</th>
                                    <th style={{ padding: '1rem', color: 'var(--color-accent)' }}>Name / Email</th>
                                    <th style={{ padding: '1rem', color: 'var(--color-accent)' }}>Phone</th>
                                    <th style={{ padding: '1rem', color: 'var(--color-accent)' }}>Transactions</th>
                                    <th style={{ padding: '1rem', color: 'var(--color-accent)' }}>Role</th>
                                    <th style={{ padding: '1rem', color: 'var(--color-accent)' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '1rem' }}># {u.id}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <strong>{u.name}</strong><br />
                                            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{u.email}</span>
                                        </td>
                                        <td style={{ padding: '1rem' }}>{u.phone_number}</td>
                                        <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>
                                            {u.orders?.length || 0} Orders<br/>
                                            {u.reservations?.length || 0} Reservations<br/>
                                            {u.caterings?.length || 0} Caterings
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{ 
                                                padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem',
                                                backgroundColor: u.role === 'ADMIN' ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255,255,255,0.1)',
                                                color: u.role === 'ADMIN' ? '#4CAF50' : '#fff'
                                            }}>{u.role}</span>
                                        </td>
                                        <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                            <button 
                                                onClick={() => setSelectedUser(u)} 
                                                style={{ background: 'rgba(59, 130, 246, 0.2)', border: 'none', color: '#60A5FA', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', transition: 'var(--transition)' }}
                                            >
                                                History
                                            </button>
                                            {u.role === 'CUSTOMER' ? (
                                                <button 
                                                    onClick={() => changeRole(u.id, 'ADMIN')} 
                                                    style={{ background: 'rgba(76, 175, 80, 0.2)', border: 'none', color: '#4CAF50', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', transition: 'var(--transition)' }}
                                                >
                                                    Make Admin
                                                </button>
                                            ) : (
                                                u.id !== currentUser?.id && (
                                                    <button 
                                                        onClick={() => changeRole(u.id, 'CUSTOMER')} 
                                                        style={{ background: 'rgba(244, 67, 54, 0.2)', border: 'none', color: '#F44336', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', transition: 'var(--transition)' }}
                                                    >
                                                        Revoke Admin
                                                    </button>
                                                )
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            {selectedUser && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setSelectedUser(null)}>
                    <div style={{ backgroundColor: 'var(--color-bg-secondary)', padding: '2.5rem', borderRadius: '12px', minWidth: '400px', maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto', border: '1px solid var(--glass-border)' }} onClick={e => e.stopPropagation()}>
                        <h2 style={{ marginBottom: '0.5rem', color: 'var(--color-accent)' }}>{selectedUser.name}'s History</h2>
                        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem', fontSize: '0.9rem' }}>Comprehensive transaction record</p>
                        
                        <h3 style={{ fontSize: '1rem', marginTop: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', color: '#fff' }}>Orders ({selectedUser.orders?.length || 0})</h3>
                        <ul style={{ listStyle: 'none', padding: 0, margin: '1rem 0', fontSize: '0.9rem' }}>
                            {selectedUser.orders?.map(o => (
                                <li key={o.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', opacity: 0.8 }}>
                                    <span>#{o.id} - {new Date(o.datetime).toLocaleDateString()}</span>
                                    <span>${(o.total || 0).toFixed(2)} - <span style={{color: 'var(--color-accent)'}}>{o.status}</span></span>
                                </li>
                            ))}
                            {(!selectedUser.orders || selectedUser.orders.length === 0) && <li style={{opacity: 0.5}}>No entries.</li>}
                        </ul>

                        <h3 style={{ fontSize: '1rem', marginTop: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', color: '#fff' }}>Reservations ({selectedUser.reservations?.length || 0})</h3>
                        <ul style={{ listStyle: 'none', padding: 0, margin: '1rem 0', fontSize: '0.9rem' }}>
                            {selectedUser.reservations?.map(r => (
                                <li key={r.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', opacity: 0.8 }}>
                                    <span>#{r.id} - {new Date(r.datetime).toLocaleDateString()}</span>
                                    <span>${(r.total || 0).toFixed(2)}</span>
                                </li>
                            ))}
                            {(!selectedUser.reservations || selectedUser.reservations.length === 0) && <li style={{opacity: 0.5}}>No entries.</li>}
                        </ul>

                        <h3 style={{ fontSize: '1rem', marginTop: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', color: '#fff' }}>Events & Catering ({selectedUser.caterings?.length || 0})</h3>
                        <ul style={{ listStyle: 'none', padding: 0, margin: '1rem 0', fontSize: '0.9rem' }}>
                            {selectedUser.caterings?.map(c => (
                                <li key={c.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', opacity: 0.8 }}>
                                    <span>#{c.id} - {c.eventName}</span>
                                    <span>${(c.total || 0).toFixed(2)} - <span style={{color: 'var(--color-accent)'}}>{c.status}</span></span>
                                </li>
                            ))}
                            {(!selectedUser.caterings || selectedUser.caterings.length === 0) && <li style={{opacity: 0.5}}>No entries.</li>}
                        </ul>

                        <button onClick={() => setSelectedUser(null)} style={{ background: 'var(--color-accent)', color: '#000', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginTop: '2.5rem', width: '100%', transition: 'var(--transition)' }}>Close Overview</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageUsers;
