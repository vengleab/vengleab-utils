import Response from './Response';

export default class Success extends Response {
  constructor(response) {
    super({
      statusCode: 200,
      message: 'Success',
      response,
    });
  }
}
