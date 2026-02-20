const { mockGet, mockGetFn } = require('./aws-mocks');
const { getCar } = require('../src/getCar');

describe('getCar', () => {
  it('debe retornar 200 cuando el auto existe', async () => {
    const mockCar = {
      id: '123',
      name: 'Jaguar',
      description: '2600cc',
    };
    mockGet.mockResolvedValue({ Item: mockCar });

    const event = {
      pathParameters: { id: '123' },
    };

    const result = await getCar(event);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual(mockCar);
    expect(mockGetFn).toHaveBeenCalledWith({
      TableName: 'CarsTable',
      Key: { id: '123' },
    });
  });

  it('debe retornar 404 cuando el auto no existe', async () => {
    mockGet.mockResolvedValue({ Item: null });

    const event = {
      pathParameters: { id: 'no-existe' },
    };

    const result = await getCar(event);

    expect(result.statusCode).toBe(404);
    expect(JSON.parse(result.body).error).toBe('Car not found - Please check the ID');
  });

  it('debe manejar pathParameters undefined', async () => {
    mockGet.mockResolvedValue({ Item: null });

    const event = {};

    const result = await getCar(event);

    expect(result.statusCode).toBe(404);
  });
});
