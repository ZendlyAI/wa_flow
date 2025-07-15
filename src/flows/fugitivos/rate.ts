import { handleMedia } from '../../helpers/media';
import { uploadBuffer } from '../../helpers/gstorage';

const saveImages = async (photoPicker: any) => {
  const mediaPayload = photoPicker;
  console.log(JSON.stringify(mediaPayload));
  const imagesUrls: string[] = [];
  try {
    for (const item of mediaPayload as any[]) {
      const data = await handleMedia(item);
      // console.log('📸 Saving image:', data);
      // require('fs').writeFileSync(item.file_name, data);
      imagesUrls.push(await uploadBuffer(data, item.file_name));
    }
  } catch (err) {
    console.error('❌ Error:', err);
  }

  return imagesUrls;
};

export const getData = async (data: any) => {
  const images = await saveImages(data.photoPicker);
  return {
    ...data,
    images
  };
};
