import { google } from 'googleapis';

interface BuscarEnGSheetResult {
  [key: string]: string;
}

interface SheetData {
  [tabName: string]: string[][];
}

const auth = new google.auth.JWT({
  email: process.env.GSHEET_EMAIL || '',
  key: process.env.GSHEET_PRIVATE_KEY?.replace(/\\n/g, '\n') || '',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

export const getGSheetTabs = async (spreadsheetId: string) => {
  const sheets = google.sheets({ version: 'v4', auth });
  const res = await sheets.spreadsheets.get({ spreadsheetId });

  if (!res.data.sheets || res.data.sheets.length === 0) {
    throw new Error('No se encontraron hojas en el documento');
  }

  const tabs = res.data.sheets || [];

  const result: SheetData = {};

  for (const tab of tabs) {
    const tabName = tab.properties?.title;
    if (!tabName) continue;

    const range = `${tabName}!A1:Z1000`;
    const res = await sheets.spreadsheets.values.get({ spreadsheetId, range });
    const rows = res.data.values || [];

    result[tabName] = rows;
    console.log(`✅ Leídas ${rows.length} filas de "${tabName}"`);
  }
  return result;
};

const updateSheetWithCoordinates = async (tabName, spreadsheetId, updates) => {
  const sheets = google.sheets({ version: 'v4', auth });

  const values = updates.map(([coords]) => coords);
  const range = `${tabName}!L2:N${values.length + 1}`;

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption: 'RAW',
    requestBody: { values },
  });

  console.log(`✅ Coordenadas agregadas para ${values.length} filas`);
};
