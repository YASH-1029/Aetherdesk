'use client';
import React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SelectChangeEvent } from '@mui/material';
import Chatbot from '../components/Chatbot';
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
  InputAdornment,
  Fade,
  CircularProgress,
  // useTheme,
  // useMediaQuery,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip
} from '@mui/material';
import {
  ConfirmationNumber as TicketIcon,
  Title as TitleIcon,
  Description as DescriptionIcon,
  PriorityHigh as PriorityIcon,
  Send as SendIcon,
  Dashboard as DashboardIcon,
  FlagOutlined as LowPriorityIcon,
  Flag as MediumPriorityIcon,
  OutlinedFlag as HighPriorityIcon
} from '@mui/icons-material';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Custom Material-UI theme (matching login/register pages)
const theme = createTheme({
  palette: {
    primary: {
      main: '#6366f1', // Indigo
      light: '#818cf8',
      dark: '#4f46e5',
    },
    secondary: {
      main: '#f59e0b', // Amber for tickets
      light: '#fbbf24',
      dark: '#d97706',
    },
    success: {
      main: '#10b981', // Emerald
      light: '#34d399',
      dark: '#059669',
    },
    warning: {
      main: '#f59e0b', // Amber
      light: '#fbbf24',
      dark: '#d97706',
    },
    error: {
      main: '#ef4444', // Red
      light: '#f87171',
      dark: '#dc2626',
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
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.15)',
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
            boxShadow: '0 8px 25px rgba(245, 158, 11, 0.3)',
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
            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.15)',
          },
        },
      },
    },
  },
});

export default function Home() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'low'
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  // const muiTheme = useTheme();
  // const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handlePriorityChange = (e: SelectChangeEvent) => {
    setForm({ ...form, priority: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      console.log('Creating ticket with:', {
        title: form.title,
        description: form.description,
        priority: form.priority
      });
      
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      if (!token) {
        setError('No authentication token found');
        return;
      }
      
      if (!user.id) {
        setError('User ID not found');
        return;
      }
      
      const payload = {
        title: form.title,
        description: form.description,
        priority: form.priority,
        createdBy: user.id,
      };
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      
      console.log('Response status:', res.status);
      const data = await res.json();
      console.log('Response data:', data);
      
      if (!res.ok) {
        setError(data.error || data.message || 'Ticket creation failed');
      } else {
        console.log('Ticket created successfully, redirecting to dashboard');
        router.push('/dashboard');
      }
    } catch (err) {
      console.error('Error creating ticket:', err);
      setError('Network error or server unavailable');
    } finally {
      setIsSubmitting(false);
    }
  };

  const priorityOptions = [
    { 
      value: 'low', 
      label: 'Low Priority', 
      icon: <LowPriorityIcon />, 
      color: 'success',
      chipColor: '#10b981'
    },
    { 
      value: 'medium', 
      label: 'Medium Priority', 
      icon: <MediumPriorityIcon />, 
      color: 'warning',
      chipColor: '#f59e0b'
    },
    { 
      value: 'high', 
      label: 'High Priority', 
      icon: <HighPriorityIcon />, 
      color: 'error',
      chipColor: '#ef4444'
    }
  ];

  // const getCurrentPriorityOption = () => {
  //   return priorityOptions.find(option => option.value === form.priority) || priorityOptions[0];
  // };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f59e0b 100%)',
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
            background: 'radial-gradient(circle at 30% 70%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 70% 30%, rgba(255,255,255,0.1) 0%, transparent 50%)',
          },
        }}
      >
        {/* Chatbot positioned absolutely */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 20,
            right: 20,
            zIndex: 1000,
          }}
        >
          <Chatbot />
        </Box>

        <Container maxWidth="sm">
          <Fade in timeout={800}>
            <Card
              sx={{
                position: 'relative',
                zIndex: 1,
                maxWidth: 520,
                mx: 'auto',
                borderRadius: 4,
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #6366f1 50%, #8b5cf6 100%)',
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
                  <TicketIcon sx={{ fontSize: 40 }} />
                </Avatar>
                <Typography variant="h4" component="h1" gutterBottom>
                  Create Support Ticket
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Tell us how we can help you today
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
                    name="title"
                    label="Ticket Title"
                    value={form.title}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                    placeholder="Brief description of your issue"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <TitleIcon color="secondary" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'rgba(245, 158, 11, 0.03)',
                      }
                    }}
                  />

                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    name="description"
                    label="Description"
                    value={form.description}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                    placeholder="Please provide detailed information about your issue..."
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                          <DescriptionIcon color="secondary" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'rgba(245, 158, 11, 0.03)',
                      }
                    }}
                  />

                  <FormControl fullWidth required>
                    <InputLabel id="priority-label">Priority Level</InputLabel>
                    <Select
                      labelId="priority-label"
                      name="priority"
                      value={form.priority}
                      label="Priority Level"
                      onChange={handlePriorityChange}
                      disabled={isSubmitting}
                      startAdornment={
                        <InputAdornment position="start">
                          <PriorityIcon color="secondary" />
                        </InputAdornment>
                      }
                      sx={{
                        backgroundColor: 'rgba(245, 158, 11, 0.03)',
                      }}
                    >
                      {priorityOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          <Stack direction="row" alignItems="center" spacing={2} sx={{ width: '100%' }}>
                            <Box sx={{ color: option.chipColor }}>
                              {option.icon}
                            </Box>
                            <Typography sx={{ flex: 1 }}>{option.label}</Typography>
                            <Chip
                              size="small"
                              label={option.value.toUpperCase()}
                              sx={{
                                bgcolor: option.chipColor,
                                color: 'white',
                                fontWeight: 600,
                                fontSize: '0.7rem'
                              }}
                            />
                          </Stack>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Box sx={{ pt: 1 }}>
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      size="large"
                      disabled={isSubmitting || !form.title || !form.description}
                      sx={{
                        background: 'linear-gradient(135deg, #f59e0b 0%, #6366f1 100%)',
                        py: 1.5,
                        fontSize: '1.1rem',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #d97706 0%, #4f46e5 100%)',
                        },
                        '&:disabled': {
                          background: 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)',
                        },
                      }}
                    >
                      {isSubmitting ? (
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <CircularProgress size={20} color="inherit" />
                          <Typography>Creating Ticket...</Typography>
                        </Stack>
                      ) : (
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <SendIcon />
                          <Typography>Submit Ticket</Typography>
                        </Stack>
                      )}
                    </Button>
                  </Box>
                </Stack>
              </CardContent>

              <Divider />

              <Box sx={{ p: 3, textAlign: 'center', bgcolor: 'rgba(245, 158, 11, 0.02)' }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Need to check existing tickets?
                </Typography>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => router.push('/dashboard')}
                  disabled={isSubmitting}
                  startIcon={<DashboardIcon />}
                  sx={{
                    borderRadius: 2,
                    px: 3,
                    '&:hover': {
                      backgroundColor: 'rgba(99, 102, 241, 0.1)',
                      borderColor: 'primary.main',
                    },
                  }}
                >
                  Go to Dashboard
                </Button>
              </Box>
            </Card>
          </Fade>
        </Container>

        {/* Floating decorative elements */}
        <Box
          sx={{
            position: 'absolute',
            top: '12%',
            left: '6%',
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
            animation: 'float 6s ease-in-out infinite',
            '@keyframes float': {
              '0%, 100%': { transform: 'translateY(0px)' },
              '50%': { transform: 'translateY(-20px)' },
            },
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: '70%',
            right: '12%',
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
            animation: 'float 4s ease-in-out infinite reverse',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '25%',
            left: '18%',
            width: 35,
            height: 35,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)',
            animation: 'float 7s ease-in-out infinite',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: '30%',
            right: '25%',
            width: 25,
            height: 25,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
            animation: 'float 5s ease-in-out infinite',
          }}
        />
      </Box>
    </ThemeProvider>
  );
}