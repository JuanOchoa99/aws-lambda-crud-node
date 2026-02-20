const mockPutPromise = jest.fn();
const mockGetPromise = jest.fn();
const mockScanPromise = jest.fn();
const mockUpdatePromise = jest.fn();
const mockDeletePromise = jest.fn();

const mockPutFn = jest.fn(() => ({ promise: mockPutPromise }));
const mockGetFn = jest.fn(() => ({ promise: mockGetPromise }));
const mockScanFn = jest.fn(() => ({ promise: mockScanPromise }));
const mockUpdateFn = jest.fn(() => ({ promise: mockUpdatePromise }));
const mockDeleteFn = jest.fn(() => ({ promise: mockDeletePromise }));

const DocumentClient = jest.fn(() => ({
  put: mockPutFn,
  get: mockGetFn,
  scan: mockScanFn,
  update: mockUpdateFn,
  delete: mockDeleteFn,
}));

module.exports = {
  DynamoDB: { DocumentClient },
  __mocks: {
    mockPut: mockPutPromise,
    mockGet: mockGetPromise,
    mockScan: mockScanPromise,
    mockUpdate: mockUpdatePromise,
    mockDelete: mockDeletePromise,
    mockPutFn,
    mockGetFn,
    mockScanFn,
    mockUpdateFn,
    mockDeleteFn,
  },
};
