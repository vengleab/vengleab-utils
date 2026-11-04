import { Storage } from './Local';

class DayCountStorage extends Storage {
  constructor() {
    super('DayCountStorage');
  }
}

export default new DayCountStorage();
