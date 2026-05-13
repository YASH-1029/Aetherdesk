import express from "express";
import { handleChatMessage } from "../controllers/aiController";
import { handleSummarizeTickets } from "../controllers/aiController";
import { verifyToken } from "../middleware/auth";
import rateLimit from "express-rate-limit";

const router = express.Router();

// Rate limiting for Gemini (more generous since it's free)
const geminiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Higher limit since Gemini is more generous
  message: {
    error: "Too many AI requests, please try again later.",
    code: "RATE_LIMIT_EXCEEDED"
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Input validation middleware
const validateChatInput: express.RequestHandler = (req, res, next) => {
  const { message } = req.body;
  
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    res.status(400).json({
      error: "Valid message is required",
      code: "INVALID_INPUT"
    });
    return;
  }
  
  next();
};

// Helper to wrap async route handlers
const asyncHandler = (fn: any) => (req: express.Request, res: express.Response, next: express.NextFunction) =>
  Promise.resolve(fn(req, res, next)).catch(next);


router.post("/chat", 
  geminiRateLimit,
  verifyToken, 
  validateChatInput,
  asyncHandler(handleChatMessage)
);

router.get("/summary",
  geminiRateLimit,
  verifyToken,
  asyncHandler(handleSummarizeTickets)
)


export default router;