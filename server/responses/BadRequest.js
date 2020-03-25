import Response from './Response';

export default class BadRequest extends Response {
  constructor(response) {
    super({
      statusCode: 400,
      message: 'Bad Request',
      response,
    });
  }
}
