import React, { useState } from 'react';
import './RoleSelection.css';
import bgImage from '../../assets/bg.webp';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

type RoleId = 'with-cards' | 'without-cards';
type View = 'role-select' | 'sign-in' | 'service-select';

interface Role {
  id: RoleId;
  title: string;
  description: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  specialization?: string;
}

interface RoleSelectionProps {
  onLogin: (user: User, token: string) => void;
}

const roles: Role[] = [
  {
    id: 'with-cards',
    title: 'With Cards',
    description: 'Access services using your campus card.'
  },
  {
    id: 'without-cards',
    title: 'Without Cards',
    description: 'Continue without a campus card.'
  }
];

export const RoleSelection: React.FC<RoleSelectionProps> = ({ onLogin }) => {
  const [selectedRole, setSelectedRole] = useState<RoleId | null>(null);
  const [currentView, setCurrentView] = useState<View>('role-select');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [pendingLoginData, setPendingLoginData] = useState<{ user: User; token: string } | null>(null);

  const handleRoleClick = (roleId: RoleId) => {
    setSelectedRole(roleId);
  };

  const handleBack = () => {
    setCurrentView('role-select');
    setSelectedRole(null);
    setEmail('');
    setPassword('');
    setError('');
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setError('');
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, loginType: selectedRole }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || 'Invalid email or password');
        setIsLoading(false);
        return;
      }

      // Login successful
      if (selectedRole === 'with-cards') {
        setPendingLoginData({ user: data.user, token: data.token });
        setCurrentView('service-select');
      } else {
        onLogin(data.user, data.token);
      }
    } catch {
      setError('Unable to connect to the server. Please try again.');
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    if (selectedRole === 'without-cards') {
      setCurrentView('sign-in');
    } else if (selectedRole === 'with-cards') {
      // "With Cards" also goes to sign-in
      setCurrentView('sign-in');
    }
  };

  const handleServiceSelect = () => {
    if (pendingLoginData) {
      // Add logic here to store the selected service if needed
      // Currently, just proceed to login with the pending data
      onLogin(pendingLoginData.user, pendingLoginData.token);
    }
  };

  return (
    <div className="role-selection-wrapper">
      <div className="role-selection-container">

        {/* Left Panel — Welcome / Background Image */}
        <div
          className="role-panel-left"
          style={{ backgroundImage: `url(${bgImage})` }}
        >
          <div className="left-panel-content">
            <h2>Welcome!</h2>
            <p>Enter your personal details and start your campus journey with us.</p>
          </div>
        </div>

        {/* Right Panel */}
        <div className="role-panel-right">

          {currentView === 'role-select' ? (
            /* ── Role Selection View ── */
            <div className="view-animate" key="role-select">
              <div className="role-header">
                <h1>Select Your Role</h1>
                <p>Choose the option that best describes you.</p>
              </div>

              <div className="role-grid">
                {roles.map((role) => (
                  <div
                    key={role.id}
                    className={`role-card ${selectedRole === role.id ? 'selected' : ''}`}
                    data-role={role.id}
                    onClick={() => handleRoleClick(role.id)}
                  >
                    <span className="check-indicator">✓</span>
                    <h2>{role.title}</h2>
                    <p>{role.description}</p>
                  </div>
                ))}
              </div>

              <div className="btn-container">
                <button
                  className="btn-continue"
                  disabled={!selectedRole}
                  onClick={handleContinue}
                >
                  Continue
                  <span className="btn-arrow">→</span>
                </button>
              </div>
            </div>
          ) : currentView === 'sign-in' ? (
            /* ── Sign In View ── */
            <div className="view-animate" key="sign-in">
              <button className="btn-back" onClick={handleBack}>
                ← Back
              </button>

              <div className="role-header">
                <h1>Sign In</h1>
                <p>{selectedRole === 'with-cards' ? 'Enter your card number and email to continue.' : 'Enter your credentials to continue.'}</p>
              </div>

              {error && (
                <div className="sign-in-error">
                  {error}
                </div>
              )}

              <form className="sign-in-form" onSubmit={handleSignIn}>
                {selectedRole === 'with-cards' ? (
                  <>
                    <div className="form-group">
                      <label htmlFor="cardNumber">Card Number</label>
                      <input
                        id="cardNumber"
                        type="text"
                        placeholder="Enter your card number"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="email">Email</label>
                      <input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="form-group">
                      <label htmlFor="email">Email</label>
                      <input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="password">Password</label>
                      <input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </>
                )}

                {selectedRole !== 'with-cards' && (
                  <a href="#" className="forgot-password">Forgot password?</a>
                )}

                <button
                  type="submit"
                  className="btn-continue"
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing in…' : 'Sign In'}
                  {!isLoading && <span className="btn-arrow">→</span>}
                </button>
              </form>
            </div>
          ) : (
            /* ── Service Select View ── */
            <div className="view-animate" key="service-select">
              <div className="role-header">
                <h1>Select a Service</h1>
                <p>What would you like to do today?</p>
              </div>

              <div className="service-grid">
                <button className="service-card" onClick={() => handleServiceSelect()}>
                  <span className="icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>
                  </span>
                  <h2>Cafe Order</h2>
                  <p>Order food and drinks</p>
                </button>
                <button className="service-card" onClick={() => handleServiceSelect()}>
                  <span className="icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                  </span>
                  <h2>Library</h2>
                  <p>Borrow or return books</p>
                </button>
                <button className="service-card" onClick={() => handleServiceSelect()}>
                  <span className="icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                  </span>
                  <h2>Visit Store</h2>
                  <p>Take things from the store</p>
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
