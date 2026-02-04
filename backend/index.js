import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import supabase from './db.js';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const app = express();
const PORT = 5000;

// Environment Variables
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);
const ENCRYPTION_KEY = crypto.scryptSync(JWT_SECRET, 'salt', 32); // Derive a 32-byte key from JWT_SECRET
const IV_LENGTH = 16;


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
app.use(express.json({ limit: '10mb' }));

// Request logger
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});
// Encryption Helpers
function encrypt(text) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}

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

        // Format date as YYYY-MM-DD HH:MM:SS (no milliseconds, no timezone offset)
        const createdAt = new Date().toISOString().replace('T', ' ').split('.')[0];

        const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert([{
                email,
                password: hashedPassword,
                username,
                phone_number: phone_number || null,
                phone_number: phone_number || null,
                dob: dob || null,
                created_at: createdAt
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
            .select('id, email, username, phone_number, dob, profile_picture, created_at') // Exclude password
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
    const { username, phone_number, dob, profile_picture } = req.body;

    try {
        const { data: user, error } = await supabase
            .from('users')
            .update({ username, phone_number, dob, profile_picture })
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

// --- Payment Cards Routes ---

// Add New Card
app.post('/cards', authenticateToken, async (req, res) => {
    const { cardHolderName, cardNumber, expiryDate, cvv, cardType, bankName, cardColor } = req.body;

    if (!cardHolderName || !cardNumber || !expiryDate || !cvv || !cardType) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const encryptedCardNumber = encrypt(cardNumber);
        const encryptedCvv = encrypt(cvv);

        const { data: card, error } = await supabase
            .from('cards')
            .insert([{
                user_id: req.user.userId,
                card_holder_name: cardHolderName,
                card_number: encryptedCardNumber,
                expiry_date: expiryDate,
                cvv: encryptedCvv,
                card_type: cardType,
                bank_name: bankName || null,
                card_color: cardColor || 'from-gray-900 to-gray-800' // Default color gradient
            }])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({ message: 'Card added successfully', card: { ...card, card_number: cardNumber.slice(-4) } });
    } catch (error) {
        console.error('Add card error:', error);
        res.status(500).json({ error: 'Failed to add card' });
    }
});

// Get User Cards
app.get('/cards', authenticateToken, async (req, res) => {
    try {
        const { data: cards, error } = await supabase
            .from('cards')
            .select('*')
            .eq('user_id', req.user.userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        const decryptedCards = cards.map(card => {
            try {
                const decryptedNumber = decrypt(card.card_number);
                return {
                    ...card,
                    card_number_masked: `**** **** **** ${decryptedNumber.slice(-4)}`,
                    // We typically don't send back the full CVV or number unless explicitly requested for revealing
                    // For dashboard purposes, masked is safer.
                    // But if user wants to see details, we might need a separate call or return it here.
                    // For now, let's return the decrypted number for simplicity in MVP, but BE CAREFUL.
                    // Ideally, only return masked.
                    card_number_plain: decryptedNumber,
                    cvv_plain: decrypt(card.cvv)
                };
            } catch (e) {
                console.error('Error decrypting card:', card.id, e);
                return { ...card, error: 'Decryption failed' };
            }
        });

        res.json(decryptedCards);
    } catch (error) {
        console.error('Fetch cards error:', error);
        res.status(500).json({ error: 'Failed to fetch cards' });
    }
});

// Update Card
app.put('/cards/:id', authenticateToken, async (req, res) => {
    const { cardHolderName, cardNumber, expiryDate, cvv, cardType, bankName, cardColor } = req.body;
    const cardId = req.params.id;

    if (!cardHolderName || !cardNumber || !expiryDate || !cvv || !cardType) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const encryptedCardNumber = encrypt(cardNumber);
        const encryptedCvv = encrypt(cvv);

        const { data: card, error } = await supabase
            .from('cards')
            .update({
                card_holder_name: cardHolderName,
                card_number: encryptedCardNumber,
                expiry_date: expiryDate,
                cvv: encryptedCvv,
                card_type: cardType,
                bank_name: bankName || null,
                card_color: cardColor || 'from-gray-900 to-gray-800'
            })
            .eq('id', cardId)
            .eq('user_id', req.user.userId) // Ensure user owns card
            .select()
            .single();

        if (error) throw error;

        res.json({ message: 'Card updated successfully', card: { ...card, card_number: cardNumber.slice(-4) } });
    } catch (error) {
        console.error('Update card error:', error);
        res.status(500).json({ error: 'Failed to update card' });
    }
});

// Delete Card
app.delete('/cards/:id', authenticateToken, async (req, res) => {
    try {
        const { error } = await supabase
            .from('cards')
            .delete()
            .eq('id', req.params.id)
            .eq('user_id', req.user.userId); // Ensure user owns card

        if (error) throw error;

        res.json({ message: 'Card deleted successfully' });
    } catch (error) {
        console.error('Delete card error:', error);
        res.status(500).json({ error: 'Failed to delete card' });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
}); 
