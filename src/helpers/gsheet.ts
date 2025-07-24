import { google } from 'googleapis';

interface BuscarEnGSheetResult {
  [key: string]: string;
}

interface SheetData {
  [tabName: string]: string[][];
}

const tabsRead = [
  'Inputs',
  'base general',
  'bd_tiendas',
  'rutero',
  'gestor_de_cartera',
  'vendedores',
  'Palanca comercial',
];

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

    if (!tabName || !tabsRead.includes(tabName)) continue;

    const range = `${tabName}!A1:Z1000`;
    const res = await sheets.spreadsheets.values.get({ spreadsheetId, range });
    const rows = res.data.values || [];

    result[tabName] = rows;
    console.log(`✅ Leídas ${rows.length} filas de "${tabName}"`);
  }
  return result;
};

export const updateSheetWithCoordinates = async (
  tabName: string,
  spreadsheetId: string,
  updates: any
) => {
  const sheets = google.sheets({ version: 'v4', auth });

  // Armar el rango para escribir LAT y LNG en columnas L, M y N
  const values = updates.map(([address]: any) => address);
  const range = `${tabName}!L2:N${values.length + 1}`;

  const res = await sheets.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption: 'RAW',
    requestBody: { values },
  });

  console.log(`✅ Coordenadas actualizadas para ${values.length} filas`);
  console.log(`✅ Rango actualizado: ${res.data.updatedRange}`);
  console.log(
    `🔢 Filas: ${res.data.updatedRows}, Columnas: ${res.data.updatedColumns}, Celdas: ${res.data.updatedCells}`
  );
};

export const getGSheetTabsByID = async (
  spreadsheetId: string,
  ID: string,
  value: string
) => {
  const sheets = google.sheets({ version: 'v4', auth });
  const res = await sheets.spreadsheets.get({ spreadsheetId });

  if (!res.data.sheets || res.data.sheets.length === 0) {
    throw new Error('No se encontraron hojas en el documento');
  }

  const tabs = res.data.sheets || [];

  const result: SheetData = {};

  for (const tab of tabs) {
    const tabName = tab.properties?.title;
    if (!tabName || !tabsRead.includes(tabName)) continue;

    const range =
      tabName === 'base general'
        ? `${tabName}!A1:BF1000`
        : `${tabName}!A1:Z1000`;

    const res = await sheets.spreadsheets.values.get({ spreadsheetId, range });
    let rows = res.data.values || [];
    const header = rows[0];

    // Buscar por SID
    const sidIndex = rows[0].indexOf(ID);
    // console.log(`🔍 Buscando "${sidIndex} en "${tabName}"`);
    let match = [];
    if (sidIndex >= 0) {
      rows = rows.slice(1); // omitir encabezado

      match = rows.filter((row) => row[sidIndex] === value) || [];
      result[tabName] = [header, ...match];
    } else {
      result[tabName] = rows;
    }

    console.log(`✅ Leídas ${result[tabName].length} filas de "${tabName}"`);
  }
  return result;
};

export const getGSheetByTab = async (
  spreadsheetId: string,
  tabName: string
) => {
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });

  if (!spreadsheet.data.sheets || spreadsheet.data.sheets.length === 0) {
    throw new Error('No se encontraron hojas en el documento');
  }

  const range =
    tabName === 'base general' ? `${tabName}!A1:BF1000` : `${tabName}!A1:Z1000`;
  const res = await sheets.spreadsheets.values.get({ spreadsheetId, range });
  const rows = res.data.values || [];

  console.log(`✅ Leídas ${rows.length} filas de "${tabName}"`);

  return rows;
};
