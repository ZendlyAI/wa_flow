const { google } = require('googleapis');
import credentials from '../../zendly-ai-1ad854c8de83.json';

interface BuscarEnGSheetResult {
  [key: string]: string;
}

export const search = async (
  spreadsheetId: string,
  tabName: string,
  columna: string,
  valor: string
) => {
  const jwtClient = new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  const sheets = google.sheets({ version: 'v4', auth: jwtClient });
  const range = `${tabName}!A1:Z1000`;
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });

  const rows: string[][] | undefined = response.data.values;
  if (!rows || rows.length < 2) return [];

  const headers: string[] = rows[0];
  const data: string[][] = rows.slice(1);
  const colIndex: number = headers.indexOf(columna);
  if (colIndex === -1) throw new Error(`Columna "${columna}" no encontrada`);

  const resultados: BuscarEnGSheetResult[] = data
    .filter(
      (row) => (row[colIndex] || '').toLowerCase() === valor.toLowerCase()
    )
    .map((row) => {
      const obj: BuscarEnGSheetResult = {};
      headers.forEach((h, i) => {
        obj[h] = row[i] || '';
      });
      return obj;
    });

  return resultados;
};
