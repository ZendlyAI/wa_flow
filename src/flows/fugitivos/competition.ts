export const getData = async (data: any) => {
  const result: Record<string, boolean> = {};

  // Detect all keys like 'competition_n'
  if (Array.isArray(data.priceValidationSelected)) {
    data.priceValidationSelected.forEach((element: string) => {
      const match = element.match(/^competition_(\d+)$/);
      if (match) {
        result[`hasCompetition${match[1]}`] = true;
      }
    });
  }

  return {
    ...data,
    ...result,
  };
};
