import { getCategoryLabelById } from '../../utils';
import { handleMedia } from '../../helpers/media';

const saveImages = async (data: any) => {
  const category = data.category.split(':')[0];
  const images = { [category]: data.photo_picker };

  const mediaPayload = data.photo_picker;
  console.log(JSON.stringify(mediaPayload));
  try {
    for (const item of mediaPayload as any[]) {
      const data = await handleMedia(item);
      // upload image to storage
      require('fs').writeFileSync(item.file_name, data);
    }
  } catch (err) {
    console.error('❌ Error:', err);
  }

  return { ...images, ...data.images };
};

export const getData = async (data: any, mediaScreens: any[]) => {
  const images = await saveImages(data);
  console.log(images);

  const categoriesSize = data.categoriesSelected.length;
  const catSize = data.categories.length;
  const screen = mediaScreens[catSize - categoriesSize];

  const cat = data.categoriesSelected.shift();

  if (cat) {
    const category = getCategoryLabelById(data.categories, cat);

    if (data.categoryCounter < data.categoriesSize) {
      console.log(
        `categoryCounter ${data.categoryCounter} is less than categoriesSize ${data.categoriesSize}`
      );

      data.categoryCounter++;
    }

    return {
      ...data,
      images: images,
      category,
      screen: data.categoryCounter > data.categoriesSize ? 'SUMMARY' : screen,
    };
  }
  return {
    ...data,
    images: images,
    screen: 'SUMMARY',
  };
};
