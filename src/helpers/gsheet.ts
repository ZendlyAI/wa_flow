import { google } from 'googleapis';

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
  'departamentos_municipios_input',
  'Cartera_por_cluster_importrange',
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
  const sheetMeta = await sheets.spreadsheets.get({ spreadsheetId });

  if (!sheetMeta.data.sheets || sheetMeta.data.sheets.length === 0) {
    throw new Error('No se encontraron hojas en el documento');
  }

  const tabs = sheetMeta.data.sheets || [];
  const result: SheetData = {};

  for (const tab of tabs) {
    const tabName = tab.properties?.title;
    if (!tabName || !tabsRead.includes(tabName)) continue;

    // console.log(`🔍 Buscando en la pestaña: ${tabName}`);

    const range =
      tabName === 'base general' ||
      tabName === 'Cartera_por_cluster_importrange'
        ? `${tabName}!A1:BF1000`
        : `${tabName}!A1:Z1000`;

    const valuesRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });
    const rows = valuesRes.data.values || [];
    const header = rows[0];

    if (!header) {
      result[tabName] = [];
      continue;
    }

    const sidIndex = header.indexOf(ID);
    // console.log(
    //   `🔍 Buscando "${value}" en columna "${ID}" (index: ${sidIndex}) de "${tabName}"`
    // );

    if (sidIndex >= 0) {
      const match = rows.slice(1).filter((row) => row[sidIndex] === value);
      result[tabName] = [header, ...match];
    } else {
      result[tabName] = rows;
    }

    console.log(`✅ Leídas ${result[tabName].length} filas de "${tabName}"`);
  }
  
  console.log('spreadsheet leido');
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
    tabName === 'base general'
      ? `${tabName}!A1:BF2000`
      : `${tabName}!A1:BF2000`;
  const res = await sheets.spreadsheets.values.get({ spreadsheetId, range });
  const rows = res.data.values || [];

  console.log(`✅ Leídas ${rows.length} filas de "${tabName}"`);

  return rows;
};

export const updateRowInSheet = async ({
  spreadsheetId,
  sheetName,
  columnName,
  valueToMatch,
  updates,
}: {
  spreadsheetId: string;
  sheetName: string;
  columnName: string;
  valueToMatch: string;
  updates: any;
}) => {
  const sheets = google.sheets({ version: 'v4', auth });

  const range = `${sheetName}!A1:Z2000`;
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });
  const rows = response.data.values || [];

  if (rows.length === 0) throw new Error('La hoja está vacía');

  let headers = rows[0];
  const columnIndex = headers.indexOf(columnName);
  // console.log(`🔍 Buscando columna "${columnName}" en "${sheetName}" = ${columnIndex}`);

  if (columnIndex === -1)
    throw new Error(`La columna "${columnName}" no existe`);

  // Buscar fila
  let matchedRowIndex = -1;
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][columnIndex] === valueToMatch) {
      matchedRowIndex = i + 1;
      break;
    }
  }
  // console.log(
  //   `Actualizando fila ${matchedRowIndex} en la hoja "${sheetName}" con valor "${valueToMatch}"`
  // );

  if (matchedRowIndex === -1) {
    throw new Error(
      `No se encontró la fila con valor "${valueToMatch}" en la columna "${columnName}"`
    );
  }

  const currentRow = rows[matchedRowIndex - 1] || [];
  let updatedRow = [...currentRow];

  // Revisar si hay columnas nuevas que no existen
  let headersModified = false;
  for (const newColumn of Object.keys(updates)) {
    if (!headers.includes(newColumn)) {
      headers.push(newColumn);
      headersModified = true;
    }
  }

  // Expandir fila para tener todas las columnas
  updatedRow.length = headers.length;

  // Asignar nuevos valores
  for (const [col, newVal] of Object.entries(updates)) {
    const colIndex = headers.indexOf(col);
    updatedRow[colIndex] = newVal;
  }

  const requests = [];

  // Si se modificaron encabezados, actualiza la fila 1
  if (headersModified) {
    requests.push({
      updateCells: {
        range: {
          sheetId: 0,
          startRowIndex: 0,
          endRowIndex: 1,
        },
        rows: [
          {
            values: headers.map((header) => ({
              userEnteredValue: { stringValue: header },
            })),
          },
        ],
        fields: '*',
      },
    });
  }

  // Actualizar fila modificada
  const updateRange = `${sheetName}!A${matchedRowIndex}`;
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: updateRange,
    valueInputOption: 'RAW',
    requestBody: {
      values: [updatedRow],
    },
  });

  // Si modificamos encabezado, actualizamos también la fila 1
  if (headersModified) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!A1`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [headers],
      },
    });
  }

  return {
    row: updatedRow,
    modifiedHeaders: headersModified,
  };
};
