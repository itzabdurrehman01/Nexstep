import React, { useState } from 'react';
import { User, Mail, KeyRound, ArrowRight, Loader2, AlertCircle, CheckCircle2, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

function PasswordStrength({ password }) {
  const checks = [
    { label: '8+ characters',    ok: password.length >= 8 },
    { label: 'Uppercase letter', ok: /[A-Z]/.test(password) },
    { label: 'Number',           ok: /[0-9]/.test(password) },
  ];
  const score = checks.filter(c => c.ok).length;
  const colors = ['bg-red-500', 'bg-amber-500', 'bg-amber-400', 'bg-emerald-500'];
  const labels = ['', 'Weak', 'Fair', 'Strong'];

  if (!password) return null;
  return (
    <div className="space-y-1.5">
      <div className="flex gap-1">
        {[0,1,2].map(i => (
          <div key={i} className={`flex-1 h-1 rounded-full ${i < score ? colors[score] : 'bg-slate-200 dark:bg-slate-700'}`} />
        ))}
      </div>
      <div className="flex justify-between text-[10px] font-semibold text-slate-500 dark:text-slate-400">
        <div className="flex gap-2">
          {checks.map((c,i) => (
            <span key={i} className={c.ok ? 'text-emerald-600 dark:text-emerald-400' : ''}>
              {c.ok ? '✓' : '·'} {c.label}
            </span>
          ))}
        </div>
        <span className={colors[score] === 'bg-emerald-500' ? 'text-emerald-600' : 'text-amber-600'}>{labels[score]}</span>
      </div>
    </div>
  );
}

export function Register({ onRegisterSuccess, onSwitchToLogin }) {
  const { login } = useAuth();

  const [firstName,       setFirstName]       = useState('');
  const [lastName,        setLastName]        = useState('');
  const [email,           setEmail]           = useState('');
  const [password,        setPassword]        = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role,            setRole]            = useState('STUDENT');
  const [agreeTerms,      setAgreeTerms]      = useState(false);
  const [showPassword,    setShowPassword]    = useState(false);
  const [isLoading,       setIsLoading]       = useState(false);
  const [error,           setError]           = useState('');
  const [success,         setSuccess]         = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!agreeTerms) { setError('Please accept the terms and conditions.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method:      'POST',
        headers:     { 'Content-Type': 'application/json' },
        credentials: 'include',
        body:        JSON.stringify({ firstName, lastName, email, password, confirmPassword, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed. Please try again.');
        return;
      }

      login(data.user);
      setSuccess(`Account created! Welcome to NexStep AI, ${data.user.firstName}!`);

      setTimeout(() => {
        if (onRegisterSuccess) onRegisterSuccess(data.user);
      }, 800);
    } catch {
      setError('Unable to connect to the server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-xs space-y-5">
      <div className="space-y-1">
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Create your account</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Already registered?{' '}
          <button onClick={onSwitchToLogin} className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer">
            Sign in
          </button>
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-xs text-red-800 dark:text-red-300 font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 font-medium">
          <CheckCircle2 className="w-4 h-4 shrink-0" /> {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">First Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input type="text" value={firstName} onChange={e=>setFirstName(e.target.value)} placeholder="Muhammad" required disabled={isLoading}
                className="w-full pl-9 pr-3 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-60" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Last Name</label>
            <input type="text" value={lastName} onChange={e=>setLastName(e.target.value)} placeholder="Ali" disabled={isLoading}
              className="w-full px-3 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-60" />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Email Address</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" required autoComplete="email" disabled={isLoading}
              className="w-full pl-9 pr-3 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-60" />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">I am a…</label>
          <div className="grid grid-cols-2 gap-2">
            {[['STUDENT','Student'],['MENTOR','Mentor'],['RECRUITER','Recruiter']].map(([val,label]) => (
              <button key={val} type="button" onClick={()=>setRole(val)}
                className={`py-2 rounded-xl text-xs font-bold border cursor-pointer transition-all ${role===val?'bg-emerald-600 text-white border-emerald-600':'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Password</label>
          <div className="relative">
            <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input type={showPassword?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Min 8 chars, 1 uppercase, 1 number" required autoComplete="new-password" disabled={isLoading}
              className="w-full pl-9 pr-10 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-60" />
            <button type="button" onClick={()=>setShowPassword(v=>!v)} className="absolute right-3 top-2.5 text-slate-400 cursor-pointer" tabIndex={-1}>
              {showPassword?<EyeOff className="w-4 h-4"/>:<Eye className="w-4 h-4"/>}
            </button>
          </div>
          <PasswordStrength password={password} />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Confirm Password</label>
          <input type="password" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} placeholder="Repeat password" required autoComplete="new-password" disabled={isLoading}
            className={`w-full px-3 py-2.5 rounded-2xl border text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-60 bg-white dark:bg-slate-800 ${confirmPassword&&password!==confirmPassword?'border-red-400':'border-slate-200 dark:border-slate-700'}`} />
          {confirmPassword && password !== confirmPassword && (
            <p className="text-[10px] text-red-500 font-semibold">Passwords do not match</p>
          )}
        </div>

        <label className="flex items-start gap-2 cursor-pointer">
          <input type="checkbox" checked={agreeTerms} onChange={e=>setAgreeTerms(e.target.checked)} className="mt-0.5 accent-emerald-600" />
          <span className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
            I agree to NexStep AI's <span className="text-emerald-600 font-semibold">Terms of Service</span> and <span className="text-emerald-600 font-semibold">Privacy Policy</span>.
          </span>
        </label>

        <button type="submit" disabled={isLoading || !agreeTerms}
          className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-extrabold text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all">
          {isLoading
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating Account…</>
            : <><ShieldCheck className="w-4 h-4" /><span>Create Account</span></>}
        </button>
      </form>
    </div>
  );
}
