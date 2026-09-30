require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { uploadDir } = require('./config/paths');
const { notFound, errorHandler } = require('./middleware/errorHandler');

if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not set');

const app = express();

const origins = process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',').map((s) => s.trim()) : '*';
app.use(cors({ origin: origins }));
app.use(express.json());

// Serve uploaded maintenance photos
app.use('/uploads', express.static(uploadDir));

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/auth', require('./routes/authRoutes'));
app.use('/equipment', require('./routes/equipmentRoutes'));
app.use('/logs', require('./routes/logRoutes'));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
connectDB()
  .then(() => app.listen(PORT, () => console.log(`API running on port ${PORT}`)))
  .catch((err) => {
    console.error('Startup failed:', err.message);
    process.exit(1);
  });
