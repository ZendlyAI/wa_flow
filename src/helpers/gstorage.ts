const { Storage } = require('@google-cloud/storage');

const storage = new Storage({
  projectId: 'zendly-ai',
  credentials: {
    client_email: process.env.GSHEET_EMAIL || '',
    private_key: process.env.GSHEET_PRIVATE_KEY?.replace(/\\n/g, '\n') || '',
  },
});
const bucketName = 'zendly';

export const uploadBuffer = async (buffer: Buffer, imageName: string) => {
  try {
    const bucket = storage.bucket(bucketName);
    const fileName = `fugitivos/${imageName}`;
    const file = bucket.file(fileName);

    await file.save(buffer, {
      metadata: { contentType: 'image/jpeg' },
    });

    console.log('Imagen subida correctamente desde buffer');
    return `https://storage.googleapis.com/${bucketName}/${fileName}`;
  } catch (err) {
    console.error(err);
    console.log('Error al subir imagen');
    return '';
  }
};
