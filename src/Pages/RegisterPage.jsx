import React, { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../firebase';
import { Link, useNavigate } from 'react-router-dom';
import './Pages.css';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      await updateProfile(user, { displayName: name });

      console.log('User registered successfully!');
      // Redirect to homepage after successful registration
      navigate('/HomePage');
    } catch (error) {
      console.error('Error registering user:', error.message);
      // Handle error and display error message to the user
    }
  };

  return (
    <div className='container'>
      <h2>עמוד הרשמה</h2>
      <form onSubmit={handleRegister}>
        <div>
          <input
            type="text"
            value={name}
            placeholder="שם מלא"
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <input
            type="email"
            value={email}
            placeholder="מייל"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="סיסמה"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button className='button-classic' type="submit">הירשם</button>
      </form>
      <p>כבר נרשמת בעבר? <Link to="/login">עבור לעמוד התחברות</Link></p>
    </div>
  );
};

export default RegisterPage;
