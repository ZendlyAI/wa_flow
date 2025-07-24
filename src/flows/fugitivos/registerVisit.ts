import { getGSheetTabsByID } from '../../helpers/gsheet';
import {
  extractChannelsAndItems,
  mapToObjectsByProps,
  sumTotalCartera,
} from '../../utils';

const sheetId: string =
  process.env.GSHEET_ID_FUGITIVOS ||
  '1fbcqSADitew_25zAlkHmJyhoLayDRhSFpXy25wgMjpk';

const formatearPesosColombianosSinSimbolo = (numero: number) => {
  return numero.toLocaleString('es-CO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const generatePorfafolioDetails = (data: any) => {
  let text = `Total de facturas pendientes: ${data.length}\n\n`;

  data.forEach((item: any) => {
    text += `Número de factura: ${item.Documento}\n`;
    text += `Fecha de vencimiento: ${item['Fecha vencimiento']}\n`;

    // Detectar el rango de mora con valor > 0
    const rangos = [
      '0 - 8 Días',
      '8 - 30 Días de Mora',
      '31 - 60 Días de Mora',
      '61 - 90 Días de Mora',
      'Más de 90 Días de Mora',
      'Más de 365 Días de Mora',
    ];

    let rangoMora = '';
    let valor = '';

    for (const rango of rangos) {
      const monto = (item[rango] || '0').replace(/[\$, ]/g, ''); // quitar $ y espacios
      if (parseFloat(monto) > 0) {
        rangoMora = rango;
        valor = item[rango];
        break; // Solo tomar el primer rango con monto > 0
      }
    }

    text += `Rango mora: ${rangoMora}\n`;
    text += `Valor: ${valor}\n\n`;
  });

  return text;
};

export const getData = async (data: any) => {
  delete data.nearbyStores;

  const tabs = await getGSheetTabsByID(sheetId, 'SID', data.sid);

  const store = tabs['bd_tiendas'];
  const commercialPlan = mapToObjectsByProps(tabs['rutero'], [
    'PLAN',
    'VENTA',
    'GAP',
    'PALANCA',
  ]);

  const portafolioStatus = mapToObjectsByProps(tabs['gestor_de_cartera'], [
    'Total cartera',
    'Documento',
    'Fecha vencimiento',
    '0 - 8 Días',
    '8 - 30 Días de Mora',
    '31 - 60 Días de Mora',
    '61 - 90 Días de Mora',
    'Más de 90 Días de Mora',
    'Más de 365 Días de Mora',
  ]);
  // console.log('portafolioStatus', portafolioStatus);

  const sumTotal = sumTotalCartera(portafolioStatus);
  // console.log('sumTotal', `$${formatearPesosColombianosSinSimbolo(sumTotal)}`);

  const portafolioDetails = generatePorfafolioDetails(portafolioStatus);
  // console.log('portafolioDetails', portafolioDetails);

  const U3M = 'Avg Compra U3M';
  const lastMonth = 'Month Last Purchase';

  // TODO: UNCOMMENT
  // console.log(tabs['base general'])
  // const generalInputs: any = mapToObjectsByProps(tabs['base general'], [
  //   U3M,
  //   lastMonth,
  // ]);
  const generalInputs = [
    { 'Avg Compra U3M': '27.43', 'Month Last Purchase': 'Julio 2025' },
  ];
  console.log('generalInputs', generalInputs);
  // TODO: UNCOMMENT

  return {
    ...data,
    store,
    commercialPlan: commercialPlan[0],
    portafolioStatus: sumTotal > 0 ? true : false,
    portafolio: `$${formatearPesosColombianosSinSimbolo(sumTotal)}`,
    u3m: generalInputs[0][U3M] || [],
    lastMonth: generalInputs[0][lastMonth] || [],
    portafolioDetails,
  };
};
