import Response from './Response';

export default class NotFound extends Response {
  constructor(response) {
    super({
      statusCode: 404,
      message: 'Url not found',
      response,
    });
  }
}
