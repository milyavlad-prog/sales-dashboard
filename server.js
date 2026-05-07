const express = require('express');
const { google } = require('googleapis');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// CORS headers
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});

// Auth setup from environment variable
function getAuth() {
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
    return new google.auth.JWT(
          credentials.client_email,
          null,
          credentials.private_key,
          ['https://www.googleapis.com/auth/spreadsheets.readonly']
        );
}

// API endpoint to get sheet data
app.get('/api/data', async (req, res) => {
    try {
          const auth = getAuth();
          const sheets = google.sheets({ version: 'v4', auth });

      const spreadsheetId = process.env.SPREADSHEET_ID;
          const range = 'Лист1!A1:E100';

      const response = await sheets.spreadsheets.values.get({
              spreadsheetId,
              range,
      });

      const rows = response.data.values;
          if (!rows || rows.length < 2) {
                  return res.json({ data: [] });
          }

      const headers = rows[0]; // ['date', 'revenue', 'leads', 'cac', 'conversion']
      const data = rows.slice(1).map(row => {
              const obj = {};
              headers.forEach((h, i) => {
                        const val = row[i];
                        obj[h] = isNaN(val) ? val : parseFloat(val);
              });
              return obj;
      }).filter(r => r.date);

      res.json({ data });
    } catch (err) {
          console.error(err);
          res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
