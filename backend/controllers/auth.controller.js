import { pool } from '../db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

    //login
    export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if email and password are provided
        if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
        }

        // Find user by email
        const query = `SELECT * FROM users WHERE email = $1;`;
        const result = await pool.query(query, [email]);

        if (result.rows.length === 0) {
        return res.status(401).json({ error: "Invalid email or password" });
        }

        const user = result.rows[0];

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
        return res.status(401).json({ error: "Invalid email or password" });
        }

        // Generate token
        const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
        );

        res.status(200).json({
        message: "Login successful",
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
        },
        token,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Server error" });
    }
    };


    //signup
    export const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validation
        if (!name || !email || !password) {
        return res.status(400).json({ error: "All fields are required" });
        }

        // Check if email already exists
        const checkQuery = `SELECT * FROM users WHERE email = $1;`;
        const checkResult = await pool.query(checkQuery, [email]);

        if (checkResult.rows.length > 0) {
        return res.status(409).json({ error: "Email already registered" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert user
        const query = `
        INSERT INTO users (name, email, password)
        VALUES ($1, $2, $3)
        RETURNING id, name, email, created_at;
        `;

        const result = await pool.query(query, [name, email, hashedPassword]);

        res.status(201).json({
        message: "User registered successfully",
        user: result.rows[0],
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Server error" });
    }
    };