import { Storage } from './Local';

class CodeHighlighterStorage extends Storage {
  constructor() {
    super('CodeHighlighterStorage');
  }
}

export default new CodeHighlighterStorage();
