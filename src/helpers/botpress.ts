import axios from 'axios';

export const sendDataCaptureFlow = async (
  data: any,
  conversationId: any,
  url: string
) => {
  try {
    delete data.photoPicker;
    delete data.nearbyStores;
    delete data.salesLevers;
    delete data.store;
    let body = JSON.stringify({
      conversationId: conversationId,
      type: 'data_capture_flow',
      data: data,
    });
    console.log('Sending to botpress', conversationId, body);

    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: url,
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
