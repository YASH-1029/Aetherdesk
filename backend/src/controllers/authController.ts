import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prismaClient'; // Assuming you have a Prisma client instance set up

export const register = async (req: Request, res: Response) => {
  try {
    console.log('📝 Register request received:', req.body);

    const { name, email, password, role } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: 'Name, email, and password are required'
      });
    }

    console.log('✅ Validation passed');

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Invalid email format' 
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ 
        error: 'Email already exists' 
      });
    }

    console.log('🔍 User does not exist, proceeding with creation');

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('🔐 Password hashed successfully');

    // Create user - note: role is optional in your schema
    const userData = {
      name,
      email,
      passwordHash: hashedPassword,
      ...(role && { role }) // Only include role if it's provided
    };

    console.log('📊 Creating user with data:', userData);

    const user = await prisma.user.create({
      data: userData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });

    console.log('✅ User created successfully:', user);

    res.status(201).json({ 
      message: 'User registered successfully',
      user 
    });

  } catch (error: any) {
    console.error('❌ Registration error:', {
      message: error.message,
      code: error.code,
      meta: error.meta
    });

    // Handle Prisma specific errors
    if (error.code === 'P2002') {
      return res.status(400).json({ 
        error: 'Email already exists' 
      });
    }

    if (error.code === 'P2003') {
      return res.status(400).json({ 
        error: 'Foreign key constraint failed' 
      });
    }

    if (error.code === 'P2025') {
      return res.status(400).json({ 
        error: 'Record not found' 
      });
    }

    res.status(500).json({ 
      error: 'Registration failed',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const login = async (req: Request, res: Response, next:NextFunction ) => {
  try {
      const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET as string)
    res.json({ token, user });
  } catch (error) {
    next(error);
}
};
