import React, { useState } from 'react';
import './RoleSelection.css';
import bgImage from '../../assets/bg.webp';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

type RoleId = 'with-cards' | 'without-cards';
type View = 'role-select' | 'sign-in';

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
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || 'Invalid email or password');
        setIsLoading(false);
        return;
      }

      // Login successful — pass user & token to parent (App)
      onLogin(data.user, data.token);
    } catch (err) {
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
          ) : (
            /* ── Sign In View ── */
            <div className="view-animate" key="sign-in">
              <button className="btn-back" onClick={handleBack}>
                ← Back
              </button>

              <div className="role-header">
                <h1>Sign In</h1>
                <p>Enter your credentials to continue.</p>
              </div>

              {error && (
                <div className="sign-in-error">
                  {error}
                </div>
              )}

              <form className="sign-in-form" onSubmit={handleSignIn}>
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

                <a href="#" className="forgot-password">Forgot password?</a>

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
          )}

        </div>

      </div>
    </div>
  );
};
