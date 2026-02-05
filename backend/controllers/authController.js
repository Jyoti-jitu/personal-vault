import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import supabase from '../db.js';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);

export const register = async (req, res) => {
    const { email, password, username, phone_number, dob } = req.body;

    if (!email || !password || !username) {
        return res.status(400).json({ error: 'Email, username, and password are required' });
    }

    try {
        const { data: existingUser, error: checkError } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .single();

        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        if (checkError && checkError.code !== 'PGRST116') {
            throw checkError;
        }

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        const createdAt = new Date().toISOString().replace('T', ' ').split('.')[0];

        const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert([{
                email,
                password: hashedPassword,
                username,
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
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        const { data: user, error: findError } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (findError || !user) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

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
};

export const getProfile = async (req, res) => {
    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('id, email, username, phone_number, dob, profile_picture, created_at')
            .eq('id', req.user.userId)
            .single();

        if (error) throw error;

        res.json(user);
    } catch (error) {
        console.error('Fetch profile error:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
};

export const updateProfile = async (req, res) => {
    const { username, phone_number, dob, profile_picture } = req.body;

    try {
        const { data: user, error } = await supabase
            .from('users')
            .update({ username, phone_number, dob, profile_picture })
            .eq('id', req.user.userId)
            .select()
            .single();

        if (error) throw error;

        res.json({ message: 'Profile updated successfully', user });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
};
