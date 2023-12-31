import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import fetchServer from './fetchServer';

function Registration() {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false); // Track the visibility state of the password
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const history = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setErr('הסיסמא לא תואמת לאימות שלה');
      return;
    }

    setLoading(true);

    fetchServer('/users',
    (res, err, status) => {
        if(err) {
          if(err.error?.code === 'ER_DUP_ENTRY')
            setErr('שם המשתמש כבר קיים במערכת');
          else setErr(`שגיאה${status||''}: ההרשמה נכשלה: ${err.error?.code || err.error || err}`);
        } else {
          setErr('');
          history('/login');
        }
        setLoading(false);
    }, 'POST', 
        JSON.stringify({ fullname: name, username, email, phone, password_ : password }),
        { 'Content-Type': 'application/json'} 
    );
  };    

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <div className="login">
      <form className="login-form registration-form" onSubmit={handleSubmit}>
        <input dir='rtl' type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="שם מלא" required />
        <input type="text" pattern='[a-zA-Z]([A-Za-z0-9])*' value={username} onChange={(e) => setUsername(e.target.value)} placeholder="שם משתמש" required />
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="דואר אלקטוני" required />
        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="טלפון נייד" required />
        <div className="password-input">
          <input
            type={passwordVisible ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="סיסמא"
            minLength={6}
            required
          />
          <span className="password-toggle-icon" onClick={togglePasswordVisibility}>
            {passwordVisible ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="אימות סיסמא"
          required
        />
        <div className="register-link">
        כבר יש לך חשבון? <Link to="/login">התחברות</Link>
        </div>
        <button type="submit">{loading ? '...טוען' : 'הרשמה'}</button>
        <span className='alert'>{err}</span>
      </form>
    </div>
  );
}

export default Registration;