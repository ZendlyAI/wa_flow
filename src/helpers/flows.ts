export const getNextScreen = async (decryptedBody: {
  screen: any;
  data: any;
  version: any;
  action: any;
  flow_token: any;
}) => {
  const { screen, data, version, action, flow_token } = decryptedBody;
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
  throw new Error(`Unsupported request action ${action} & screen: ${screen}`);
};
