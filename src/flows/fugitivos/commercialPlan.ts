import { findRowById } from '../../utils';
import { getGSheetTabsByID } from '../../helpers/gsheet';
const sheetId: string =
  process.env.GSHEET_ID_FUGITIVOS ||
  '1fbcqSADitew_25zAlkHmJyhoLayDRhSFpXy25wgMjpk';
export const getData = async (data: any) => {
  const clientSelect = findRowById(data.store, 'SID', data.sid) || [];
  console.log(`✅ Cliente seleccionado: ${JSON.stringify(clientSelect)}`);
  if (data.noFound) {
    // clean data
  }
  return {
    ...data,
    client: clientSelect[4] || ''  };
};
