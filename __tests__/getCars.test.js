const { mockScan, mockScanFn } = require('./aws-mocks');
const { getCars } = require('../src/getCars');

describe('getCars', () => {
  it('debe retornar 200 con lista de autos', async () => {
    const mockItems = [
      { id: '1', name: 'Jaguar', description: '2600cc' },
      { id: '2', name: 'Mercedes', description: '2500cc' },
    ];
    mockScan.mockResolvedValue({ Items: mockItems });

    const event = {};

    const result = await getCars(event);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual(mockItems);
    expect(mockScanFn).toHaveBeenCalledWith({ TableName: 'CarsTable' });
  });

  it('debe retornar array vacío cuando no hay autos', async () => {
    mockScan.mockResolvedValue({ Items: [] });

    const result = await getCars({});

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual([]);
  });
});
