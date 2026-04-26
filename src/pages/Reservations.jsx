import React, { useState } from 'react';
import { ShoppingBag, Plus, Minus, Search, Check, Utensils, Calendar, Users, Clock, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchWithAuth } from '../api';
import './Reservations.css';

// Menu items for pre-ordering
import BurgerImage from '../assets/images/gourmet_burger_plate_1769975915068.png';
import SalmonImage from '../assets/images/salmon_dish_fine_dining_1769975929501.png';
import RisottoImage from '../assets/images/truffle_risotto_closeup_1769976236482.png';
import CaesarImage from '../assets/images/caesar_salad_fresh_1769976250655.png';
import CakeImage from '../assets/images/chocolate_lava_cake_dessert_1769976265084.png';

const INITIAL_MENU_DATA = [
    { id: 1, name: 'Wagyu Gold Burger', price: 28, image: BurgerImage },
    { id: 2, name: 'Atlantic Glazed Salmon', price: 32, image: SalmonImage },
    { id: 3, name: 'Black Truffle Risotto', price: 24, image: RisottoImage },
    { id: 4, name: 'Architectural Caesar', price: 16, image: CaesarImage },
    { id: 5, name: 'Molten Obsidian Cake', price: 14, image: CakeImage },
    { id: 7, name: 'Signature Mojito', price: 14, image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80" },
    { id: 8, name: 'Velvet Espresso Martini', price: 16, image: "https://images.unsplash.com/photo-1545438102-799c3991ffb2?auto=format&fit=crop&w=800&q=80" },
    { id: 9, name: 'Mango Lassi Silk', price: 9, image: "https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=800&q=80" },
];

const INITIAL_TABLES = [
    { id: 'T1', name: 'Alchemist Pod 1', capacity: 2, pos: { top: '20%', left: '20%' }, type: 'Window', status: 'available' },
    { id: 'T2', name: 'Alchemist Pod 2', capacity: 2, pos: { top: '20%', left: '50%' }, type: 'Booth', status: 'occupied' },
    { id: 'T3', name: 'Alchemist Pod 3', capacity: 2, pos: { top: '20%', left: '80%' }, type: 'Window', status: 'available' },
    { id: 'T4', name: 'Gourmet Lounge', capacity: 4, pos: { top: '50%', left: '35%' }, type: 'Private', status: 'available' },
    { id: 'T5', name: 'Gourmet Lounge', capacity: 4, pos: { top: '50%', left: '65%' }, type: 'Private', status: 'occupied' },
    { id: 'T6', name: 'The Grand Table', capacity: 6, pos: { top: '80%', left: '50%' }, type: 'Luxury', status: 'available' },
];

const VISUAL_POSITIONS = [
    { name: 'Window 1', pos: { top: '15%', left: '20%' }, type: 'Window' },
    { name: 'Window 2', pos: { top: '15%', left: '50%' }, type: 'Window' },
    { name: 'Window 3', pos: { top: '15%', left: '80%' }, type: 'Window' },
    
    { name: 'Booth Alpha', pos: { top: '35%', left: '35%' }, type: 'Booth' },
    { name: 'Booth Beta', pos: { top: '35%', left: '65%' }, type: 'Booth' },
    
    { name: 'Lounge 1', pos: { top: '55%', left: '20%' }, type: 'Private' },
    { name: 'Lounge 2', pos: { top: '55%', left: '50%' }, type: 'Private' },
    { name: 'Lounge 3', pos: { top: '55%', left: '80%' }, type: 'Private' },
    
    { name: 'Grand VIP', pos: { top: '75%', left: '35%' }, type: 'Luxury' },
    { name: 'Banquet Hall', pos: { top: '75%', left: '65%' }, type: 'Luxury' },
    { name: 'Centerpiece', pos: { top: '45%', left: '50%' }, type: 'Luxury' }
];

const Reservations = () => {
    const [step, setStep] = useState(1);
    const [bookingData, setBookingData] = useState({
        date: '',
        time: '19:00',
        guests: 2,
        selectedTable: null,
        preOrder: {}, // { itemId: quantity }
    });
    const [menuData, setMenuData] = useState(INITIAL_MENU_DATA);
    const [dbTables, setDbTables] = useState([]);

    React.useEffect(() => {
        fetchWithAuth('/api/dishes')
            .then(res => setMenuData(res.data || INITIAL_MENU_DATA))
            .catch(err => console.error('Failed to fetch menu:', err));
        
        fetchWithAuth('/api/tables')
            .then(res => setDbTables(res.data || []))
            .catch(err => console.error('Failed to fetch tables:', err));
    }, []);

    const tables = dbTables.length > 0 ? dbTables.map((t, i) => {
        const visual = VISUAL_POSITIONS[i % VISUAL_POSITIONS.length];
        
        let isOccupied = !t.status; // Base status (e.g. out of order)
        if (bookingData.date && bookingData.time && t.reservations && t.reservations.length > 0) {
            const selectedTime = new Date(`${bookingData.date}T${bookingData.time}:00`).getTime();
            const TWO_HOURS = 2 * 60 * 60 * 1000;
            const hasConflict = t.reservations.some(res => {
                const resTime = new Date(res.datetime).getTime();
                return Math.abs(resTime - selectedTime) < TWO_HOURS;
            });
            if (hasConflict) isOccupied = true;
        }

        return {
            id: `T${t.id}`,
            name: `${visual.name} (DB)`, 
            capacity: t.capacity,
            pos: visual.pos,
            type: visual.type,
            status: isOccupied ? 'occupied' : 'available'
        };
    }) : INITIAL_TABLES;

    const handleNext = () => setStep(step + 1);
    const handleBack = () => setStep(step - 1);

    const togglePreOrder = (itemId) => {
        setBookingData(prev => {
            const newPreOrder = { ...prev.preOrder };
            if (newPreOrder[itemId]) {
                delete newPreOrder[itemId];
            } else {
                newPreOrder[itemId] = 1;
            }
            return { ...prev, preOrder: newPreOrder };
        });
    };

    const updatePreOrderQty = (itemId, delta) => {
        setBookingData(prev => {
            const newPreOrder = { ...prev.preOrder };
            const newQty = (newPreOrder[itemId] || 0) + delta;
            if (newQty <= 0) {
                delete newPreOrder[itemId];
            } else {
                newPreOrder[itemId] = newQty;
            }
            return { ...prev, preOrder: newPreOrder };
        });
    };

    const isStep1Valid = bookingData.date && bookingData.time && bookingData.guests;
    const isStep2Valid = bookingData.selectedTable;

    return (
        <div className="reservations-container animate-fade-in">
            <div className="reservation-nav-header">
                <div className="container">
                    <div className="steps-indicator">
                        <div className={`step-dot ${step >= 1 ? 'active' : ''}`}><span>1</span><label>Details</label></div>
                        <div className={`line ${step >= 2 ? 'active' : ''}`}></div>
                        <div className={`step-dot ${step >= 2 ? 'active' : ''}`}><span>2</span><label>Location</label></div>
                        <div className={`line ${step >= 3 ? 'active' : ''}`}></div>
                        <div className={`step-dot ${step >= 3 ? 'active' : ''}`}><span>3</span><label>Pre-Meal</label></div>
                        <div className={`line ${step >= 4 ? 'active' : ''}`}></div>
                        <div className={`step-dot ${step >= 4 ? 'active' : ''}`}><span>4</span><label>Confirm</label></div>
                    </div>
                </div>
            </div>

            <main className="container reservation-main">
                {step === 1 && (
                    <div className="reservation-setup fade-in">
                        <div className="section-header">
                            <h1>Book Your Table</h1>
                            <p>Choose the date and time for your dining experience.</p>
                        </div>
                        <div className="reservation-form-grid glass-card">
                            <div className="input-field-group">
                                <label><Calendar size={16} /> Date</label>
                                <input
                                    type="date"
                                    className="reservation-input"
                                    value={bookingData.date}
                                    onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                                />
                            </div>
                            <div className="input-field-group">
                                <label><Clock size={16} /> Time</label>
                                <select
                                    className="reservation-input"
                                    value={bookingData.time}
                                    onChange={(e) => setBookingData({ ...bookingData, time: e.target.value })}
                                >
                                    <option>18:00</option>
                                    <option>19:00</option>
                                    <option>20:00</option>
                                    <option>21:00</option>
                                    <option>22:00</option>
                                </select>
                            </div>
                            <div className="input-field-group">
                                <label><Users size={16} /> Guests</label>
                                <input
                                    type="number"
                                    className="reservation-input"
                                    min="1" max="10"
                                    value={bookingData.guests}
                                    onChange={(e) => setBookingData({ ...bookingData, guests: parseInt(e.target.value) })}
                                />
                            </div>
                            <button
                                className="reservation-submit-btn"
                                disabled={!isStep1Valid}
                                onClick={handleNext}
                            >
                                Find Availability
                            </button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="table-selection fade-in">
                        <div className="section-header">
                            <button className="back-link" onClick={handleBack}><ChevronLeft size={16} /> Previous Step</button>
                            <h1>Select Your Portal</h1>
                            <p>Choose your specific vantage point within the sanctuary.</p>
                        </div>
                        <div className="table-map-container glass-card">
                            <div className="map-legend">
                                <div className="legend-item"><span className="dot available"></span> Available</div>
                                <div className="legend-item"><span className="dot selected"></span> Selected</div>
                                <div className="legend-item"><span className="dot occupied"></span> Occupied</div>
                            </div>
                            <div className="restaurant-floor-plan">
                                {tables.map(table => (
                                    <div
                                        key={table.id}
                                        className={`table-node ${table.status} ${bookingData.selectedTable === table.id ? 'selected' : ''}`}
                                        style={{ top: table.pos.top, left: table.pos.left }}
                                        onClick={() => table.status === 'available' && setBookingData({ ...bookingData, selectedTable: table.id })}
                                    >
                                        <div className="table-inner">
                                            <span className="table-id">{table.id}</span>
                                            <div className="table-status-label">{table.status === 'occupied' ? 'BOOKED' : 'AVAIL'}</div>
                                            <div className="guests-dots">
                                                {[...Array(table.capacity)].map((_, i) => <span key={i} />)}
                                            </div>
                                        </div>
                                        <div className="table-tooltip">
                                            <strong>{table.name}</strong>
                                            <span>{table.type} View • Capacity: {table.capacity}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="selection-summary">
                            {bookingData.selectedTable ? (
                                <div className="info animate-fade-in">
                                    <MapPin size={20} className="accent" />
                                    <span>Selected: <strong>{tables.find(t => t.id === bookingData.selectedTable)?.name}</strong></span>
                                </div>
                            ) : <span>Please select a table on the map to continue.</span>}
                            <button
                                className="reservation-submit-btn"
                                disabled={!isStep2Valid}
                                onClick={handleNext}
                            >
                                Proceed to Pre-Order
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="pre-meal-selection fade-in">
                        <div className="section-header">
                            <button className="back-link" onClick={handleBack}><ChevronLeft size={16} /> Previous Step</button>
                            <h1>Instant Gratification</h1>
                            <p>Select dishes to be prepared and served the moment you arrive.</p>
                        </div>
                        <div className="pre-meal-grid">
                            {menuData.map(item => (
                                <div
                                    key={item.id}
                                    className={`pre-meal-card glass-card ${bookingData.preOrder[item.id] ? 'active' : ''}`}
                                    onClick={() => !bookingData.preOrder[item.id] && togglePreOrder(item.id)}
                                >
                                    <div className="card-image" style={{ backgroundImage: `url(${item.imageUrl || item.image})` }}>
                                        {bookingData.preOrder[item.id] && <div className="check-overlay"><Check /></div>}
                                    </div>
                                    <div className="card-info">
                                        <h3>{item.name}</h3>
                                        <span className="price">${item.price}</span>
                                        {bookingData.preOrder[item.id] ? (
                                            <div className="qty-ctrl" onClick={e => e.stopPropagation()}>
                                                <button onClick={() => updatePreOrderQty(item.id, -1)}><Minus size={14} /></button>
                                                <span>{bookingData.preOrder[item.id]}</span>
                                                <button onClick={() => updatePreOrderQty(item.id, 1)}><Plus size={14} /></button>
                                            </div>
                                        ) : (
                                            <button className="add-pre-btn">Add to Arrival</button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="action-row">
                            <button className="reservation-submit-btn outline" onClick={handleNext}>Skip Pre-Order</button>
                            <button className="reservation-submit-btn" onClick={handleNext}>Finalize Reservation</button>
                        </div>
                    </div>
                )}

                {step === 4 && (
                    <div className="confirmation-final fade-in">
                        <div className="section-header">
                            <h1>Review Your Passage</h1>
                        </div>
                        <div className="confirm-grid glass-card">
                            <div className="confirm-section">
                                <h3><Calendar size={18} /> Booking Details</h3>
                                <p>Date: <strong>{bookingData.date}</strong></p>
                                <p>Time: <strong>{bookingData.time}</strong></p>
                                <p>Guests: <strong>{bookingData.guests}</strong></p>
                                <p>Table: <strong>{tables.find(t => t.id === bookingData.selectedTable)?.name} ({bookingData.selectedTable})</strong></p>
                            </div>
                            <div className="confirm-separator"></div>
                            <div className="confirm-section">
                                <h3><Utensils size={18} /> Pre-Ordered Items</h3>
                                {Object.keys(bookingData.preOrder).length > 0 ? (
                                    <ul className="pre-order-list">
                                        {Object.entries(bookingData.preOrder).map(([id, qty]) => {
                                            const item = menuData.find(i => i.id === parseInt(id));
                                            return (
                                                <li key={id}>
                                                    <span>{item?.name} x {qty}</span>
                                                    <span>${(item?.price || 0) * qty}</span>
                                                </li>
                                            );
                                        })}
                                        <li className="total-row">
                                            <span>Pre-Order Total</span>
                                            <span>${Object.entries(bookingData.preOrder).reduce((sum, [id, qty]) => sum + ((menuData.find(i => i.id === parseInt(id))?.price || 0) * qty), 0)}</span>
                                        </li>
                                    </ul>
                                ) : (
                                    <p className="mute">No pre-ordered meals selected.</p>
                                )}
                            </div>
                        </div>
                        <div className="final-actions">
                            <p className="disclaimer">By confirming, you agree to our 24-hour cancellation policy.</p>
                            <button
                                className="reservation-submit-btn final"
                                onClick={async () => {
                                    try {
                                        // tableId might be a number or string like 'T1' wait we need integer
                                        // let's just parse the last char
                                        const tId = parseInt(String(bookingData.selectedTable).replace('T', ''));
                                        const preOrders = Object.entries(bookingData.preOrder).map(([id, qty]) => ({
                                            dishId: parseInt(id),
                                            quantity: qty
                                        }));
                                        const dt = new Date(`${bookingData.date}T${bookingData.time}:00`).toISOString();
                                        
                                        await fetchWithAuth('/api/reservations', {
                                            method: 'POST',
                                            body: JSON.stringify({
                                                tableId: tId || 1,
                                                datetime: dt,
                                                preOrders
                                            })
                                        });
                                        
                                        alert('Your Table is Secured!');
                                        window.location.href = '/';
                                    } catch (err) {
                                        alert('Failed to secure table: ' + err.message);
                                    }
                                }}
                            >
                                Confirm Booking
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Reservations;
