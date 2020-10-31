import Response from './Response';

export default class UnauthorizedAccess extends Response {
  constructor(response) {
    super({
      statusCode: 401,
      message: 'Unauthorized Access',
      response,
    });
  }
}
