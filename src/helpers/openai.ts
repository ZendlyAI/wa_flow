import OpenAI from 'openai';
const client = new OpenAI();

export const openai = async (question: string) => {
  const response = await client.responses.create({
    model: 'gpt-4.1',
    input: question,
  });
  console.log('OpenAI response:', response);
  return response.output_text || 'No response from OpenAI';
};

export const transcribeAudio = async (url: string) => {
  const audioResponse = await fetch(url);
  const buffer = await audioResponse.arrayBuffer();
  const base64str = Buffer.from(buffer).toString('base64');

  const prompt =
    'You will receive an audio recording from a field agent’s visit. First, transcribe the audio exactly as spoken, without summarizing or changing any words. Then, analyze the content and identify the overall sentiment (positive, neutral, or negative), including any emotional changes or key reactions throughout the recording. Next, detect the main topics discussed, such as product availability, pricing, display, or store cleanliness, and summarize what was said for each one. Pay attention to any patterns in user or staff behavior, like recurring confusion, interest, resistance, or collaboration. From the conversation, extract the key insights or takeaways based on what the agent observed or reported. Identify any issues or obstacles mentioned, including problems with stock, logistics, or communication. Also, capture any suggestions made by the store, customers, or the agent. Finally, write a short paragraph summarizing the overall visit, tone, and key outcomes in no more than four sentences. Do not format or label your response, just focus on delivering clear and actionable information.';

  const response = await client.chat.completions.create({
    model: 'gpt-4o-audio-preview',
    modalities: ['text', 'audio'],
    audio: { voice: 'alloy', format: 'mp3' },
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          {
            type: 'input_audio',
            input_audio: { data: base64str, format: 'mp3' },
          },
        ],
      },
    ],
    store: true,
  });

  console.log('OpenAI response:', JSON.stringify(response));
  const json = response.choices[0].message.content || '{}';
  try {
    return JSON.parse(json);
  } catch (e) {
    throw new Error('OpenAI response parsing failed: ' + json);
  }
};
