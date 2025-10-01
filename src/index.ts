import type { HttpFunction } from '@google-cloud/functions-framework/build/src/functions';
import { decryptRequest, encryptResponse } from './helpers/encryption';
import { getFlow } from './flows';
import { saveImages } from './flows/fugitivos/rate';
const sharp = require('sharp');
const axios = require('axios');
import { uploadBuffer } from './helpers/gstorage';
import { v4 as uuidv4 } from 'uuid';

const privateKey: string = process.env.PRIVATE_KEY || '';
const passphrase: string = process.env.PASSPHRASE || '';

export const preLoad: HttpFunction = async (req, res) => {
  const body = req.body;

  try {
    if (!privateKey) {
      res
        .status(500)
        .send(
          'Private key is empty. Please check your env variable "privateKey".'
        );
    }
    if (!passphrase) {
      res
        .status(500)
        .send(
          'Passphrase key is empty. Please check your env variable "passphrase".'
        );
    }
    console.info(JSON.stringify(body));
    const key = Buffer.from(privateKey, 'base64').toString('ascii');

    const { decryptedBody, aesKeyBuffer, initialVectorBuffer } = decryptRequest(
      body,
      key,
      passphrase
    );
    console.info(JSON.stringify(decryptedBody));

    console.log('💬 Decrypted Request:', JSON.stringify(decryptedBody));
    const screenResponse = await getFlow(decryptedBody);
    console.log('👉 Response to Encrypt:', JSON.stringify(screenResponse));
    res.append('Content-Type', 'application/json');
    res
      .status(200)
      .send(encryptResponse(screenResponse, aesKeyBuffer, initialVectorBuffer));
  } catch (err) {
    res.status(500).send(JSON.stringify(err));
  }
};

export const photoPicker: HttpFunction = async (req, res) => {
  const body = req.body;

  try {
    const images = await saveImages(body);

    console.log('👉 Response to saveImages:', JSON.stringify(images));

    res.append('Content-Type', 'application/json');
    res.status(200).send('{ "images": ' + JSON.stringify(images) + ' }');
  } catch (err) {
    res.status(500).send(JSON.stringify(err));
  }
};

export const getOrientationFromUrl: HttpFunction = async (req, res) => {
  const body = req.body;
  console.log(JSON.stringify(body));

  try {
    // Descargar la imagen como buffer
    const response = await axios.get(body.url, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data);

    // Procesar con sharp
    const metadata = await sharp(buffer).metadata();
    console.log(`metadata: `, metadata);
    const orientation = metadata.orientation || 'no EXIF orientation';
    console.log(`Orientation: ${orientation}`);
    const fixedBuffer = await sharp(buffer).rotate().toBuffer();

    res
      .status(200)
      .send(
        '{ "images": ' +
          JSON.stringify(await uploadBuffer(fixedBuffer, uuidv4())) +
          ' }'
      );
  } catch (error) {
    console.error('Error extracting orientation:', error);
    res.status(500).send(JSON.stringify(error));
  }
};
