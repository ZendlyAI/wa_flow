import { getGSheetTabsByID } from '../../helpers/gsheet';
import {
  extractChannelsAndItems,
  mapToObjectsByProps,
  sumTotalCartera,
} from '../../utils';

const sheetId: string = '1fbcqSADitew_25zAlkHmJyhoLayDRhSFpXy25wgMjpk';

const formatearPesosColombianosSinSimbolo = (numero: number) => {
  return numero.toLocaleString('es-CO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const getData = async (data: any) => {
  delete data.nearbyStores;

  const tabs = await getGSheetTabsByID(sheetId, 'SID', data.sid);

  const store = tabs['bd_tiendas'];
  const commercialPlan = mapToObjectsByProps(tabs['rutero'], [
    'PLAN',
    'VENTA',
    'GAP',
  ]);

  const portafolioStatus = mapToObjectsByProps(tabs['gestor_de_cartera'], [
    'Total cartera',
  ]);

  console.log('portafolioStatus', portafolioStatus);

  const sumTotal = sumTotalCartera(portafolioStatus);
  console.log('sumTotal', sumTotal);
  console.log('sumTotal', `$${formatearPesosColombianosSinSimbolo(sumTotal)}`);

  const salesLevers: any = extractChannelsAndItems(tabs['Palanca comercial']);

  return {
    ...data,
    store,
    commercialPlan: commercialPlan[0],
    portafolioStatus: sumTotal > 0 ? true : false,
    portafolio: `$${formatearPesosColombianosSinSimbolo(sumTotal)}`,
    salesLevers: salesLevers['Palanca'] || [],
  };
};
