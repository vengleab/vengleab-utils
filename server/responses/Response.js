export default class Response {
  constructor({ statusCode, message, response }) {
    this.statusCode = statusCode;
    this.message = message;
    this.response = response;
  }

  send(result) {
    this.response.status(this.statusCode).send({
      message: this.message,
      statusCode: this.statusCode,
      result,
    });
  }

  setMessage(msg) {
    this.message = msg;
    return this;
  }
}
