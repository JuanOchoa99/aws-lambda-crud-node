const { mockDelete, mockDeleteFn } = require('./aws-mocks');
const { deleteCar } = require('../src/deleteCar');

describe('deleteCar', () => {
  it('debe eliminar un auto y retornar 200', async () => {
    mockDelete.mockResolvedValue({});

    const event = {
      pathParameters: { id: '123' },
    };

    const result = await deleteCar(event);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body).message).toBe('Car deleted successfully');
    expect(mockDeleteFn).toHaveBeenCalledWith({
      TableName: 'CarsTable',
      Key: { id: '123' },
    });
  });

  it('debe retornar 400 cuando falta el id en el path', async () => {
    const event = {
      pathParameters: {},
    };

    const result = await deleteCar(event);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body).error).toBe('Missing id in path');
  });

  it('debe retornar 400 cuando pathParameters es undefined', async () => {
    const event = {};

    const result = await deleteCar(event);

    expect(result.statusCode).toBe(400);
  });

  it('debe retornar 400 cuando DynamoDB falla', async () => {
    mockDelete.mockRejectedValue(new Error('DynamoDB error'));

    const event = {
      pathParameters: { id: '123' },
    };

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    const result = await deleteCar(event);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body).error).toBe('DynamoDB error');
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
