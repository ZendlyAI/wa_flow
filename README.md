# Endpoint for WhatsApp Flows

This project is a cloud function to implement a endpoint to manage flow, following the Whatsapp Guide [Whastapp Implementing Endpoint for Flows Doc](https://developers.facebook.com/docs/whatsapp/flows/guides/implementingyourflowendpoint)
and [Reference](https://developers.facebook.com/docs/whatsapp/cloud-api/reference/whatsapp-business-encryption#set-business-public-key)

Example: [nodejs](https://github.com/WhatsApp/WhatsApp-Flows-Tools/tree/main/examples/endpoint/nodejs/basic)

### Prerequisites

1. The phone number must be successfully registered (DONE)
2. The business must have generated a 2048-bit RSA Key as described in the Doc [Generating a 2048-bit RSA Key Pair](https://developers.facebook.com/docs/whatsapp/cloud-api/reference/whatsapp-business-encryption#gen)

   - Generate a public and private RSA key pair by typing in the following command:
     ```shell
     openssl genrsa -des3 -out private.pem 2048
     ```

   This generates 2048-bit RSA key pair encrypted with a password you provided and is written to a file.

   - Next, you need to export the RSA Public Key to a file:
     ```shell
     openssl rsa -in private.pem -outform PEM -pubout -out public.pem
     ```

3. Generate PRIVATE_KEY env

- Export private key

```shell
    export PRIVATE_PEM=`cat ./private.pem`
```

- Run this code in a JS file on your Dev Machine.

```shell
    node
    const privateKey=process.env.PRIVATE_PEM
    const buff = Buffer.from(privateKey).toString('base64');
    console.log(buff); // "RESULTADO DE BUFF"
    (To exit, press Ctrl+C again or Ctrl+D or type .exit)
```

- Copy the buff result in .env file

```shell
export PRIVATE_KEY="RESULTADO DE BUFF"
```

- Export .env to start envs

```
source .env
```

## Implementing Endpoint for Flows
This NodeJS code sample aims to give an approximate example of how encrypted_aes_key field is calculated and how it can be decrypted.

[NodeJS Script Demonstrating AES Key Encryption and Decryption](https://developers.facebook.com/docs/whatsapp/flows/guides/implementingyourflowendpoint#nodejs-script-demonstrating-aes-key-encryption-and-decryption)

You can reference the below examples of how to decrypt and encrypt.

The endpoint source code is available in the [WhatsApp-Flows-Tools Github repo](https://github.com/WhatsApp/WhatsApp-Flows-Tools/tree/main/examples/endpoint/nodejs/book-appointment?fbclid=IwZXh0bgNhZW0CMTEAAR1LixUss6fd79BuG9cAcUiud1L0MKIQjYMKBh0-3_gClCIeZDH4NOLUoVE_aem_y-qF36TRh7IBp0w9QxNgQA) 

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
