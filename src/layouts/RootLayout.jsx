import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import CartDrawer from '../components/common/CartDrawer';
import { useCart } from '../context/CartContext';
import { fetchWithAuth } from '../api';

// Import menu data for the cart drawer
import BurgerImage from '../assets/images/gourmet_burger_plate_1769975915068.png';
import SalmonImage from '../assets/images/salmon_dish_fine_dining_1769975929501.png';
import RisottoImage from '../assets/images/truffle_risotto_closeup_1769976236482.png';
import CaesarImage from '../assets/images/caesar_salad_fresh_1769976250655.png';
import CakeImage from '../assets/images/chocolate_lava_cake_dessert_1769976265084.png';

const INITIAL_ITEMS_DATA = [
    { id: 1, name: 'Wagyu Gold Burger', price: 28, image: BurgerImage },
    { id: 2, name: 'Atlantic Glazed Salmon', price: 32, image: SalmonImage },
    { id: 3, name: 'Black Truffle Risotto', price: 24, image: RisottoImage },
    { id: 4, name: 'Architectural Caesar', price: 16, image: CaesarImage },
    { id: 5, name: 'Molten Obsidian Cake', price: 14, image: CakeImage },
    { id: 7, name: 'Signature Mojito', price: 14, image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80" },
    { id: 8, name: 'Velvet Espresso Martini', price: 16, image: "https://images.unsplash.com/photo-1545438102-799c3991ffb2?auto=format&fit=crop&w=800&q=80" },
    { id: 9, name: 'Mango Lassi Silk', price: 9, image: "https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=800&q=80" },
];

const RootLayout = () => {
    const { isCartOpen, closeCart, cartItems, updateQuantity } = useCart();
    const [menuData, setMenuData] = React.useState(INITIAL_ITEMS_DATA);

    React.useEffect(() => {
        fetchWithAuth('/api/dishes')
            .then(res => {
                if (res.data && res.data.length > 0) {
                    // merge with images
                    const merged = res.data.map(dbDish => {
                        const staticDish = INITIAL_ITEMS_DATA.find(i => i.id === dbDish.id);
                        return { ...dbDish, image: staticDish ? staticDish.image : BurgerImage };
                    });
                    setMenuData(merged);
                }
            })
            .catch(err => console.error('Failed to load menu for cart:', err));
    }, []);

    return (
        <div className="app-root-container">
            {/* Global Ambient Gradient */}
            <div className="ambient-background"></div>

            <Navbar />

            <CartDrawer
                isOpen={isCartOpen}
                onClose={closeCart}
                cartItems={cartItems}
                updateQuantity={updateQuantity}
                itemsData={menuData}
            />

            <main className="main-content-flow">
                <Outlet />
            </main>

            <footer className="refined-footer">
                <div className="container">
                    <div className="footer-grid">
                        <div className="footer-brand">
                            <h2 className="nav-logo">Gourmet<span className="accent">Flow</span></h2>
                            <p>Culinary Excellence in Every Pixel.</p>
                        </div>
                        <div className="footer-links">
                            <h4>Explore</h4>
                            <ul>
                                <li><a href="/order">Menu</a></li>
                                <li><a href="/reservations">Reservations</a></li>
                                <li><a href="/events">Events</a></li>
                            </ul>
                        </div>
                        <div className="footer-contact">
                            <h4>Visit Us</h4>
                            <p>123 Obsidian Lane, Metropolis</p>
                            <p>rsvp@gourmetflow.com</p>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <p>&copy; 2026 GourmetFlow • Crafted for Culinary Explorers</p>
                    </div>
                </div>
            </footer>

            <style>{`
                .ambient-background {
                    position: fixed;
                    top: 0; left: 0; width: 100%; height: 100%;
                    background: radial-gradient(circle at 50% -20%, rgba(212, 175, 55, 0.08) 0%, transparent 50%),
                                radial-gradient(circle at -20% 50%, rgba(212, 175, 55, 0.03) 0%, transparent 50%);
                    z-index: -1;
                    pointer-events: none;
                }

                .refined-footer {
                    padding: 8rem 0 4rem;
                    background: var(--color-bg-secondary);
                    border-top: 1px solid var(--glass-border);
                    margin-top: 5rem;
                }

                .footer-grid {
                    display: grid;
                    grid-template-columns: 2fr 1fr 1fr;
                    gap: 4rem;
                    margin-bottom: 4rem;
                }

                .footer-brand h2 { margin-bottom: 1rem; }
                .footer-brand p { color: var(--color-text-secondary); }

                .footer-links h4, .footer-contact h4 { 
                    font-size: 1.1rem; color: #fff; margin-bottom: 1.5rem; 
                    text-transform: uppercase; letter-spacing: 0.1em;
                }

                .footer-links ul { list-style: none; }
                .footer-links li { margin-bottom: 0.75rem; }
                .footer-links a { color: var(--color-text-secondary); text-decoration: none; transition: var(--transition); }
                .footer-links a:hover { color: var(--color-accent); }

                .footer-contact p { color: var(--color-text-secondary); margin-bottom: 0.5rem; }

                .footer-bottom {
                    padding-top: 2rem;
                    border-top: 1px solid rgba(255,255,255,0.05);
                    text-align: center;
                    color: var(--color-text-secondary);
                    font-size: 0.85rem;
                }

                @media (max-width: 768px) {
                    .footer-grid { grid-template-columns: 1fr; gap: 3rem; }
                }
            `}</style>
        </div>
    );
};

export default RootLayout;
