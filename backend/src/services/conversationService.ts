import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { BufferMemory } from "langchain/memory";
import { ConversationChain } from "langchain/chains";
import { HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

class ConversationManager {
  private conversations: Map<string, ConversationMessage[]> = new Map();
  private chatModel: ChatGoogleGenerativeAI;

  constructor() {
    this.chatModel = new ChatGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_API_KEY,
      temperature: 0.7,
      model: "gemini-2.0-flash",
      maxOutputTokens: 1000,
      // Gemini safety settings
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    });
  }

  async generateResponseWithHistory(userId: string, message: string): Promise<string> {
    try {
      // Validate input
      if (!message || message.trim().length === 0) {
        throw new Error("Message cannot be empty");
      }

      if (message.length > 8000) {
        throw new Error("Message too long for Gemini");
      }

      // Get or create conversation history
      const history = this.conversations.get(userId) || [];
      
      // Add user message to history
      history.push({
        role: 'user',
        content: message,
        timestamp: new Date()
      });

      // Create memory from history
      const { ChatMessageHistory } = await import("langchain/memory");
      const chatMessageHistory = new ChatMessageHistory();
      
      for (const msg of history) {
        if (msg.role === 'user') {
          await chatMessageHistory.addUserMessage(msg.content);
        } else if (msg.role === 'assistant') {
          await chatMessageHistory.addAIMessage(msg.content);
        }
      }
      
      const memory = new BufferMemory({
        chatHistory: chatMessageHistory
      });

      // Create conversation chain with Gemini
      const chain = new ConversationChain({
        llm: this.chatModel,
        memory: memory,
      });

      console.log(`Processing conversation for user: ${userId}`);
      const response = await chain.call({ input: message });
      
      // Add AI response to history
      history.push({
        role: 'assistant',
        content: response.response,
        timestamp: new Date()
      });

      // Keep only last 10 messages to manage memory
      if (history.length > 10) {
        history.splice(0, history.length - 10);
      }

      // Update conversation history
      this.conversations.set(userId, history);

      return response.response;
      
    } catch (error) {
      console.error("Gemini conversation error:", error);
      
      // Handle Gemini-specific errors
      if (error instanceof Error) {
        if (error.message.includes('quota') || error.message.includes('QUOTA_EXCEEDED')) {
          throw new Error("Gemini quota exceeded. Please try again later.");
        }
        if (error.message.includes('API_KEY') || error.message.includes('authentication')) {
          throw new Error("Invalid Gemini API key configuration");
        }
        if (error.message.includes('SAFETY') || error.message.includes('BLOCKED')) {
          throw new Error("Content blocked by Gemini safety filters. Please rephrase your message.");
        }
        if (error.message.includes('timeout')) {
          throw new Error("Request timeout. Please try again.");
        }
      }
      
      throw new Error(`Gemini conversation service failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get conversation history for a user
  getConversationHistory(userId: string): ConversationMessage[] {
    return this.conversations.get(userId) || [];
  }

  // Clear conversation for a user
  clearConversation(userId: string): void {
    this.conversations.delete(userId);
    console.log(`Cleared conversation for user: ${userId}`);
  }

  // Get all active conversations count
  getActiveConversationsCount(): number {
    return this.conversations.size;
  }

  // Clear old conversations (cleanup utility)
  clearOldConversations(maxAgeHours: number = 24): void {
    const cutoffTime = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000);
    let cleanedCount = 0;

    for (const [userId, history] of this.conversations.entries()) {
      if (history.length > 0) {
        const lastMessage = history[history.length - 1];
        if (lastMessage.timestamp < cutoffTime) {
          this.conversations.delete(userId);
          cleanedCount++;
        }
      }
    }

    if (cleanedCount > 0) {
      console.log(`Cleaned up ${cleanedCount} old conversations`);
    }
  }

  // Test Gemini connection
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const testResponse = await this.chatModel.invoke("Say hello and confirm you are Google Gemini");
      return {
        success: true,
        message: testResponse.content as string
      };
    } catch (error) {
      console.error("Gemini connection test failed:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Connection test failed'
      };
    }
  }
}

// Export the conversation manager instance
export const conversationManager = new ConversationManager();

// Helper functions for easier usage
export const chatWithGemini = async (userId: string, message: string): Promise<string> => {
  return await conversationManager.generateResponseWithHistory(userId, message);
};

export const getChatHistory = (userId: string): ConversationMessage[] => {
  return conversationManager.getConversationHistory(userId);
};

export const clearUserChat = (userId: string): void => {
  conversationManager.clearConversation(userId);
};

export const testGeminiConnection = async () => {
  return await conversationManager.testConnection();
};