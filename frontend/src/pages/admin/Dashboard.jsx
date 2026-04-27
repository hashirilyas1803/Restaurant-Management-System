import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import { TrendingUp, Users, DollarSign, ChefHat } from 'lucide-react';
import { fetchWithAuth } from '../../api';

const Dashboard = () => {
    const [orders, setOrders] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const load = async () => {
            try {
                const oRes = await fetchWithAuth('/api/orders');
                const rRes = await fetchWithAuth('/api/reservations');
                const uRes = await fetchWithAuth('/api/auth/users').catch(() => ({ data: [] })); // Fail gracefully
                setOrders(oRes.data || []);
                setReservations(rRes.data || []);
                setUsers(uRes.data || []);
            } catch(e) { console.error('Failed to load dashboard', e) }
        };
        load();
    }, []);

    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0) + 
                         reservations.reduce((sum, r) => sum + (r.total || 0), 0);
    const activeOrders = orders.filter(o => o.status !== 'DELIVERED').length;

    return (
        <div>
            <h1 style={{ marginBottom: '2rem' }}>Dashboard Overview</h1>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(222px, 1fr))', gap: '0.5rem', marginBottom: '3rem' }}>
                <StatCard title="Total Revenue" value={`$${totalRevenue.toFixed(2)}`} icon={<DollarSign size={21} />} trend="Recent" />
                <StatCard title="Active Orders" value={activeOrders} icon={<ChefHat size={21} />} trend="Recent" />
                <StatCard title="Reservations" value={reservations.length} icon={<TrendingUp size={21} />} trend="Recent" />
                <StatCard title="Total Customers" value={users.filter(user => user.role === 'CUSTOMER').length || "--"} icon={<Users size={21} />} trend="Recent" />
                <StatCard title="Total Users" value={users.length || "--"} icon={<Users size={21} />} trend="Recent" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
                <Card className="glass-panel">
                    <h3>Recent Orders</h3>
                    <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem' }}>
                        {orders.slice(0, 5).map((item, i) => (
                            <li key={i} style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--glass-border)' }}>
                                {item.user?.name ? item.user.name : `User ${item.userId}`} - Order #{item.id} <span style={{ float: 'right', color: 'var(--color-success)' }}>{item.status}</span>
                            </li>
                        ))}
                    </ul>
                </Card>
                <Card className="glass-panel">
                    <h3>Today's Reservations</h3>
                    <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem' }}>
                        {reservations.slice(0, 5).map((item, i) => (
                            <li key={i} style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--glass-border)' }}>
                                {item.user?.name ? item.user.name : `User ${item.userId}`} - Table {item.tableId} ({new Date(item.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                            </li>
                        ))}
                    </ul>
                </Card>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon, trend }) => (
    <Card className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ padding: '1rem', background: 'rgba(251, 191, 36, 0.1)', borderRadius: '12px', color: 'var(--color-accent)' }}>
            {icon}
        </div>
        <div>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>{title}</p>
            <h3 style={{ fontSize: '1.5rem', lineHeight: 1 }}>{value}</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-success)' }}>{trend} from last week</span>
        </div>
    </Card>
);

export default Dashboard;
