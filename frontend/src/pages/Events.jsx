import React, { useState } from 'react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { 
    Mail, Phone, Calendar, ArrowRight, ShieldCheck, 
    MapPin, Check, Plus, Minus, ChevronLeft, Search 
} from 'lucide-react';
import { fetchWithAuth } from '../api';
import useScrollOnUpdate from '../hooks/useScrollOnUpdate';

// Assets
import HeroImage from '../assets/images/hero_restaurant_ambience_1769975900791.png';
import CateringImage from '../assets/images/truffle_risotto_closeup_1769976236482.png';
import BurgerImage from '../assets/images/gourmet_burger_plate_1769975915068.png';
import SalmonImage from '../assets/images/salmon_dish_fine_dining_1769975929501.png';
import RisottoImage from '../assets/images/truffle_risotto_closeup_1769976236482.png';
import CaesarImage from '../assets/images/caesar_salad_fresh_1769976250655.png';
import CakeImage from '../assets/images/chocolate_lava_cake_dessert_1769976265084.png';

const MENU_DATA = [
    { id: 1, name: 'Wagyu Gold Burger', price: 28, image: BurgerImage },
    { id: 2, name: 'Atlantic Glazed Salmon', price: 32, image: SalmonImage },
    { id: 3, name: 'Black Truffle Risotto', price: 24, image: RisottoImage },
    { id: 4, name: 'Architectural Caesar', price: 16, image: CaesarImage },
    { id: 5, name: 'Molten Obsidian Cake', price: 14, image: CakeImage },
    { id: 7, name: 'Signature Mojito', price: 14, image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80" },
    { id: 8, name: 'Velvet Espresso Martini', price: 16, image: "https://images.unsplash.com/photo-1545438102-799c3991ffb2?auto=format&fit=crop&w=800&q=80" },
    { id: 9, name: 'Mango Lassi Silk', price: 9, image: "https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=800&q=80" },
];

const Events = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '', 
        email: '', 
        date: '', 
        guests: 5,
        location: 'Main Sanctuary',
        type: 'Corporate Gala & Summit', 
        details: '',
        selectedDishes: {} 
    });
    useScrollOnUpdate(step);
    const todayStr = new Date().toISOString().split('T')[0];

    // Calculate 1.5 years (18 months) in the future
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 18);
    const maxDateStr = maxDate.toISOString().split('T')[0];

    // New states for feedback
    const [error, setError] = useState(null);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleNext = () => setStep(step + 1);
    const handleBack = () => setStep(step - 1);

    const toggleDishSelection = (itemId) => {
        setFormData(prev => ({
            ...prev,
            selectedDishes: {
                ...prev.selectedDishes,
                [itemId]: !prev.selectedDishes[itemId]
            }
        }));
    };

    const getQuantityPerPerson = (numPeople) => {
        if (numPeople <= 10) return 3;
        if (numPeople <= 25) return 2.5;
        if (numPeople <= 50) return 2;
        return 1.5;
    };

    const getMenuSummaryWithQuantities = () => {
        const items = [];
        const selectedCount = Object.values(formData.selectedDishes).filter(v => v).length;
        if (selectedCount === 0) return items;

        const quantityPerPerson = getQuantityPerPerson(formData.guests);
        
        Object.entries(formData.selectedDishes).forEach(([dishId, selected]) => {
            if (selected) {
                const dish = MENU_DATA.find(d => d.id === parseInt(dishId));
                if (dish) {
                    const baseQty = Math.ceil((formData.guests * quantityPerPerson) / selectedCount);
                    items.push({ ...dish, quantity: baseQty });
                }
            }
        });
        return items;
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        
        const selectedIds = Object.keys(formData.selectedDishes)
            .filter(id => formData.selectedDishes[id])
            .map(id => parseInt(id));

        try {
            await fetchWithAuth('/api/caterings', {
                method: 'POST',
                body: JSON.stringify({
                    eventName: formData.type,
                    guestCount: parseInt(formData.guests) || 10,
                    location: 'Main Sanctuary',
                    datetime: new Date(`${formData.date}T19:00:00`).toISOString(),
                    menuItemIds: selectedIds 
                })
            });
            setIsSubmitted(true);
            window.scrollTo(0, 0);
        } catch (err) {
            setError(err.message || 'The curation system is currently unavailable. Please attempt your proposal later.');
            window.scrollTo(0, 0);
        }
    };

    const isStep1Valid = formData.date && formData.guests;
    const isStep2Valid = Object.values(formData.selectedDishes).some(v => v);

    // --- SUCCESS STATE ---
    if (isSubmitted) {
        return (
            <div className="container" style={{ paddingTop: '12rem', paddingBottom: '10rem', textAlign: 'center' }}>
                <div className="glass-panel animate-fade-in" style={{ padding: '5rem', borderRadius: '32px', maxWidth: '800px', margin: '0 auto' }}>
                    <div style={{ width: '80px', height: '80px', background: 'rgba(212, 175, 55, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyCenter: 'center', margin: '0 auto 2rem', justifyContent: 'center' }}>
                        <Check className="accent" size={40} />
                    </div>
                    <h2 style={{ fontSize: '3rem', fontFamily: 'Playfair Display', marginBottom: '1.5rem' }}>Proposal Dispatched</h2>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.2rem', marginBottom: '3rem', lineHeight: '1.8' }}>
                        Your vision for a {formData.type} has been received. Our events coordinator will contact you shortly to refine the architectural details of your experience.
                    </p>
                    <button onClick={() => window.location.href = '/'} className="refined-submit-btn" style={{ margin: '0 auto', width: 'fit-content', padding: '1.25rem 3rem' }}>
                        RETURN TO SANCTUARY
                    </button>
                </div>
            </div>
        );
    }

    // --- ERROR STATE ---
    if (error) {
        return (
            <div className="container" style={{ paddingTop: '12rem', paddingBottom: '10rem', textAlign: 'center' }}>
                <div className="glass-panel animate-fade-in" style={{ padding: '5rem', borderRadius: '32px', maxWidth: '800px', margin: '0 auto', border: '1px solid rgba(255, 50, 50, 0.2)' }}>
                    <div style={{ width: '80px', height: '80px', background: 'rgba(255, 50, 50, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
                        <Search style={{ color: '#ff4d4d' }} size={40} />
                    </div>
                    <h2 style={{ fontSize: '3rem', fontFamily: 'Playfair Display', marginBottom: '1.5rem' }}>Something went wrong</h2>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.2rem', marginBottom: '3rem' }}>{error}</p>
                    <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center' }}>
                        <button onClick={() => setError(null)} className="refined-submit-btn" style={{ width: 'fit-content', padding: '1.25rem 3rem' }}>
                            RETRY
                        </button>
                        <button onClick={() => window.location.href = '/'} className="refined-submit-btn" style={{ background: 'transparent', border: '1px solid var(--glass-border)', color: '#fff', width: 'fit-content', padding: '1.25rem 3rem' }}>
                            RETURN HOME
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ paddingTop: '8rem', paddingBottom: '6rem' }}>
            {step === 1 && (
                <div className="container">
                    <header className="animate-fade-up" style={{ textAlign: 'center', marginBottom: '5rem' }}>
                        <span style={{ color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '0.4em', fontSize: '0.75rem', fontWeight: 800 }}>Immersive Experiences</span>
                        <h1 style={{ fontSize: '4.5rem', marginTop: '1rem', marginBottom: '1.5rem', fontFamily: 'Playfair Display, serif' }}>Curated <span className="accent" style={{ color: 'var(--color-accent)', fontStyle: 'italic' }}>Private Events</span></h1>
                        <p style={{ color: 'var(--color-text-secondary)', maxWidth: '750px', margin: '0 auto', fontSize: '1.15rem', lineHeight: '1.8' }}>
                            From high-profile corporate summits to intimate candlelit celebrations, our sanctuary transforms to mirror your architectural vision.
                        </p>
                    </header>
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 0.8fr)', gap: '6rem', alignItems: 'start' }}>
                        <div className="animate-fade-up delay-1">
                            <h2 style={{ fontSize: '2rem', fontFamily: 'Playfair Display' }}>Submit a Proposal</h2>
                            <Card className="glass-panel" style={{ padding: '1.5rem', borderRadius: '24px' }}>
                                <form onSubmit={(e) => { e.preventDefault(); handleNext(); }} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                        <div className="input-field-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                            <label style={{ fontSize: '0.7rem', opacity: 0.5, letterSpacing: '0.2em', fontWeight: 700 }}>
                                                TARGET DATE
                                            </label>
                                            <input 
                                                type="date" 
                                                className="refined-input" 
                                                value={formData.date} 
                                                min={todayStr}    // Prevents past bookings
                                                max={maxDateStr}  // Prevents bookings beyond 1.5 years
                                                onChange={e => setFormData({...formData, date: e.target.value})} 
                                                onClick={(e) => e.target.showPicker?.()} 
                                                required 
                                                style={{ cursor: 'pointer' }}
                                            />
                                        </div>
                                        <div className="input-field-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                            <label style={{ fontSize: '0.7rem', opacity: 0.5, letterSpacing: '0.2em', fontWeight: 700 }}>EXPECTED GUESTS</label>
                                            <input type="number" className="refined-input" min="5" placeholder="Minimum 5" value={formData.guests} onChange={e => setFormData({...formData, guests: e.target.value})} required />
                                        </div>
                                    </div>
                                    <div className="input-field-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        <label style={{ fontSize: '0.7rem', opacity: 0.5, letterSpacing: '0.2em', fontWeight: 700 }}>EVENT ARCHITECTURE</label>
                                        <select className="refined-input select-dark" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} required>
                                            <option>Corporate Gala & Summit</option>
                                            <option>Private Birthday Celebration</option>
                                            <option>Wedding Reception & Vows</option>
                                            <option>Bespoke Culinary Dinner</option>
                                        </select>
                                    </div>
                                    <div className="input-field-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        <label style={{ fontSize: '0.7rem', opacity: 0.5, letterSpacing: '0.2em', fontWeight: 700 }}>VISUAL VISION & DETAILS</label>
                                        <textarea
                                            className="refined-input"
                                            rows="4"
                                            placeholder="Describe your desired atmosphere..."
                                            style={{ resize: 'none' }}
                                            value={formData.details} onChange={e => setFormData({...formData, details: e.target.value})}
                                        ></textarea>
                                    </div>
                                    <button type="submit" className="refined-submit-btn" disabled={!isStep1Valid}>
                                        SELECT MENU <ArrowRight size={18} />
                                    </button>
                                </form>
                            </Card>
                        </div>

                        <div className="animate-fade-up delay-2" style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
                            <div>
                                <h3 style={{ marginBottom: '2rem', color: 'var(--color-accent)', fontSize: '1.25rem', letterSpacing: '0.15em', fontWeight: 800 }}>DIRECT COORDINATION</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <p style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem' }}>
                                        <Phone size={22} style={{ color: 'var(--color-accent)' }} /> +1 (555) 123-4567
                                    </p>
                                    <p style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem' }}>
                                        <Mail size={22} style={{ color: 'var(--color-accent)' }} /> concierge@gourmetflow.com
                                    </p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                                <div className="event-visual-card">
                                    <div className="img-container"><img src={HeroImage} alt="Venue" /><div className="card-overlay"></div></div>
                                    <div className="card-lbl"><h4>Main Sanctuary</h4></div>
                                </div>
                                <div className="event-visual-card">
                                    <div className="img-container"><img src={CateringImage} alt="Catering" /><div className="card-overlay"></div></div>
                                    <div className="card-lbl"><h4>Gourmet Catering</h4><span><ShieldCheck size={12} /> Custom Bespoke Menus</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="container animate-fade-in">
                    <div className="section-header">
                        <button className="back-link" onClick={handleBack}><ChevronLeft size={16} /> Previous Step</button>
                        <h1 style={{ fontFamily: 'Playfair Display', fontSize: '3rem' }}>Select Your Culinary Vision</h1>
                        <p>Choose dishes for your {formData.guests}-guest event.</p>
                    </div>
                    <div className="menu-selection-grid">
                        {MENU_DATA.map(item => (
                            <div
                                key={item.id}
                                className={`menu-card glass-card ${formData.selectedDishes[item.id] ? 'active' : ''}`}
                                onClick={() => toggleDishSelection(item.id)}
                            >
                                <div className="card-image" style={{ backgroundImage: `url(${item.image})` }}>
                                    {formData.selectedDishes[item.id] && <div className="check-overlay"><Check /></div>}
                                </div>
                                <div className="card-info">
                                    <h3>{item.name}</h3>
                                    <span className="price">${item.price}</span>
                                    <button className={`select-dish-btn ${formData.selectedDishes[item.id] ? 'selected' : ''}`}>
                                        {formData.selectedDishes[item.id] ? '✓ Selected' : 'Select Dish'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="action-row">
                        <button className="refined-submit-btn" style={{ background: 'transparent', border: '1px solid var(--glass-border)', color: '#fff' }} onClick={handleBack}>Back</button>
                        <button className="refined-submit-btn" onClick={handleNext} disabled={!isStep2Valid}>
                            Review Summary <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="container animate-fade-in">
                    <div className="section-header">
                        <button className="back-link" onClick={handleBack}><ChevronLeft size={16} /> Previous Step</button>
                        <h1 style={{ fontFamily: 'Playfair Display', fontSize: '3rem' }}>Finalize Your Catering</h1>
                    </div>
                    <div className="catering-summary glass-panel" style={{ padding: '3rem', borderRadius: '24px', border: '1px solid var(--glass-border)' }}>
                        <div className="summary-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
                            <h2 style={{ fontFamily: 'Playfair Display' }}>Menu Summary</h2>
                            <span style={{ color: 'var(--color-accent)', fontWeight: 700 }}>For {formData.guests} Guests</span>
                        </div>
                        <div className="summary-items" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {getMenuSummaryWithQuantities().map(item => (
                                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '12px' }}>
                                    <div>
                                        <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{item.name}</h4>
                                        <p style={{ margin: 0, opacity: 0.6, fontSize: '0.9rem' }}>${item.price} / unit</p>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                                        <span>Qty: <strong>{item.quantity}</strong></span>
                                        <span style={{ color: 'var(--color-accent)', fontWeight: 700 }}>${(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div style={{ marginTop: '2rem', textAlign: 'right', fontSize: '1.5rem' }}>
                            <span style={{ opacity: 0.6, fontSize: '1rem', marginRight: '1rem' }}>ESTIMATED TOTAL:</span>
                            <strong style={{ color: 'var(--color-accent)' }}>
                                ${getMenuSummaryWithQuantities().reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}
                            </strong>
                        </div>
                    </div>
                    <div className="action-row" style={{ marginTop: '3rem' }}>
                        <button className="refined-submit-btn" style={{ background: 'transparent', border: '1px solid var(--glass-border)', color: '#fff' }} onClick={handleBack}>Back</button>
                        <button className="refined-submit-btn" onClick={handleSubmit} style={{ background: 'var(--color-accent)' }}>
                            CONFIRM & SUBMIT <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            )}

            <style>{`
                .section-header { text-align: center; margin-bottom: 4rem; }
                .back-link { background: none; border: none; color: var(--color-text-secondary); cursor: pointer; display: flex; align-items: center; gap: 0.5rem; margin: 0 auto 1.5rem; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.1em; }
                
                .menu-selection-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 2rem;
                    margin-bottom: 4rem;
                }

                .menu-card { padding: 0 !important; overflow: hidden; cursor: pointer; transition: var(--transition); border: 1px solid var(--glass-border); border-radius: 16px; }
                .menu-card:hover { transform: translateY(-8px); }
                .menu-card.active { border-color: var(--color-accent); box-shadow: 0 0 30px rgba(212, 175, 55, 0.2); }

                .card-image { height: 200px; background-size: cover; background-position: center; position: relative; filter: brightness(0.8); }
                .check-overlay { position: absolute; inset: 0; background: rgba(212, 175, 55, 0.4); display: flex; align-items: center; justify-content: center; color: #fff; backdrop-filter: blur(2px); }
                
                .card-info { padding: 1.5rem; }
                .card-info h3 { margin-bottom: 0.5rem; font-size: 1.2rem; color: #fff; }
                .card-info .price { color: var(--color-accent); font-weight: 700; display: block; margin-bottom: 1.5rem; }

                .select-dish-btn { width: 100%; background: none; border: 1px solid var(--glass-border); color: #fff; padding: 0.75rem; border-radius: 8px; cursor: pointer; transition: 0.3s; }
                .select-dish-btn.selected { background: var(--color-accent); color: #000; border-color: var(--color-accent); font-weight: 700; }

                .action-row { display: flex; gap: 2rem; justify-content: center; }

                .refined-input {
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.08);
                    padding: 1.25rem;
                    border-radius: 12px;
                    color: #fff;
                    font-family: 'Outfit', sans-serif;
                    font-size: 0.95rem;
                    outline: none;
                    transition: var(--transition);
                }
                .refined-input:focus { border-color: var(--color-accent); background: rgba(255,255,255,0.05); }
                .select-dark option { background: #111; color: #fff; }

                .refined-submit-btn {
                    background: var(--color-accent);
                    border: none;
                    padding: 1.5rem;
                    border-radius: 14px;
                    color: #000;
                    font-weight: 800;
                    font-size: 1rem;
                    letter-spacing: 0.15em;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 1rem;
                    transition: var(--transition);
                }
                .refined-submit-btn:hover:not(:disabled) { background: #fff; transform: translateY(-5px); }
                .refined-submit-btn:disabled { opacity: 0.3; cursor: not-allowed; }

                .event-visual-card { background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 20px; overflow: hidden; position: relative; }
                .img-container { height: 260px; overflow: hidden; position: relative; }
                .img-container img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s var(--ease-out-expo); }
                .event-visual-card:hover .img-container img { transform: scale(1.1); }
                .card-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%); }
                .card-lbl { position: absolute; bottom: 1.5rem; left: 2rem; }
                .card-lbl h4 { font-family: 'Playfair Display', serif; font-size: 1.4rem; color: #fff; margin-bottom: 0.4rem; }
                .card-lbl span { color: var(--color-accent); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.15em; font-weight: 700; display: flex; align-items: center; gap: 0.5rem; }
                
                @media (max-width: 768px) {
                    .menu-selection-grid { grid-template-columns: 1fr; }
                    .action-row { flex-direction: column; }
                    header h1 { font-size: 3rem !important; }
                }
                /* Invert the calendar icon for the refined-input class */
                .refined-input::-webkit-calendar-picker-indicator {
                    filter: invert(1);
                    cursor: pointer;
                    opacity: 0.7;
                }

                .refined-input::-webkit-calendar-picker-indicator:hover {
                    opacity: 1;
                }
            `}</style>
        </div>
    );
};

export default Events;