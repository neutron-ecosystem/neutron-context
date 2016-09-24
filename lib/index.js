const fs = require('fs');
const path = require('path');

const Schema = require('./utils/schema');
const NeutronFunction = require('./utils/neutron-function');
const NeutronConfig = require('./neutron-config');

const readSpec = specPath => {
  const json = fs.readFileSync(specPath).toString();
  const spec =  JSON.parse(json);

  return {
    name: spec.name,
    version: spec.version,
    description: spec.description
  }
};

const addModules = (schema, modules) => {
  for (const moduleMeta of modules) {
    const spec = readSpec(moduleMeta.path);
    const functions = require(moduleMeta.main);
    const functionNames = Object.keys(functions);

    const moduleSpec = Object.assign({}, spec, {
      functions: functionNames
    });

    schema.addModule(moduleSpec, moduleMeta);
    schema.addFunctions(functions, moduleMeta);
  }
};

const addHigherOrder = (schema, higherOrder) => {
  for (const higherOrderMeta of higherOrder) {
    const func = require(higherOrderMeta.path);
    const funcName = higherOrderMeta.id;

    schema.addHigherOrder(funcName, func, higherOrderMeta);
  }
};

const addRemoteFunction = (schema, remoteFunctions) => {
  for (const funcName of Object.keys(remoteFunctions)) {
    const options = remoteFunctions[funcName];
    schema.addRemoteFunction(funcName, options);
  }
};


module.exports = {
  getEmptySchema() {
    return Schema;
  },

  loadContext(options, meta) {
    const schema = new Schema();

    addModules(schema, meta.modules);
    addHigherOrder(schema, meta.higherOrder);

    let spec = null;
    if (meta.spec.isExists) {
      spec = readSpec(meta.spec.path);
    }

    let scope = null;
    if (meta.scope.isExists) {
      scope = require(meta.scope.path);
    }

    let neutron = null;
    if (meta.neutron.isExists) {
      const neutronJson = require(meta.neutron.path);
      neutron = new NeutronConfig(neutronJson);

      addRemoteFunction(schema, neutron.getRemoteFunctions());
    }

    schema.addScope(scope);

    return Promise.resolve({
      schema,
      spec,
      neutron
    });
  }
}
