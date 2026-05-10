import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import clinicRoutes from './routes/clinic.js';
import authRoutes from './routes/auth.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use('/api', clinicRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
    res.send('Welcome to the Veterinary Clinic API');
});

app.listen(process.env.port, () => {
    console.log(`Server is running on port ${process.env.port}`);
});