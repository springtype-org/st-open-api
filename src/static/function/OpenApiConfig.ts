import { OpenApiConfig } from '../interface/http/OpenApiConfig';

export const Config: OpenApiConfig = {
  endpointUrl: 'Please override me',
  sendRequest: () => {
    throw new Error('Not implemented exception');
  },
  requestInterceptor: async (request) => request,
  errorHandler: () => {},
};
