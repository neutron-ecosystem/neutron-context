const NeutronFunction = require('./neutron-function');
const NeutronRemoteFunction = require('./neutron-remote-function');
const LambdaFunction = require('./lambda-function');

const getModuleKey = (name, version) => `${name}@${version}`;

module.exports = class Schema {
  constructor() {
    this.version = 1;

    this.functions = new Map();
    this.meta = new Map();
    this.modules = new Map();
    this.warnings = new Set();
    this.scope = null;
  }

  addScope(scope) {
    this.scope = scope;
  }

  getScope() {
    return this.scope;
  }

  addFunctions(functions, meta) {
    for (const funcName of Object.keys(functions)) {
      this.addFunction(funcName, functions[funcName], meta);
    }
  }

  addFunction(funcName, func, meta) {
    if (this.isFuntionExists(funcName)) {
      throw new Error(`function "${funcName}" already exists`);
    }

    const neutronFunction = new NeutronFunction(funcName, func, {
      meta,
      protocols: {
        socket: true,
        http: true,
        method: 'GET'
      }
    });

    this.functions.set(funcName, neutronFunction);
    this.meta.set(`function.${funcName}`, meta);
  }

  replaceFunction() {
    // NOTE: dev
    this.version++;
  }

  addRemoteFunction(funcName, options) {
    const neutronRemoteFunction = new NeutronRemoteFunction(funcName, options);
    this.functions.set(funcName, neutronRemoteFunction);

    this.meta.set(`function.${funcName}`, {
      url: options.url,
      method: options.method,
      protocols: options.protocols
    });
  }

  replaceRemoteFunction() {
    // NOTE: dev
    this.version++;
  }

  addHigherOrder(funcName, func, meta) {
    if (this.isFuntionExists(funcName)) {
      const neutronFunc = this.functions.get(funcName);
      neutronFunc.addHigherOrder(func, meta);

      this.meta.set(`highOrder.${funcName}`, meta);
    } else {
      this.warnings.add({
        message: `extra higher order funcion "${funcName}"`,
        meta
      });
    }
  }

  isFuntionExists(funcName) {
    return this.functions.has(funcName);
  }

  isModuleExists(name, version) {
    const key = getModuleKey(name, version);
    return this.modules.has(key);
  }

  addModule(spec, meta) {
    const { name, version } = spec;
    const key = getModuleKey(name, version);

    if (this.isModuleExists(name, version)) {
      throw new Error(`module "${key}" already exists`);
    }

    this.modules.set(key, spec);
    this.meta.set(`module.${key}`, meta);
  }

  addWargning(message) {
    this.warnings.add(message);
  }
};
