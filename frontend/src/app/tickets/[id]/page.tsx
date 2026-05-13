'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Alert,
  CircularProgress,
  Chip,
  Stack,
  Paper,
  Avatar,
  IconButton,
  Breadcrumbs,
  Link,
  Divider,
  Skeleton,
  Fade,
  Snackbar,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  // Cancel as CancelIcon,
  // Assignment as TicketIcon,
  Schedule as ScheduleIcon,
  // Person as PersonIcon,
  CalendarToday as CalendarIcon,
  PriorityHigh as HighPriorityIcon,
  Remove as MediumPriorityIcon,
  KeyboardArrowDown as LowPriorityIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as OpenIcon,
  Sync as ProgressIcon,
} from '@mui/icons-material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useAuth } from '@/context/AuthContext';

// Custom theme matching your dashboard
const theme = createTheme({
  palette: {
    primary: {
      main: '#6366f1',
      light: '#818cf8',
      dark: '#4f46e5',
    },
    secondary: {
      main: '#ec4899',
      light: '#f472b6',
      dark: '#db2777',
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
    },
    warning: {
      main: '#f59e0b',
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
  },
  shape: {
    borderRadius: 12,
  },
});

type Ticket = {
  id: number;
  title: string;
  description: string;
  priority: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
  assignedTo?: string;
};

export default function TicketDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { token } = useAuth();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const statusConfig = {
    open: {
      label: 'Open',
      color: '#3b82f6',
      bgcolor: '#dbeafe',
      icon: OpenIcon,
    },
    'in progress': {
      label: 'In Progress',
      color: '#f59e0b',
      bgcolor: '#fef3c7',
      icon: ProgressIcon,
    },
    closed: {
      label: 'Closed',
      color: '#10b981',
      bgcolor: '#d1fae5',
      icon: CheckCircleIcon,
    },
  };

  const priorityConfig = {
    high: {
      label: 'High Priority',
      color: '#dc2626',
      bgcolor: '#fee2e2',
      icon: HighPriorityIcon,
    },
    medium: {
      label: 'Medium Priority',
      color: '#ea580c',
      bgcolor: '#fed7aa',
      icon: MediumPriorityIcon,
    },
    low: {
      label: 'Low Priority',
      color: '#16a34a',
      bgcolor: '#dcfce7',
      icon: LowPriorityIcon,
    },
  };

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchTicket = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/tickets/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        
        if (!res.ok) {
          setError(data.error || 'Failed to fetch ticket');
        } else {
          setTicket(data.ticket);
          setStatus(data.ticket.status);
        }
      } catch (err) {
        setError('Something went wrong while fetching the ticket');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [id, token, router]);

  const handleStatusChange = async () => {
    if (!token) return;
    
    setUpdating(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/tickets/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to update status');
      } else {
        setTicket(data.ticket);
        setShowSuccess(true);
      }
    } catch (err) {
      setError('Something went wrong while updating the ticket');
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
          <Container maxWidth="md">
            <Skeleton variant="rectangular" height={60} sx={{ mb: 3, borderRadius: 2 }} />
            <Card sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 4 }}>
                <Skeleton variant="text" height={40} width="60%" sx={{ mb: 2 }} />
                <Skeleton variant="text" height={20} width="100%" sx={{ mb: 1 }} />
                <Skeleton variant="text" height={20} width="80%" sx={{ mb: 3 }} />
                <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
              </CardContent>
            </Card>
          </Container>
        </Box>
      </ThemeProvider>
    );
  }

  if (error) {
    return (
      <ThemeProvider theme={theme}>
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
          <Container maxWidth="md">
            <Alert 
              severity="error" 
              sx={{ borderRadius: 2 }}
              action={
                <Button color="inherit" size="small" onClick={() => router.push('/dashboard')}>
                  Back to Dashboard
                </Button>
              }
            >
              {error}
            </Alert>
          </Container>
        </Box>
      </ThemeProvider>
    );
  }

  if (!ticket) return null;

  const currentStatus = statusConfig[ticket.status.toLowerCase() as keyof typeof statusConfig] || statusConfig.open;
  const currentPriority = priorityConfig[ticket.priority.toLowerCase() as keyof typeof priorityConfig] || priorityConfig.medium;
  const StatusIcon = currentStatus.icon;
  const PriorityIcon = currentPriority.icon;

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
        <Container maxWidth="md">
          {/* Breadcrumbs */}
          <Breadcrumbs sx={{ mb: 3 }}>
            <Link
              component="button"
              variant="body2"
              onClick={() => router.push('/dashboard')}
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                textDecoration: 'none',
                color: 'primary.main',
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              <ArrowBackIcon sx={{ mr: 0.5, fontSize: 16 }} />
              Dashboard
            </Link>
            <Typography variant="body2" color="text.primary">
              Ticket #{ticket.id}
            </Typography>
          </Breadcrumbs>

          <Fade in={true} timeout={600}>
            <Card 
              sx={{ 
                borderRadius: 3,
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
              }}
            >
              <CardContent sx={{ p: 4 }}>
                {/* Header */}
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3 }}>
                  <Box>
                    <Typography 
                      variant="h4" 
                      component="h1" 
                      sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}
                    >
                      {ticket.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Ticket #{ticket.id}
                    </Typography>
                  </Box>
                  <IconButton 
                    color="primary"
                    sx={{ 
                      bgcolor: 'primary.50',
                      '&:hover': { bgcolor: 'primary.100' }
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                </Stack>

                {/* Status and Priority Chips */}
                <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                  <Chip
                    icon={<StatusIcon />}
                    label={currentStatus.label}
                    sx={{
                      bgcolor: currentStatus.bgcolor,
                      color: currentStatus.color,
                      fontWeight: 600,
                      '& .MuiChip-icon': {
                        color: currentStatus.color,
                      },
                    }}
                  />
                  <Chip
                    icon={<PriorityIcon />}
                    label={currentPriority.label}
                    sx={{
                      bgcolor: currentPriority.bgcolor,
                      color: currentPriority.color,
                      fontWeight: 600,
                      '& .MuiChip-icon': {
                        color: currentPriority.color,
                      },
                    }}
                  />
                </Stack>

                <Divider sx={{ my: 3 }} />

                {/* Description */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Description
                  </Typography>
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: 3, 
                      bgcolor: 'grey.50',
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'grey.200'
                    }}
                  >
                    <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                      {ticket.description}
                    </Typography>
                  </Paper>
                </Box>

                {/* Ticket Details */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Ticket Details
                  </Typography>
                  <Stack spacing={2}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar sx={{ bgcolor: 'primary.100', color: 'primary.main', width: 32, height: 32 }}>
                        <CalendarIcon sx={{ fontSize: 16 }} />
                      </Avatar>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Created
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {formatDate(ticket.createdAt)}
                        </Typography>
                      </Box>
                    </Stack>
                    
                    {ticket.updatedAt && (
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar sx={{ bgcolor: 'secondary.100', color: 'secondary.main', width: 32, height: 32 }}>
                          <ScheduleIcon sx={{ fontSize: 16 }} />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Last Updated
                          </Typography>
                          <Typography variant="body1" fontWeight={500}>
                            {formatDate(ticket.updatedAt)}
                          </Typography>
                        </Box>
                      </Stack>
                    )}
                  </Stack>
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* Status Update Section */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Update Status
                  </Typography>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <FormControl sx={{ minWidth: 200 }}>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={status}
                        label="Status"
                        onChange={(e) => setStatus(e.target.value)}
                        disabled={updating}
                      >
                        <MenuItem value="open">
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <OpenIcon sx={{ fontSize: 16, color: statusConfig.open.color }} />
                            <span>Open</span>
                          </Stack>
                        </MenuItem>
                        <MenuItem value="in progress">
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <ProgressIcon sx={{ fontSize: 16, color: statusConfig['in progress'].color }} />
                            <span>In Progress</span>
                          </Stack>
                        </MenuItem>
                        <MenuItem value="closed">
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <CheckCircleIcon sx={{ fontSize: 16, color: statusConfig.closed.color }} />
                            <span>Closed</span>
                          </Stack>
                        </MenuItem>
                      </Select>
                    </FormControl>

                    <Button
                      variant="contained"
                      onClick={handleStatusChange}
                      disabled={updating || status === ticket.status}
                      startIcon={updating ? <CircularProgress size={16} /> : <SaveIcon />}
                      sx={{
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                        },
                      }}
                    >
                      {updating ? 'Updating...' : 'Update Status'}
                    </Button>
                  </Stack>
                </Box>

                {/* Action Buttons */}
                <Stack direction="row" spacing={2} sx={{ pt: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => router.push('/dashboard')}
                    sx={{ borderRadius: 2 }}
                  >
                    Back to Dashboard
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Fade>

          {/* Success Snackbar */}
          <Snackbar
            open={showSuccess}
            autoHideDuration={3000}
            onClose={() => setShowSuccess(false)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            <Alert onClose={() => setShowSuccess(false)} severity="success" sx={{ width: '100%' }}>
              Ticket status updated successfully!
            </Alert>
          </Snackbar>
        </Container>
      </Box>
    </ThemeProvider>
  );
}