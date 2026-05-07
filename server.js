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
const FIELD_MAP = {
  'Дата': 'date',
  'Лиды ИТОГО (авто)': 'leads',
  'Лиды с сайта': 'leads_site',
  'Лиды с бота': 'leads_bot',
  'Лиды с таргета': 'leads_target',
  'Кол-во переписок': 'chats',
  'Сделок за сутки': 'deals',
  'Конверсия % (авто)': 'conversion',
  'Выручка ЕРИП': 'erip',
  'Выручка Безнал': 'beznal',
  'Выручка Партнёрка': 'partner',
  'Общая выручка (авто)': 'revenue',
  'Средний чек (авто)': 'avg_check',
  'Бюджет таргет/сутки': 'budget_target',
  'CAC (авто)': 'cac',
  'Ср. стоим. лида': 'leads_avg_cost',
  'Обработано лидов': 'processed',
  'Динамика лидов (авто)': 'leads_dynamic',
  '% плана (авто, нараст.)': 'plan_pct',
  'Билеты Стандарт': 'sold_standart',
  'Билеты Комфорт': 'sold_comfort',
  'Билеты Премиум': 'sold_premium',
  'Билеты VIP': 'sold_vip',
};
app.get('/api/data', async (req, res) => {
  try {
    const auth = getAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'Лист1!A2:W200',
    });
    const rows = response.data.values;
    if (!rows || rows.length < 2) return res.json({ data: [] });
    const ruHeaders = rows[0];
    const headers = ruHeaders.map(h => FIELD_MAP[h] || h);
    const data = rows.slice(1)
      .map(row => {
        const obj = {};
        headers.forEach((h, i) => {
          const val = row[i] !== undefined ? row[i] : '';
          obj[h] = (val !== '' && !isNaN(val)) ? parseFloat(val) : val;
        });
        return obj;
      })
      .filter(r => r.date && r.date !== '');
    res.json({ data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
