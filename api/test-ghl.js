// Test endpoint – sends a dummy contact to GHL and returns the full response.
// Access: GET /api/test-ghl   (staff only, not linked publicly)

const GHL_CONTACTS_URL = 'https://services.leadconnectorhq.com/contacts/upsert';

module.exports = async (req, res) => {
  const apiKey = process.env.GHL_API_KEY;
  const locationId = process.env.GHL_LOCATION_ID;

  const result = {
    timestamp: new Date().toISOString(),
    env: {
      GHL_API_KEY: apiKey ? `set (${apiKey.slice(0, 8)}...)` : 'NOT SET',
      GHL_LOCATION_ID: locationId || 'NOT SET',
    },
    ghl: null,
  };

  if (!apiKey || !locationId) {
    return res.status(200).json({ ...result, error: 'Missing env vars' });
  }

  const payload = {
    locationId,
    firstName: 'Test',
    lastName: 'Lead',
    email: 'test@perfectlyfastmoving.com',
    phone: '+15555550100',
    source: 'BESTMOVING',
    tags: ['test-ping'],
  };

  try {
    const ghlRes = await fetch(GHL_CONTACTS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        Version: '2021-07-28',
      },
      body: JSON.stringify(payload),
    });
    const body = await ghlRes.text();
    result.ghl = {
      status: ghlRes.status,
      ok: ghlRes.ok,
      body: (() => { try { return JSON.parse(body); } catch { return body; } })(),
    };
  } catch (err) {
    result.ghl = { error: err.message };
  }

  return res.status(200).json(result);
};
