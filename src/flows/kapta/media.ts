import { getCategoryLabelById } from '../../utils';

export const getData = async (data: any, mediaScreens: any[]) => {
  const categoriesSize = data.categoriesSelected.length;
  const catSize = data.categories.length;
  const categoryCounter = 1;

  const screen = mediaScreens[catSize - categoriesSize];
  const cat = data.categoriesSelected.shift();
  const category = getCategoryLabelById(data.categories, cat);
  return {
    ...data,
    screen,
    categoriesSize,
    categoryCounter,
    category,
  };
};
