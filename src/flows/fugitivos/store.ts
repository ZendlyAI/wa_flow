import { getGSheetTabs } from '../../helpers/gsheet';

import { extractIdTitleArray } from '../../utils';

const sheetId: string = '1fbcqSADitew_25zAlkHmJyhoLayDRhSFpXy25wgMjpk';

export const getData = async (data: any) => {
  const tabs = await getGSheetTabs(sheetId);

  // Check if the "Tiendas" tab exists
  if (!tabs || !tabs['bd_tiendas']) {
    throw new Error('No "Tiendas" tab found in the Google Sheet');
  }

  const stores = extractIdTitleArray(
    tabs['Tiendas'],
    'NOMBRE COMERCIAL',
    'NOMBRE COMERCIAL'
  );

  return {
    ...data,
    stores: stores.slice(0, 25),
  };
};
