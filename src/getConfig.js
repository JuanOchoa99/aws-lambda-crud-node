const { withCors } = require('./utils/cors');

const getConfig = async () => {
  const config = {
    userPoolId: process.env.USER_POOL_ID,
    userPoolClientId: process.env.USER_POOL_CLIENT_ID,
    region: process.env.AWS_REGION || process.env.COGNITO_REGION,
  };

  return {
    statusCode: 200,
    headers: withCors({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(config),
  };
};

module.exports = {
  getConfig,
};
