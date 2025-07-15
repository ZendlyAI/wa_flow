import { getNextScreen as KaptaNextScreen } from './flows/kapta/flow';
import { getNextScreen as FugitivosNextScreen } from './flows/fugitivos/flow';

export const getFlow = async (decryptedBody: {
  screen: any;
  data: any;
  version: any;
  action: any;
  flow_token: any;
}) => {
  let { screen, data, version, action, flow_token } = decryptedBody;

  // handle health check request
  if (action === 'ping') {
    return {
      version,
      data: {
        status: 'active',
      },
    };
  }

  // handle error notification
  if (data?.error) {
    console.warn('Received client error:', data);
    return {
      version,
      data: {
        acknowledged: true,
      },
    };
  }

  if (!flow_token) {
    throw new Error('Missing flow_token');
  }

  const metadata = JSON.parse(flow_token);
  // console.debug(`metadata: ${metadata}`);
  // console.debug(`metadata: ${metadata.flowName}`);
  if (metadata.flowName === 'kapta') {
    console.debug(
      `Processing Kapta flow with action: ${action} and screen: ${screen}`
    );
    return await KaptaNextScreen({
      screen,
      data: { ...data, ...metadata },
      version,
      action,
      flow_token,
    });
  }

  if (metadata.flowName === 'fugitivos') {
    console.debug(
      `Processing Fugitivos flow with action: ${action} and screen: ${screen}`
    );
    return await FugitivosNextScreen({
      screen,
      data: { ...data, ...metadata },
      version,
      action,
      flow_token,
    });
  }

  throw new Error(`Unsupported request action ${action} & screen: ${screen}`);
};
