import React, { useState } from 'react';
import {
  TextField,
  Button,
  Typography,
  Box,
} from '@mui/material';
import axios from 'axios';

function Register({ onRegister }) {
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    password: '',
    address: '',
    phoneNumber: '',
    profileImage: '', // ممكن لاحقاً نضيف input type="file"
  });

  const [msg, setMsg] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      const res = await axios.post('http://localhost:5000/api/users/register', formData);
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      onRegister(user);
    } catch (err) {
      setMsg(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 5 }}>
      <Typography variant="h5" mb={2}>Create an Account</Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Full Name"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Phone Number"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleChange}
          margin="normal"
        />
        {/* profileImage ممكن نضيفه لاحقًا كـ file upload */}
        {msg && <Typography color="error" mt={1}>{msg}</Typography>}
        <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
          Register
        </Button>
      </form>
      <Typography variant="body2" mt={2}>
        Already have an account?{' '}
        <span style={{ color: '#1976d2', cursor: 'pointer' }} onClick={() => onRegister(null)}>
          Login here
        </span>
      </Typography>
    </Box>
  );
}

export default Register;
