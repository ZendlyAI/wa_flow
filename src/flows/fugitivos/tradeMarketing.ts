import { getGSheetByTab } from '../../helpers/gsheet';

const sheetId: string =
  process.env.GSHEET_ID_FUGITIVOS ||
  '1fbcqSADitew_25zAlkHmJyhoLayDRhSFpXy25wgMjpk';

type Item = {
  id: string;
  title: string;
};

const extractItems = (data: string[][], input: string) => {
  const [headers, ...rows] = data;
  const inputIndex = headers.indexOf(input);
  
  if (inputIndex === -1) {
    throw new Error(`Input "${input}" not found in headers.`);
  }

  // Initialize a map for each item
  const items: Item[] = [];

  rows.forEach((row, index) => {
    if (row[inputIndex]) {
      items.push({
        id: 'competition_' + (index + 1).toString(),
        title: row[inputIndex],
      });
    }
  });

  return items;
};

export const getData = async (data: any) => {
  const tab: any = await getGSheetByTab(sheetId, 'Inputs');
  const inputs: any = extractItems(tab, 'COMPETENCIA');
  console.log('Extracted inputs:', inputs);
  return {
    ...data,
    competitionOptions: inputs.slice(0, 5) || [],
  };
};
