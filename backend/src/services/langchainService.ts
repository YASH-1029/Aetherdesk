import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { BaseMessage, HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";
import prisma from '../prismaClient';

// === Environment Check ===
const checkGeminiEnvironment = () => {
  console.log('=== Gemini Environment Check ===');
  console.log('GOOGLE_API_KEY exists:', !!process.env.GOOGLE_API_KEY);
  console.log('GOOGLE_API_KEY length:', process.env.GOOGLE_API_KEY?.length);
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('===============================');
};
checkGeminiEnvironment();

// === Gemini Model Initialization ===
const geminiModel = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY!,
  model: "gemini-2.0-flash",
  temperature: 0.7,
  maxOutputTokens: 1000,
  safetySettings: [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  ]
});

interface ConversationEntry {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const conversationStore = new Map<string, ConversationEntry[]>();
const ticketIdStore = new Map<string, number>();

const generateSessionId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

const getConversationHistory = (sessionId: string): ConversationEntry[] => {
  return conversationStore.get(sessionId) || [];
};

const addToConversationHistory = (sessionId: string, role: 'user' | 'assistant', content: string): void => {
  const history = getConversationHistory(sessionId);
  history.push({ role, content, timestamp: new Date() });
  if (history.length > 20) history.splice(0, history.length - 20);
  conversationStore.set(sessionId, history);
};

const clearConversationHistory = (sessionId: string): void => {
  conversationStore.delete(sessionId);
};

const formatMessagesForGemini = (history: ConversationEntry[]): BaseMessage[] => {
  return history.map(entry => entry.role === 'user' ? new HumanMessage(entry.content) : new AIMessage(entry.content));
};

const extractTicketId = (message: string): number | null => {
  const match = message.match(/(?:ticket\s*(?:id)?\s*#?\s*)(\d+)/i);
  return match ? parseInt(match[1]) : null;
};

const getStoredTicketId = (sessionId: string): number | null => {
  return ticketIdStore.get(sessionId) || null;
};

const setStoredTicketId = (sessionId: string, ticketId: number): void => {
  ticketIdStore.set(sessionId, ticketId);
};

const logError = (context: string, error: any) => {
  console.error(`=== ${context} ===`);
  console.error('Error type:', typeof error);
  console.error('Error message:', error?.message);
  console.error('Error stack:', error?.stack);
  console.error('Full error object:', JSON.stringify(error, null, 2));
  console.error('=================');
};


export const generateGeminiResponse = async (
  message: string,
  sessionId?: string
): Promise<{ response: string; sessionId: string }> => {
  try {
    console.log(">> Inside generateGeminiResponse(), langchainServices with message:", message);

    if (!message) throw new Error("Message is required");

    const currentSessionId = sessionId || generateSessionId();
    const history = getConversationHistory(currentSessionId);

    const ticketIdInMsg = extractTicketId(message);
console.log("Extracted ticket ID from message:", ticketIdInMsg);
if (ticketIdInMsg) setStoredTicketId(currentSessionId, ticketIdInMsg);

const ticketId = getStoredTicketId(currentSessionId);
console.log("Stored ticket ID for session:", ticketId);

    let ticketContext = '';

    if (ticketId) {
      const ticket = await prisma.ticket.findUnique({
        where: { id: ticketId },
        include: { user: { select: { name: true, email: true } } }
      });

      console.log("Fetched ticket for Gemini context:", ticket);

      if (ticket) {
        ticketContext = `
You are a helpful support assistant. Here's the ticket context:
---
Ticket ID: ${ticket.id}
Title: ${ticket.title}
Description: ${ticket.description || "No description provided"}
Priority: ${ticket.priority}
Status: ${ticket.status}
Submitted by: ${ticket.user.name} (${ticket.user.email})
---
Answer the user's question below.
        `.trim();
      } else {
        ticketContext = `User is asking about ticket ID ${ticketId}, but it was not found in the system.`;
        console.warn("No ticket found for ID:", ticketId);
      }
    }

    const allMessages = [
      ...(ticketContext ? [new HumanMessage(ticketContext)] : []),
      ...formatMessagesForGemini(history),
      new HumanMessage(message)
    ];

    console.log("Sending to Gemini:");
    allMessages.forEach((m, i) => console.log(`${i + 1}. [${m._getType()}]:`, m.content));

    const response = await geminiModel.invoke(allMessages);
    const responseContent = response.content as string;

    // Store full turn in memory
    addToConversationHistory(currentSessionId, 'user', message);
    addToConversationHistory(currentSessionId, 'assistant', responseContent);

    // Escalate if triggered
    if (responseContent.toLowerCase().includes("escalating this issue to a human") && ticketId) {
      await prisma.ticket.update({
        where: { id: ticketId },
        data: { status: 'escalated' }
      });
    }

    return {
      response: responseContent,
      sessionId: currentSessionId
    };

  } catch (error) {
    logError("Gemini Error", error);
    throw new Error(error instanceof Error ? error.message : "Gemini AI service failed");
  }
};


export const getSessionHistory = (sessionId: string): ConversationEntry[] => {
  return getConversationHistory(sessionId);
};

export const clearSession = (sessionId: string): void => {
  clearConversationHistory(sessionId);
};

export const getActiveSessions = (): string[] => {
  return Array.from(conversationStore.keys());
};

export const testGeminiConnection = async (): Promise<{ success: boolean; message: string }> => {
  try {
    const testResponse = await geminiModel.invoke("Say 'Hello World' and confirm you are Google Gemini");
    return { success: true, message: `Connection successful. Response: ${testResponse.content}` };
  } catch (error) {
    logError("Gemini Connection Test Error", error);
    return { success: false, message: error instanceof Error ? error.message : 'Unknown connection error' };
  }
};

export const summarizeTickets = async (
  tickets: {
    id: number;
    title: string;
    description: string;
    priority: string;
    status: string;
    user: { name: string; email: string };
  }[]
): Promise<string> => {
  const context = tickets.map(ticket => (
    `Ticket ID: ${ticket.id}
Title: ${ticket.title}
Description: ${ticket.description}
Priority: ${ticket.priority}
Status: ${ticket.status}
Submitted by: ${ticket.user.name} (${ticket.user.email})`
  )).join('\n\n---\n\n');

  const prompt = `
You are a support admin assistant. Given the list of support tickets below, generate a high-level summary for the admin. Mention:

- How many open, resolved, or escalated tickets exist
- Any repeating issues or patterns (e.g. "multiple users reported login issues")
- Highlight high priority or urgent issues
- Be concise and professional.

Here are the tickets:
---
${context}
`;

  const messages = [new HumanMessage(prompt)];
  const response = await geminiModel.invoke(messages);
  return response.content as string;
};
