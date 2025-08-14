import { getGSheetByTab } from '../../helpers/gsheet';

import { extractChannelsAndItems } from '../../utils';

const sheetId: string =
  process.env.GSHEET_ID_FUGITIVOS ||
  '1fbcqSADitew_25zAlkHmJyhoLayDRhSFpXy25wgMjpk';

export const getData = async (data: any) => {
  const tab: any = await getGSheetByTab(sheetId, 'Inputs');
  const inputs: any = extractChannelsAndItems(tab);
  console.log('tradeMarketingPlan', inputs['MATERIAL TRADE MARKETING']);

  console.log('closureReasonOptions', inputs['MOTIVOS DE NO VENTA']);

  return {
    ...data,
    tradeMarketingPlan: inputs['MATERIAL TRADE MARKETING'] || [],
    closureReasonOptions: inputs['MOTIVOS DE NO VENTA'] || [],
  };
};
