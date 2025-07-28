import { Store } from './types/stores';
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';
import axios from 'axios';

export const parseStoresFromMatrix = (matrix: string[][]): Store[] => {
  const headers = matrix[0];
  const nameIdx = headers.indexOf('name');
  const addressIdx = headers.indexOf('address');
  const locationIdx = headers.indexOf('location');
  const storeType = headers.indexOf('store_type');

  return matrix.slice(1).map((row) => ({
    name: row[nameIdx] || '',
    address: row[addressIdx] || '',
    location: row[locationIdx] || '',
    storeType: row[storeType] || '',
    storeChannel: '',
    latitude: row[locationIdx].split(',')[0]
      ? row[locationIdx].split(',')[0]
      : '',
    longitude: row[locationIdx].split(',')[1]
      ? row[locationIdx].split(',')[1]
      : '',
  }));
};

export const joinStores = (moderns: string[][], traditionals: string[][]) => {
  return [...moderns, ...traditionals];
};

type Channel = {
  id: string;
  title: string;
};

type Item = {
  id: string;
  title: string;
};

export const extractChannelsAndItems = (data: string[][]) => {
  const [headers, ...rows] = data;

  // Generate list of channels
  const channels: Channel[] = headers.map((header) => ({
    id: header.toUpperCase(),
    title: header,
  }));

  // Initialize a map for each channel
  const channelItemsMap: Record<string, Item[]> = {};

  headers.forEach((header) => {
    channelItemsMap[header] = [];
  });

  // Fill channel items
  rows.forEach((row) => {
    row.forEach((value, index) => {
      const header = headers[index];
      if (value) {
        channelItemsMap[header].push({
          // id: (channelItemsMap[header].length + 1).toString(),
          id: value.toUpperCase(),
          title: value,
        });
      }
    });
  });

  return {
    channels,
    ...channelItemsMap,
  };
};

export const mediaScreensExists = (arr: any[], str: any) => {
  return arr.some((innerArray) => innerArray.includes(str));
};

type Category = {
  id: string;
  title: string;
  description: string;
};

export const getCategoryLabelById = (
  categories: Category[],
  id: string
): string | undefined => {
  const category = categories.find((cat) => cat.id === id);
  return category ? `${category.title}: ${category.description}` : undefined;
};

async function resizeAndConvertToBase64(
  buffer: Buffer,
  width: number,
  height: number
): Promise<string> {
  const resized = await sharp(buffer)
    .resize(width, height, { fit: 'cover' })
    .toBuffer();
  return resized.toString('base64');
}

export const convertImagesFromURLs = async (width: number, height: number) => {
  try {
    const imageUrls = [
      'https://storage.googleapis.com/zendly/whatsapp-flow-zendly/image1.jpeg',
      'https://storage.googleapis.com/zendly/whatsapp-flow-zendly/image2.jpeg',
      'https://storage.googleapis.com/zendly/whatsapp-flow-zendly/image3.jpg',
    ];

    const base64Results: Record<string, string> = {};
    let count = 1;

    for (const url of imageUrls) {
      try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const contentType = response.headers['content-type'];

        if (!contentType.startsWith('image/')) {
          console.warn(`Skipping non-image URL: ${url}`);
          continue;
        }

        const buffer = Buffer.from(response.data);
        const base64 = await resizeAndConvertToBase64(buffer, width, height);
        base64Results[`imgSrc${count}`] = base64;
        count++;
      } catch (innerError) {
        console.error(`Error processing URL ${url}:`, innerError);
      }
    }

    return base64Results;
  } catch (error) {
    console.error('Error downloading image:', error);
    return {};
  }
};

export const formatCategoryTitles = (images: any) => {
  return Object.entries(images)
    .map(([category, items]) => {
      return ` - ${category}`;
    })
    .join('\n');
};

export const formatImageUploadSummary = (images: any) => {
  return Object.entries(images)
    .map(([category, items]) => {
      const size = Array.isArray(items) ? items.length : 0;
      return ` - ${category}: ${size} fotos subidas`;
    })
    .join('\n');
};

// [
//   ["NIT","SID","Suc","Nombre tercero","NOMBRE COMERCIAL","DEPARTAMENTO","DIRECCIÓN","ZONA","ESTADO CODIFICACIÓN","FECHA ESTADO (fecha de creación)","POLITICA DE CARTERA","Address","lat","lng"],
//   ["901084743","9010847431","1","CHICHERIA DEMENTE S.A.S.","CHICHERIA DEMENTE","Bogotá D.C.","CLL 69 15 10","Chapinero","7. CLIENTE","20/10/2024","","Cl. 69 #15-08, Bogotá, Colombia","4,6568056","-74,0641556"],
//   ["901262730","9012627301","1","POLA Y TEJO SAS","TEJO LA EMBAJADA","Bogotá D.C.","CRA 24 76 20","San Felipe","7. CLIENTE","20/10/2024","Cra. 24 #76-20, Bogotá, Colombia","4.6666805","-74.0645844"]
// ]
// Elimina entradas duplicadas por valor de id
// Result: [ { "id": "901400632", "title": "GLOUNGE" }, { "id": "901047072", "title": "HUERTA COCTELERIA ARTESANAL" }, { "id": "901627338", "title": "CAÑA AGUARDIENTERIA" }, { "id": "900996095", "title": "NUEVA BOTELLA" }, { "id": "901590789", "title": "ACERTIJO BAR" }, { "id": "900581506", "title": "DEMENTE TAPAS BAR S.A.S." }, { "id": "80873860", "title": "KB ESPACIO CULTURAL" }, { "id": "901179346", "title": "BILONGO" }, { "id": "901262730", "title": "TEJO LA EMBAJADA" } ]
export const extractIdTitleArray = (
  data: any[],
  idField: string,
  titleField: string,
  unique: boolean = true
) => {
  if (!Array.isArray(data) || data.length < 2) {
    return [];
  }

  const header = data[0];
  const idIndex = header.indexOf(idField);
  const titleIndex = header.indexOf(titleField);

  if (idIndex === -1 || titleIndex === -1) {
    throw new Error('Campo no encontrado en el header');
  }

  const seen = new Set();

  return data.slice(1).reduce((result, row) => {
    const idRaw = row[idIndex];
    const title = row[titleIndex];

    if (!idRaw || !title) return result;

    // const id = idRaw.toString().replace(/\s+/g, '_').toUpperCase();
    const id =
      idRaw.toString().trim() === '' ? '_' : idRaw.toString().toUpperCase();

    if (unique && !seen.has(id)) {
      seen.add(id);
      result.push({ id, title: title.toUpperCase() });
    } else {
      result.push({ id, title: title.toUpperCase() });
    }

    return result;
  }, []);
};

// [
//   ["NIT","SID","Suc","Nombre tercero","NOMBRE COMERCIAL","DEPARTAMENTO","DIRECCIÓN","ZONA","ESTADO CODIFICACIÓN","FECHA ESTADO (fecha de creación)","POLITICA DE CARTERA","Address","lat","lng"],
//   ["901084743","9010847431","1","CHICHERIA DEMENTE S.A.S.","CHICHERIA DEMENTE","Bogotá D.C.","CLL 69 15 10","Chapinero","7. CLIENTE","20/10/2024","","Cl. 69 #15-08, Bogotá, Colombia","4,6568056","-74,0641556"],
//   ["901262730","9012627301","1","POLA Y TEJO SAS","TEJO LA EMBAJADA","Bogotá D.C.","CRA 24 76 20","San Felipe","7. CLIENTE","20/10/2024","Cra. 24 #76-20, Bogotá, Colombia", "4.6666805", "-74.0645844"]
// ]
// Result: [ "901262730", "9012627301", "1", "POLA Y TEJO SAS", "TEJO LA EMBAJADA", "Bogotá D.C.", "CRA 24 76 20", "San Felipe", "7. CLIENTE", "20/10/2024", "Cra. 24 #76-20, Bogotá, Colombia", "4.6666805", "-74.0645844" ]
export const findRowById = (
  data: string[][],
  idProp: string,
  idValue: string
): string[] | null => {
  if (!data || data.length < 2) return null;

  const header = data[0];
  const rows = data.slice(1);

  const idIndex = header.indexOf(idProp);
  if (idIndex === -1) {
    throw new Error(`Columna '${idProp}' no encontrada en el header`);
  }

  console.log(`🔍 Buscando fila con ${idProp} = ${idValue}`);
  console.log(`🔍 idIndex ${idIndex}`);
  for (const row of rows) {
    if (row[idIndex] === idValue) {
      return row;
    }
  }

  return null;
};

// [
//   ["NIT","SID","Suc","Nombre tercero","NOMBRE COMERCIAL","DEPARTAMENTO","DIRECCIÓN","ZONA","ESTADO CODIFICACIÓN","FECHA ESTADO (fecha de creación)","POLITICA DE CARTERA","Address","lat","lng"],
//   ["901084743","9010847431","1","CHICHERIA DEMENTE S.A.S.","CHICHERIA DEMENTE","Bogotá D.C.","CLL 69 15 10","Chapinero","7. CLIENTE","20/10/2024","","Cl. 69 #15-08, Bogotá, Colombia","4,6568056","-74,0641556"],
//   ["901262730","9012627301","1","POLA Y TEJO SAS","TEJO LA EMBAJADA","Bogotá D.C.","CRA 24 76 20","San Felipe","7. CLIENTE","20/10/2024","Cra. 24 #76-20, Bogotá, Colombia","4.6666805","-74.0645844"]
// ]
// Result: [ { SID: '9010847431', 'NOMBRE COMERCIAL': 'CHICHERIA DEMENTE', ZONA: 'Chapinero' }, { SID: '9012627301', 'NOMBRE COMERCIAL': 'TEJO LA EMBAJADA', ZONA: 'San Felipe' } ]
export const mapToObjectsByProps = (data: string[][], props: string[]): any => {
  if (!data || data.length < 2) return [];

  const header = data[0];

  // Obtener los índices de todas las props solicitadas
  const indices = props.map((prop) => {
    const index = header.indexOf(prop);
    if (index === -1) {
      // throw new Error(`No se encontró columna '${prop}' en el header`);
      console.log(`No se encontró columna '${prop}' en el header`);
    }
    return index;
  });

  return data.slice(1).map((plan) => {
    const obj: any = {};
    props.forEach((prop, i) => {
      obj[prop] = plan[indices[i]];
    });
    return obj;
  });
};

export const sumTotalCartera = (
  data: { 'Total cartera': string }[]
): number => {
  return data.reduce((acc, item) => {
    const raw = item['Total cartera'];
    const clean = raw.replace(/,/g, '').replace('$', ''); // Elimina coma dolar de miles
    const value = parseFloat(clean); // Convierte a número flotante
    return acc + (isNaN(value) ? 0 : value);
  }, 0);
};

export const getUniqueById = (data: any[]) => {
  const seen = new Set();

  return data
    .filter((item) => {
      if (seen.has(item.id.trim())) {
        return false;
      }
      seen.add(item.id.trim());
      return true;
    })
    .sort((a: { title: number }, b: { title: number }) => a.title - b.title);
};

export const getUniqueByKey = (array: any[], key: string) => {
  const seen = new Set<any>();
  const uniques: any = [];
  const duplicates: any = [];

  for (const item of array) {
    const value = item[key];
    if (seen.has(value)) {
      duplicates.push(item);
    } else {
      seen.add(value);
      uniques.push(item);
    }
  }

  return uniques;
};
