import { AxiosInstance, AxiosRequestConfig, AxiosResponse, HeadersDefaults, AxiosHeaderValue, RawAxiosHeaders } from 'axios';

interface MockAxiosInstance extends AxiosInstance {
  create: jest.Mock;
  get: jest.Mock;
  post: jest.Mock;
  put: jest.Mock;
  delete: jest.Mock;
  patch: jest.Mock;
  head: jest.Mock;
  options: jest.Mock;
  postForm: jest.Mock;
  putForm: jest.Mock;
  patchForm: jest.Mock;
}

const mockHeaders: HeadersDefaults = {
  common: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  },
  delete: {},
  get: {},
  head: {},
  post: {
    'Content-Type': 'application/json'
  },
  put: {
    'Content-Type': 'application/json'
  },
  patch: {
    'Content-Type': 'application/json'
  }
};

const mockAxios: MockAxiosInstance = {
  create: jest.fn(() => mockAxios),
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  patch: jest.fn(),
  head: jest.fn(),
  options: jest.fn(),
  postForm: jest.fn(),
  putForm: jest.fn(),
  patchForm: jest.fn(),
  defaults: {
    headers: mockHeaders,
    baseURL: '',
    timeout: 0,
    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN',
    maxContentLength: -1,
    maxBodyLength: -1,
    validateStatus: (status: number) => status >= 200 && status < 300
  },
  interceptors: {
    request: { use: jest.fn(), eject: jest.fn() },
    response: { use: jest.fn(), eject: jest.fn() }
  },
  request: jest.fn(),
  getUri: jest.fn(),
  // Add any other methods you need to mock
} as MockAxiosInstance;

export default mockAxios; 