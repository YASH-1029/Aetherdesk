// backend/routes/chat.ts (or wherever your chat route is)
import { Request, Response } from 'express';
import { generateGeminiResponse, clearSession, getSessionHistory } from '../services/langchainService';
import prisma from '../prismaClient';
import { summarizeTickets } from '../services/langchainService';// adjust path

interface ChatRequest extends Request {
  body: {
    message: string;
    sessionId?: string;
  };
}

export const handleChatMessage = async (req: ChatRequest, res: Response): Promise<Response | void> => {
  try {
    const { message, sessionId } = req.body;
    console.log(">> Inside handleChatMessage, aiController. Message:", message, "Session:", sessionId);

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required and must be a non-empty string' });
    }

    console.log('Processing message:', message);
    console.log('Session:', sessionId || 'new');

    // Now Gemini will extract ticket ID internally
    const result = await generateGeminiResponse(message, sessionId);

    res.status(200).json({
      response: result.response,
      sessionId: result.sessionId,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('AI error:', errorMessage);
    res.status(500).json({
      error: errorMessage,
      timestamp: new Date().toISOString(),
    });
  }
};


// Optional: Endpoint to clear conversation history
export const clearChatHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      res.status(400).json({ error: 'Session ID is required' });
      return;
    }

    clearSession(sessionId);
    
    res.json({ 
      message: 'Conversation history cleared',
      sessionId 
    });

  } catch (error) {
    console.error('Clear history error:', error);
    res.status(500).json({ 
      error: 'Failed to clear conversation history' 
    });
  }
};

// Optional: Endpoint to get conversation history
export const getChatHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      res.status(400).json({ error: 'Session ID is required' });
      return;
    }

    const history = getSessionHistory(sessionId);
    
    res.json({ 
      history,
      sessionId,
      messageCount: history.length 
    });

  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve conversation history' 
    });
  }
};

export const handleSummarizeTickets = async (req: Request, res: Response): Promise<void> => {
  try {
    const tickets = await prisma.ticket.findMany({
      include: {
        user: { select: { name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!tickets.length) {
      res.json({ summary: "There are currently no tickets to summarize." });
      return;
    }

    const summary = await summarizeTickets(
      tickets.map(ticket => ({
        id: ticket.id,
        title: ticket.title,
        description: ticket.description ?? '',
        priority: ticket.priority ?? '',
        status: ticket.status,
        user: ticket.user
      }))
    );
    res.json({ summary });
  } catch (error) {
    console.error('Summarization Error:', error);
    res.status(500).json({ error: 'Failed to summarize tickets' });
  }
};


// Your route setup (adjust based on your app structure)
// app.post('/ai/chat', handleChatMessage);
// app.post('/ai/clear', clearChatHistory);
// app.get('/ai/history/:sessionId', getChatHistory);