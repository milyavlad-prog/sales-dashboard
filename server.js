const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint for sales data
app.get('/api/sales', (req, res) => {
  const salesData = [
      { month: 'January', revenue: 45000, orders: 120 },
          { month: 'February', revenue: 52000, orders: 145 },
              { month: 'March', revenue: 61000, orders: 178 },
                  { month: 'April', revenue: 48000, orders: 132 },
                      { month: 'May', revenue: 73000, orders: 201 },
                          { month: 'June', revenue: 89000, orders: 245 }
                            ];
                              res.json(salesData);
                              });

                              // Serve the main page
                              app.get('/', (req, res) => {
                                res.sendFile(path.join(__dirname, 'public', 'index.html'));
                                });

                                app.listen(PORT, () => {
                                  console.log(`Sales Dashboard server running on port ${PORT}`);
                                  });
                                  
