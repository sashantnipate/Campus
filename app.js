const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const eventRoutes = require('./routes/event.routes');
const studentRoutes = require('./routes/student.routes');
const organizationRoutes = require('./routes/organization.routes');
const userRoutes = require('./routes/user.routes');
const certificateRoutes = require('./routes/certificate.routes');
const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/orgs', organizationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/certificates', certificateRoutes);
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Welcome to the University API!' });
});

module.exports = app;
