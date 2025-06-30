export const getData = async (data: any) => {
  const categories = [
    {
      id: '1',
      title: 'Bebidas sin alcohol',
      description: 'Jugos, gaseosas, aguas',
    },
    {
      id: '2',
      title: 'Mascotas',
      description: 'Comida seca, húmeda, snacks',
    },
    {
      id: '3',
      title: 'Snacks',
      description: 'Papas fritas, galletas, ponqués, chocolates, chicles',
    },
    {
      id: '4',
      title: 'Cervezas y licores',
      description: 'Latas, botellas, packs',
    },
  ];
  return {
    ...data,
    categories,
  };
};
