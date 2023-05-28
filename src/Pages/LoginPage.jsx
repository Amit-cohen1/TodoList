import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';
import './Pages.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const auth = getAuth();
    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        // Successfully logged in
        navigate('/HomePage');
      })
      .catch((error) => {
        const errorMessage = error.message;
        setError(errorMessage);
      });
  };

  const handleRegister = () => {
    navigate('/register');
  };

  return (
    <div className='container'>
      <h1>התחברות</h1>
      {error && <p>{error}</p>}
      <form onSubmit={handleLogin}>
        <input type="email" value={email} onChange={handleEmailChange} placeholder="מייל" />
        <input type="password" value={password} onChange={handlePasswordChange} placeholder="סיסמה" />
        <button className='button-classic' type="submit">התחבר</button>
      </form>
      <p>לא רשום? <Link to="/register">הירשם כאן</Link></p>
    </div>
  );
};

export default LoginPage;
