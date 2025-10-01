import { info } from 'console';
import { updateRowInSheet } from '../../helpers/gsheet';

const sheetId: string =
  process.env.GSHEET_ID_FUGITIVOS ||
  '1fbcqSADitew_25zAlkHmJyhoLayDRhSFpXy25wgMjpk';

const getTitleById = (id: string, competitions: any) => {
  const competition = competitions.find((item: any) => item.id === id);
  return competition ? competition.title : '-';
};

const transformDate = (date: string) => {
  if (date) {
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  } else {
    return '-';
  }
};

export const getData = async (data: any, status: string) => {
  // console.log('Updating data with status:', data);
  const dataUpdate: any = {
    status: status,
    captureType: data.captureType || '-',
    clientName: data.clientName || '-',
    nit: data.nit || data.clientNit || '-',
    depto: data.depto || '-',
    town: data.town || '-',
    address: data.address || '-',
    zone: data.zone || '-',
    segment: data.segment || '-',
    managerName: data.managerName || '-',
    contactPhone: data.contactPhone || '-',
    contactEmail: data.contactEmail || '-',
    creationDate: `${data.creationDate}` || '-',
    sid: data.sid || '',
    visitDate: `${transformDate(data.visitDate)}` || '-',
    noFound: data.noFound || '-',
    client: data.client || '-',
    portafolioStatus: data.portafolioStatus ? true : false,
    portafolio: data.portafolio || '-',
    u3m: data.u3m || '-',
    lastMonth: data.lastMonth || '-',
    portafolioDetails: data.portafolioDetails || '-',
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
    CAP6M:
      Array.isArray(data.training) &&
      data.training.find(
        (element: string) => element === 'Capacitación últimos 6 meses'
      )
        ? true
        : false,
    tradeMarketingSelected: data.tradeMarketingSelected || '-',
    quantitytradeMarketing: data.quantitytradeMarketing || '-',
    additionalMaterial: data.additionalMaterial ? true : false,
    additionalMaterialSelected: data.additionalMaterialSelected || '-',
    quantityAdditionalMaterial: data.quantityAdditionalMaterial || '-',
    'Comentarios de la requisición': data.tradeMarketingMaterial || '-',
    'Tiene Competencia 1': data.hasCompetition1
      ? getTitleById('competition_1', data.competitionOptions)
      : false,
    'Tiene Competencia 2': data.hasCompetition2
      ? getTitleById('competition_2', data.competitionOptions)
      : false,
    'Tiene Competencia 3': data.hasCompetition3
      ? getTitleById('competition_3', data.competitionOptions)
      : false,
    'Tiene Competencia 4': data.hasCompetition4
      ? getTitleById('competition_4', data.competitionOptions)
      : false,
    'Tiene Competencia 5': data.hasCompetition5
      ? getTitleById('competition_5', data.competitionOptions)
      : false,
    'Tiene Otro Licor': data.otherSpiritDrink || '-',
    'Precio Competencia 1': data.competitionPrice1 || '-',
    'Precio Competencia 2': data.competitionPrice2 || '-',
    'Precio Competencia 3': data.competitionPrice3 || '-',
    'Precio Competencia 4': data.competitionPrice4 || '-',
    'Precio Competencia 5': data.competitionPrice5 || '-',
    'Precio Otro Licor': data.priceOtherSpiritDrink || '-',
    'Cantidad Competencia 1': data.competitionQty1 || '-',
    'Cantidad Competencia 2': data.competitionQty2 || '-',
    'Cantidad Competencia 3': data.competitionQty3 || '-',
    'Cantidad Competencia 4': data.competitionQty4 || '-',
    'Cantidad Competencia 5': data.competitionQty5 || '-',
    'Cantidad Otro Licor': data.qtyOtherSpiritDrink || '-',
    generalComments: data.generalComments || '-',
    generalExperience: data.generalExperience || '-',
    saleCompleted: data.saleCompleted === 'si' ? true : false,
    agreedBottlesCount: data.agreedBottlesCount || '-',
    closureReason: data.closureReason || '-',
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
    columnName: 'uniqueId',
    valueToMatch: `${data.uuid}`,
    updates: dataUpdate,
  };

  console.log(
    `Updating data for uuid ${data.uuid} with captureType ${JSON.stringify(
      info
    )}`
  );

  return await updateRowInSheet(info);
};
