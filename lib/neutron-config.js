module.exports = class NeutronConfig {
  constructor(config) {
    this.config = config;
  }

  getPort() {
    return this.config.port;
  }

  getSecretKey() {
    return this.config.secret;
  }

  getTokePayload() {
    return this.config.payload;
  }

  getConnectionHosts() {
    return this.config.connections;
  }

  isMaster() {
    return !!this.config.master;
  }

  getRequestedFunctions() {
    return this.config.requestFunctions || [];
  }

  getRemoteFunctions() {
    return this.config.remoteFunctions || [];
  }
}
