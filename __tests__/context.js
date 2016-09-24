const path = require('path');
const loadContext = require('..');
const loadMeta = require('neutron-meta');

const options = {
  dir: './__tests__/test-workspace'
};

describe('load context', () => {
  let schema = null;
  let spec = null;

  beforeAll(() => {
    return loadMeta(options).then(meta => {
      return loadContext(options, meta).then(context => {
        schema = context.schema;
        spec = context.spec;
      });
    });
  });

  it('shema functions', () => {
    expect(schema.functions.size).toEqual(6);
  });

  it('shema modules', () => {
    expect(schema.modules.size).toEqual(3);
  });

  it('module spec', () => {
    const mod = schema.modules.get('neutron-foo-module@2.0.0');
    expect(mod.version).toEqual('2.0.0');
    expect(mod.name).toEqual('neutron-foo-module');
  });

  it('module meta', () => {
    const mod = schema.meta.get('module.neutron-foo-module@2.0.0');
    expect(mod).toEqual({
      path: path.join(__dirname, 'test-workspace/modules/foo/package.json'),
      main: path.join(__dirname, 'test-workspace/modules/foo/index.js'),
      isExists: true
    })
  });

  it('module existing', () => {
    expect(schema.isModuleExists('neutron-foo-module', '2.0.0')).toEqual(true);
    expect(schema.isModuleExists('foobar', '1.2.3')).toEqual(false);
  });

  it('function existing', () => {
    expect(schema.isFuntionExists('getFooBar')).toEqual(false);
    expect(schema.isFuntionExists('barB')).toEqual(true);
  });

  it('warnings', () => {
    const warnings = schema.warnings;
    const warningsIterator = warnings.values();

    expect(warnings.size).toEqual(1);
    expect(warningsIterator.next().value).toEqual({
      message: 'extra higher order funcion "getBarBaz"',
      meta: {
        id: 'getBarBaz',
        path: path.join(__dirname, 'test-workspace/higher-order/getBarBaz.js'),
        isExists: true
      }
    });
  });

  it('function call', () => {
    const neutronFunction = schema.functions.get('barB');
    const NUMBER = 5;

    expect(neutronFunction.execute(NUMBER)).toEqual(`barB${NUMBER}`);
  });

  it('function call with higher order', () => {
    const neutronFunction = schema.functions.get('getBaz');
    const NUMBER = 5;

    expect(neutronFunction.execute(NUMBER)).toEqual(106);
  });

  it('function execute trace', () => {
    const neutronFunction = schema.functions.get('getBaz');

    expect(neutronFunction.getTrace()).toEqual([
      path.join(__dirname, 'test-workspace/higher-order/getBaz.js'),
      path.join(__dirname, 'test-workspace/node_modules/baz-neutron-function/index.js')
    ]);
  });

  it('application spec', () => {
    expect(spec).toEqual({
      "name": "test-workspace",
      "version": "1.0.0",
      "description": "",
      "main": "context.js",
      "devDependencies": {},
      "scripts": {
        "test": "echo \"Error: no test specified\" && exit 1"
      },
      "keywords": [],
      "author": "",
      "license": "ISC"
    });
  });
});
