import { findRowById } from '../../utils';
export const getData = async (data: any) => {
  const clientSelect = findRowById(data.store, 'SID', data.sid) || [];
  console.log(`✅ Cliente seleccionado: ${JSON.stringify(clientSelect)}`);
  return {
    ...data,
    client: clientSelect[4] || '',
  };
};
