import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { createReadStream } from 'fs';
import FormData from 'form-data';
import { v4 as uuidv4 } from 'uuid';

const CHATWOOT_API_URL = 'https://app.chatwoot.com'; // Cambia si usas self-hosted

export const downloadAndSendImage = async (
  attachments: string[],
  account_id: string,
  conversation_id: string,
  access_token: string,
  message?: string
) => {
  const tempFiles: string[] = [];
  const form = new FormData();

  try {
    for (const imageUrl of attachments) {
      const uniqueFilename = `image-${uuidv4()}.jpg`;
      const tempFilePath = path.join('/tmp', uniqueFilename);
      tempFiles.push(tempFilePath);

      const response = await axios({
        url: imageUrl,
        method: 'GET',
        responseType: 'stream',
      });

      await new Promise<void>((resolve, reject) => {
        const writer = fs.createWriteStream(tempFilePath);
        response.data.pipe(writer);
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      form.append('attachments[]', createReadStream(tempFilePath));
    }

    if (message) {
      form.append('content', message);
    }

    form.append('message_type', 'incoming');

    const uploadResponse = await axios.post(
      `${CHATWOOT_API_URL}/api/v1/accounts/${account_id}/conversations/${conversation_id}/messages`,
      form,
      {
        headers: {
          ...form.getHeaders(),
          api_access_token: access_token,
        },
      }
    );

    return uploadResponse.data;
  } catch (error) {
    console.error('Error downloading or uploading image:', error);
    throw error;
  } finally {
    // Limpieza
    for (const file of tempFiles) {
      try {
        await fs.promises.unlink(file);
      } catch {
        // Ignorar error si no existe
      }
    }
  }
};
