import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Eye, EyeOff, Briefcase } from 'lucide-react';
import PublicNav from '../components/PublicNav';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const user = await login(email, password);
      const path = user.role === 'candidate' ? '/candidate/dashboard'
        : user.role === 'company' ? '/company/dashboard'
        : '/admin/dashboard';
      navigate(path);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="starry-bg auth-page">
      <PublicNav />
      <div className="auth-center">
        <form className="auth-card card" onSubmit={handleSubmit}>
          <div className="auth-logo"><Briefcase size={32} /></div>
          <h1>TalentSphere</h1>
          <p className="auth-sub">Sign in to your account</p>
          <div className="form-group">
            <label>Email</label>
            <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <div className="password-wrap">
              <input type={showPass ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required />
              <button type="button" className="eye-btn" onClick={() => setShowPass(!showPass)}>
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          {error && <p className="error-msg">{error}</p>}
          <p className="demo-hint">Demo: admin@talentsphere.com / admin123 · demo@techcorp.com / demo123</p>
          <button type="submit" className="btn btn-primary auth-submit" disabled={submitting}>
            <LogIn size={18} /> {submitting ? 'Signing in…' : 'Sign In'}
          </button>
          <p className="auth-footer">Don&apos;t have an account? <Link to="/register">Register here</Link></p>
        </form>
      </div>
    </div>
  );
}
