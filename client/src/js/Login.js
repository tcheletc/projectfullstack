import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../css/Login.css'; // import the CSS file
import fetchServer from './fetchServer';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); // Add a state variable to track loading state
  const [err, setErr] = useState('');
  const history = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    fetchServer('/users/login',
      (user, err, status) => {
          if(err) {
            if(status === 404)
              setErr(`שם המשתמש ו/או הסיסמא אינם נכונים`);
            else
              setErr(`שגיאה${status}: ההתחברות נכשלה`);
          } else {
            setErr('');
            localStorage.setItem('user', JSON.stringify(user));
            history(`/users/${user.username}`);
          }
          setLoading(false);
      }, 'POST', { 'Content-Type': 'application/json'}, 
      JSON.stringify({ username, password_ : password })
    );
  };
  
  return (
    <div className="login">
      <form className="login-form" onSubmit={handleSubmit}>
        <input type="text" pattern='[a-zA-Z]([A-Za-z0-9])*' value={username} onChange={(e) => setUsername(e.target.value)} placeholder="שם משתמש" />
        <input type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="סיסמא" />
        <div className="register-link">
        אין לך חשבון? <Link to="/register">הירשם</Link>
        </div >
        <button type="submit">{loading ? '...טוען' : 'התחברות'}</button> {/* Update button text based on loading state */}
        <span className='alert'>{err}</span>
      </form>
     
    </div>
  );
}

export default Login;