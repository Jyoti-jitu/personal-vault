import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import supabase from './db.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 5000;

// Environment Variables
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);

if (!JWT_SECRET) {
    console.error('Missing JWT_SECRET environment variable');
    process.exit(1);
}

// Middleware
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(express.json());

// Request logger
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Routes
app.post('/register', async (req, res) => {
    const { email, password, username, phone_number, dob } = req.body;

    if (!email || !password || !username) {
        return res.status(400).json({ error: 'Email, username, and password are required' });
    }

    try {
        // Check if user exists
        const { data: existingUser, error: checkError } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .single();

        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Ignore "PGRST116" error (no rows found)
        if (checkError && checkError.code !== 'PGRST116') {
            throw checkError;
        }

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert([{
                email,
                password: hashedPassword,
                username,
                phone_number: phone_number || null,
                dob: dob || null
            }])
            .select()
            .single();

        if (insertError) throw insertError;

        const token = jwt.sign(
            { userId: newUser.id, email: newUser.email },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        res.status(201).json({ message: 'User registered successfully', user: { id: newUser.id, email: newUser.email }, token });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: error.message || 'Internal server error', details: error });
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        // Find user
        const { data: user, error: findError } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (findError || !user) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        // Generate token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        res.json({
            message: 'Login successful',
            user: { id: user.id, email: user.email },
            token
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Middleware to authenticate token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Get User Profile
app.get('/me', authenticateToken, async (req, res) => {
    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('id, email, username, phone_number, dob, created_at') // Exclude password
            .eq('id', req.user.userId)
            .single();

        if (error) {
            throw error;
        }

        res.json(user);
    } catch (error) {
        console.error('Fetch profile error:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// Update User Profile
app.put('/me', authenticateToken, async (req, res) => {
    const { username, phone_number, dob } = req.body;

    try {
        const { data: user, error } = await supabase
            .from('users')
            .update({ username, phone_number, dob })
            .eq('id', req.user.userId)
            .select()
            .single();

        if (error) {
            throw error;
        }

        res.json({ message: 'Profile updated successfully', user });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
}); 
