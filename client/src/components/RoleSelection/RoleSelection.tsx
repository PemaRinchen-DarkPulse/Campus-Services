import React, { useState } from 'react';
import './RoleSelection.css';
import bgImage from '../../assets/bg.webp';

type RoleId = 'with-cards' | 'without-cards';
type View = 'role-select' | 'sign-in';

interface Role {
  id: RoleId;
  title: string;
  description: string;
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

export const RoleSelection: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<RoleId | null>(null);
  const [currentView, setCurrentView] = useState<View>('role-select');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRoleClick = (roleId: RoleId) => {
    setSelectedRole(roleId);
    if (roleId === 'without-cards') {
      setCurrentView('sign-in');
    }
  };

  const handleBack = () => {
    setCurrentView('role-select');
    setSelectedRole(null);
    setEmail('');
    setPassword('');
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      console.log(`Signing in with: ${email}`);
      alert(`Sign in successful!`);
    }
  };

  const handleContinue = () => {
    if (selectedRole) {
      console.log(`Proceeding to dashboard for: ${selectedRole}`);
      alert(`Success! You selected the With Cards option.`);
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
                  disabled={!selectedRole || selectedRole === 'without-cards'}
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
                  />
                </div>

                <a href="#" className="forgot-password">Forgot password?</a>

                <button type="submit" className="btn-continue">
                  Sign In
                  <span className="btn-arrow">→</span>
                </button>
              </form>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
