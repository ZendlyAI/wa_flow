
# Endpoint for WhatsApp Flows

This project is a cloud function to implement a endpoint to manage flow, following the Whatsapp Guide [Whastapp Implementing Endpoint for Flows Doc](https://developers.facebook.com/docs/whatsapp/flows/guides/implementingyourflowendpoint)
and [rederence](https://developers.facebook.com/docs/whatsapp/flows/reference/implementingyourflowendpoint)

Example: [nodejs](https://github.com/WhatsApp/WhatsApp-Flows-Tools/tree/main/examples/endpoint/nodejs/basic)

### Prerequisites
  The phone number must be successfully registered, and the business must have generated a 2048-bit RSA Key as described in the Doc [WhatsApp Business Encryption](https://developers.facebook.com/docs/whatsapp/cloud-api/reference/whatsapp-business-encryption#set-business-public-key)
 
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

