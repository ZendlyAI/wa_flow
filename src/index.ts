import type { HttpFunction } from '@google-cloud/functions-framework/build/src/functions';

import { openai, transcribeAudio } from './helpers/openai';
import { createConversation } from './helpers/chatwoot';
import { sentMessage } from './helpers/botpress';

// import { convertFromUrlToMp3 } from './helpers/convertor';

import { handleMedia } from './helpers/media';

// this function handles the incoming and outgoing requests from the webhook to chatwoot
// create a new conversation in Chatwoot and returns the conversation ID and contact ID.
export const incoming: HttpFunction = async (req, res) => {
  console.log('INCOMING FUNCTION CALLED');

  const body = req.body;
  console.log(JSON.stringify(body));

  const response = await createConversation(body);
  // res.append('Content-Type', 'application/json');
  res.status(200).send(JSON.stringify(response));
};

export const outgoing: HttpFunction = async (req, res) => {
  console.log('OUTGOING FUNCTION CALLED');

  const body = req.body;
  console.log(JSON.stringify(body));

  const response = await sentMessage(body);
  // res.append('Content-Type', 'application/json');
  res.status(200).send(JSON.stringify(response));
};

export const media: HttpFunction = async (req, res) => {
  const mediaPayload = req.body;
  console.log(JSON.stringify(mediaPayload));
  try {
    const data = await handleMedia(mediaPayload);
    require('fs').writeFileSync(mediaPayload.file_name, data);
  } catch (err) {
    console.error('❌ Error:', err);
  }
  res.status(200).send(JSON.stringify('✅ Listo'));
};

export const audio: HttpFunction = async (req, res) => {
  const response = await transcribeAudio(
    'https://files.bpcontent.cloud/2025/06/18/21/20250618213534-F4NS1A78.oga'
  );

  res.status(200).send(JSON.stringify(response));
};
