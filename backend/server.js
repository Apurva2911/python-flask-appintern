const express = require('express');
const app = express();

app.use(express.static(__dirname));

app.get('/api/hello', (req, res) => {
  res.send('Hello from backend API 👋');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
