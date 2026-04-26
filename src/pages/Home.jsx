import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Clock, MapPin, ChevronDown } from 'lucide-react';
import HeroImage from '../assets/images/hero_restaurant_ambience_1769975900791.png';
import SalmonImage from '../assets/images/salmon_dish_fine_dining_1769975929501.png';

const Home = () => {
  return (
    <div className="home-wrapper">
      {/* Hero Section */}
      <section className="hero-modern">
        <div className="hero-bg-wrapper">
          <img src={HeroImage} alt="Restaurant Ambience" className="hero-bg" />
          <div className="hero-overlay"></div>
        </div>

        <div className="container hero-content">
          <div className="hero-text-block animate-fade-up">
            <span className="hero-badge">Award Winning Fine Dining</span>
            <h1 className="hero-title">
              Experience the Art of <span className="accent">Modern Flavor</span>
            </h1>
            <p className="hero-desc">
              A symphony of taste, texture, and visual storytelling. Discover why GourmetFlow is a world-class destination for culinary explorers.
            </p>
            <div className="hero-cta-group">
              <Link to="/reservations" className="btn-primary">
                Reserve a Table <ArrowRight size={20} />
              </Link>
              <Link to="/order" className="btn-secondary">
                View Gallery Menu
              </Link>
            </div>
          </div>
        </div>

        <div className="hero-scroll-indicator">
          <ChevronDown className="bounce" size={32} />
        </div>
      </section>

      {/* Feature Section */}
      <section className="highlights-section">
        <div className="container">
          <div className="highlights-grid">
            <div className="highlight-visual glass-card animate-fade-up">
              <img src={SalmonImage} alt="Signature Dish" />
              <div className="visual-caption">
                <h4>Signature Selection</h4>
                <p>Wild Alaskan Salmon with Truffle Essence</p>
              </div>
            </div>

            <div className="highlight-content animate-fade-up delay-1">
              <h2 className="section-title">The GourmetFlow <span className="accent">Difference</span></h2>
              <p className="section-desc">
                We don't believe in just "meals." Each visit is a curated experience designed to awaken your senses. From the atmosphere to the final bite, perfection is our only standard.
              </p>

              <div className="feature-list">
                <div className="feature-item">
                  <div className="icon-box"><Star size={24} /></div>
                  <div>
                    <h5>Michelin Concepts</h5>
                    <p>Designed by world-renowned culinary architects.</p>
                  </div>
                </div>
                <div className="feature-item">
                  <div className="icon-box"><Clock size={24} /></div>
                  <div>
                    <h5>Always Available</h5>
                    <p>Intuitive reservation and order-at-home systems.</p>
                  </div>
                </div>
                <div className="feature-item">
                  <div className="icon-box"><MapPin size={24} /></div>
                  <div>
                    <h5>Prime Atmosphere</h5>
                    <p>Breathtaking views and immersive architectural design.</p>
                  </div>
                </div>
              </div>

              <Link to="/events" className="btn-outline">Explore Private Events</Link>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .home-wrapper { background: var(--color-bg-primary); }
        
        .hero-modern {
          height: 100vh;
          position: relative;
          display: flex;
          align-items: center;
          overflow: hidden;
        }
        
        .hero-bg-wrapper {
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          z-index: 0;
        }
        
        .hero-bg {
          width: 100%; height: 100%;
          object-fit: cover;
          filter: brightness(0.4) saturate(1.2);
        }
        
        .hero-overlay {
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          background: linear-gradient(to bottom, transparent 0%, var(--color-bg-primary) 100%);
        }
        
        .hero-content {
          position: relative;
          z-index: 1;
        }
        
        .hero-text-block {
          max-width: 850px;
        }
        
        .hero-badge {
          display: inline-block;
          color: var(--color-accent);
          text-transform: uppercase;
          letter-spacing: 0.3em;
          font-weight: 600;
          font-size: 0.85rem;
          margin-bottom: 1.5rem;
          background: var(--color-accent-soft);
          padding: 0.4rem 1.2rem;
          border-radius: 4px;
        }
        
        .hero-title {
          font-size: clamp(3.5rem, 7vw, 6.5rem);
          line-height: 1.05;
          margin-bottom: 2rem;
          color: #fff;
        }
        
        .hero-title .accent { color: var(--color-accent); }
        
        .hero-desc {
          font-size: 1.25rem;
          color: var(--color-text-secondary);
          margin-bottom: 3rem;
          max-width: 600px;
          line-height: 1.6;
        }
        
        .hero-cta-group {
          display: flex;
          gap: 1.5rem;
        }
        
        .btn-primary {
          background: var(--color-accent);
          color: #000;
          padding: 1.2rem 2.5rem;
          border-radius: 12px;
          text-decoration: none;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        
        .btn-secondary {
          background: rgba(255,255,255,0.05);
          color: #fff;
          padding: 1.2rem 2.5rem;
          border-radius: 12px;
          text-decoration: none;
          font-weight: 600;
          border: 1px solid var(--glass-border);
          backdrop-filter: blur(10px);
        }

        .btn-outline {
          display: inline-block;
          padding: 1rem 2rem;
          border: 1px solid var(--color-accent);
          color: var(--color-accent);
          text-decoration: none;
          border-radius: 10px;
          font-weight: 600;
          margin-top: 2rem;
        }

        .hero-scroll-indicator {
          position: absolute;
          bottom: 3rem; left: 50%;
          transform: translateX(-50%);
          color: rgba(255,255,255,0.3);
          animation: bounce 2s infinite;
        }

        .highlights-section {
          padding: 10rem 0;
        }

        .highlights-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6rem;
          align-items: center;
        }

        .highlight-visual {
          position: relative;
          padding: 1rem;
        }

        .highlight-visual img {
          width: 100%;
          border-radius: 16px;
          box-shadow: 0 30px 60px rgba(0,0,0,0.5);
        }

        .visual-caption {
          margin-top: 1.5rem;
          text-align: center;
        }

        .visual-caption h4 { color: var(--color-accent); font-size: 1.25rem; }
        .visual-caption p { color: var(--color-text-secondary); }

        .section-title { font-size: 3.5rem; margin-bottom: 1.5rem; }
        .section-desc { font-size: 1.15rem; color: var(--color-text-secondary); margin-bottom: 3rem; }

        .feature-list { display: grid; gap: 2rem; }
        .feature-item { display: flex; gap: 1.5rem; }
        .icon-box { 
          color: var(--color-accent); 
          background: var(--color-accent-soft); 
          min-width: 50px; height: 50px; 
          border-radius: 12px; 
          display: flex; align-items: center; justify-content: center;
        }
        .feature-item h5 { font-size: 1.25rem; margin-bottom: 0.25rem; }
        .feature-item p { color: var(--color-text-secondary); }

        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {transform: translateY(0) translateX(-50%);}
          40% {transform: translateY(-10px) translateX(-50%);}
          60% {transform: translateY(-5px) translateX(-50%);}
        }

        @media (max-width: 1024px) {
          .highlights-grid { grid-template-columns: 1fr; gap: 4rem; }
          .hero-cta-group { flex-direction: column; width: 100%; }
          .hero-cta-group a { text-align: center; justify-content: center; }
        }
      `}</style>
    </div>
  );
};

export default Home;
