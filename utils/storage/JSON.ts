import { Storage } from './Local';

class JSONBeautifier extends Storage {
  constructor() {
    super('JSONBeautifier');
  }
}

export default new JSONBeautifier();
