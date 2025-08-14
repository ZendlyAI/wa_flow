import { getGSheetByTab } from '../../helpers/gsheet';

import { extractChannelsAndItems } from '../../utils';

const sheetId: string =
  process.env.GSHEET_ID_FUGITIVOS ||
  '1fbcqSADitew_25zAlkHmJyhoLayDRhSFpXy25wgMjpk';

export const getData = async (data: any) => {
  const tab: any = await getGSheetByTab(sheetId, 'Inputs');
  const salesLevers: any = extractChannelsAndItems(tab);
  console.log('salesLevers', salesLevers['PALANCAS PREDETERMINADAS']);

  return {
    ...data,
    salesLevers: salesLevers['PALANCAS PREDETERMINADAS'] || [],
  };
};
