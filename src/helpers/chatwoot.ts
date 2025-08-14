import axios from 'axios';
import { downloadAndSendImage } from './image_processor';
import { downloadAndSendAudio } from './audio_processor';
const CHATWOOT_API_URL = 'https://app.chatwoot.com'; // Cambia si usas self-hosted

interface ChatwootParams {
  botpress_conversation_id: string;
  account_id: string;
  access_token: string;
  name: string;
  email: string;
  phone_number: string;
  inbox_id: string;
  message?: string;
  assignee_id?: string;
  tags?: string[];
  content_type?: string;
  attachments?: string[];
}

export const createConversation = async (data: ChatwootParams) => {
  const {
    botpress_conversation_id,
    account_id,
    inbox_id,
    access_token,
    name,
    email,
    phone_number,
    message,
    assignee_id,
    tags = [],
    content_type = 'text',
    attachments = [],
  } = data;

  try {
    let contact_id;

    // 1. Buscar contacto
    const searchResponse = await axios.get(
      `${CHATWOOT_API_URL}/api/v1/accounts/${account_id}/contacts/search?q=${encodeURIComponent(
        phone_number
      )}`,
      {
        headers: { api_access_token: access_token },
      }
    );

    const contacts = searchResponse.data.payload;
    if (contacts.length > 0) {
      contact_id = contacts[0].id;
      console.log(`Contacto encontrado: ${contact_id}`);
    } else {
      // Crear contacto
      const contactResponse = await axios.post(
        `${CHATWOOT_API_URL}/api/v1/accounts/${account_id}/contacts`,
        { name, email, phone_number },
        {
          headers: { api_access_token: access_token },
        }
      );
      contact_id = contactResponse.data.payload.contact.id;
      console.log(`Nuevo contacto creado: ${contact_id}`);
    }

    // 2. Buscar conversaciones del contacto
    const conversationList = await axios.get(
      `${CHATWOOT_API_URL}/api/v1/accounts/${account_id}/contacts/${contact_id}/conversations`,
      {
        headers: { api_access_token: access_token },
      }
    );

    // 3. Buscar si hay una conversación abierta
    const openConversation = conversationList.data.payload.find(
      (convo: { status: string }) => convo.status !== 'resolved'
    );

    console.log(
      `Conversaciones encontradas para el contacto ${contact_id}: ${conversationList.data.payload.length}`
    );

    let conversation_id;

    if (openConversation) {
      conversation_id = openConversation.id;
      console.log(`Usando conversación abierta: ${conversation_id}`);
    } else {
      // 4. Crear nueva conversación
      console.log(`Crear nueva conversación para el contacto ${contact_id}`);
      const newConversation = await axios.post(
        `${CHATWOOT_API_URL}/api/v1/accounts/${account_id}/conversations`,
        {
          inbox_id: inbox_id,
          contact_id: contact_id,
          content: message,
          message_type: 'incoming',
          private: false,
          custom_attributes: {
            botpress_conversation_id: botpress_conversation_id,
          },
        },
        {
          headers: { api_access_token: access_token },
        }
      );

      conversation_id = newConversation.data.id;
      console.log(`Nueva conversación creada: ${conversation_id}`);
    }

    // 5. Enviar mensaje
    if (message) {
      if (content_type === 'image') {
        await downloadAndSendImage(
          attachments,
          account_id,
          conversation_id,
          access_token,
          message
        );
      } else if (content_type === 'audio') {
        await downloadAndSendAudio(
          attachments,
          account_id,
          conversation_id,
          access_token,
          message
        );
      } else {
        await axios.post(
          `${CHATWOOT_API_URL}/api/v1/accounts/${account_id}/conversations/${conversation_id}/messages`,
          {
            content: message,
            message_type: 'incoming',
          },
          {
            headers: { api_access_token: access_token },
          }
        );
      }
    }

    // 6. Asignar conversación
    if (assignee_id) {
      await axios.post(
        `${CHATWOOT_API_URL}/api/v1/accounts/${account_id}/conversations/${conversation_id}/assignments`,
        { assignee_id },
        {
          headers: { api_access_token: access_token },
        }
      );
    }

    // 7. Agregar etiquetas
    if (tags.length > 0) {
      const labels = [...openConversation.labels, ...tags];
      await axios.post(
        `${CHATWOOT_API_URL}/api/v1/accounts/${account_id}/conversations/${conversation_id}/labels`,
        { labels: labels },
        {
          headers: { api_access_token: access_token },
        }
      );
    }

    return {
      conversation_id,
      contact_id,
    };
  } catch (error: any) {
    console.error('Error:', error?.response?.data || error.message);
    return { error: error?.response?.data || 'Internal server error' };
  }
};
