import React, { useState, useContext } from 'react';
import { 
  Container, Typography, Box, TextField, Button, Paper, 
  Link, Alert, CircularProgress, InputAdornment, IconButton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Psychology, Visibility, VisibilityOff, Email, Lock } from '@mui/icons-material';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const API_BASE = 'http://localhost:5000/api';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_BASE}/auth/login`, { email, password });
      login(res.data.token, res.data.name);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.msg || 'Login failed. Please check your credentials.');
    }
    setLoading(false);
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        py: 4
      }}>
        <Paper className="glass-card animate-fade-up" sx={{ p: 5, textAlign: 'center', width: '100%' }}>
          <Box className="animate-float" sx={{ mb: 2 }}>
            <Psychology sx={{ fontSize: 60, color: '#60a5fa' }} />
          </Box>
          
          <Typography variant="h4" className="gradient-text" sx={{ mb: 1 }}>
            TalentScout AI
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Enter your details to access the recruitment engine
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email Address"
              variant="outlined"
              margin="normal"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: 'rgba(255,255,255,0.5)', fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              variant="outlined"
              margin="normal"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: 'rgba(255,255,255,0.5)', fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            
            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              className="btn-primary"
              disabled={loading}
              sx={{ mt: 4, py: 1.5 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Launch Dashboard'}
            </Button>
          </form>

          <Box sx={{ mt: 4 }}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account yet?{' '}
              <Link 
                href="/signup" 
                underline="none" 
                sx={{ 
                  color: '#60a5fa', 
                  fontWeight: 600,
                  '&:hover': { color: '#a855f7' }
                }}
              >
                Create Account
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default Login;
