// const NeutronServerConnection = require('./neutron-server-connection');
const NeutronFunction = require('./neutron-function');

module.exports = class NeutornRemoteFunction extends NeutronFunction {
  constructor(name, options) {
    const func = (props) => {
      // NOTE: implement functions calls between servers

      // const connection = new NeutronServerConnection({
        // url: options.url
      // });

      // return connection(props);
      return 'remote func';
    };

    super(name, func, options);
  }
}
