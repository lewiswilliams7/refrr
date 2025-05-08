import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

interface MockAxiosInstance extends AxiosInstance {
  create: jest.Mock;
  get: jest.Mock;
  post: jest.Mock;
  put: jest.Mock;
  delete: jest.Mock;
  patch: jest.Mock;
}

const mockAxios: MockAxiosInstance = {
  create: jest.fn(() => mockAxios),
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  patch: jest.fn(),
  defaults: { headers: { common: {} } },
  interceptors: {
    request: { use: jest.fn(), eject: jest.fn() },
    response: { use: jest.fn(), eject: jest.fn() }
  },
  request: jest.fn(),
  getUri: jest.fn(),
  // Add any other methods you need to mock
} as MockAxiosInstance;

export default mockAxios; 