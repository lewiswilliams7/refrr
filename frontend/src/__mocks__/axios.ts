import { AxiosInstance, AxiosRequestConfig, AxiosResponse, HeadersDefaults, AxiosHeaderValue, AxiosHeaders, AxiosDefaults } from 'axios';
import type { Mock } from 'jest-mock';

interface MockAxiosInstance extends AxiosInstance {
  create: Mock;
  get: Mock;
  post: Mock;
  put: Mock;
  delete: Mock;
  patch: Mock;
  head: Mock;
  options: Mock;
  postForm: Mock;
  putForm: Mock;
  patchForm: Mock;
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