import { AxiosError, AxiosHeaders } from 'axios';
import { errorMessage } from './error-message';

const responseError = (data: unknown) =>
  new AxiosError('Request failed with status code 400', 'ERR_BAD_REQUEST', undefined, undefined, {
    data,
    status: 400,
    statusText: 'Bad Request',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });

describe('errorMessage', () => {
  it('should join the validation messages of a response', () => {
    expect(errorMessage(responseError({ message: ['amount: Invalid currency', 'id: Invalid UUID'] }))).toBe(
      'amount: Invalid currency\r\nid: Invalid UUID',
    );
  });

  it('should use the message of a response', () => {
    expect(errorMessage(responseError({ statusCode: 400, message: 'Not enough money', error: 'Bad Request' }))).toBe(
      'Not enough money',
    );
  });

  it('should fall back to the request error when the response has no message', () => {
    expect(errorMessage(responseError('<html>Bad Gateway</html>'))).toBe('Request failed with status code 400');
  });

  it('should use the request error when there is no response', () => {
    expect(errorMessage(new AxiosError('Network Error', 'ERR_NETWORK'))).toBe('Network Error');
  });

  it('should use the message of any other error', () => {
    expect(errorMessage(new Error('Unexpected token'))).toBe('Unexpected token');
  });

  it('should describe a thrown non-error', () => {
    expect(errorMessage('aborted')).toBe('aborted');
  });
});
