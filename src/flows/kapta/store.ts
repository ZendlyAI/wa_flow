import { getGSheetTabs } from '../../helpers/gsheet';

import { searchStoreOpenAI } from '../../helpers/openai';
import { Store } from '../../types/stores';

import { joinStores, extractChannelsAndItems } from '../../utils';

const sheetId: string =
  process.env.GSHEET_ID_KAPTA || '1a8wbNU5PwXrjNQ2dtX4daUEIKRgyaWExiNnGeFoN7EA';

export const getData = async (data: any) => {
  const tabs = await getGSheetTabs(sheetId);

  // Check if the "Tiendas" tab exists
  if (!tabs || !tabs['Tiendas']) {
    throw new Error('No "Tiendas" tab found in the Google Sheet');
  }
  if (!tabs || !tabs['Tiendas Modernas']) {
    throw new Error('No "Tiendas" tab found in the Google Sheet');
  }

  const stores = joinStores(tabs['Tiendas'], tabs['Tiendas Modernas'].slice(1));

  const query = {
    userLocation: data.userLocation,
    storeName: data.storeName,
    storeAddress: data.storeAddress,
  };

  // const searchTerm = await searchStoreOpenAI(stores, query);

  const searchTerm = {
    isMatch: false,
    matches: [
      {
        name: 'Farmatodo',
        address: 'Calle 127 #17A-19',
        location: 'Latitude 4.7042101, Longitude -74.045885',
        storeType: 'Farmacia',
        latitude: '4.7042101',
        longitude: '-74.045885',
        storeChannel: '',
      },
    ],
    suggestedStores: [
      {
        name: 'D1 Roncato',
        address: 'Calle 127#19a 25',
        location: '',
        storeType: 'Moderno',
        latitude: '',
        longitude: '',
        storeChannel: '',
      },
      {
        name: 'Farmatodo',
        address: 'Calle 127 #17A-19',
        location: 'Latitude 4.7042101, Longitude -74.045885',
        storeType: 'Farmacia',
        latitude: '4.7042101',
        longitude: '-74.045885',
        storeChannel: '',
      },
      {
        name: 'Carulla 102',
        address: '',
        location: 'Latitude 4.6874493, Longitude -74.0517004',
        storeType: 'Moderno',
        latitude: '4.6874493',
        longitude: '-74.0517004',
        storeChannel: '',
      },
      {
        name: 'Exito expres calle 97',
        address: '',
        location: 'Latitude 4.6852327, Longitude -74.0523791',
        storeType: 'Moderno',
        latitude: '4.6852327',
        longitude: '-74.0523791',
        storeChannel: '',
      },
      {
        name: 'Oxxo multicentro',
        address: '',
        location: 'Latitude 4.7022652, Longitude -74.0433096',
        storeType: 'Moderno',
        latitude: '4.7022652',
        longitude: '-74.0433096',
        storeChannel: '',
      },
    ],
  };

  const lists = extractChannelsAndItems(
    tabs['Tipos de Tienda(Clasificacion)']
  ) as {
    channels: any[];
    Moderno: any[];
    Tradicional: any[];
  };

  // const stores = await search(
  //   sheetId,
  //   'Tiendas',
  //   'name',
  //   'Mi tierra panaderia' // 'data.storeName'
  // );

  let storeMatched: {
    store?: any;
    storeChannel?: any;
    storeType?: any;
  } = {};

  let suggestedMatches: Store[] = [];

  if (searchTerm.isMatch && searchTerm.matches.length > 0) {
    // complete the channel screen data
    storeMatched.store = searchTerm.matches[0] ? searchTerm.matches[0] : {};
    storeMatched.storeChannel = searchTerm.matches[0].storeChannel;
    storeMatched.storeType = searchTerm.matches[0].storeType;
  } else {
    suggestedMatches = [
      ...(searchTerm.matches ?? []),
      ...(searchTerm.suggestedStores ?? []),
    ];
  }
  return {
    ...data,
    searchTerm: searchTerm,
    ...storeMatched,
    suggestedStores: suggestedMatches,
    channels: lists.channels,
    modernTypes: lists['Moderno'],
    traditionalTypes: lists['Tradicional'],
  };
};
