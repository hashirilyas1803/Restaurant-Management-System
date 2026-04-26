import React, { useState } from 'react';
import { ShoppingBag, Plus, Minus, Search } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { fetchWithAuth } from '../api';
import './Order.css';

// Existing local images
import BurgerImage from '../assets/images/gourmet_burger_plate_1769975915068.png';
import SalmonImage from '../assets/images/salmon_dish_fine_dining_1769975929501.png';
import RisottoImage from '../assets/images/truffle_risotto_closeup_1769976236482.png';
import CaesarImage from '../assets/images/caesar_salad_fresh_1769976250655.png';
import CakeImage from '../assets/images/chocolate_lava_cake_dessert_1769976265084.png';

// High-quality Unsplash replacements for missing items
const CHEESE_IMAGE = "https://images.unsplash.com/photo-1631451095765-2c91616fc986?auto=format&fit=crop&w=800&q=80";
const MOJITO_IMAGE = "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80";
const MARTINI_IMAGE = "https://images.unsplash.com/photo-1545438102-799c3991ffb2?auto=format&fit=crop&w=800&q=80";
const MANGO_IMAGE = "https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=800&q=80";

const INITIAL_MENU_ITEMS = [
    { id: 1, name: 'Wagyu Gold Burger', price: 28, category: 'Mains', image: BurgerImage, desc: 'Premium Wagyu beef, truffle aioli, 24k gold leaf, aged white cheddar.' },
    { id: 2, name: 'Atlantic Glazed Salmon', price: 32, category: 'Mains', image: SalmonImage, desc: 'Miso-glazed wild salmon, asparagus spears, purple potato mash.' },
    { id: 3, name: 'Black Truffle Risotto', price: 24, category: 'Mains', image: RisottoImage, desc: 'Slow-cooked Arborio rice, shaved black truffles, 36-month Parmesan.' },
    { id: 4, name: 'Architectural Caesar', price: 16, category: 'Starters', image: CaesarImage, desc: 'Baby romaine hearts, garlic herb sourdough shards, aged Pecorino.' },
    { id: 5, name: 'Molten Obsidian Cake', price: 14, category: 'Desserts', image: CakeImage, desc: '72% dark chocolate, liquid lava center, Madagascan vanilla cloud.' },
    { id: 7, name: 'Signature Mojito', price: 14, category: 'Drinks', image: MOJITO_IMAGE, desc: 'Fresh mint, muddles lime, premium white rum, botanical soda.' },
    { id: 8, name: 'Velvet Espresso Martini', price: 16, category: 'Drinks', image: MARTINI_IMAGE, desc: 'Single-origin espresso, artisanal vodka, dark chocolate dusting.' },
    { id: 9, name: 'Mango Lassi Silk', price: 9, category: 'Drinks', image: MANGO_IMAGE, desc: 'Creamy yogurt, Alfonso mango nectar, cardamom infusion.' },
];

const CATEGORIES = ['All', 'Starters', 'Mains', 'Desserts', 'Drinks'];

const Order = () => {
    const [category, setCategory] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const { cartItems = {}, addToCart, updateQuantity, openCart } = useCart();
    const [menuItems, setMenuItems] = useState(INITIAL_MENU_ITEMS);

    React.useEffect(() => {
        fetchWithAuth('/api/dishes')
            .then(res => setMenuItems(res.data || INITIAL_MENU_ITEMS))
            .catch(err => console.error(err));
    }, []);

    const categoryMap = { 'All': 'All', 'Starters': 'Starter', 'Mains': 'Main Course', 'Desserts': 'Dessert', 'Drinks': 'Drink' };

    const filteredItems = menuItems.filter(item =>
        (category === 'All' || item.category === categoryMap[category] || item.category === category) &&
        (item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.desc || '').toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleQuantityChange = (id, newQty) => {
        updateQuantity(id, newQty);
    };

    return (
        <div className="order-page-container fade-in">
            <header className="order-hero-banner">
                <div className="container banner-content">
                    <h1 className="animate-fade-up">Curated <span className="accent">Menu</span></h1>
                    <p className="animate-fade-up delay-1">Fine dining excellence, delivered to your door.</p>
                </div>
            </header>

            <div className="container filter-navigation-wrapper">
                <div className="filter-navigation-bar glass-panel">
                    <div className="categories-pills">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                className={`pill-btn ${category === cat ? 'active' : ''}`}
                                onClick={() => setCategory(cat)}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                    <div className="order-search-box">
                        <Search size={18} className="icon" />
                        <input
                            placeholder="Search menu..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <main className="container menu-grid-layout" style={{ marginTop: '4rem' }}>
                <div className="menu-items-grid">
                    {filteredItems.map(item => (
                        <div key={item.id} className="menu-item-card glass-card">
                            <div className="item-image-wrapper">
                                <img src={item.imageUrl || item.image} alt={item.name} loading="lazy" />
                                <div className="item-tag">{item.category}</div>
                            </div>

                            <div className="item-info">
                                <div className="title-row">
                                    <h3>{item.name}</h3>
                                    <span className="price">${item.price}</span>
                                </div>
                                <p className="description">{item.desc}</p>

                                <div className="item-footer">
                                    {cartItems[item.id] ? (
                                        <div className="quantity-manager">
                                            <button onClick={() => handleQuantityChange(item.id, cartItems[item.id] - 1)}><Minus size={16} /></button>
                                            <span className="count">{cartItems[item.id]}</span>
                                            <button onClick={() => handleQuantityChange(item.id, cartItems[item.id] + 1)}><Plus size={16} /></button>
                                        </div>
                                    ) : (
                                        <button className="add-to-cart-btn" onClick={() => addToCart(item.id)}>
                                            <Plus size={18} /> Add to Order
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {/* Sticky Cart FAB */}
            {Object.keys(cartItems).length > 0 && (
                <button className="cart-fab" onClick={openCart}>
                    <ShoppingBag size={24} />
                    <span className="fab-badge">{Object.values(cartItems).reduce((a, b) => a + b, 0)}</span>
                </button>
            )}

            <style>{`
                .order-page-container { padding-top: var(--nav-height); min-height: 100vh; background: #050505; }
                
                .order-hero-banner { 
                    padding: 6rem 0 4rem; 
                    text-align: center;
                }

                .order-hero-banner h1 { font-family: 'Playfair Display', serif; font-size: 4rem; margin-bottom: 1rem; color: #fff; }
                .order-hero-banner p { color: var(--color-text-secondary); font-size: 1.2rem; }

                .filter-navigation-wrapper {
                    position: sticky;
                    top: calc(var(--nav-height) + 1rem);
                    z-index: 100;
                    margin-top: 2rem;
                }

                .filter-navigation-bar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0.75rem 2rem;
                    border-radius: 100px;
                    gap: 2rem;
                    background: rgba(15, 15, 15, 0.8) !important;
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255,255,255,0.05);
                }

                .categories-pills { display: flex; gap: 0.5rem; }
                
                .pill-btn {
                    padding: 0.6rem 1.4rem;
                    background: transparent;
                    border: none;
                    color: rgba(255,255,255,0.5);
                    border-radius: 100px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    font-size: 0.75rem;
                    cursor: pointer;
                    transition: var(--transition);
                }

                .pill-btn.active, .pill-btn:hover {
                    background: var(--color-accent);
                    color: #000;
                }

                .order-search-box {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    background: rgba(255,255,255,0.03);
                    padding: 0.5rem 1.5rem;
                    border-radius: 100px;
                    flex: 1;
                    max-width: 300px;
                    border: 1px solid rgba(255,255,255,0.05);
                }

                .order-search-box input {
                    background: transparent;
                    border: none;
                    color: #fff;
                    width: 100%;
                    outline: none;
                }

                .menu-items-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                    gap: 2.5rem;
                    padding-bottom: 8rem;
                }

                .menu-item-card {
                    padding: 0 !important;
                    overflow: hidden;
                    border-radius: 20px;
                }

                .item-image-wrapper {
                    height: 240px;
                    position: relative;
                }

                .item-image-wrapper img {
                    width: 100%; height: 100%;
                    object-fit: cover;
                    display: block; /* Fix grey line issue */
                }

                .item-tag {
                    position: absolute;
                    top: 1rem; right: 1rem;
                    background: var(--color-accent);
                    color: #000;
                    padding: 0.3rem 0.8rem;
                    border-radius: 6px;
                    font-size: 0.7rem;
                    font-weight: 800;
                }

                .item-info { padding: 2rem; }
                .title-row { display: flex; justify-content: space-between; margin-bottom: 1rem; }
                .title-row h3 { font-family: 'Playfair Display', serif; font-size: 1.4rem; color: #fff; }
                .price { color: var(--color-accent); font-weight: 800; }
                .description { color: var(--color-text-secondary); font-size: 0.9rem; line-height: 1.6; margin-bottom: 2rem; height: 3rem; overflow: hidden; }

                .add-to-cart-btn {
                    width: 100%;
                    background: transparent;
                    border: 1px solid var(--color-accent);
                    color: var(--color-accent);
                    padding: 0.8rem;
                    border-radius: 10px;
                    font-weight: 700;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                }

                .add-to-cart-btn:hover { background: var(--color-accent); color: #000; }

                .quantity-manager {
                    display: flex; align-items: center; justify-content: space-between;
                    background: rgba(255,255,255,0.03);
                    padding: 0.5rem; border-radius: 10px;
                }

                .quantity-manager button {
                    background: rgba(255,255,255,0.05);
                    border: none; color: #fff; width: 30px; height: 30px; border-radius: 6px; cursor: pointer;
                }

                .cart-fab {
                    position: fixed;
                    bottom: 2.5rem; right: 2.5rem;
                    width: 65px; height: 65px;
                    background: var(--color-accent);
                    border: none; border-radius: 50%;
                    box-shadow: 0 10px 30px rgba(212, 175, 55, 0.4);
                    cursor: pointer;
                }

                .fab-badge {
                    position: absolute; top: 0; right: 0;
                    background: #fff; color: #000;
                    width: 24px; height: 24px; border-radius: 50%;
                    font-size: 0.8rem; font-weight: 800; display: flex; align-items: center; justify-content: center;
                }

                @media (max-width: 768px) {
                    .filter-navigation-bar { flex-direction: column; border-radius: 20px; padding: 1.5rem; }
                    .categories-pills { flex-wrap: wrap; justify-content: center; }
                    .order-search-box { max-width: none; width: 100%; }
                }
            `}</style>
        </div>
    );
};

export default Order;
