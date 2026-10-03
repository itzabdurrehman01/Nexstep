import React, { useState } from 'react';
import { Login }    from '../auth/Login.jsx';
import { Register } from '../auth/Register.jsx';

export function AuthTab({ onAuthenticated, onNavigate }) {
  const [view, setView] = useState('login'); // 'login' | 'register'

  const handleLoginSuccess = (user) => {
    if (onAuthenticated) onAuthenticated(user);
    if (onNavigate) onNavigate('dashboard');
  };

  const handleRegisterSuccess = (user) => {
    if (onAuthenticated) onAuthenticated(user);
    // New users go to onboarding
    if (onNavigate) onNavigate('onboarding');
  };

  return (
    <div className="max-w-lg mx-auto py-4 space-y-4">
      {/* Tab switcher */}
      <div className="bg-slate-900 text-white p-1.5 rounded-2xl flex items-center gap-1 shadow-md">
        <button
          onClick={() => setView('login')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${view === 'login' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-300 hover:bg-slate-800'}`}
        >
          Sign In
        </button>
        <button
          onClick={() => setView('register')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${view === 'register' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-300 hover:bg-slate-800'}`}
        >
          Create Account
        </button>
      </div>

      {view === 'login' ? (
        <Login
          onLoginSuccess={handleLoginSuccess}
          onSwitchToRegister={() => setView('register')}
        />
      ) : (
        <Register
          onRegisterSuccess={handleRegisterSuccess}
          onSwitchToLogin={() => setView('login')}
        />
      )}
    </div>
  );
}
