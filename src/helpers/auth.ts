const { google } = require('googleapis');
import readline from 'readline';

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost:3000/oauth2callback';

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

// Paso 1: generar URL de autorización
const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline', // ¡Importante! para obtener refresh_token
  scope: [
    'https://www.googleapis.com/auth/spreadsheets.readonly',
    'https://www.googleapis.com/auth/drive.metadata.readonly',
  ],
});

console.log('Visita esta URL para autorizar:', authUrl);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question(
  'Ingresa el código que aparece después de autorizar: ',
  async (code) => {
    const { tokens } = await oauth2Client.getToken(code);
    console.log('\n✅ Tokens obtenidos:\n');
    console.log('ACCESS_TOKEN:', tokens.access_token);
    console.log('REFRESH_TOKEN:', tokens.refresh_token);
    console.log('EXPIRY_DATE:', tokens.expiry_date);

    rl.close();
  }
);
