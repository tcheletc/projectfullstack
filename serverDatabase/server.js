const express = require('express');
const cors = require('cors');
const usersRouter = require('./routes/users');
const passwordsRouter = require('./routes/passwords');
const groupsRouter = require('./routes/groups');
const chatsRouter = require('./routes/chats');
const messagesRouter = require('./routes/messages');

const app = express();
app.use(express.json());
const port = process.env.PORT || 9000;

app.use(cors());
app.use('/users', usersRouter);
app.use('/passwords', passwordsRouter);
app.use('/groups', groupsRouter);
app.use('/chats', chatsRouter);
app.use('/messages', messagesRouter);

  
// Start the server
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});