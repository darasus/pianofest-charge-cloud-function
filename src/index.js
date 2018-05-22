const stripe = require('stripe')(STRIPE_SECRET_HERE);

/**
 * makeCharge helper function
 */
const makeCharge = (res, id, amount, currency, metadata) => {
  const paylaod = {
    amount,
    currency,
    metadata,
    source: id,
  };
  stripe.charges.create(paylaod, (err, charge) => {
    if (err !== null) {
      res
        .status(500)
        .send({ error: 'Purchase Failed. Please try again.', err });
    } else {
      res.send(charge);
    }
  });
};

/**
 * retrieveSource helper function
 */
const retrieveSource = (sourceId, callback) =>
  stripe.sources.retrieve(sourceId, (err, source) => callback(source));

exports.charge = (req, res) => {
  // setting headers
  res.set('Access-Control-Allow-Origin', CLIENT_ORIGIN_URL_HERE);
  res.set('Access-Control-Allow-Methods', 'POST');
  res.header('Content-Type', 'text/x-www-form-urlencoded');
  const { sourceId } = JSON.parse(req.body);
  if (!sourceId) {
    return res.status(400).send('sourceId is not provided.');
  }
  return retrieveSource(sourceId, ({ amount, currency, id, metadata }) =>
    makeCharge(res, id, amount, currency, metadata, (chargeResponse) =>
      res.send(chargeResponse),
    ),
  );
};
