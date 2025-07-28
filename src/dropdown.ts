type Input = {
  id: string; // Department
  title: string; // Town
};

type ZoneOption = {
  id: string;
  title: string;
};

type TownOption = {
  id: string;
  title: string;
  'on-select-action'?: {
    name: 'update_data';
    payload: {
      zones: ZoneOption[];
    };
  };
  'on-unselect-action'?: {
    name: 'update_data';
    payload: {
      zones: ZoneOption[];
    };
  };
};

type DepartmentOption = {
  id: string;
  title: string;
  'on-select-action': {
    name: 'update_data';
    payload: {
      towns: TownOption[];
    };
  };
};

export const departmentsDropdown = (
  data: Input[],
  zones: any[]
): DepartmentOption[] => {
  const map = new Map<string, TownOption[]>();

  for (const { id: department, title: town } of data) {
    if (!map.has(department)) {
      map.set(department, []);
    }

    const towns = map.get(department)!;

    // Avoid duplicates
    if (towns.some((m) => m.id === town)) continue;

    const newTown: TownOption = {
      id: town,
      title: town,
    };

    if (town === 'BOGOTÁ, D.C.') {
      newTown['on-unselect-action'] = {
        name: 'update_data',
        payload: {
          zones: [
            {
              id: 'NO_APLICA',
              title: 'NO_APLICA',
            },
          ],
        },
      };
      newTown['on-select-action'] = {
        name: 'update_data',
        payload: {
          zones: zones,
        },
      };
    }

    towns.push(newTown);
  }

  // Build output array
  const result: DepartmentOption[] = [];

  for (const [department, towns] of map.entries()) {
    result.push({
      id: department,
      title: department,
      'on-select-action': {
        name: 'update_data',
        payload: {
          towns: towns,
        },
      },
    });
  }

  return result;
};

type InputData = Record<string, any>;

export const dropdownGrouped = (
  data: InputData[],
  groupKey: string,
  idKey: string,
  titleKey: string,
  payloadName: string = 'stores',
  zones: { id: string; title: string }[] = []
) => {
  const result: Record<
    string,
    { id: string; title: string; [key: string]: any }[]
  > = {};

  for (const item of data) {
    const rawKey = item[groupKey];
    const key =
      rawKey?.toString().trim() === '' ? '_' : rawKey?.toString().toUpperCase();

    const idRaw = item[idKey];
    const id = idRaw?.toString().trim() === '' ? '_' : idRaw?.toString();
    const title = item[titleKey]?.toString();

    if (!result[key]) {
      result[key] = [];
    }

    const townItem: TownOption = { id, title };

    // Aplicar excepción solo si el payloadName es 'towns' y es Bogotá, D.C.
    if (
      payloadName === 'towns' &&
      id.toUpperCase() === 'BOGOTÁ, D.C.' &&
      title?.toUpperCase() === 'BOGOTÁ, D.C.' &&
      zones.length > 0
    ) {
      townItem['on-select-action'] = {
        name: 'update_data',
        payload: {
          zones: zones,
        },
      };

      townItem['on-unselect-action'] = {
        name: 'update_data',
        payload: {
          zones: [{ id: 'NO_APLICA', title: 'NO_APLICA' }],
        },
      };
    }

    result[key].push(townItem);
  }

  return Object.entries(result)
    .map(([groupId, items]) => {
      const sortedItems = items.sort((a, b) =>
        a.title.localeCompare(b.title, 'es', { sensitivity: 'base' })
      );

      return {
        id: groupId,
        title: groupId,
        'on-select-action': {
          name: 'update_data',
          payload: {
            [payloadName]: sortedItems,
          },
        },
      };
    })
    .sort((a: { id: string }, b: { id: string }) =>  a.id.localeCompare(b.id, 'es', { sensitivity: 'base' }))
};
