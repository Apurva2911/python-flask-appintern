const express = require('express');
const cors = require('cors');

const app = express();

// Allow requests from your frontend Azure URL
app.use(cors({
  origin: "https://appnew-cfe4gvcba0f7dtdk.centralindia-01.azurewebsites.net"
}));

app.use(express.json());

// Root route (fixes "Cannot GET /")
app.get('/', (req, res) => {
  res.send('Backend is running ✅');
});

// API route
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from backend API 👋' });
});

// IMPORTANT: use Azure port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Backend running on port ${port}`);
});
