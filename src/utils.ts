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

export const extractIdTitleArray = (
  data: any[],
  idField: string,
  titleField: string
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

    const id = idRaw.toString().replace(/\s+/g, '_').toUpperCase();

    if (!seen.has(id)) {
      seen.add(id);
      result.push({ id, title: title.toUpperCase() });
    }

    return result;
  }, []);
};
