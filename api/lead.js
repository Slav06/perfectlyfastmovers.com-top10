// Proxy lead to Dialerr (auto-text platform) and GoHighLevel (CRM record).
// Dialerr texts the lead; on reply, Dialerr posts to /api/dialerr-webhook
// which forwards the confirmed lead to Pricerr.
// NOTE: This file is a Vercel serverless function (Node.js, CommonJS).

const DIALERR_WEBHOOK_URL =
  process.env.DIALERR_WEBHOOK_URL ||
  'https://api.dialerr.com/api/v1/webhooks/66a76bfcfb02cbbce16406c6a2ccb8b1';

const GHL_CONTACTS_URL = 'https://services.leadconnectorhq.com/contacts/upsert';

/** Parse form body into key-value object */
function parseFormBody(bodyStr) {
  const params = new URLSearchParams(bodyStr);
  const out = {};
  for (const [k, v] of params) {
    out[k] = v;
  }
  return out;
}

/** Send lead to Dialerr webhook as JSON */
async function sendToDialerr(contact) {
  const payload = {
    firstName: contact.firstname || '',
    lastName: contact.lastname || '',
    email: contact.email || '',
    phone: contact.phone1 || contact.phone || '',
    moveDate: contact.movedate || contact.move_date || '',
    moveSize: contact.movesize || contact.move_size || '',
    originCity: contact.ocity || contact.origin_city || '',
    originState: contact.ostate || contact.origin_state || '',
    originZip: contact.ozip || contact.origin_zip || '',
    destCity: contact.dcity || contact.dest_city || '',
    destState: contact.dstate || contact.dest_state || '',
    destZip: contact.dzip || contact.dest_zip || '',
    refNo: contact.Ref_no || '',
    source: 'BESTMOVING',
    raw: contact,
  };

  console.log('[DIALERR] Sending payload:', JSON.stringify(payload));

  try {
    const r = await fetch(DIALERR_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const text = await r.text();
    if (r.ok) {
      console.log('[DIALERR] Success:', r.status, text);
      return { ok: true, status: r.status, body: text };
    }
    console.error('[DIALERR] Failed:', r.status, text);
    return { ok: false, status: r.status, body: text };
  } catch (err) {
    console.error('[DIALERR] Request error:', err.message);
    return { ok: false, error: err.message };
  }
}

/** Send contact to GoHighLevel; returns result object for logging */
async function sendToGHL(contact) {
  const apiKey = process.env.GHL_API_KEY;
  const locationId = process.env.GHL_LOCATION_ID;

  if (!apiKey || !locationId) {
    console.warn('[GHL] Skipped – GHL_API_KEY or GHL_LOCATION_ID not set');
    return { skipped: true, reason: 'env vars not set' };
  }

  const payload = {
    locationId,
    firstName: contact.firstname || '',
    lastName: contact.lastname || '',
    email: contact.email || '',
    phone: contact.phone1 || contact.phone || '',
    source: 'BESTMOVING',
  };

  payload.tags = ['BESTMOVING'];
  if (contact.Ref_no) {
    payload.tags.push(`Ref:${contact.Ref_no}`);
    payload.sourceId = contact.Ref_no;
  }

  console.log('[GHL] Sending payload:', JSON.stringify(payload));

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
    const ghlText = await ghlRes.text();
    if (ghlRes.ok) {
      console.log('[GHL] Success:', ghlRes.status, ghlText);
      return { ok: true, status: ghlRes.status, body: ghlText };
    } else {
      console.error('[GHL] Failed:', ghlRes.status, ghlText);
      return { ok: false, status: ghlRes.status, body: ghlText };
    }
  } catch (err) {
    console.error('[GHL] Request error:', err.message);
    return { ok: false, error: err.message };
  }
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let body;

    // Vercel may give us a raw string body or an already-parsed object.
    if (typeof req.body === 'string') {
      body = req.body;
    } else if (req.body && typeof req.body === 'object') {
      body = new URLSearchParams(req.body).toString();
    } else {
      return res.status(400).send('400,Bad request,Missing body');
    }

    const form = parseFormBody(body);

    // Send to Dialerr (primary — triggers auto-text) and GHL (CRM record) in parallel
    const [dialerrResult, ghlResult] = await Promise.all([
      sendToDialerr(form),
      sendToGHL(form),
    ]);

    console.log(
      '[LEAD] Dialerr result:',
      JSON.stringify(dialerrResult),
      '| GHL result:',
      JSON.stringify(ghlResult)
    );

    // Frontend parses "LEADID,ERRID,message,..." and treats ERRID==='0' as success.
    res.setHeader('Content-Type', 'text/plain');
    if (dialerrResult.ok) {
      const leadId = form.Ref_no || Date.now().toString();
      return res.status(200).send(`${leadId},0,OK,Lead received`);
    }
    const errDetail = (dialerrResult.body || dialerrResult.error || 'unknown')
      .toString()
      .replace(/,/g, ' ');
    return res.status(502).send(`0,1,Dialerr error,${errDetail}`);
  } catch (err) {
    console.error('Lead proxy error:', err);
    return res
      .status(500)
      .send('500,Proxy error,' + (err && err.message ? err.message : 'Unknown error'));
  }
};
