import express from 'express';
import { Request, Response, NextFunction } from 'express';
const { createTicket, getTickets, updateTicketStatus, getTicketById } = require('../controllers/ticketController');
const router = express.Router();

router.post('/', createTicket);
router.get('/', getTickets);
router.get('/:id', getTicketById);
router.put('/:id/status', updateTicketStatus);

export default router;