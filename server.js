const express = require('express');
const { google } = require('googleapis');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res, next) => { res.header('Access-Control-Allow-Origin', '*'); next(); });
function getAuth() {
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
  return new google.auth.JWT(credentials.client_email, null, credentials.private_key, ['https://www.googleapis.com/auth/spreadsheets.readonly']);
}
function excelDateToString(serial) {
  const d = new Date((serial - 25569) * 86400 * 1000);
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
}
const COL_KEYS = [
  'date','leads','leads_site','leads_bot','leads_target','chats','deals','conversion',
  'erip','beznal','partner','revenue','avg_check','budget_target','cac','leads_avg_cost',
  'processed','leads_dynamic','plan_pct','sold_standart','sold_comfort','sold_premium','sold_vip'
];
app.get('/api/data', async (req, res) => {
  try {
    const auth = getAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'Лист1!A3:W200',
    });
    const rows = response.data.values;
    if (!rows || rows.length < 1) return res.json({ data: [] });
    const data = rows.map(row => {
      const obj = {};
      COL_KEYS.forEach((key, i) => {
        const raw = row[i] !== undefined ? String(row[i]).trim() : '';
        if (key === 'date') {
          const num = parseFloat(raw.replace(',', '.'));
          obj.date = !isNaN(num) && num > 40000 ? excelDateToString(num) : raw;
        } else {
          const cleaned = raw.replace(',', '.').replace(/[^\d.-]/g, '');
          obj[key] = cleaned !== '' && !isNaN(cleaned) ? parseFloat(cleaned) : 0;
        }
      });
      return obj;
    }).filter(r => r.date && r.date !== '');
    res.json({ data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
