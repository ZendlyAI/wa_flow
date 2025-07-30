export const getData = async (data: any) => {
  const hasManoDeBuey =
    data.priceValidationSelected.find(
      (element: string) => element === 'Mano_de_Buey'
    ) || false;
  const hasVicheDioses =
    data.priceValidationSelected.find(
      (element: string) => element === 'Viche_Dioses'
    ) || false;
  const hasVicheCanao =
    data.priceValidationSelected.find(
      (element: string) => element === 'Viche_Canao'
    ) || false;
  const hasVicheLaEsperanza =
    data.priceValidationSelected.find(
      (element: string) => element === 'Viche_La_Esperanza'
    ) || false;

  return {
    ...data,
    hasManoDeBuey: hasManoDeBuey ? true : false,
    hasVicheDioses: hasVicheDioses ? true : false,
    hasVicheCanao: hasVicheCanao ? true : false,
    hasVicheLaEsperanza: hasVicheLaEsperanza ? true : false,
  };
};
