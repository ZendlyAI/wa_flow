import { findRowById } from '../../utils';
import { getGSheetTabsByID } from '../../helpers/gsheet';
const sheetId: string =
  process.env.GSHEET_ID_FUGITIVOS ||
  '1fbcqSADitew_25zAlkHmJyhoLayDRhSFpXy25wgMjpk';
export const getData = async (data: any) => {
  const clientSelect = findRowById(data.store, 'SID', data.sid) || [];
  console.log(`✅ Cliente seleccionado: ${JSON.stringify(clientSelect)}`);
  const tabs = await getGSheetTabsByID(sheetId, 'SID', data.sid);
  const specificAction =
    findRowById(tabs['Cartera_por_cluster_importrange'], 'SID', data.sid) || [];
  console.log(
    `✅ specificAction seleccionado: ${JSON.stringify(specificAction)}`
  );
  console.log(`✅ specificAction seleccionado: ${specificAction[23]}`);
  if (data.noFound) {
    // clean data
  }
  return {
    ...data,
    client: clientSelect[4] || '',
    specificAction: specificAction[23] || '',
  };
};
