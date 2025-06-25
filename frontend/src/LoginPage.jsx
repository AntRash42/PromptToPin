import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { Box, Paper, Tabs, Tab, Typography, TextField, Button, Alert, CircularProgress } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { useAuth } from './AuthContext';

export default function LoginPage() {
  const [tab, setTab] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleTabChange = (_, newValue) => {
    setTab(newValue);
    setError('');
  };

  const handleEmailChange = (e) => setEmail(e.target.value);
  const handlePasswordChange = (e) => setPassword(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const auth = getAuth();    
    try {
      if (tab === 0) {        
        const login_status = await signInWithEmailAndPassword(auth, email, password);
        console.log("Login status after logging in: ", login_status);        
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      // redirect will happen via useEffect
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // redirect will happen via useEffect
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'linear-gradient(135deg, #e3f2fd 0%, #e0f7fa 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Paper elevation={6} sx={{ p: 4, minWidth: 350, maxWidth: 400, borderRadius: 4 }}>
        <Typography variant="h4" align="center" color="primary" fontWeight={800} gutterBottom>
          {tab === 0 ? 'Login' : 'Sign Up'}
        </Typography>
        <Tabs value={tab} onChange={handleTabChange} variant="fullWidth" sx={{ mb: 2 }}>
          <Tab label="Login" />
          <Tab label="Sign Up" />
        </Tabs>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <form>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={handleEmailChange}
            fullWidth
            required
            sx={{ mb: 2 }}
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={handlePasswordChange}
            fullWidth
            required
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            color="primary"
            fullWidth
            disabled={loading}
            onClick={handleSubmit}
            sx={{ mb: 2, fontWeight: 700, fontSize: 16 }}
          >
            {loading ? <CircularProgress size={24} /> : (tab === 0 ? 'Login' : 'Sign Up')}
          </Button>
        </form>
        <Button
          variant="outlined"
          color="secondary"
          fullWidth
          startIcon={<GoogleIcon />}
          onClick={handleGoogleSignIn}
          disabled={loading}
          sx={{ fontWeight: 700, fontSize: 16 }}
        >
          Continue with Google
        </Button>
      </Paper>
    </Box>
  );
}
