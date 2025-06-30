import { getGSheetTabs } from '../../helpers/gsheet';

const sheetId: string =
  process.env.GSHEET_ID2 || '1nf7963AIOHFuKwdpFcAfxZsRWdSX60TXynweYJtzN2Q';

export const getData = async (data: any) => {
  const tabs = await getGSheetTabs(sheetId);

  // Check if the "Tiendas" tab exists
  if (!tabs || !tabs['Tiendas']) {
    throw new Error('No "Tiendas" tab found in the Google Sheet');
  }

  const stores = tabs['Tiendas'];
  console.log(
    `Found ${stores.length} stores in the "Tiendas" tab` +
      JSON.stringify(stores)
  );

  return {
    ...data,
    stores: stores,
  };
};
