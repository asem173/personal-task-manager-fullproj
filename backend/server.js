const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');

const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');
const tasksRouter = require('./routes/tasks');
const notificationsRouter = require('./routes/notifications');
const sharedTasksRouter = require('./routes/sharedTasks');

const { authenticateToken } = require('./middleware/authMiddleware');


dotenv.config();

app.use(cors());
app.use(bodyParser.json());

app.use('/api', authRouter);
app.use('/api/users', authenticateToken, usersRouter);
app.use('/api/tasks', authenticateToken, tasksRouter);
app.use('/api/shared-tasks', authenticateToken, sharedTasksRouter);
app.use('/api/notifications', authenticateToken, notificationsRouter);


app.get('/', (req, res) => {
    res.send('Personal Task Manager API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
