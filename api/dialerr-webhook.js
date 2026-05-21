// Inbound webhook from Dialerr — fires when a lead replies to the SMS.
// Per business rule: any reply = confirmed. Forward to Pricerr.
//
// Env vars expected (set in Vercel once Pricerr provides their details):
//   PRICERR_WEBHOOK_URL   — endpoint to POST confirmed leads to
//   PRICERR_API_KEY       — optional; sent as Authorization: Bearer <key> if set
//   PRICERR_CONTENT_TYPE  — optional; "json" (default) or "form"

const PRICERR_URL = process.env.PRICERR_WEBHOOK_URL || '';
const PRICERR_KEY = process.env.PRICERR_API_KEY || '';
const PRICERR_CT = (process.env.PRICERR_CONTENT_TYPE || 'json').toLowerCase();

/** Best-effort parser for whatever Dialerr posts (JSON or form-encoded). */
async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    const s = req.body.trim();
    if (!s) return {};
    if (s.startsWith('{') || s.startsWith('[')) {
      try { return JSON.parse(s); } catch { /* fall through */ }
    }
    const out = {};
    for (const [k, v] of new URLSearchParams(s)) out[k] = v;
    return out;
  }
  return {};
}

/** Pull common lead fields out of Dialerr's payload shape (best-effort). */
function extractLead(payload) {
  // Dialerr payloads vary; check the top level and a nested `contact`/`lead`/`data` object.
  const nest = payload.contact || payload.lead || payload.data || {};
  const pick = (...keys) => {
    for (const src of [payload, nest]) {
      for (const k of keys) {
        if (src && src[k] != null && src[k] !== '') return src[k];
      }
    }
    return '';
  };

  return {
    firstName: pick('firstName', 'first_name', 'firstname', 'fname'),
    lastName: pick('lastName', 'last_name', 'lastname', 'lname'),
    email: pick('email', 'emailAddress'),
    phone: pick('phone', 'phoneNumber', 'phone1', 'mobile'),
    moveDate: pick('moveDate', 'move_date', 'movedate'),
    moveSize: pick('moveSize', 'move_size', 'movesize'),
    originCity: pick('originCity', 'ocity'),
    originState: pick('originState', 'ostate'),
    originZip: pick('originZip', 'ozip'),
    destCity: pick('destCity', 'dcity'),
    destState: pick('destState', 'dstate'),
    destZip: pick('destZip', 'dzip'),
    refNo: pick('refNo', 'Ref_no', 'ref_no'),
    replyMessage: pick('message', 'body', 'text', 'reply'),
    source: 'BESTMOVING-CONFIRMED',
  };
}

async function sendToPricerr(lead) {
  if (!PRICERR_URL) {
    console.warn('[PRICERR] Skipped — PRICERR_WEBHOOK_URL not set');
    return { skipped: true, reason: 'PRICERR_WEBHOOK_URL not set' };
  }

  const headers = {};
  if (PRICERR_KEY) headers.Authorization = `Bearer ${PRICERR_KEY}`;

  let body;
  if (PRICERR_CT === 'form') {
    headers['Content-Type'] = 'application/x-www-form-urlencoded';
    body = new URLSearchParams(lead).toString();
  } else {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(lead);
  }

  console.log('[PRICERR] Sending:', PRICERR_CT, body);

  try {
    const r = await fetch(PRICERR_URL, { method: 'POST', headers, body });
    const text = await r.text();
    if (r.ok) {
      console.log('[PRICERR] Success:', r.status, text);
      return { ok: true, status: r.status, body: text };
    }
    console.error('[PRICERR] Failed:', r.status, text);
    return { ok: false, status: r.status, body: text };
  } catch (err) {
    console.error('[PRICERR] Request error:', err.message);
    return { ok: false, error: err.message };
  }
}

module.exports = async (req, res) => {
  // Allow GET so you can hit the URL in a browser to confirm it's deployed.
  if (req.method === 'GET') {
    return res.status(200).json({ ok: true, endpoint: 'dialerr-webhook', method: 'POST' });
  }
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const payload = await readBody(req);
    console.log('[DIALERR-WEBHOOK] Raw payload:', JSON.stringify(payload));

    const lead = extractLead(payload);
    console.log('[DIALERR-WEBHOOK] Extracted lead:', JSON.stringify(lead));

    const pricerrResult = await sendToPricerr(lead);
    console.log('[DIALERR-WEBHOOK] Pricerr result:', JSON.stringify(pricerrResult));

    // Always 200 to Dialerr — they'll retry on non-2xx and we don't want loops.
    return res.status(200).json({
      received: true,
      forwarded: !!pricerrResult.ok,
      pricerr: pricerrResult,
    });
  } catch (err) {
    console.error('[DIALERR-WEBHOOK] Error:', err);
    return res.status(200).json({ received: true, error: err.message || 'unknown' });
  }
};
