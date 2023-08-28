// app.js
import * as dotenv from 'dotenv';
import express, { json } from 'express';
import mongoose from 'mongoose';
import { config } from './config/index.js';
import { studentAuthRouter } from './routes/studentRoutes.js';
import { educatorAuthRouter } from './routes/educatorRoutes.js';

dotenv.config();
const app = express();
const PORT = config.port || 3000;

mongoose
.connect(config.mongodb_connection_url, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => {console.log('Connected to MongoDB');})
.catch(err => console.error('Error connecting to MongoDB:', err));

app.use(json()); 

app.use('/api/v1/student', studentAuthRouter);
app.use('/api/v1/educator', educatorAuthRouter);

app.use((req, res) => {
  res.status(404).json({ message: 'Not Found' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});