'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Container,
  Avatar,
  Stack,
  Divider,
  // Link,
  InputAdornment,
  IconButton,
  Fade,
  CircularProgress,
  // useTheme,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  PersonAdd as PersonAddIcon,
  Visibility,
  VisibilityOff,
  Person as PersonIcon,
  Badge as BadgeIcon,
  Login as LoginIcon
} from '@mui/icons-material';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Custom Material-UI theme (matching login page)
const theme = createTheme({
  palette: {
    primary: {
      main: '#6366f1', // Indigo
      light: '#818cf8',
      dark: '#4f46e5',
    },
    secondary: {
      main: '#ec4899', // Pink
      light: '#f472b6',
      dark: '#db2777',
    },
    success: {
      main: '#10b981', // Emerald
      light: '#34d399',
      dark: '#059669',
    },
    background: {
      default: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
          backdropFilter: 'blur(20px)',
          background: 'rgba(255, 255, 255, 0.95)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-1px)',
            },
            '&.Mui-focused': {
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.15)',
            },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 12,
          padding: '12px 24px',
          fontSize: '1rem',
          fontWeight: 600,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)',
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-1px)',
          },
          '&.Mui-focused': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.15)',
          },
        },
      },
    },
  },
});

export default function RegisterPage() {
  // const { setToken } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  // const muiTheme = useTheme();
  // const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleRoleChange = (e: SelectChangeEvent) => {
    setForm({ ...form, role: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      console.log('Attempting registration with:', { 
        name: form.name,
        email: form.email, 
        password: form.password ? '***' : 'empty',
        role: form.role
      });
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role
        }),
      });
      
      console.log('Response status:', res.status);
      const data = await res.json();
      console.log('Response data:', data);
      
      if (!res.ok) {
        setError(data.error || 'Registration failed');
      } else {
        console.log('Registration successful, redirecting to login');
        router.push('/login');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const roleOptions = [
    { value: 'user', label: 'User', icon: <PersonIcon /> },
    { value: 'admin', label: 'Admin', icon: <BadgeIcon /> },
    { value: 'support', label: 'Support', icon: <PersonIcon /> }
  ];

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 2,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)',
          },
        }}
      >
        <Container maxWidth="sm">
          <Fade in timeout={800}>
            <Card
              sx={{
                position: 'relative',
                zIndex: 1,
                maxWidth: 480,
                mx: 'auto',
                borderRadius: 4,
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  background: 'linear-gradient(135deg, #10b981 0%, #6366f1 50%, #8b5cf6 100%)',
                  p: 4,
                  textAlign: 'center',
                  color: 'white',
                }}
              >
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    mx: 'auto',
                    mb: 2,
                    bgcolor: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <PersonAddIcon sx={{ fontSize: 40 }} />
                </Avatar>
                <Typography variant="h4" component="h1" gutterBottom>
                  Join Us Today
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Create your account and get started
                </Typography>
              </Box>

              <CardContent sx={{ p: 4 }}>
                {error && (
                  <Fade in>
                    <Alert 
                      severity="error" 
                      sx={{ 
                        mb: 3, 
                        borderRadius: 2,
                        '& .MuiAlert-icon': {
                          alignItems: 'center'
                        }
                      }}
                    >
                      {error}
                    </Alert>
                  </Fade>
                )}

                <Stack spacing={3} component="form" onSubmit={handleSubmit}>
                  <TextField
                    fullWidth
                    type="text"
                    name="name"
                    label="Full Name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon color="primary" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'rgba(16, 185, 129, 0.03)',
                      }
                    }}
                  />

                  <TextField
                    fullWidth
                    type="email"
                    name="email"
                    label="Email Address"
                    value={form.email}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon color="primary" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'rgba(16, 185, 129, 0.03)',
                      }
                    }}
                  />

                  <TextField
                    fullWidth
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    label="Password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon color="primary" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={togglePasswordVisibility}
                            edge="end"
                            disabled={loading}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'rgba(16, 185, 129, 0.03)',
                      }
                    }}
                  />

                  <FormControl fullWidth required>
                    <InputLabel id="role-label">Role</InputLabel>
                    <Select
                      labelId="role-label"
                      name="role"
                      value={form.role}
                      label="Role"
                      onChange={handleRoleChange}
                      disabled={loading}
                      startAdornment={
                        <InputAdornment position="start">
                          <BadgeIcon color="primary" />
                        </InputAdornment>
                      }
                      sx={{
                        backgroundColor: 'rgba(16, 185, 129, 0.03)',
                      }}
                    >
                      {roleOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            {option.icon}
                            <Typography>{option.label}</Typography>
                          </Stack>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={loading || !form.name || !form.email || !form.password}
                    sx={{
                      background: 'linear-gradient(135deg, #10b981 0%, #6366f1 100%)',
                      py: 1.5,
                      fontSize: '1.1rem',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #059669 0%, #4f46e5 100%)',
                      },
                      '&:disabled': {
                        background: 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)',
                      },
                    }}
                  >
                    {loading ? (
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <CircularProgress size={20} color="inherit" />
                        <Typography>Creating Account...</Typography>
                      </Stack>
                    ) : (
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <PersonAddIcon />
                        <Typography>Create Account</Typography>
                      </Stack>
                    )}
                  </Button>
                </Stack>
              </CardContent>

              <Divider />

              <Box sx={{ p: 3, textAlign: 'center', bgcolor: 'rgba(16, 185, 129, 0.02)' }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Already have an account?
                </Typography>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => router.push('/login')}
                  disabled={loading}
                  startIcon={<LoginIcon />}
                  sx={{
                    borderRadius: 2,
                    px: 3,
                    '&:hover': {
                      backgroundColor: 'rgba(99, 102, 241, 0.1)',
                      borderColor: 'primary.main',
                    },
                  }}
                >
                  Sign In
                </Button>
              </Box>
            </Card>
          </Fade>
        </Container>

        {/* Floating decorative elements */}
        <Box
          sx={{
            position: 'absolute',
            top: '8%',
            left: '8%',
            width: 50,
            height: 50,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
            animation: 'float 7s ease-in-out infinite',
            '@keyframes float': {
              '0%, 100%': { transform: 'translateY(0px)' },
              '50%': { transform: 'translateY(-25px)' },
            },
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: '65%',
            right: '10%',
            width: 35,
            height: 35,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
            animation: 'float 5s ease-in-out infinite reverse',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '20%',
            left: '15%',
            width: 25,
            height: 25,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)',
            animation: 'float 6s ease-in-out infinite',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: '25%',
            right: '20%',
            width: 45,
            height: 45,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
            animation: 'float 8s ease-in-out infinite',
          }}
        />
      </Box>
    </ThemeProvider>
  );
}