import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  Avatar,
  Stack,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  PriorityHigh as HighPriorityIcon,
  Remove as MediumPriorityIcon,
  KeyboardArrowDown as LowPriorityIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

type Ticket = {
  id: number;
  title: string;
  description: string;
  priority: string;
  status: string;
  createdAt: string;
};

interface TicketCardProps {
  ticket: Ticket;
  onEdit?: (ticket: Ticket) => void;
  onView?: (ticket: Ticket) => void;
}

const TicketCard: React.FC<TicketCardProps> = ({ ticket, onEdit, onView }) => {
  const statusConfig = {
    open: {
      color: '#3b82f6',
      bgcolor: '#dbeafe',
      label: 'Open',
    },
    'in progress': {
      color: '#f59e0b',
      bgcolor: '#fef3c7',
      label: 'In Progress',
    },
    closed: {
      color: '#10b981',
      bgcolor: '#d1fae5',
      label: 'Closed',
    },
  };

  const priorityConfig = {
    high: {
      color: '#dc2626',
      bgcolor: '#fee2e2',
      icon: HighPriorityIcon,
      label: 'High Priority',
    },
    medium: {
      color: '#ea580c',
      bgcolor: '#fed7aa',
      icon: MediumPriorityIcon,
      label: 'Medium Priority',
    },
    low: {
      color: '#16a34a',
      bgcolor: '#dcfce7',
      icon: LowPriorityIcon,
      label: 'Low Priority',
    },
  };

  const currentStatus = statusConfig[ticket.status.toLowerCase() as keyof typeof statusConfig] || statusConfig.open;
  const currentPriority = priorityConfig[ticket.priority.toLowerCase() as keyof typeof priorityConfig] || priorityConfig.medium;
  const PriorityIcon = currentPriority.icon;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

const router = useRouter();

  return (
    <Card
    onClick={() => router.push(`/tickets/${ticket.id}`)}
      sx={{
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 10px 10px -5px rgb(0 0 0 / 0.04)',
          borderColor: currentStatus.color,
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Header with Status and Priority */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Chip
            label={currentStatus.label}
            size="small"
            sx={{
              bgcolor: currentStatus.bgcolor,
              color: currentStatus.color,
              fontWeight: 600,
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          />
          <Tooltip title={currentPriority.label}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: currentPriority.bgcolor,
                color: currentPriority.color,
              }}
            >
              <PriorityIcon sx={{ fontSize: 18 }} />
            </Avatar>
          </Tooltip>
        </Stack>

        {/* Ticket Title */}
        <Typography
          variant="h6"
          component="h3"
          sx={{
            fontWeight: 700,
            color: 'text.primary',
            mb: 1,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: 1.3,
          }}
        >
          {ticket.title}
        </Typography>

        {/* Ticket Description */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 3,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: 1.5,
            minHeight: '3.6em',
          }}
        >
          {ticket.description}
        </Typography>

        {/* Footer */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pt: 2,
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box display="flex" alignItems="center">
            <ScheduleIcon 
              sx={{ 
                fontSize: 16, 
                color: 'text.secondary', 
                mr: 0.5 
              }} 
            />
            <Typography variant="caption" color="text.secondary">
              {formatDate(ticket.createdAt)}
            </Typography>
          </Box>

          <Stack direction="row" spacing={0.5}>
            {onView && (
              <Tooltip title="View Details">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onView(ticket);
                  }}
                  sx={{
                    color: 'text.secondary',
                    '&:hover': {
                      color: 'primary.main',
                      bgcolor: 'primary.50',
                    },
                  }}
                >
                  <ViewIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            )}
            {onEdit && (
              <Tooltip title="Edit Ticket">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(ticket);
                  }}
                  sx={{
                    color: 'text.secondary',
                    '&:hover': {
                      color: 'secondary.main',
                      bgcolor: 'secondary.50',
                    },
                  }}
                >
                  <EditIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Box>

        {/* Ticket ID Badge */}
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            bgcolor: 'rgba(0, 0, 0, 0.04)',
            borderRadius: 1,
            px: 1,
            py: 0.25,
          }}
        >
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
            #{ticket.id}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TicketCard;