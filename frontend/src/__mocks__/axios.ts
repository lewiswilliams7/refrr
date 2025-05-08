import { AxiosInstance, AxiosRequestConfig, AxiosResponse, HeadersDefaults, AxiosHeaderValue, AxiosHeaders, AxiosDefaults } from 'axios';

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

const mockHeaders = {
  common: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  } as Record<string, string>,
  delete: {} as Record<string, string>,
  get: {} as Record<string, string>,
  head: {} as Record<string, string>,
  post: {
    'Content-Type': 'application/json'
  } as Record<string, string>,
  put: {
    'Content-Type': 'application/json'
  } as Record<string, string>,
  patch: {
    'Content-Type': 'application/json'
  } as Record<string, string>
} as HeadersDefaults;

const mockDefaults: AxiosDefaults = {
  headers: mockHeaders,
  baseURL: '',
  timeout: 0,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
  maxContentLength: -1,
  maxBodyLength: -1,
  validateStatus: (status: number) => status >= 200 && status < 300
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
  defaults: mockDefaults,
  interceptors: {
    request: { use: jest.fn(), eject: jest.fn() },
    response: { use: jest.fn(), eject: jest.fn() }
  },
  request: jest.fn(),
  getUri: jest.fn(),
  // Add any other methods you need to mock
} as unknown as MockAxiosInstance;

export default mockAxios; 