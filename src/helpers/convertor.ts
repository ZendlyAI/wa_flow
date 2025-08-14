import ffmpeg from 'fluent-ffmpeg';
import https from 'https';
import fs from 'fs';

export const convertFromUrlToMp3 = (
  url: string,
  outputPath: string
): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Creamos un stream de entrada desde la URL
    https
      .get(url, (response) => {
        ffmpeg(response)
        //   .inputFormat('oga') // importante para stream .oga
          .toFormat('mp3')
          .on('end', () => {
            console.log('Conversión completa:', outputPath);
            resolve();
          })
          .on('error', (err) => {
            console.error('Error en la conversión:', err.message);
            reject(err);
          })
          .save(outputPath);
      })
      .on('error', reject);
  });
};
