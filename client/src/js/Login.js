import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../css/Login.css'; // import the CSS file
import fetchServer from './fetchServer';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); // Add a state variable to track loading state
  const history = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    fetchServer('/users/login',
      (user, err, status) => {
          if(err) {
            if(status === 404)
              alert(`Error: Invalid login credentials`);
            else
              alert(`Error${status}: Login failed`);
          } else {
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
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="שם משתמש" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="סיסמא" />
        <div className="register-link">
        אין לך חשבון? <Link to="/register">הירשם</Link>
      </div >
        <button type="submit">{loading ? 'טוען...' : 'התחברות'}</button> {/* Update button text based on loading state */}
      </form>
     
    </div>
  );
}

export default Login;