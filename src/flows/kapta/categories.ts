import { convertImagesFromURLs } from '../../utils';

export const getData = async (data: any) => {
  const imgSrc = await convertImagesFromURLs(854, 480);

  const categoriesSize = data.categoriesSelected.length;

  return {
    ...data,
    ...imgSrc,
    categoriesSize,
  };
};
