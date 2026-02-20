const { mockUpdate, mockUpdateFn } = require('./aws-mocks');
const { updateCar } = require('../src/updateCar');

describe('updateCar', () => {
  it('debe actualizar un auto y retornar 200', async () => {
    const mockUpdated = {
      id: '123',
      name: 'Mercedes',
      description: '2500cc',
      updatedAt: '2024-01-01T00:00:00.000Z',
    };
    mockUpdate.mockResolvedValue({ Attributes: mockUpdated });

    const event = {
      pathParameters: { id: '123' },
      body: { name: 'Mercedes', description: '2500cc' },
    };

    const result = await updateCar(event);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual(mockUpdated);
    expect(mockUpdateFn).toHaveBeenCalledWith(
      expect.objectContaining({
        TableName: 'CarsTable',
        Key: { id: '123' },
      })
    );
  });

  it('debe retornar 400 cuando el body JSON es inválido', async () => {
    const event = {
      pathParameters: { id: '123' },
      body: 'invalid json {',
    };

    const result = await updateCar(event);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body).error).toBe('Invalid JSON body');
  });

  it('debe retornar 400 cuando falta el id en el path', async () => {
    const event = {
      pathParameters: {},
      body: { name: 'Mercedes', description: '2500cc' },
    };

    const result = await updateCar(event);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body).error).toBe('Missing id in path');
  });

  it('debe retornar 400 cuando pathParameters es undefined', async () => {
    const event = {
      body: { name: 'Mercedes', description: '2500cc' },
    };

    const result = await updateCar(event);

    expect(result.statusCode).toBe(400);
  });

  it('debe retornar 500 cuando DynamoDB falla', async () => {
    mockUpdate.mockRejectedValue(new Error('DynamoDB error'));

    const event = {
      pathParameters: { id: '123' },
      body: { name: 'Mercedes', description: '2500cc' },
    };

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    const result = await updateCar(event);

    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body).error).toBe('DynamoDB error');
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('debe manejar body como objeto ya parseado', async () => {
    mockUpdate.mockResolvedValue({ Attributes: { id: '123', name: 'X', description: 'Y' } });

    const event = {
      pathParameters: { id: '123' },
      body: { name: 'X', description: 'Y' },
    };

    const result = await updateCar(event);

    expect(result.statusCode).toBe(200);
  });

  it('debe manejar body undefined usando objeto vacío', async () => {
    mockUpdate.mockResolvedValue({ Attributes: { id: '123' } });

    const event = {
      pathParameters: { id: '123' },
      body: undefined,
    };

    const result = await updateCar(event);

    expect(result.statusCode).toBe(200);
  });
});
