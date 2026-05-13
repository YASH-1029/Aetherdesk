'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Stack,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  AppBar,
  Toolbar,
  IconButton,
  Badge,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Avatar,
  Button,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Logout as LogoutIcon,
  // Add as AddIcon,
  Assignment as TicketIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import TicketCard from '@/components/TicketCard';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

// Custom Material-UI theme with vibrant colors
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
    warning: {
      main: '#f59e0b', // Amber
      light: '#fbbf24',
      dark: '#d97706',
    },
    background: {
      default: '#f8fafc',
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
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
          },
        },
      },
    },
  },
});

type Ticket = {
  id: number;
  title: string;
  description: string;
  priority: string;
  status: string;
  createdAt: string;
};

const statusConfig = {
  open: {
    label: 'Open',
    color: '#3b82f6' as const,
    icon: TicketIcon,
    bgGradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
  },
  'in progress': {
    label: 'In Progress',
    color: '#f59e0b' as const,
    icon: ScheduleIcon,
    bgGradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
  },
  closed: {
    label: 'Closed',
    color: '#10b981' as const,
    icon: CheckCircleIcon,
    bgGradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  },
};

export default function DashboardPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [openSummary, setOpenSummary] = useState(false);
  const [summaryText, setSummaryText] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const { token, logout } = useAuth();
  const router = useRouter();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));

  useEffect(() => {
    if (!token) {
      router.push('/login');
    }
  }, [token, router]);

  useEffect(() => {
    const fetchTickets = async () => {
      const token = localStorage.getItem('token');
      setLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/tickets`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setTickets(data.tickets);
        } else {
          setError(data.error || 'Failed to fetch tickets');
        }
      } catch (err) {
        setError('An error occurred while fetching tickets.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchTickets();
    }
  }, [token]);

  useEffect(() => {
  const fetchSummary = async () => {
    if (!openSummary) return;
    const token = localStorage.getItem('token');
    setSummaryLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/ai/summary`
        , {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to fetch summary');
      }
      const data = await res.json();
      setSummaryText(data.summary || 'No summary available.');
    } catch (err) {
      setSummaryText('Failed to load AI summary.');
      console.error('Error fetching AI summary:', err);
    } finally {
      setSummaryLoading(false);
    }
  };

  fetchSummary();
}, [openSummary]);


  const getTicketStats = () => {
    const stats = {
      total: tickets.length,
      open: tickets.filter(t => t.status.toLowerCase() === 'open').length,
      inProgress: tickets.filter(t => t.status.toLowerCase() === 'in progress').length,
      closed: tickets.filter(t => t.status.toLowerCase() === 'closed').length,
    };
    return stats;
  };

  const stats = getTicketStats();

  if (!token) {
    return (
      <ThemeProvider theme={theme}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
          bgcolor="background.default"
        >
          <CircularProgress size={60} />
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: 'background.default' }}>
        {/* Header */}
        <AppBar 
          position="sticky" 
          sx={{ 
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
            boxShadow: '0 4px 20px rgba(99, 102, 241, 0.3)'
          }}
        >
          <Toolbar>
            <Avatar sx={{ mr: 2, bgcolor: 'rgba(255,255,255,0.2)' }}>
              <TicketIcon />
            </Avatar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
              Ticket Dashboard
            </Typography>
            <IconButton color="inherit" sx={{ mr: 1 }}>
              <Badge badgeContent={stats.open} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <IconButton color="inherit" onClick={logout}>
              <LogoutIcon />
            </IconButton>
          </Toolbar>
        </AppBar>

        <Container maxWidth="xl" sx={{ py: 4 }}>
          {/* Stats Cards */}
          <Stack 
            direction={isMobile ? 'column' : 'row'} 
            spacing={3} 
            sx={{ mb: 4 }}
          >
            <Card sx={{ 
              flex: 1,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white'
            }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" component="div" fontWeight="bold">
                      {stats.total}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Total Tickets
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                    <TicketIcon fontSize="large" />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
            
            <Card sx={{ 
              flex: 1,
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              color: 'white'
            }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" component="div" fontWeight="bold">
                      {stats.open}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Open Tickets
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                    <TrendingUpIcon fontSize="large" />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ 
              flex: 1,
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: 'white'
            }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" component="div" fontWeight="bold">
                      {stats.inProgress}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      In Progress
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                    <ScheduleIcon fontSize="large" />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ 
              flex: 1,
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white'
            }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" component="div" fontWeight="bold">
                      {stats.closed}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Closed Tickets
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                    <CheckCircleIcon fontSize="large" />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Stack>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {/* Loading State */}
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" py={8}>
              <CircularProgress size={60} />
            </Box>
          ) : (
            /* Ticket Columns */
            <Stack 
              direction={isMobile ? 'column' : 'row'} 
              spacing={3}
              sx={{ alignItems: 'flex-start' }}
            >
              {Object.entries(statusConfig).map(([status, config]) => {
                const statusTickets = tickets.filter(t => t.status.toLowerCase() === status);
                const StatusIcon = config.icon;
                
                return (
                  <Box 
                    key={status}
                    sx={{ 
                      flex: 1, 
                      width: '100%',
                      minWidth: isMobile ? '100%' : '300px'
                    }}
                  >
                    <Paper 
                      elevation={0}
                      sx={{ 
                        p: 2, 
                        minHeight: '600px',
                        bgcolor: 'background.paper',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 3
                      }}
                    >
                      {/* Column Header */}
                      <Box 
                        sx={{ 
                          background: config.bgGradient,
                          borderRadius: 2,
                          p: 2,
                          mb: 3,
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <Box display="flex" alignItems="center">
                          <StatusIcon sx={{ mr: 1 }} />
                          <Typography variant="h6" fontWeight="bold">
                            {config.label}
                          </Typography>
                        </Box>
                        <Chip 
                          label={statusTickets.length} 
                          size="small"
                          sx={{ 
                            bgcolor: 'rgba(255,255,255,0.2)',
                            color: 'white',
                            fontWeight: 'bold'
                          }}
                        />
                      </Box>

                      {/* Tickets */}
                      <Stack spacing={2}>
                        {statusTickets.length === 0 ? (
                          <Box 
                            display="flex" 
                            flexDirection="column" 
                            alignItems="center" 
                            justifyContent="center"
                            py={6}
                            sx={{ opacity: 0.6 }}
                          >
                            <StatusIcon sx={{ fontSize: 48, mb: 2, color: config.color }} />
                            <Typography variant="body1" color="text.secondary">
                              No {config.label.toLowerCase()} tickets
                            </Typography>
                          </Box>
                        ) : (
                          statusTickets.map((ticket) => (
                            <TicketCard key={ticket.id} ticket={ticket} />
                          ))
                        )}
                      </Stack>
                    </Paper>
                  </Box>
                );
              })}
            </Stack>
          )}
        </Container>

        {/* Floating AI Summary Button */}
        <Fab
          color="secondary"
          aria-label="ai summary"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            }
          }}
          onClick={() => setOpenSummary(true)}
        >
          <TrendingUpIcon />
        </Fab>
        
        <Dialog open={openSummary} onClose={() => setOpenSummary(false)} fullWidth maxWidth="md">
          <DialogTitle>🧠 AI Ticket Summary</DialogTitle>
          <DialogContent dividers sx={{ whiteSpace: 'pre-wrap', fontSize: '0.95rem' }}>
            {summaryLoading ? (
              <Box display="flex" alignItems="center" justifyContent="center" py={4}>
                <CircularProgress />
              </Box>
            ) : (
              <Typography variant="body1">
                {summaryText}
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenSummary(false)} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>

      </Box>
    </ThemeProvider>
  );
}