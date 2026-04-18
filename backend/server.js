import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import postRoutes from './routes/post.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', postRoutes);

app.get('/', (req, res) => {
    res.send('Welcome to the Veterinary Clinic API');
});

app.listen(process.env.port,() => {
    console.log(`Server is running on port ${process.env.port}`);
});

