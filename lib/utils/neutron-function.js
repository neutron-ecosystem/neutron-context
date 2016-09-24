module.exports = class NeutronFunction {
  constructor(name, func, options = {
    isExecutable: true
  }) {
    // NOTE: convert to private attributes
    this.name = name;
    this.func = func;
    this.options = options;

    this.higherOrderMeta = [];
    this.higherOrder = [];
  }

  isBlocked() {
    return this.options.isBlocked;
  }

  isDirectCallAvailable() {
    return this.higherOrder.length === 0;
  }

  getRemoteAddress() {
    return this.options.url;
  }

  getProtocols() {
    return this.options.protocols;
  }

  addHigherOrder(higherOrder, meta) {
    this.higherOrder.push(higherOrder);
    this.higherOrderMeta.push(meta)
  }

  execute(...props) {
    if (this.higherOrder.length) {

      const func = this.higherOrder.reduce((func, step) => {
        return (...props) => step(func, ...props);
      }, (...props) => this.func(...props));

      // NOTE: will promise be rejected on error?
      return Promise.resolve(func(...props));
    } else {
      // NOTE: will promise be rejected on error?
      return Promise.resolve(this.func(...props));
    }
  }

  getTrace() {
    const trace = [];

    for (const higherOrder of this.higherOrderMeta) {
      trace.push(higherOrder.path);
    }

    trace.push(this.options.meta.main);

    return trace;
  }
};
