const express = require('express');
const cors = require('cors');
var usersRouter = require('./routes/users');

const app = express();
app.use(express.json());
const port = process.env.PORT || 9000;

app.use(cors());
app.use('/api/users', usersRouter);

  
// Start the server
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});