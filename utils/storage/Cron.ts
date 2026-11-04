import { Storage } from './Local';

class CronStorage extends Storage {
  constructor() {
    super('CronStorage');
  }
}

export default new CronStorage();
