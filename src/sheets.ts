// src/sheets.ts
import { google } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';

// Carga las credenciales de la service account
const CREDENTIALS_PATH = path.join(__dirname, '../zendly-ai-1ad854c8de83.json');
console.log(`Cargando credenciales desde: ${CREDENTIALS_PATH}`);
const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf-8'));

export async function leerHoja(
  spreadsheetId: string,
  tabName: string
): Promise<string[][]> {
  const auth = new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  console.log(auth);

  const sheets = google.sheets({ version: 'v4', auth });
  console.log(sheets);

  const range = `${tabName}!A1:Z1000`;
  const res = await sheets.spreadsheets.values.get({ spreadsheetId, range });

  console.log(res.data.values || []);
  return res.data.values || [];
}

leerHoja('1a8wbNU5PwXrjNQ2dtX4daUEIKRgyaWExiNnGeFoN7EA', 'Tiendas')
  .then((data) => {
    console.log('Datos leídos de la hoja:', data);
  })
  .catch((error) => {
    console.error('Error al leer la hoja:', error);
  });
