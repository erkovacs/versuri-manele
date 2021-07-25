class TextGenerator {

  static get DEFAULT_ORDER() { return 6; }
  static get DEFAULT_LENGTH() { return 10000; }
  static get REGEX_UPPERCASE() { return /[A-Z]/g; }
  static get RAND_MAX() { return 32767; }

  constructor(config = {}) {
    if (!config.text || config.text.length === 0) {
      this.text = "";
    } else {
      this.text = config.text;
    }
    if (typeof config.order !== "number") {
      this.order = TextGenerator.DEFAULT_ORDER;
    } else if (config.order < 1) {
      throw new Error("Invalid order passed");
    } else {
      this.order = config.order;
    }
    if (typeof config.length !== "number") {
      this.maxLength = this.text.length || TextGenerator.DEFAULT_LENGTH;
    } else if (config.length < 1) {
      throw new Error("Invalid length passed");
    } else {
      this.maxLength = config.length;
    }
    this.ngrams = new Map();
    this.result = "";
  }

  setText(text) {
    this.text = text;
  }

  setOrder(order) {
    if (typeof order !== "number") {
      throw new Error("Invalid order passed");
    }
    this.order = order;
  }

  getResult() {
    return this.result;
  }

  _pick(possibilities) {
    const i =
      Math.round(Math.random() * TextGenerator.RAND_MAX) % possibilities.length;
    return possibilities[i];
  }

  _pickStart(ngrams) {
    const beginnings = [];
    let first,
      i = 0;
    for (let ngram of ngrams) {
      if (i === 0) first = ngram;
      if (TextGenerator.REGEX_UPPERCASE.test(ngram.charAt(0))) {
        beginnings.push(ngram);
      }
    }
    if (beginnings.length === 0) {
      beginnings.push(first);
    }
    return this._pick(beginnings);
  }

  _createTable() {
    if (this.text.length === 0) {
      throw new Error("Cannot produce output without a seed text");
    }
    let ngram;
    for (let i = 0; i < this.text.length; i++) {
      ngram = this.text.substring(i, i + this.order);
      let current = this.ngrams.get(ngram);
      if (!Array.isArray(current)) {
        current = [];
      }
      current.push(this.text.charAt(i + this.order));
      this.ngrams.set(ngram, current);
    }
  }

  generateText() {
    this._createTable();
    let current = this._pickStart(this.ngrams.keys());
    this.result = current;
    for (let i = 0; i < this.maxLength; i++) {
      let possibilities = this.ngrams.get(current);
      if (!possibilities || !possibilities.length) {
        possibilities = [""];
      }
      this.result += this._pick(possibilities);
      current = this.result.substring(
        this.result.length - this.order,
        this.result.length
      );
    }
  }
}

module.exports = TextGenerator;
