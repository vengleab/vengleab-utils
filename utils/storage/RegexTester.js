import { Storage } from "./Local";

class RegexTesterStorage extends Storage {
  constructor() {
    super("RegexTesterStorage");
  }
}

export default new RegexTesterStorage();
