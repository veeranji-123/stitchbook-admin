const { coreUrl, internalToken } = require('./config');

async function coreRequest(method, path, body) {
  const response = await fetch(`${coreUrl}${path}`, {
    method,
    headers: {
      'content-type': 'application/json',
      'x-internal-token': internalToken,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = await response.json().catch(() => ({}));
  return { status: response.status, payload };
}

function getSummary() {
  return coreRequest('GET', '/internal/admin/summary');
}

function getShops() {
  return coreRequest('GET', '/internal/admin/shops');
}

function setShopActive(id, isActive) {
  return coreRequest('PATCH', `/internal/admin/shops/${encodeURIComponent(id)}/active`, { isActive });
}

module.exports = { getSummary, getShops, setShopActive };
