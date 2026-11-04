export class Storage {
  private key: string;

  constructor(key = '') {
    this.key = key || '';
  }

  get(key: string) {
    return localStorage.getItem(this.key + key) || '';
  }

  set(key: string, value: string) {
    localStorage.setItem(this.key + key, value);
  }
}

export default new Storage();
