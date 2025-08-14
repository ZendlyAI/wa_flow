# Endpoint for Chatwoot integration

This project is a cloud function to implement a endpoint to manage the chatwoot integration

- Export .env to start envs

```
source .env
```

## How to Run

Builds the app at build, cleaning the folder first.

```
npm run build
```

Starts the app in local by first building the project with npm run build, and then executing the compiled JavaScript at build/index.js.

```
npm run start:local
```

Start the built-in local development server:

```
npm run start
```

Open [http://localhost:8080/](http://localhost:8080/)

## How the Agent Mode Should Works in Botpress?

If started a humanTakeover?
send a summary of the conversation between bot and user
identify the intent
assign the accurate team or human agent

if It's an open conversation with the humanAgent
open all the incoming, outgoing messages and keep the state in the flow
transcript every interaction bot, user, humanAgent or AIAgent

if the conversation change to resolved
change state to humanTakeover=false and return to botHandover

### How to control the traffic between chatwoot and botpress

should trigger a humanTakeover=false and botHandover in botpress when
"status": "resolved" and "event": "conversation_updated"

    "event": "conversation_updated" and
      "status": "pending", is a conversation that is not been taken by the agent
      status: "open", when the agent open a conversation

      "message_type": "outgoing" send it from chatwoot humanAgent to wbehook
      "message_type": "incomming" Send it from the user-botpress to chatwoot

\*\*USING custom_attributes to send the botpress_conversation_id

humanTakeover: true
payload.content_type === 'text' &&
payload.message_type === 'outgoing' &&
payload.event === 'message_created'

humanTakeover: false
payload.status === 'resolved' &&
payload.event === 'conversation_updated'

## How to generate the ChatwootPayload in botpress

// Example assumes `payload` is your JSON object

```javascript
const humanTakeoverTrue = {
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
};

const humanTakeoverFalse = {
  conversationId: payload.custom_attributes.botpress_conversation_id,
  name: 'Agente de Chatwoot',
  type: 'chatwoot_agent_incoming',
  timestamp: payload.created_at,
  humanTakeover: false,
};
```

## How a transcript should looks like

```json
"transcript": [
      {
        "sender": "bot",
        "preview": "Genial Tatis, iniciemos la captura de datos",
        "senderDetails": {
          "id": "botpress",
          "name": "Bot de Botpress",
          "type": "bot"
        },
        "timestamp": "2023-10-01T12:00:00Z"
      },
      {
        "sender": "bot",
        "preview": "Tu Ubicacion es  \nTASK: 14",
        "senderDetails": {
          "id": "botpress",
          "name": "Bot de Botpress",
          "type": "bot"
        },
        "timestamp": "2023-10-01T12:00:00Z"
      },
      {
        "sender": "user",
        "preview": "Hola",
        "senderDetails": {
          "id": "+50250192435",
          "name": "Tatis",
          "type": "whatsapp"
        },
        "timestamp": "2023-10-01T12:00:00Z"
      },
      {
        "sender": "user",
        "preview": "Hola, como estas?",
        "senderDetails": {
          "id": "+50250192435",
          "name": "Tatis",
          "type": "whatsapp"
        },
        "timestamp": "2023-10-01T12:00:00Z"
      },
      {
        "sender": "chatwootAgent",
        "preview": "Hola, como puedo ayudarte",
        "senderDetails": {
          "id": "chatwoot",
          "name": "Agente de Chatwoot",
          "type": "human",
          "message": "180125760",
          "conversation": "8",
          "agent": 128228,
          "contact": 358324356,
          "account_id": "124274",
          "inbox_id": "67317"
        },
        "timestamp": "2023-10-01T12:00:00Z"
      }
    ]
```
