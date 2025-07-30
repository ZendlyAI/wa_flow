import { info } from 'console';
import { updateRowInSheet } from '../../helpers/gsheet';

const sheetId: string =
  process.env.GSHEET_ID_FUGITIVOS ||
  '1fbcqSADitew_25zAlkHmJyhoLayDRhSFpXy25wgMjpk';

export const getData = async (data: any, status: string) => {
  const dataUpdate: any = {
    status: status,
    captureType: data.captureType || '-',
    clientName: data.clientName || '-',
    nit: data.nit || data.clientNit || '-',
    depto: data.depto || '-',
    address: data.address || '-',
    zone: data.zone || '-',
    segment: data.segment || '-',
    managerName: data.managerName || '-',
    contactPhone: data.contactPhone || '-',
    contactEmail: data.contactEmail || '-',
    creationDate: data.creationDate || '-',
    sid: data.sid || '',
    visitDate: data.visitDate || '-',
    noFound: data.noFound || '-',
    client: data.client || '-',
    portafolioStatus: data.portafolioStatus ? true : false,
    portafolio: data.portafolio || '-',
    u3m: data.u3m || '-',
    lastMonth: data.lastMonth || '-',
    situationExpressed: data.situationExpressed || '-',
    leverPresented: data.leverPresented === 'si' ? true : false,
    salesLeverSelected: data.salesLeverSelected || '-',
    aceptedLever: data.aceptedLever === 'si' ? true : false,
    comments: data.comments || '-',
    bottlesCount: data.bottlesCount || '-',
    quantityOpenBottles: data.quantityOpenBottles || '-',
    openBottles: data.openBottles === 'si' ? true : false,
    coctel:
      Array.isArray(data.executionSelected) &&
      data.executionSelected.find((element: string) => element === 'Coctel')
        ? true
        : false,
    menu:
      Array.isArray(data.executionSelected) &&
      data.executionSelected.find((element: string) => element === 'Menú')
        ? true
        : false,
    CAP6M:
      Array.isArray(data.executionSelected) &&
      data.executionSelected.find(
        (element: string) => element === 'Capacitación últimos 6 meses'
      )
        ? true
        : false,
    BACKBAR:
      Array.isArray(data.executionSelected) &&
      data.executionSelected.find(
        (element: string) => element === 'Visibilidad en barra'
      )
        ? true
        : false,
    shots:
      Array.isArray(data.executionSelected) &&
      data.executionSelected.find((element: string) => element === 'Shots')
        ? true
        : false,
    tradeMarketingMaterial: data.tradeMarketingMaterial || '-',
    tradeMarketingSelected: data.tradeMarketingSelected || '-',
    quantitytradeMarketing: data.quantitytradeMarketing || '-',
    hasManoDeBuey: data.hasManoDeBuey ? true : false,
    hasVicheDioses: data.hasVicheDioses ? true : false,
    hasVicheCanao: data.hasVicheCanao ? true : false,
    hasVicheLaEsperanza: data.hasVicheLaEsperanza ? true : false,
    otherViche: data.otherViche || '-',
    'Precio Mano de Buey': data.screen_2_Precio_Mano_de_Buey_0 || '-',
    'Precio Viche Dioses': data.screen_2_Precio_Viche_Dioses_1 || '-',
    'Precio Viche Canao': data.screen_2_Precio_Viche_Canao_2 || '-',
    'Precio La Esperanza': data.screen_2_Precio_La_Esperanza_3 || '-',
    'Precio Otro Viche': data.screen_2_Precio_Otro_Viche_4 || '-',
    'Cantidad Mano de Buey': data.screen_3_Mano_de_Buey_0 || '-',
    'Cantidad Viche Dioses': data.screen_3_Viche_Dioses_1 || '-',
    'Cantidad Viche Canao': data.screen_3_Viche_Canao_2 || '-',
    'Cantidad La Esperanza': data.screen_3_La_Esperanza_3 || '-',
    'Cantidad Otro Viche': data.screen_3_Otro_Viche_4 || '-',
    generalComments: data.generalComments || '-',
    generalExperience: data.generalExperience || '-',
    saleCompleted: data.saleCompleted === 'si' ? true : false,
    agreedBottlesCount: data.agreedBottlesCount || '-',
    userLocation: JSON.stringify(data.userLocation) || '-',
    userLocationStr:
      data.userLocation &&
      typeof data.userLocation.latitude !== 'undefined' &&
      typeof data.userLocation.longitude !== 'undefined'
        ? `https://www.google.com/maps?q=${data.userLocation.latitude},${data.userLocation.longitude}`
        : '-',
    images: JSON.stringify(data.images) || '-',
  };

  const info = {
    spreadsheetId: sheetId,
    sheetName: 'Data',
    columnName: 'id',
    valueToMatch: `${data.taskId}`,
    updates: dataUpdate,
  };

  console.log(
    `Updating data for taskId ${data.taskId} with captureType ${JSON.stringify(
      info
    )}`
  );

  return await updateRowInSheet(info);
};
