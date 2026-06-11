const business = require('../business/user.bs');

async function health(req, res) {
  const result = business.health();
  res.json(result);
}

module.exports = {
  health,
};