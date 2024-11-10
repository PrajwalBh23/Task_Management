import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  Typography,
} from '@mui/material';
import { useAuth, API } from '../AuthContext';
import './Styles/Loginbox.css';
import img from './Styles/google.png';
import { useGoogleLogin } from '@react-oauth/google';

// Define props type for the LoginBox component
interface LoginBoxProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleClose: () => void;
  isRegistering: boolean;
}

const LoginBox: React.FC<LoginBoxProps> = ({ open, handleClose, isRegistering }) => {
  const { register, login, loginOrNot } = useAuth();
  const [userLoggedIn, setUserLoggedIn] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmNewPassword, setConfirmNewPassword] = useState<string>('');
  const [isForgotPassword, setIsForgotPassword] = useState<boolean>(false);
  const [isRegisteringState, setIsRegisteringState] = useState<boolean>(isRegistering);
  const navigate = useNavigate();

  useEffect(() => {
    const checkLoginStatus = async () => {
      await loginOrNot();
      setUserLoggedIn(true);
    };

    checkLoginStatus();
  }, [loginOrNot]);

  const handleLogin = async () => {
    try {
      const response = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }

      const data = await response.json();
      const { token } = data;
      login(token);
      localStorage.setItem('token', token);
      alert('Login successful');
      handleClose();
      navigate('/task');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'An error occurred');
      console.error('Error during login:', error);
    }
  };

  const handleRegister = async () => {
    try {
      const response = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, phone, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Registration failed');
      }

      const data = await response.json();
      const { token } = data;
      register(token);
      localStorage.setItem('token', token);
      alert('Register successful');
      handleClose();
      navigate('/task');
    } catch (error) {
      console.error('Error during registration:', error instanceof Error ? error.message : error);
      alert(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  const handleForgotPassword = () => {
    setIsForgotPassword(true);
  };

  const handleResetPassword = () => {
    console.log('Resetting password with:', email, newPassword);
    setIsForgotPassword(false);
  };

  const handleToggleForm = () => {
    setIsRegisteringState(!isRegisteringState);
  };

  const handleGoogleAuth = useGoogleLogin({
    onSuccess: async (authResult: any) => {
      try {
        if ('code' in authResult) {
          const endpoint = isRegistering ? 'auth/google-signup' : 'auth/google-login';
          const response = await fetch(`${API}/${endpoint}`, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: authResult.code }),
          });

          const data = await response.json();

          if (!response.ok) {
            alert(data.message || 'An error occurred during signup');
            return;
          }

          const { token } = data;
          localStorage.setItem('token', token);
          login(token);
          navigate('/task');
        }
      } catch (error) {
        console.error('Error during Google authentication', error);
      }
    },
    onError: () => console.log('Google Sign In was unsuccessful'),
    flow: 'auth-code',
  });

  
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
    <DialogTitle>
      <Typography variant="h3" component="div" sx={{ textAlign: 'center' }}>
        {isRegisteringState ? 'Register' : 'Login'}
      </Typography>
    </DialogTitle>
    <DialogContent>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          padding: '20px',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '350px',
            padding: '20px',
            borderRadius: '5px',
            backgroundColor: 'transparent',
            border: '1px solid #dfdfdf',
            boxSizing: 'border-box',
          }}
        >
          {isForgotPassword ? (
            <>
              <TextField
                label="Email"
                type="email"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                inputProps={{
                  style: { fontSize: '16px' }, // Adjust font size for input text
                }}
                InputLabelProps={{
                  style: { fontSize: '16px' }, // Adjust font size for label text
                }}
                style={{
                  marginBottom: '20px',
                  height: '50px', // Set consistent height
                }}
              />
              <TextField
                label="New Password"
                type="password"
                fullWidth
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                inputProps={{
                  style: {
                    fontSize: '16px',
                    height: '50px',
                  },
                }}
                InputLabelProps={{
                  style: {
                    fontSize: '16px',
                    height: '50px',
                  },
                }}
                style={{
                  marginBottom: '20px',
                  height: '50px', // Set consistent height
                }}
              />
              <TextField
                label="Confirm New Password"
                type="password"
                fullWidth
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                inputProps={{
                  style: { fontSize: '16px', height: '50px' },
                }}
                InputLabelProps={{
                  style: { fontSize: '16px', height: '50px' },
                }}
                style={{
                  marginBottom: '20px',
                  height: '50px',
                }}
              />
              <Button
                onClick={handleResetPassword}
                color="primary"
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '18px',
                  borderRadius: '5px',
                  marginBottom: '20px',
                  background: '#44a0dc',
                  color: 'white',
                }}
              >
                Reset Password
              </Button>
            </>
          ) : (
            <form>
              {isRegisteringState && (
                <TextField
                  label="Name"
                  fullWidth
                  onChange={(e) => setName(e.target.value)}
                  inputProps={{
                    style: { fontSize: '16px' },
                  }}
                  InputLabelProps={{
                    style: { fontSize: '16px' },
                  }}
                  style={{
                    marginBottom: '20px',
                    height: '50px',
                  }}
                />
              )}
              <TextField
                label="Email"
                type="email"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                inputProps={{
                  style: { fontSize: '16px' },
                }}
                InputLabelProps={{
                  style: { fontSize: '16px' },
                }}
                style={{
                  marginBottom: '20px',
                  height: '50px',
                }}
              />
              {isRegisteringState && (
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                  <TextField
                    label="Phone Number"
                    fullWidth
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    inputProps={{
                      style: { fontSize: '16px' }, // Consistent font size and height
                    }}
                    InputLabelProps={{
                      style: { fontSize: '16px' }, // Consistent font size for label
                    }}
                    style={{
                      height: '50px',
                      flex: 1, // Allow TextField to take remaining space
                    }}
                  />
                </div>
              )}
              <TextField
                label="Password"
                type="password"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                inputProps={{
                  style: { fontSize: '16px', height: '50px' },
                }}
                InputLabelProps={{
                  style: { fontSize: '16px', height: '50px' },
                }}
                style={{
                  marginBottom: '20px',
                  height: '50px',
                }}
              />
              {!isRegisteringState && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '20px',
                      fontSize: '14px',
                    }}
                  >
                    <input
                      type="checkbox"
                      style={{
                        width: '14px',
                        height: '14px',
                        marginRight: '4px',
                      }}
                    />
                    Remember me
                  </label>
                  <Typography
                    variant="caption"
                    style={{
                      marginBottom: '20px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      textDecoration: 'underline',
                      color: '#888',
                    }}
                    onClick={handleForgotPassword}
                  >
                    Forgot Password?
                  </Typography>
                </div>
              )}
              <Button
                onClick={isRegisteringState ? handleRegister : handleLogin}
                color="primary"
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '18px',
                  borderRadius: '5px',
                  marginBottom: '20px',
                  background: '#44a0dc',
                  color: 'white',
                }}
              >
                {isRegisteringState ? 'Sign up' : 'Log in'}
              </Button>
              <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'row' }}> <hr style={{ width: '150px', height: '0px', }} /><span style={{ margin: '0px 10px' }}>Or</span><hr style={{ width: '150px', height: '0px', }} /></div>
              <Button
                onClick={isRegisteringState ? () => handleGoogleAuth(true) : () => handleGoogleAuth(false)}
                color="primary"
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '18px',
                  borderRadius: '5px',
                  marginBottom: '20px',
                  background: 'white',
                  boxShadow: 'rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgb(209, 213, 219) 0px 0px 0px 1px inset',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <img
                  src={img}
                  alt="Google Logo"
                  style={{
                    width: '20px',
                    height: '20px',
                    marginRight: '10px',
                  }}
                />
                {isRegisteringState ? 'Sign up' : 'Log in'} with Google
              </Button>

            </form>
          )}
          {!isForgotPassword && (
            <p
              style={{
                textAlign: 'center',
                fontSize: '14px',
                margin: '0',
              }}
            >
              {isRegisteringState
                ? 'Already have an account?'
                : 'Don’t have an account?'}
              <Button
                onClick={handleToggleForm}
                color="primary"
                style={{
                  textDecoration: 'underline',
                  fontSize: '14px',
                  padding: '0',
                }}
              >
                {isRegisteringState ? 'Log in' : 'Sign up'}
              </Button>
            </p>
          )}
        </div>
      </div>
    </DialogContent>
  </Dialog>
  );
};

export default LoginBox;
