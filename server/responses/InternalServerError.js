import Response from './Response';

export default class InternalServerError extends Response {
  constructor(response) {
    super({
      message: 'Internal Server Error',
      statusCode: 500,
      response,
    });
  }
}
