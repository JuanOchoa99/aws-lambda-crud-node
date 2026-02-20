const aws = require('aws-sdk');
const {
  mockPut, mockGet, mockScan, mockUpdate, mockDelete,
  mockPutFn, mockGetFn, mockScanFn, mockUpdateFn, mockDeleteFn,
} = aws.__mocks;

beforeEach(() => {
  [mockPut, mockGet, mockScan, mockUpdate, mockDelete].forEach((m) => m.mockClear());
  [mockPutFn, mockGetFn, mockScanFn, mockUpdateFn, mockDeleteFn].forEach((m) => m.mockClear());
});
