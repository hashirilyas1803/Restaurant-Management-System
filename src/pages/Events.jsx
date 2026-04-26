import React from 'react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { Mail, Phone, Calendar, ArrowRight, ShieldCheck, MapPin } from 'lucide-react';
import { fetchWithAuth } from '../api';
import HeroImage from '../assets/images/hero_restaurant_ambience_1769975900791.png';
import CateringImage from '../assets/images/truffle_risotto_closeup_1769976236482.png';

const Events = () => {
    const [formData, setFormData] = React.useState({
        name: '', email: '', date: '', guests: '', type: 'Corporate Gala & Summit', details: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await fetchWithAuth('/api/caterings', {
                method: 'POST',
                body: JSON.stringify({
                    eventName: formData.type,
                    guestCount: parseInt(formData.guests) || 10,
                    location: 'Main Sanctuary', // Default event location
                    datetime: new Date(`${formData.date}T19:00:00`).toISOString(),
                    menuItemIds: [] // Leaving empty to avoid Prisma nested connect errors on hardcoded fake IDs
                })
            });
            alert('Event inquiry sent! Our events coordinator will contact you shortly to plan your bespoke experience.');
        } catch (err) {
            alert('Failed to send inquiry: ' + err.message);
        }
    };

    return (
        <div className="container" style={{ paddingTop: '8rem', paddingBottom: '6rem' }}>
            <header className="animate-fade-up" style={{ textAlign: 'center', marginBottom: '5rem' }}>
                <span style={{ color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '0.4em', fontSize: '0.75rem', fontWeight: 800 }}>Immersive Experiences</span>
                <h1 style={{ fontSize: '4.5rem', marginTop: '1rem', marginBottom: '1.5rem', fontFamily: 'Playfair Display, serif' }}>Curated <span className="accent" style={{ color: 'var(--color-accent)', fontStyle: 'italic' }}>Private Events</span></h1>
                <p style={{ color: 'var(--color-text-secondary)', maxWidth: '750px', margin: '0 auto', fontSize: '1.15rem', lineHeight: '1.8' }}>
                    From high-profile corporate summits to intimate candlelit celebrations, our sanctuary transforms to mirror your architectural vision.
                </p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 0.8fr)', gap: '6rem', alignItems: 'start' }}>
                <div className="animate-fade-up delay-1">
                    <h2 style={{ marginBottom: '2.5rem', fontSize: '2rem', fontFamily: 'Playfair Display' }}>Submit a Proposal</h2>
                    <Card className="glass-panel" style={{ padding: '3.5rem', borderRadius: '24px' }}>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                <div className="input-field-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <label style={{ fontSize: '0.7rem', opacity: 0.5, letterSpacing: '0.2em', fontWeight: 700 }}>FULL NAME</label>
                                    <input type="text" className="refined-input" placeholder="e.g. Alexander Pierce" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                                </div>
                                <div className="input-field-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <label style={{ fontSize: '0.7rem', opacity: 0.5, letterSpacing: '0.2em', fontWeight: 700 }}>EMAIL ADDRESS</label>
                                    <input type="email" className="refined-input" placeholder="contact@domain.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                <div className="input-field-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <label style={{ fontSize: '0.7rem', opacity: 0.5, letterSpacing: '0.2em', fontWeight: 700 }}>TARGET DATE</label>
                                    <input type="date" className="refined-input" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
                                </div>
                                <div className="input-field-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <label style={{ fontSize: '0.7rem', opacity: 0.5, letterSpacing: '0.2em', fontWeight: 700 }}>EXPECTED GUESTS</label>
                                    <input type="number" className="refined-input" min="5" placeholder="Minimum 5" value={formData.guests} onChange={e => setFormData({...formData, guests: e.target.value})} required />
                                </div>
                            </div>
                            <div className="input-field-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <label style={{ fontSize: '0.7rem', opacity: 0.5, letterSpacing: '0.2em', fontWeight: 700 }}>EVENT ARCHITECTURE</label>
                                <select className="refined-input select-dark" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} required>
                                    <option value="" disabled selected>Select event type...</option>
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
                                    rows="5"
                                    placeholder="Describe your desired atmosphere, theme, and requirements..."
                                    style={{ resize: 'none' }}
                                    value={formData.details} onChange={e => setFormData({...formData, details: e.target.value})}
                                ></textarea>
                            </div>
                            <button type="submit" className="refined-submit-btn">
                                SUBMIT PROPOSAL <ArrowRight size={18} />
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
                            <div className="img-container">
                                <img src={HeroImage} alt="Venue" />
                                <div className="card-overlay"></div>
                            </div>
                            <div className="card-lbl">
                                <h4>Main Sanctuary</h4>
                                <span><MapPin size={12} /> Capacity: 120 Guests</span>
                            </div>
                        </div>
                        <div className="event-visual-card">
                            <div className="img-container">
                                <img src={CateringImage} alt="Catering" />
                                <div className="card-overlay"></div>
                            </div>
                            <div className="card-lbl">
                                <h4>Gourmet Catering</h4>
                                <span><ShieldCheck size={12} /> Custom Bespoke Menus</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
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

                .refined-input:focus {
                    border-color: var(--color-accent);
                    background: rgba(255,255,255,0.05);
                }

                .select-dark option {
                    background: #111;
                    color: #fff;
                    padding: 1rem;
                }

                .refined-submit-btn {
                    margin-top: 1.5rem;
                    background: var(--color-accent);
                    border: none;
                    padding: 1.5rem;
                    border-radius: 14px;
                    color: #000;
                    font-weight: 800;
                    font-family: 'Outfit', sans-serif;
                    font-size: 1rem;
                    letter-spacing: 0.15em;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 1rem;
                    transition: var(--transition);
                }

                .refined-submit-btn:hover {
                    background: #fff;
                    transform: translateY(-5px);
                }

                .event-visual-card {
                    background: var(--glass-bg);
                    border: 1px solid var(--glass-border);
                    border-radius: 20px;
                    overflow: hidden;
                    position: relative;
                }

                .img-container {
                    height: 260px;
                    overflow: hidden;
                    position: relative;
                }

                .img-container img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    display: block; /* Fix grey space below image */
                    transition: transform 0.6s var(--ease-out-expo);
                }

                .event-visual-card:hover .img-container img {
                    transform: scale(1.1);
                }

                .card-overlay {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%);
                }

                .card-lbl {
                    position: absolute;
                    bottom: 1.5rem;
                    left: 2rem;
                }

                .card-lbl h4 {
                    font-family: 'Playfair Display', serif;
                    font-size: 1.4rem;
                    color: #fff;
                    margin-bottom: 0.4rem;
                }

                .card-lbl span {
                    color: var(--color-accent);
                    font-size: 0.8rem;
                    text-transform: uppercase;
                    letter-spacing: 0.15em;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
            `}</style>
        </div>
    );
};

export default Events;
