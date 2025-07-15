export const getData = async (data: any) => {
  const categories = [
    {
      id: '1',
      title: 'Bebidas sin alcohol',
      description: 'Jugos, gaseosas, aguas',
    },
    {
      id: '2',
      title: 'Alimentos para Mascotas',
      description: 'Comida seca, húmeda, snacks',
    },
    {
      id: '3',
      title: 'Snacks',
      description: 'Papas fritas, galletas, ponqués, chocolates, chicles',
    }
  ];
  return {
    ...data,
    categories,
  };
};
