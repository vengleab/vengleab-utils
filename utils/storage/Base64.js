import { Storage } from './Local';

class Base64Storage extends Storage {
  constructor() {
    super('Base64Storage');
  }
}

export default new Base64Storage();
