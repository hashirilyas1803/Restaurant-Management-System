import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchWithAuth } from '../api';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [mode, setMode] = useState('login'); // 'login' or 'register'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [error, setError] = useState('');

    const handleAction = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (mode === 'login') {
                const res = await fetchWithAuth('/api/auth/login', {
                    method: 'POST',
                    body: JSON.stringify({ email, password })
                });
                login(res.data.user, res.data.token);
                res.data.user.role === 'ADMIN' ? navigate('/admin') : navigate('/');
            } else {
                const res = await fetchWithAuth('/api/auth/register', {
                    method: 'POST',
                    body: JSON.stringify({ name, email, password, phone_number: phoneNumber })
                });
                login(res.data.user, res.data.token);
                res.data.user.role === 'ADMIN' ? navigate('/admin') : navigate('/');
            }
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="login-portal-container fade-in">
            <div className="portal-shield">
                <p className="portal-subtitle">Identity Verification</p>
                <h1 className="portal-title">{mode === 'login' ? 'Access Portal' : 'Create Identity'}</h1>

                <form onSubmit={handleAction} className="portal-form">
                    {error && <div style={{color: 'red', marginBottom: '1rem'}}>{error}</div>}
                    <div className="input-row">
                        <input type="email" placeholder="EMAIL ADDRESS" className="portal-input" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                    {mode === 'register' && (
                        <>
                        <div className="input-row animate-fade-in">
                            <input type="text" placeholder="FULL NAME" className="portal-input" value={name} onChange={e => setName(e.target.value)} required />
                        </div>
                        <div className="input-row animate-fade-in">
                            <input type="text" placeholder="PHONE NUMBER" className="portal-input" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} required />
                        </div>
                        </>
                    )}
                    <div className="input-row">
                        <input type="password" placeholder="SECRET KEY" className="portal-input" value={password} onChange={e => setPassword(e.target.value)} required />
                    </div>

                    {mode === 'login' && (
                        <div className="role-selector" style={{display: 'none'}}>
                            {/* Role selector hidden, backend determines role */}
                        </div>
                    )}

                    <button type="submit" className="authorize-btn">
                        {mode === 'login' ? 'Authorize' : 'Register'}
                    </button>

                    <div className="portal-footer">
                        {mode === 'login' ? (
                            <p>First time here? <button type="button" onClick={() => setMode('register')}>Create an account</button></p>
                        ) : (
                            <p>Already have an identity? <button type="button" onClick={() => setMode('login')}>Sign in here</button></p>
                        )}
                    </div>
                </form>
            </div>

            <style>{`
                .login-portal-container {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background-color: #050505;
                    font-family: 'Outfit', sans-serif;
                    padding-top: 10rem; /* Added padding to prevent navbar overlap */
                    padding-bottom: 5rem;
                }

                .portal-shield {
                    width: 100%;
                    max-width: 450px;
                    padding: 3rem;
                    text-align: center;
                }

                .portal-subtitle {
                    letter-spacing: 0.5em;
                    font-size: 0.75rem;
                    color: var(--color-accent);
                    text-transform: uppercase;
                    margin-bottom: 2rem;
                    font-weight: 700;
                }

                .portal-title {
                    font-family: 'Playfair Display', serif;
                    font-size: 2.8rem;
                    margin-bottom: 4rem;
                    color: #fff;
                    font-style: italic;
                }

                .portal-form {
                    display: flex;
                    flex-direction: column;
                    gap: 2.5rem;
                }

                .portal-input {
                    width: 100%;
                    background: none;
                    border: none;
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                    color: #fff;
                    padding: 1.25rem 0;
                    font-family: inherit;
                    outline: none;
                    letter-spacing: 0.1em;
                    font-size: 1rem;
                    transition: border-color 0.4s;
                }

                .portal-input:focus {
                    border-color: var(--color-accent);
                }

                .role-selector {
                    display: flex;
                    justify-content: center;
                    gap: 3rem;
                    margin: 1rem 0;
                }

                .role-btn {
                    background: none;
                    border: none;
                    color: rgba(255,255,255,0.2);
                    font-size: 0.8rem;
                    letter-spacing: 0.25em;
                    font-weight: 800;
                    cursor: pointer;
                    transition: var(--transition);
                }

                .role-btn.active {
                    color: var(--color-accent);
                }

                .authorize-btn {
                    margin-top: 2rem;
                    background: #fff;
                    color: #000;
                    border: none;
                    padding: 1.25rem;
                    text-transform: uppercase;
                    letter-spacing: 0.4em;
                    font-weight: 900;
                    font-size: 0.9rem;
                    cursor: pointer;
                    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .authorize-btn:hover {
                    background: var(--color-accent);
                    letter-spacing: 0.5em;
                }

                .portal-footer {
                    margin-top: 3rem;
                    color: rgba(255,255,255,0.4);
                }

                .portal-footer button {
                    background: none;
                    border: none;
                    color: var(--color-accent);
                    font-weight: 700;
                    cursor: pointer;
                    text-decoration: underline;
                    margin-left: 0.5rem;
                }

                @media (max-width: 480px) {
                    .login-portal-container { padding-top: 8rem; }
                    .portal-title { font-size: 2rem; }
                }
            `}</style>
        </div>
    );
};

export default Login;
