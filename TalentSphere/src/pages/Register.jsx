import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { User, Briefcase, ArrowRight } from 'lucide-react';
import PublicNav from '../components/PublicNav';
import './Auth.css';

export default function Register() {
  const [searchParams] = useSearchParams();
  const [role, setRole] = useState(searchParams.get('role') === 'company' ? 'company' : 'candidate');
  const navigate = useNavigate();

  const handleContinue = () => {
    navigate(role === 'company' ? '/register/company' : '/register/candidate');
  };

  return (
    <div className="starry-bg auth-page">
      <PublicNav />
      <div className="register-page-title">
        <h1>Join TalentSphere</h1>
        <p>Choose your account type to get started</p>
      </div>
      <div className="role-cards">
        <button
          type="button"
          className={`role-card card ${role === 'candidate' ? 'selected' : ''}`}
          onClick={() => setRole('candidate')}
        >
          <User className="role-icon" size={28} color="white" />
          <div>
            <h3>Register as Candidate</h3>
            <p>Create your profile and find your next opportunity.</p>
          </div>
        </button>
        <button
          type="button"
          className={`role-card card ${role === 'company' ? 'selected' : ''}`}
          onClick={() => setRole('company')}
        >
          <Briefcase className="role-icon" size={28} color="white" />
          <div>
            <h3>Register as Company</h3>
            <p>Post jobs and discover top talent.</p>
          </div>
        </button>
      </div>
      <div className="register-actions">
        <button type="button" className="btn btn-ghost" style={{ width: '100%', maxWidth: 700 }} onClick={handleContinue}>
          Continue <ArrowRight size={18} />
        </button>
        <p className="auth-footer" style={{ marginTop: '1rem' }}>
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
