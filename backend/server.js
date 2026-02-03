const express = require('express');
const app = express();

const path = require('path');

app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/api/hello', (req, res) => {
  res.send('Hello from backend API 👋');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
