import axios from 'axios';

const BOTPRESS_WEBHOOK_URL = process.env.BOTPRESS_WEBHOOK_URL;

const humanTakeover = async (payload: any) => {
  const body = {
    conversationId:
      payload.conversation.custom_attributes.botpress_conversation_id,
    name: 'Agente de Chatwoot',
    type: 'chatwoot_agent_incoming',
    message: payload.content,
    conversation: payload.conversation.id,
    agent: payload.sender,
    contact: payload.conversation.meta.sender,
    account: payload.account,
    inbox: payload.inbox,
    timestamp: payload.created_at,
    humanTakeover: true,
    attachments: payload.attachments
      ? payload.attachments
          .map((att: any) => att.data_url)
          .filter((url: string | undefined) => !!url)
      : [],
  };

  const response = await axios.post(`${BOTPRESS_WEBHOOK_URL}`, body, {
    // headers: { api_access_token: access_token },
  });
  // console.log(`humanTakeover response: ${JSON.stringify(response)}`);

  console.log(`humanTakeover Mensaje enviado: ${JSON.stringify(body)}`);

  return response.data;
};

const botHandover = async (payload: any) => {
  const body = {
    conversationId: payload.custom_attributes.botpress_conversation_id,
    name: 'Agente de Chatwoot',
    type: 'chatwoot_agent_incoming',
    timestamp: payload.created_at,
    humanTakeover: false,
  };

  const response = await axios.post(`${BOTPRESS_WEBHOOK_URL}`, body, {
    // headers: { api_access_token: access_token },
  });

  // console.log(`botHandover response: ${JSON.stringify(response)}`);
  console.log(`botHandover Mensaje enviado: ${JSON.stringify(body)}`);

  return response.data;
};

export const sentMessage = async (payload: any) => {
  try {
    if (
      payload.message_type === 'outgoing' &&
      payload.event === 'message_created'
    ) {
      return humanTakeover(payload);
    } else if (
      payload.status === 'resolved' &&
      payload.event === 'conversation_updated'
    ) {
      return botHandover(payload);
    }
    return { error: 'no content_type controller' };
  } catch (error: any) {
    console.error('Error:', error?.response?.data || error.message);
    return { error: error?.response?.data || 'Internal server error' };
  }
};
