import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, CreditCard, Banknote, Truck, ShoppingBasket, MapPin, ChevronDown } from 'lucide-react';
import { fetchWithAuth } from '../api';
import './Checkout.css';

const BRANCHES = [
    "Downtown Sanctuary - 123 Gourmet Ave",
    "Harbor View - 456 Ocean Dr",
    "Uptown Lounge - 789 Skyline Blvd",
    "Westside Gardens - 101 Nature Way"
];

const Checkout = () => {
    const { cartItems, updateQuantity } = useCart();
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Details, 2: Receipt
    const [orderType, setOrderType] = useState('delivery');
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [selectedBranch, setSelectedBranch] = useState(BRANCHES[0]);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: ''
    });

    const INITIAL_MENU_DATA = [
        { id: 1, name: 'Wagyu Gold Burger', price: 28 },
        { id: 2, name: 'Atlantic Glazed Salmon', price: 32 },
        { id: 3, name: 'Black Truffle Risotto', price: 24 },
        { id: 4, name: 'Architectural Caesar', price: 16 },
        { id: 5, name: 'Molten Obsidian Cake', price: 14 },
        { id: 7, name: 'Signature Mojito', price: 14 },
        { id: 8, name: 'Velvet Espresso Martini', price: 16 },
        { id: 9, name: 'Mango Lassi Silk', price: 9 },
    ];
    const [menuData, setMenuData] = useState(INITIAL_MENU_DATA);

    React.useEffect(() => {
        fetchWithAuth('/api/dishes')
            .then(res => setMenuData(res.data || INITIAL_MENU_DATA))
            .catch(err => console.error(err));
    }, []);

    const subtotal = Object.entries(cartItems).reduce((sum, [id, qty]) => {
        const item = menuData.find(i => i.id === parseInt(id));
        return sum + (item ? item.price * qty : 0);
    }, 0);

    const deliveryFee = orderType === 'delivery' ? 5 : 0;
    const total = subtotal + deliveryFee;

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const items = Object.entries(cartItems).map(([id, qty]) => ({
                dishId: parseInt(id),
                quantity: qty
            }));
            await fetchWithAuth('/api/orders', {
                method: 'POST',
                body: JSON.stringify({
                    location: orderType === 'delivery' ? formData.address : selectedBranch,
                    type: orderType.toUpperCase(),
                    paymentMethod: 'ONLINE',
                    items
                })
            });
            setStep(2);
        } catch (err) {
            alert('Failed to place order: ' + err.message);
        }
    };

    if (step === 2) {
        return (
            <div className="checkout-container fade-in">
                <div className="receipt-card glass-panel">
                    <div className="success-header">
                        <CheckCircle2 size={64} className="success-icon" />
                        <h1>Order Confirmed</h1>
                        <p>Your order has been sent to our kitchen.</p>
                    </div>

                    <div className="receipt-details">
                        <div className="receipt-id">ORD-#{Math.floor(Math.random() * 90000) + 10000}</div>

                        <div className="receipt-section">
                            <h4>Customer Details</h4>
                            <p>{formData.name}</p>
                            <p>{formData.email}</p>
                            <p>{formData.phone}</p>
                            {orderType === 'delivery' ? (
                                <p>{formData.address}</p>
                            ) : (
                                <p><strong>Collection Point:</strong> {selectedBranch}</p>
                            )}
                        </div>

                        <div className="receipt-section">
                            <h4>Order Type</h4>
                            <p style={{ textTransform: 'capitalize' }}>{orderType} • {orderType === 'takeaway' ? 'Payment at Counter' : (paymentMethod === 'card' ? 'Paid via Card' : 'Cash on Delivery')}</p>
                        </div>

                        <div className="receipt-section">
                            <h4>Summary</h4>
                            {Object.entries(cartItems).map(([id, qty]) => {
                                const item = menuData.find(i => i.id === parseInt(id));
                                return (
                                    <div key={id} className="receipt-row">
                                        <span>{qty}x {item?.name}</span>
                                        <span>${(item?.price || 0) * qty}</span>
                                    </div>
                                );
                            })}
                            <div className="receipt-divider"></div>
                            <div className="receipt-row total-row">
                                <span>TOTAL</span>
                                <span>${total}</span>
                            </div>
                        </div>
                    </div>

                    <button className="back-home-btn" onClick={() => navigate('/')}>
                        Return to Sanctuary
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="checkout-container fade-in">
            <div className="checkout-grid container">
                <div className="checkout-form-side">
                    <button className="back-btn" onClick={() => navigate('/order')}>
                        <ArrowLeft size={18} /> Back to Menu
                    </button>

                    <h1 className="checkout-title">Finalize Order</h1>

                    <form onSubmit={handleSubmit} className="checkout-form">
                        <section className="form-section">
                            <h3>1. Preferred Fulfillment</h3>
                            <div className="toggle-group">
                                <button
                                    type="button"
                                    className={`toggle-btn ${orderType === 'delivery' ? 'active' : ''}`}
                                    onClick={() => setOrderType('delivery')}
                                >
                                    <Truck size={18} /> Delivery
                                </button>
                                <button
                                    type="button"
                                    className={`toggle-btn ${orderType === 'takeaway' ? 'active' : ''}`}
                                    onClick={() => setOrderType('takeaway')}
                                >
                                    <ShoppingBasket size={18} /> Takeaway
                                </button>
                            </div>
                        </section>

                        <section className="form-section">
                            <h3>2. Guest Details</h3>
                            <div className="input-grid">
                                <div className="input-group">
                                    <label>FULL NAME</label>
                                    <input type="text" name="name" onChange={handleInputChange} required />
                                </div>
                                <div className="input-group">
                                    <label>EMAIL</label>
                                    <input type="email" name="email" onChange={handleInputChange} required />
                                </div>
                                <div className="input-group">
                                    <label>PHONE</label>
                                    <input type="tel" name="phone" onChange={handleInputChange} required />
                                </div>
                                {orderType === 'delivery' && (
                                    <div className="input-group full-width">
                                        <label>DELIVERY ADDRESS</label>
                                        <input type="text" name="address" onChange={handleInputChange} required />
                                    </div>
                                )}
                            </div>
                        </section>

                        {orderType === 'takeaway' ? (
                            <section className="form-section animate-fade-in">
                                <h3>3. Select Branch</h3>
                                <div className="branch-selector-wrapper">
                                    <MapPin className="branch-icon-left" size={20} />
                                    <select
                                        className="branch-select"
                                        value={selectedBranch}
                                        onChange={(e) => setSelectedBranch(e.target.value)}
                                        required
                                    >
                                        {BRANCHES.map(branch => (
                                            <option key={branch} value={branch}>{branch}</option>
                                        ))}
                                    </select>
                                    <div className="select-arrow-right">
                                        <ChevronDown size={18} />
                                    </div>
                                </div>
                                <p className="payment-note">Payment will be handled at the branch counter during collection.</p>
                            </section>
                        ) : (
                            <section className="form-section animate-fade-in">
                                <h3>3. Payment Method</h3>
                                <div className="payment-options">
                                    <label className={`payment-card ${paymentMethod === 'card' ? 'active' : ''}`}>
                                        <input
                                            type="radio"
                                            name="payment"
                                            checked={paymentMethod === 'card'}
                                            onChange={() => setPaymentMethod('card')}
                                        />
                                        <CreditCard size={20} />
                                        <span>Credit / Debit Card</span>
                                    </label>
                                    <label className={`payment-card ${paymentMethod === 'cash' ? 'active' : ''}`}>
                                        <input
                                            type="radio"
                                            name="payment"
                                            checked={paymentMethod === 'cash'}
                                            onChange={() => setPaymentMethod('cash')}
                                        />
                                        <Banknote size={20} />
                                        <span>Cash on Delivery</span>
                                    </label>
                                </div>
                            </section>
                        )}

                        <button type="submit" className="confirm-order-btn">
                            Confirm Order • ${total}
                        </button>
                    </form>
                </div>

                <div className="checkout-summary-side">
                    <div className="summary-card glass-panel">
                        <h3>Order Summary</h3>
                        <div className="summary-items">
                            {Object.entries(cartItems).map(([id, qty]) => {
                                const item = menuData.find(i => i.id === parseInt(id));
                                return (
                                    <div key={id} className="summary-item">
                                        <div>
                                            <p className="item-name">{item?.name}</p>
                                            <p className="item-qty">Qty: {qty}</p>
                                        </div>
                                        <p className="item-price">${(item?.price || 0) * qty}</p>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="summary-totals">
                            <div className="summary-row">
                                <span>Subtotal</span>
                                <span>${subtotal}</span>
                            </div>
                            <div className="summary-row">
                                <span>{orderType === 'delivery' ? 'Delivery Fee' : 'Collection'}</span>
                                <span>${deliveryFee}</span>
                            </div>
                            <div className="summary-divider"></div>
                            <div className="summary-row main-total">
                                <span>Total</span>
                                <span>${total}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
