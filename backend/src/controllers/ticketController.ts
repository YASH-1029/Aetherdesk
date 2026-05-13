import { Request, Response } from 'express';
import prisma from '../prismaClient'; // Assuming you have a Prisma client instance set up

export const createTicket = async (req: Request, res: Response) => {
  try {
    console.log('Request body:', req.body);
    console.log('Request headers:', req.headers);
    
    const { title, description, priority, createdBy } = req.body;

    // Validation
    if (!title || !description || !priority || !createdBy) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        received: { title, description, priority, createdBy }
      });
    }

    // Check if user exists (optional but recommended)
    const userExists = await prisma.user.findUnique({
      where: { id: createdBy }
    });

    if (!userExists) {
      return res.status(400).json({ error: 'User not found' });
    }

    // Create ticket
    const ticket = await prisma.ticket.create({
      data: {
        title,
        description,
        priority,
        status: 'open',
        createdBy,
      },
    });

    console.log('Ticket created successfully:', ticket);
    
    res.status(201).json({ 
      success: true,
      ticket 
    });

  } catch (error) {
    console.error('Error creating ticket:', error);
    
    // Handle Prisma-specific errors
    if (typeof error === 'object' && error !== null && 'code' in error) {
      if ((error as any).code === 'P2002') {
        return res.status(400).json({ error: 'Unique constraint violation' });
      }
      if ((error as any).code === 'P2003') {
        return res.status(400).json({ error: 'Foreign key constraint failed' });
      }
    }
    
    res.status(500).json({ 
      error: 'Could not create ticket',
      details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined
    });
  }
};

export const getTickets = async (req: Request, res: Response) => {
  try {
    const tickets = await prisma.ticket.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });
    res.json({ tickets });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
};

// Get ticket by id
export const getTicketById = async (req: Request, res: Response) => {
  const ticketId = Number(req.params.id);
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.json({ ticket });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch ticket' });
  }
};

// Update ticket status
export const updateTicketStatus = async (req: Request, res: Response) => {
  const ticketId = Number(req.params.id);
  const { status } = req.body;

  try {
    const updatedTicket = await prisma.ticket.update({
      where: { id: ticketId },
      data: { status },
    });
    res.json({ ticket: updatedTicket });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update ticket status' });
  }
};