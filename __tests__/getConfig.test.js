const { getConfig } = require('../src/getConfig');

describe('getConfig', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('debe retornar la configuración de Cognito', async () => {
    process.env.USER_POOL_ID = 'us-east-1_xxxxx';
    process.env.USER_POOL_CLIENT_ID = 'client123';
    process.env.AWS_REGION = 'us-east-1';

    const result = await getConfig();

    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body.userPoolId).toBe('us-east-1_xxxxx');
    expect(body.userPoolClientId).toBe('client123');
    expect(body.region).toBe('us-east-1');
    expect(result.headers['Access-Control-Allow-Origin']).toBe('*');
  });

  it('debe usar COGNITO_REGION cuando AWS_REGION no está definido', async () => {
    delete process.env.AWS_REGION;
    process.env.USER_POOL_ID = 'us-east-1_xxxxx';
    process.env.USER_POOL_CLIENT_ID = 'client123';
    process.env.COGNITO_REGION = 'us-west-2';

    const result = await getConfig();

    const body = JSON.parse(result.body);
    expect(body.region).toBe('us-west-2');
  });
});
