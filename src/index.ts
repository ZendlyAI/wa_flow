import type { HttpFunction } from '@google-cloud/functions-framework/build/src/functions';

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
    console.info('preload || ', JSON.stringify(body));
    
    res.append('Content-Type', 'application/json');
    res
      .status(200)
      .send("Hello, World!");
  } catch (err) {
    res.status(500).send(JSON.stringify(err));
  }
};