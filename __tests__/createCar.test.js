const { mockPut, mockPutFn } = require('./aws-mocks');
const { addCar, addCarRaw } = require('../src/createCar');

describe('createCar', () => {
  it('debe crear un auto y retornar 200', async () => {
    mockPut.mockResolvedValue({});

    const event = {
      body: { name: 'Jaguar', description: '2600cc' },
    };

    const result = await addCar(event);

    expect(result.statusCode).toBe(200);
    expect(result.headers['Content-Type']).toBe('application/json');
    expect(result.headers['Access-Control-Allow-Origin']).toBe('*');
    const body = JSON.parse(result.body);
    expect(body.name).toBe('Jaguar');
    expect(body.description).toBe('2600cc');
    expect(body.id).toBeDefined();
    expect(body.createdAt).toBeDefined();
    expect(body.updatedAt).toBeDefined();
    expect(mockPutFn).toHaveBeenCalledWith(
      expect.objectContaining({
        TableName: 'CarsTable',
        Item: expect.objectContaining({
          name: 'Jaguar',
          description: '2600cc',
        }),
      })
    );
  });

  it('debe manejar body vacío o undefined (addCarRaw)', async () => {
    mockPut.mockResolvedValue({});

    const event = { body: undefined };

    const result = await addCarRaw(event);

    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body.name).toBeUndefined();
    expect(body.description).toBeUndefined();
  });

  it('debe parsear body como JSON string (addCar con middleware)', async () => {
    mockPut.mockResolvedValue({});

    const event = {
      body: '{"name":"BMW","description":"3000cc"}',
      headers: { 'content-type': 'application/json' },
    };

    const result = await addCar(event);

    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body.name).toBe('BMW');
    expect(body.description).toBe('3000cc');
  });

  it('debe retornar 500 cuando DynamoDB falla', async () => {
    mockPut.mockRejectedValue(new Error('DynamoDB error'));

    const event = {
      body: { name: 'Jaguar', description: '2600cc' },
    };

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    const result = await addCar(event);

    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body).error).toBe('DynamoDB error');
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
