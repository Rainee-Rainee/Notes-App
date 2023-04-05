import React, { useState } from 'react';
import axios from 'axios';

const Form = ({ action }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`/${action}`, { username, password });
      if (action === 'login') {
        localStorage.setItem('auth-token', response.data);
      }
      window.location.href = '/';
    } catch (err) {
      setError(err.response.data);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>{action === 'register' ? 'Register' : 'Login'}</h2>
      {error && <p>{error}</p>}
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit">{action === 'register' ? 'Register' : 'Login'}</button>
    </form>
  );
};

export default Form;