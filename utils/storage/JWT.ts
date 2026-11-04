import { Storage } from './Local';

class JWT extends Storage {
  constructor() {
    super('JWT');
  }
}

export default new JWT();
