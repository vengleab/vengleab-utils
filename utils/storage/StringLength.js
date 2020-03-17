import { Storage } from './Local';

class StringLengthStorage extends Storage {
  constructor() {
    super('StringLengthStorage');
  }
}

export default new StringLengthStorage();
