import { getData as storeScreenData } from './store';
import { getData as registerVisitScreenData } from './registerVisit';
import { getData as commercialPlanScreenData } from './commercialPlan';
import { getData as portafolioStatusScreenData } from './portafolioStatus';
import { getData as captureDataScreenData } from './captureData';
import { getData as salesLeversScreenData } from './salesLevers';
import { getData as inventoryScreenData } from './inventory';
import { getData as executionScreenData } from './execution';
import { getData as rateScreenData } from './rate';
import { getData as competitionScreenData } from './competition';
import { getData as updateData } from './updateData';

import { sendDataCaptureFlow } from '../../helpers/botpress';
import { stat } from 'fs';

const BOTPRESS_WEBHOOK_URL =
  'https://webhook.botpress.cloud/7b82b00b-91b0-4964-abd4-9542823675c2';

export const getNextScreen = async (decryptedBody: {
  screen: any;
  data: any;
  version: any;
  action: any;
  flow_token: any;
}) => {
  let { screen, data, version, action, flow_token } = decryptedBody;
  console.debug(
    `action ${action} screen ${screen} data: ${JSON.stringify(data)}`
  );

  // handle initial request when opening the flow
  if (action === 'INIT') {
    return {
      version,
      screen: 'CAPTURE_TYPE',
      data: { ...data },
    };
  }

  if (action === 'data_exchange' && screen === 'CAPTURE_TYPE') {
    const screenData = await storeScreenData(data);

    try {
      await updateData(data, 'CAPTURE_TYPE');
    } catch (error) {
      console.error('updateData failed:', error);
    }

    return {
      version,
      screen: data.captureType === 'exist' ? 'REGISTER_VISIT' : 'NEW_CLIENT',
      data: { ...data, ...screenData },
    };
  }
  if (action === 'data_exchange' && screen === 'NEW_CLIENT') {
    try {
      await updateData(data, 'NEW_CLIENT');
    } catch (error) {
      console.error('updateData failed:', error);
    }
    return {
      version,
      screen: 'CONTACT',
      data: { ...data },
    };
  }
  if (action === 'data_exchange' && screen === 'CONTACT') {
    try {
      await updateData(data, 'CONTACT');
    } catch (error) {
      console.error('updateData failed:', error);
    }

    return {
      version,
      screen: 'CAPTURE_DATA',
      data: { ...data },
    };
  }

  if (action === 'data_exchange' && screen === 'REGISTER_VISIT') {
    const screenData = await registerVisitScreenData(data);
    try {
      await updateData(data, 'REGISTER_VISIT');
    } catch (error) {
      console.error('updateData failed:', error);
    }

    return {
      version,
      screen: data.noFound ? 'CAPTURE_DATA' : 'COMMERCIAL_PLAN',
      data: { ...data, ...screenData },
    };
  }

  if (action === 'data_exchange' && screen === 'COMMERCIAL_PLAN') {
    const screenData = await commercialPlanScreenData(data);

    try {
      await updateData(data, 'COMMERCIAL_PLAN');
    } catch (error) {
      console.error('updateData failed:', error);
    }

    return {
      version,
      screen: 'PORTAFOLIO_STATUS',
      data: { ...data, ...screenData },
    };
  }
  if (action === 'data_exchange' && screen === 'PORTAFOLIO_STATUS') {
    const screenData = await portafolioStatusScreenData(data);

    try {
      await updateData(data, 'PORTAFOLIO_STATUS');
    } catch (error) {
      console.error('updateData failed:', error);
    }

    return {
      version,
      screen: 'CAPTURE_DATA',
      data: { ...data, ...screenData },
    };
  }
  if (action === 'data_exchange' && screen === 'CAPTURE_DATA') {
    const screenData = await captureDataScreenData(data);

    return {
      version,
      screen: 'SALES_LEVERS',
      data: { ...data, ...screenData },
    };
  }
  if (action === 'data_exchange' && screen === 'SALES_LEVERS') {
    const screenData = await salesLeversScreenData(data);

    try {
      await updateData(data, 'SALES_LEVERS');
    } catch (error) {
      console.error('updateData failed:', error);
    }

    return {
      version,
      screen: 'INVENTORY',
      data: { ...data, ...screenData },
    };
  }
  if (action === 'data_exchange' && screen === 'INVENTORY') {
    const screenData = await inventoryScreenData(data);

    try {
      await updateData(data, 'INVENTORY');
    } catch (error) {
      console.error('updateData failed:', error);
    }

    return {
      version,
      screen: 'EXECUTION',
      data: { ...data, ...screenData },
    };
  }
  if (action === 'data_exchange' && screen === 'EXECUTION') {
    const screenData = await executionScreenData(data);

    try {
      await updateData(data, 'EXECUTION');
    } catch (error) {
      console.error('updateData failed:', error);
    }

    return {
      version,
      screen: 'TRADE_MARKETING',
      data: { ...data, ...screenData },
    };
  }
  if (action === 'data_exchange' && screen === 'TRADE_MARKETING') {
    try {
      await updateData(data, 'TRADE_MARKETING');
    } catch (error) {
      console.error('updateData failed:', error);
    }

    return {
      version,
      screen: 'COMPETITION',
      data: { ...data },
    };
  }
  if (action === 'data_exchange' && screen === 'COMPETITION') {
    const screenData = await competitionScreenData(data);

    try {
      await updateData(data, 'COMPETITION');
    } catch (error) {
      console.error('updateData failed:', error);
    }

    return {
      version,
      screen: 'PRICE_VALIDATION',
      data: { ...data, ...screenData },
    };
  }
  if (action === 'data_exchange' && screen === 'PRICE_VALIDATION') {
    try {
      await updateData(data, 'PRICE_VALIDATION');
    } catch (error) {
      console.error('updateData failed:', error);
    }

    return {
      version,
      screen: 'COMPETITION_INVENTORIES',
      data: { ...data },
    };
  }
  if (action === 'data_exchange' && screen === 'COMPETITION_INVENTORIES') {
    try {
      await updateData(data, 'COMPETITION_INVENTORIES');
    } catch (error) {
      console.error('updateData failed:', error);
    }

    return {
      version,
      screen: 'RATE',
      data: { ...data },
    };
  }

  if (action === 'data_exchange' && screen === 'RATE') {
    const screenData = await rateScreenData(data);
    data = { ...data, ...screenData };
    try {
      await updateData(data, 'COMPLETED');
    } catch (error) {
      console.error('updateData failed:', error);
    }

    await sendDataCaptureFlow(data, data.conversationId, BOTPRESS_WEBHOOK_URL);

    return {
      version,
      screen: 'SUMMARY',
      data: data,
    };
  }
  if (action === 'data_exchange' && screen === 'SUMMARY') {
    return {
      version,
      screen: 'SUCCESS',
      data: { ...data },
    };
  }

  throw new Error(`Unsupported request action ${action} & screen: ${screen}`);
};
