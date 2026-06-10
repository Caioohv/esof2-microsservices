const repo = require('../repositories/user.rep');

const health = () => {
  const repositoryInfo = repo.findServiceInfo();

  return {
    status: 'ok',
    service: 'user-service',
    layer: 'business',
    repository: repositoryInfo
  };
};

module.exports = {
  health
};