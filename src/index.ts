import type { HttpFunction } from '@google-cloud/functions-framework/build/src/functions';
import {
  decryptRequest,
  encryptResponse,
} from './helpers/encryption';
import { getNextScreen } from './helpers/flows';

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
    const screenResponse = await getNextScreen(decryptedBody);
    console.log('👉 Response to Encrypt:', JSON.stringify(screenResponse));
    res.append('Content-Type', 'application/json');
    res
      .status(200)
      .send(encryptResponse(screenResponse, aesKeyBuffer, initialVectorBuffer));
  } catch (err) {
    res.status(500).send(JSON.stringify(err));
  }
};
