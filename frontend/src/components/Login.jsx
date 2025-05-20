import React, { useState } from 'react';
import axios from 'axios';

const LoginForm = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      onLogin(res.data.user);
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 border rounded">
      <h2 className="text-xl mb-4 font-bold">Login</h2>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <input type="email" placeholder="Email" className="w-full mb-2 p-2 border" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" className="w-full mb-4 p-2 border" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">Login</button>
    </form>
  );
};

export default LoginForm;
