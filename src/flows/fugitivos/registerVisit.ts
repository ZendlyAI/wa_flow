import { getGSheetTabsByID } from '../../helpers/gsheet';
import {
  extractChannelsAndItems,
  mapToObjectsByProps,
  sumTotalCartera,
} from '../../utils';

const sheetId: string =
  process.env.GSHEET_ID_FUGITIVOS ||
  '1fbcqSADitew_25zAlkHmJyhoLayDRhSFpXy25wgMjpk';

interface CommercialPlan {
  PLAN: string;
  VENTA: string;
  GAP: string;
  PALANCA: string;
  'PROMEDIO 3 ULTIMOS MESES': string;
  'MES ULTIMA COMPRA': string;
  'MATERIAL SUGERIDO POR TIPOLOGIA': string;
  MATERIAL: string;
}

interface PortafolioItem {
  Documento: string;
  'Fecha vencimiento': string;
  '0 - 8 Días': string;
  '8 - 30 Días de Mora': string;
  '31 - 60 Días de Mora': string;
  '61 - 90 Días de Mora': string;
  'Más de 90 Días de Mora': string;
  'Más de 365 Días de Mora': string;
}

const formatearPesosColombianosSinSimbolo = (numero: number) => {
  return numero.toLocaleString('es-CO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const generatePortafolioDetails = (data: any) => {
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
      const rawValue = item[rango];
      const monto =
        typeof rawValue === 'string'
          ? rawValue.replace(/[\$, ]/g, '')
          : String(rawValue || 0);

      if (parseFloat(monto) > 0) {
        rangoMora = rango;
        valor = item[rango];
        break;
      }
    }

    text += `Rango mora: ${rangoMora}\n`;
    text += `Valor: ${valor}\n\n`;
  });

  return text;
};

const commercialPlanSummary = (data: any) => {
  if (!data || typeof data !== 'object') return ['No hay datos disponibles.'];

  const safe = (key: keyof typeof data, fallback: string = 'N/A') =>
    data[key] !== undefined && data[key] !== null && data[key] !== ''
      ? data[key]
      : fallback;

  return [
    '# Plan comercial',
    `**Plan:** ${safe('PLAN')}`,
    `**Venta:** ${safe('VENTA')}`,
    `**Gap:** ${safe('GAP')}`,
    `**Promedio de compra últimos 3 meses:** ${safe(
      'PROMEDIO 3 ULTIMOS MESES'
    )}`,
    `**Mes de última compra:** ${safe('MES ULTIMA COMPRA')}`,
  ];
};

export const getData = async (data: any) => {
  delete data.nearbyStores;

  const tabs: any = await getGSheetTabsByID(sheetId, 'SID', data.sid);

  if (
    !tabs ||
    !tabs['bd_tiendas'] ||
    !tabs['rutero'] ||
    !tabs['gestor_de_cartera']
  ) {
    throw new Error('Datos incompletos desde Google Sheets');
  }

  const store = tabs['bd_tiendas'];
  let commercialPlan: CommercialPlan[] = mapToObjectsByProps(tabs['rutero'], [
    'PLAN',
    'VENTA',
    'GAP',
    'PALANCA',
    'PROMEDIO 3 ULTIMOS MESES',
    'MES ULTIMA COMPRA',
    'MATERIAL SUGERIDO POR TIPOLOGIA',
  ]);
  // console.log('commercialPlan', commercialPlan);
  if (!commercialPlan || commercialPlan.length === 0) {
    console.log('No se encontró el plan comercial para la tienda');
    commercialPlan = [
      {
        PLAN: '-',
        VENTA: '-',
        GAP: '-',
        PALANCA: '-',
        'PROMEDIO 3 ULTIMOS MESES': '-',
        'MES ULTIMA COMPRA': '-',
        'MATERIAL SUGERIDO POR TIPOLOGIA': '-',
        MATERIAL: '-',
      },
    ];
  }
  const summary = commercialPlanSummary(commercialPlan[0]);
  commercialPlan[0].MATERIAL =
    commercialPlan[0]['MATERIAL SUGERIDO POR TIPOLOGIA'] || '-';

  // console.log('summary', summary);

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

  const portafolioDetails = generatePortafolioDetails(portafolioStatus);
  // console.log('portafolioDetails', portafolioDetails);

  data = {
    ...data,
    store,
    commercialPlan: commercialPlan[0],
    portafolioStatus: sumTotal > 0 ? true : false,
    portafolio: `$${formatearPesosColombianosSinSimbolo(sumTotal)}`,
    u3m: commercialPlan[0]['PROMEDIO 3 ULTIMOS MESES'] || 'N/A',
    lastMonth: commercialPlan[0]['MES ULTIMA COMPRA'] || 'N/A',
    portafolioDetails,
    comercialPlanSummary: summary,
  };

  console.log('Final data for registerVisit screen:', data);

  return data;
};
