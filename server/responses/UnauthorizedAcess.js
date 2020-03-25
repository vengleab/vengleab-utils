import Response from './Response';

export default class UnauthorizedAcess extends Response {
  constructor(response) {
    super({
      statusCode: 500,
      message: 'Unauthorized Access',
      response,
    });
  }
}
