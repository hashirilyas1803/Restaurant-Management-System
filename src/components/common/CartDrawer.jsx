import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import './CartDrawer.css';

const CartDrawer = ({ isOpen, onClose, cartItems, itemsData, updateQuantity }) => {
    const navigate = useNavigate();

    const total = Object.entries(cartItems).reduce((sum, [id, qty]) => {
        const item = itemsData.find(i => i.id === parseInt(id));
        return sum + (item ? item.price * qty : 0);
    }, 0);

    const handleBrowseMenu = () => {
        onClose();
        navigate('/order');
    };

    const handleCheckout = () => {
        onClose();
        navigate('/checkout');
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="cart-backdrop" onClick={onClose} />
            <div className="cart-drawer glass-panel">
                <div className="cart-header">
                    <h2>Your Order</h2>
                    <button onClick={onClose} className="close-btn"><X size={20} /></button>
                </div>

                <div className="cart-items">
                    {Object.keys(cartItems).length === 0 ? (
                        <div className="empty-cart-state">
                            <ShoppingBag size={64} className="empty-icon" />
                            <p>Your cart is empty</p>
                            <button className="browse-menu-btn" onClick={handleBrowseMenu}>
                                Browse Menu
                            </button>
                        </div>
                    ) : (
                        Object.entries(cartItems).map(([id, qty]) => {
                            const item = itemsData.find(i => i.id === parseInt(id));
                            if (!item) return null;
                            return (
                                <div key={id} className="cart-item">
                                    <div className="item-img" style={{ backgroundImage: item.image ? `url(${item.image})` : 'none', backgroundColor: '#111' }}>
                                        {!item.image && <ShoppingBag size={20} opacity={0.1} />}
                                    </div>
                                    <div className="item-details">
                                        <h4>{item.name}</h4>
                                        <div className="item-price">${item.price}</div>
                                        <div className="item-controls">
                                            <button onClick={() => updateQuantity(parseInt(id), qty - 1)}><Plus size={14} style={{ transform: 'rotate(45deg)' }} /></button>
                                            <span className="qty-val">{qty}</span>
                                            <button onClick={() => updateQuantity(parseInt(id), qty + 1)}><Plus size={14} /></button>
                                        </div>
                                    </div>
                                    <div className="item-total-val">${item.price * qty}</div>
                                </div>
                            );
                        })
                    )}
                </div>

                {Object.keys(cartItems).length > 0 && (
                    <div className="cart-footer">
                        <div className="cart-total-row">
                            <span>Subtotal</span>
                            <span className="total-amount">${total}</span>
                        </div>
                        <button className="checkout-btn-cart" onClick={handleCheckout}>
                            Finalize Order <ArrowRight size={18} />
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};

export default CartDrawer;
