import axios from 'axios';

const BOTPRESS_WEBHOOK_URL =
  'https://webhook.botpress.cloud/337d573f-d7f2-4311-96e5-009b1c6e82c5';

export const sendDataCaptureFlow = async (data: any, conversationId: any) => {
  try {
    console.log("Sending to botpress", conversationId)
    let body = JSON.stringify({
      conversationId: conversationId,
      type: 'data_capture_flow',
      data: data,
    });

    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: BOTPRESS_WEBHOOK_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      data: body,
    };
    const response = await axios.request(config);
    return response.data;
  } catch (error: any) {
    console.error('Error:', error?.response?.data || error.message);
    return { error: error?.response?.data || 'Internal server error' };
  }
};
