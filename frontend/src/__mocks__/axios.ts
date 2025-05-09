import { AxiosInstance, AxiosRequestConfig, AxiosResponse, HeadersDefaults, AxiosHeaderValue, AxiosHeaders, AxiosDefaults } from 'axios';

// Only import jest types in test environment
const isTest = process.env.NODE_ENV === 'test';
const Mock = isTest ? require('jest-mock').Mock : Function;

interface MockAxiosInstance extends AxiosInstance {
  create: typeof Mock;
  get: typeof Mock;
  post: typeof Mock;
  put: typeof Mock;
  delete: typeof Mock;
  patch: typeof Mock;
  head: typeof Mock;
  options: typeof Mock;
  postForm: typeof Mock;
  putForm: typeof Mock;
  patchForm: typeof Mock;
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

// Only use jest.fn in test environment
const createMockFn = () => isTest ? jest.fn() : () => {};

const mockAxios: MockAxiosInstance = {
  create: createMockFn(),
  get: createMockFn(),
  post: createMockFn(),
  put: createMockFn(),
  delete: createMockFn(),
  patch: createMockFn(),
  head: createMockFn(),
  options: createMockFn(),
  postForm: createMockFn(),
  putForm: createMockFn(),
  patchForm: createMockFn(),
  defaults: mockDefaults,
  interceptors: {
    request: { use: createMockFn(), eject: createMockFn() },
    response: { use: createMockFn(), eject: createMockFn() }
  },
  request: createMockFn(),
  getUri: createMockFn(),
} as unknown as MockAxiosInstance;

export default mockAxios; 