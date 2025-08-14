import { handleMedia } from '../../helpers/media';
import { uploadBuffer } from '../../helpers/gstorage';
const saveImages = async (photoPicker: any) => {
  const mediaPayload = photoPicker;
  console.log(JSON.stringify(mediaPayload));
  const imagesUrls: string[] = [];
  try {
    for (const item of mediaPayload as any[]) {
      const data = await handleMedia(item);
      // console.log('📸 Saving image:', data);
      // require('fs').writeFileSync(item.file_name, data);
      imagesUrls.push(await uploadBuffer(data, item.file_name));
    }
  } catch (err) {
    console.error('❌ Error:', err);
  }

  return imagesUrls;
};

const generateRichTextFromData = (data: any) => {
  if (!data || typeof data !== 'object') return ['No hay datos disponibles.'];

  const safe = (key: keyof typeof data, fallback: string = 'N/A') =>
    data[key] !== undefined && data[key] !== null && data[key] !== ''
      ? data[key]
      : fallback;

  return [
    '# Resumen de Visita',
    '## Información del Cliente',
    `- **SID:** ${safe('sid')}`,
    `- **Nombre del cliente:** ${safe('client')}`,
    `- **Cliente nuevo:** ${safe('clientName')}`,
    `- **NIT:** ${safe('nit')}`,
    `- **Departamento:** ${safe('depto')}`,
    `- **Municipio:** ${safe('town')}`,
    `- **Dirección:** ${safe('address')}`,
    `- **Zona:** ${safe('zone')}`,
    `- **Segmento:** ${safe('segment')}`,
    `- **Encargado/a:** ${safe('managerName')}`,
    `- **Teléfono de contacto:** ${safe('contactPhone')}`,
    `- **Correo electrónico:** ${safe('contactEmail')}`,
    `- **Fecha de visita/creación:** ${safe('creationDate')}`,
    '## Detalles de la Visita',
    `- **Fecha de visita:** ${safe('visitDate')}`,
    `- **Tipo de captura:** ${safe('captureType')}`,
    `- **¿Cliente encontrado?:** ${safe('noFound')}`,
    `- **Palanca presentada?:** ${safe('leverPresented')}`,
    `- **Palanca aceptada?:** ${safe('aceptedLever')}`,
    `- **Palanca seleccionada:** ${safe('salesLeverSelected')}`,
    `- **Cantidad de botellas:** ${safe('bottlesCount')}`,
    `- **Botellas abiertas:** ${safe('openBottles')}`,
    `- **Cantidad botellas abiertas:** ${safe('quantityOpenBottles')}`,
    `- **¿Venta completada?:** ${safe('saleCompleted')}`,
    `- **Cantidad de botellas acordadas:** ${safe('agreedBottlesCount')}`,
    `- **Motivo de cierre:** ${safe('closureReason')}`,
    '## Experiencia y Comentarios',
    `- **Validación de ejecución:** ${safe('executionSelected')}`,
    `- **Capacitación:** ${safe('training')}`,
    `- **Comentarios de inventario:** ${safe('comments')}`,
    `- **Comentarios generales:** ${safe('generalComments')}`,
    `- **Experiencia general:** ${safe('generalExperience')}`,
    `- **Situación expresada por el cliente:** ${safe('situationExpressed')}`,
    '## Competencia',
    '- **¿Presencia de competidores?:**',
    `  - Competidor 1: ${safe('hasCompetition1')}`,
    `  - Competidor 2: ${safe('hasCompetition2')}`,
    `  - Competidor 3: ${safe('hasCompetition3')}`,
    `  - Competidor 4: ${safe('hasCompetition4')}`,
    `  - Competidor 5: ${safe('hasCompetition5')}`,
    '- **Cantidad por competidor:**',
    `  - 1: ${safe('competitionQty1')}, 2: ${safe(
      'competitionQty2'
    )}, 3: ${safe('competitionQty3')}, 4: ${safe('competitionQty4')}, 5: ${safe(
      'competitionQty5'
    )}`,
    '- **Precios por competidor:**',
    `  - 1: ${safe('competitionPrice1')}, 2: ${safe(
      'competitionPrice2'
    )}, 3: ${safe('competitionPrice3')}, 4: ${safe(
      'competitionPrice4'
    )}, 5: ${safe('competitionPrice5')}`,
    '## Otro Licor',
    `- **Licor:** ${safe('otherSpiritDrink')}`,
    `- **Cantidad:** ${safe('qtyOtherSpiritDrink')}`,
    `- **Precio:** ${safe('priceOtherSpiritDrink')}`,
    '## Trade Marketing',
    `- **Trade Marketing seleccionado:** ${safe('tradeMarketingSelected')}`,
    `- **Cantidad:** ${safe('quantitytradeMarketing')}`,
    `- **Material Adicional:** ${safe('additionalMaterial')}`,
    `- **Material:** ${safe('additionalMaterialSelected')}`,
    `- **Cantidad:** ${safe('quantityAdditionalMaterial')}`,
    `- **Comentarios de la requisición:** ${safe('tradeMarketingMaterial')}`,
    '## Portafolio',
    `- **Portafolio:** ${safe('portafolio')}`,
    `- **Estado del portafolio:** ${safe('portafolioStatus')}`,
    '## Otros datos',
    `- **Último mes (ventas):** ${safe('lastMonth')}`,
    `- **U3M (últimos 3 meses):** ${safe('u3m')}`,
  ];
};

export const getData = async (data: any) => {
  const images = await saveImages(data.photoPicker);

  return {
    ...data,
    images,
    summary: generateRichTextFromData(data),
  };
};
