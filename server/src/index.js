const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const storeRoutes = require('./routes/storeRoutes');
const ratingRoutes = require('./routes/ratingRoutes');

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/ratings', ratingRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

// Sync database and start server
const PORT = process.env.PORT || 5000;

// Create admin user if not exists
const createAdminUser = async () => {
  try {
    const { User } = require('./models');
    const adminExists = await User.findOne({ where: { email: 'admin@example.com' } });

    if (!adminExists) {
      await User.create({
        name: 'System Administrator Full Name',  // 20+ characters for name validation
        email: 'admin@example.com',
        password: 'Admin@123',  // Meets password requirements
        address: 'Admin Office Address',
        role: 'ADMIN'
      });
      console.log('Admin user created successfully');
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
};

// Initialize database and start server
(async () => {
  try {
    // Sync all models without dropping tables
    await sequelize.sync({ alter: true });
    console.log('Database synced successfully');

    // Create admin user
    await createAdminUser();

    // Start server
    const server = app.listen(PORT, () => {
      const actualPort = server.address().port;
      console.log(`Configured port: ${PORT}, Actual port: ${actualPort}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
})();
