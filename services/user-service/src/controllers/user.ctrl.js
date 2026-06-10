const business = require('../business/user.bs');

const health = async (req, res) => {
  const result = business.health();
  res.json(result);
};

module.exports = {
  health
};