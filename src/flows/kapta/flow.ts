import { getData as storeScreenData } from './store';
import { getData as channelScreenData } from './channel';
import { getData as categoriesScreenData } from './categories';
import { getData as mediaScreenData } from './media';
import { getData as mediasScreenData } from './medias';

import {
  mediaScreensExists,
  formatCategoryTitles,
  formatImageUploadSummary,
} from '../../utils';

import { sendDataCaptureFlow } from '../../helpers/botpress';

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
    const screenData = {};

    return {
      version,
      screen: 'STORE',
      data: { ...data, ...screenData },
    };
  }

  if (action === 'data_exchange' && screen === 'STORE') {
    if (!flow_token) {
      throw new Error('Missing flow_token');
    }

    const metadata = JSON.parse(flow_token);
    data.userLocation = metadata.userLocation;
    console.debug(`Processing STORE screen with data: ${JSON.stringify(data)}`);

    // data = {
    //   storeName: 'Carulla Santa Bárbara',
    //   storeAddress: 'Calle 127',
    //   userLocation: {
    //     title: '',
    //     address: '',
    //     latitude: 4.703836943245158,
    //     longitude: -74.04632665044485,
    //   },
    // };

    const screenData = await storeScreenData(data);

    return {
      version,
      screen: screenData.searchTerm.isMatch ? 'CATEGORIES' : 'CHANNEL',
      data: { ...data, ...screenData },
    };
  }

  if (action === 'data_exchange' && screen === 'CHANNEL') {
    const screenData = await channelScreenData(data);

    return {
      version,
      screen: data.next ? 'CATEGORIES' : 'CHANNEL',
      data: { ...data, ...screenData },
    };
  }

  const mediaScreens = ['MEDIA_ONE', 'MEDIA_TWO', 'MEDIA_THREE', 'MEDIA_FOUR'];

  if (action === 'data_exchange' && screen === 'CATEGORIES') {
    const screenData = await categoriesScreenData(data);

    return {
      version,
      screen: 'MEDIA',
      data: { ...data, ...screenData },
    };
  }

  if (action === 'data_exchange' && screen === 'MEDIA') {
    const screenData = await mediaScreenData(data, mediaScreens);

    return {
      version,
      screen: screenData.screen,
      data: { ...data, ...screenData },
    };
  }

  if (action === 'data_exchange' && mediaScreensExists(mediaScreens, screen)) {
    const screenData = await mediasScreenData(data, mediaScreens);
    delete screenData.photo_picker;
    delete data.photo_picker;
    let summary = {};
    if (screenData.screen === 'SUMMARY') {
      summary = {
        categoriesSummary: '\n' + formatCategoryTitles(screenData.images),
        imagenesSummary: '\n' + formatImageUploadSummary(screenData.images),
      };
      console.log(summary);
      if (flow_token) {
        const flowToken = JSON.parse(flow_token);
        console.log('flow_token', flowToken);
        await sendDataCaptureFlow(
          { ...data, ...screenData, ...summary },
          flowToken.conversationId
        );
      } else {
        console.error(
          'Error sending botpress data captured in flow: Missing flow_token'
        );
      }
    }

    return {
      version,
      screen: screenData.screen,
      data: { ...data, ...screenData, ...summary },
    };
  }

  if (action === 'data_exchange' && screen === 'SUMMARY') {
    // const screenData = await mediaScreenData(data, mediaScreens);

    // const metadata = { ...data, ...screenData };

    // send botpress data captured in flow
    // if (flow_token) {
    //   const flowToken = JSON.parse(flow_token);
    //   console.log('flow_token', flowToken);
    //   await sendDataCaptureFlow(data, flowToken.conversationId);
    // } else {
    //   console.error(
    //     'Error sending botpress data captured in flow: Missing flow_token'
    //   );
    // }
    return {
      version,
      screen: 'SUCCESS',
      data: data,
    };
  }

  throw new Error(`Unsupported request action ${action} & screen: ${screen}`);
};
