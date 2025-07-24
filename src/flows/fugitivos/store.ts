import {
  getGSheetTabs,
  updateSheetWithCoordinates,
} from '../../helpers/gsheet';
import { geocode } from '../../helpers/geocode';
import {
  extractIdTitleArray,
  mapToObjectsByProps,
  extractChannelsAndItems,
  getUniqueById,
} from '../../utils';

const sheetId: string =
  process.env.GSHEET_ID_FUGITIVOS ||
  '1fbcqSADitew_25zAlkHmJyhoLayDRhSFpXy25wgMjpk';

const toRadians = (deg: number) => {
  return deg * (Math.PI / 180);
};

const haversineDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) => {
  const R = 6371; // Radio de la Tierra en km
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};
/**
 * Devuelve tiendas ordenadas por cercanía al punto (userLat, userLng).
 * Opcionalmente filtra por radio máximo en km.
 */
const findClosestStores = (
  data: any[][],
  userLat: number,
  userLng: number,
  seller: string,
  maxDistanceKm?: number
): any[][] => {
  const header = data[0];
  const latIndex = header.indexOf('lat');
  const lngIndex = header.indexOf('lng');
  const sellerIndex = header.indexOf('seller');

  if (latIndex === -1 || lngIndex === -1) {
    throw new Error("No se encontró la columna 'lat' o 'lng' en los datos");
  }

  // console.log(`🔍 indexOf fila:  ${latIndex} and ${lngIndex} `);

  let rows = data.slice(1); // omitir encabezado

  if (seller !== '') {
    rows = rows.filter((row) => row[sellerIndex] === seller);
  }

  const rowsWithDistance = rows
    .map((row) => {
      // console.log(
      //   `🔍 Procesando fila: ${JSON.stringify(row)} in ${row[latIndex]} and ${
      //     row[lngIndex]
      //   } `
      // );
      const lat = parseFloat(String(row[latIndex]).replace(',', '.'));
      const lng = parseFloat(String(row[lngIndex]).replace(',', '.'));
      const distance = haversineDistance(userLat, userLng, lat, lng);
      return { row, distance };
    })
    .filter(
      ({ distance }) => maxDistanceKm === undefined || distance <= maxDistanceKm
    )
    .sort((a, b) => a.distance - b.distance)
    .map(({ row }) => row);

  return [header, ...rowsWithDistance];
};

const getCoordinates = async (data: any) => {
  const updates = await Promise.all(
    data.slice(1).map(async (row: any[], i: any) => {
      // console.log(`🔍 Procesando fila ${i + 1}: ${JSON.stringify(row)}`);
      const storeName = row[4] === 'Sin datos' ? '' : row[4];
      const address = row[5] || '';
      // Only skip geocoding if all three fields are already present
      // console.log(row[11], row[12], row[13]);
      if (row[11] && row[12] && row[13])
        return [[row[11], row[12], row[13]], row, false, i];

      const [formatted_address, lat, lng] = await geocode(
        storeName + ', ' + address + ', ' + 'Colombia '
      );
      console.log(
        `✅ Coordenadas obtenidas para fila ${
          i + 1
        }: ${formatted_address} - Lat: ${lat}, Lng: ${lng}`
      );
      row.push(formatted_address, lat, lng);
      // console.log([[formatted_address, lat, lng], row]);
      return [[formatted_address, lat, lng], row, true, i];
    })
  );
  return updates;
};

const selectSeller = (tabs: any, data: { phone: string }) => {
  if (!tabs || !tabs['vendedores']) {
    throw new Error(`No vendedores tab found in the Google Sheet`);
  }
  let result = mapToObjectsByProps(tabs['vendedores'], ['seller', 'phone'])
    .filter((seller: any) => seller.phone == data.phone)
    .map((s: any) => s.seller);

  return result[0] || '';
};

export const getData = async (data: any) => {
  const tabs = await getGSheetTabs(sheetId);

  const tabName = 'bd_tiendas';

  if (!tabs || !tabs[tabName]) {
    throw new Error(`No ${tabName} tab found in the Google Sheet`);
  }
  const seller = selectSeller(tabs, data);
  console.log(seller);

  // console.log(`✅ data  "${JSON.stringify(tabs[tabName])}"`);
  const updates = await getCoordinates(tabs[tabName]);
  // console.log(`✅ updates "${JSON.stringify(updates)}"`);

  await updateSheetWithCoordinates(tabName, sheetId, updates);

  const storesUpdated = updates.map(([address, original, updated]: any) =>
    updated ? [...original, ...address] : original
  );

  const headers = [...tabs[tabName][0], ...['Address', 'lat', 'lng']];
  storesUpdated.unshift(headers);
  // console.log(`✅ storesUpdated "${JSON.stringify(storesUpdated)}"`);

  const userLat = data.userLocation.latitude;
  const userLng = data.userLocation.longitude;

  console.log(
    `🔍 Buscando tiendas cercanas al usuario en lat: ${userLat}, lng: ${userLng}`
  );
  // Buscar tiendas a menos de 2km del usuario
  const nearbyStores = findClosestStores(
    storesUpdated,
    userLat,
    userLng,
    seller,
    1
  );

  console.log(
    `✅ ${nearbyStores.length - 1} tiendas encontradas cerca del usuario`
  );

  // nearbyStores.forEach(({ row, distanceKm }, i) => {
  //   console.log(`${i + 1}. ${row[4]} - ${distanceKm.toFixed(3)} km`);
  // });

  const stores = extractIdTitleArray(
    nearbyStores,
    'SID',
    'NOMBRE COMERCIAL'
  ).sort((a: { title: number }, b: { title: number }) => a.title - b.title);

  // GET DATA FOR NEW CLIENT FLOW
  const inputs: any = extractChannelsAndItems(tabs['Inputs']);

  return {
    ...data,
    nearbyStores,
    stores,
    deptos: getUniqueById(inputs['DEPARTAMENTO']) || [],
    zones: getUniqueById(inputs['ZONA']) || [],
    towns: getUniqueById(inputs['MUNICIPIO ']) || [],
    segments: getUniqueById(inputs['SEGMENTO ']) || [],
  };
};
