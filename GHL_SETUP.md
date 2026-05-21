# GoHighLevel (GHL) integration

Leads submitted from the quote form are sent to **Hello Moving (Granot)** and also to **GoHighLevel** when the env vars below are set.

## 1. Set environment variables (Vercel)

In **Vercel** → your project → **Settings** → **Environment Variables**, add:

| Name             | Value                                      | Environments   |
|------------------|--------------------------------------------|----------------|
| `GHL_API_KEY`    | Your GHL Private Integration Token (e.g. `pit-...`) | Production, Preview |
| `GHL_LOCATION_ID`| Your GHL location/sub-account ID (e.g. `smihYndzGBgpiI04p14R`) | Production, Preview |

Redeploy after saving so the function picks up the new variables.

## 2. What gets sent to GHL

For each lead we call the GHL **Upsert Contact** API with:

- **locationId** – from `GHL_LOCATION_ID`
- **firstName** – from form `firstname`
- **lastName** – from form `lastname`
- **email** – from form `email`
- **phone** – from form `phone1` (or `phone`)
- **tags** – automatically adds `Ref:{clickid}` tag if clickid is present (e.g. `Ref:232323232`)
- **sourceId** – set to the clickid value for tracking/attribution

Upsert uses GHL’s duplicate rules (e.g. by email/phone) so the same person won’t be duplicated if they submit again.

## 3. Ref_no / ClickID in GHL

**Ref_no (clickid) is automatically sent to GHL** in two ways:

1. **As a Tag**: The contact gets tagged with `Ref:{clickid}` (e.g. `Ref:232323232`)
   - View tags in the contact's detail page in GHL
   - Filter/search contacts by tag: `Ref:232323232`

2. **As sourceId**: Used for lead source tracking/attribution
   - Check the contact's source field in GHL

### Optional: Custom Field (for structured data)

If you want Ref_no in a dedicated custom field instead of (or in addition to) tags:

1. In GHL dashboard, go to **Settings** → **Custom Fields** → create a field (e.g. "Ref No" or "Click ID")
2. Note the **custom field ID** from GHL
3. In `api/lead.js`, uncomment the `customFieldValueList` line and replace `'YOUR_CUSTOM_FIELD_ID'` with your actual field ID

## 4. Testing

1. Visit your site with a test clickid: `https://yoursite.com/?clickid=TEST123`
2. Submit a test lead from the form
3. In GHL, open **Contacts** for the location and find the contact
4. Verify:
   - Contact has name, email, phone
   - Contact has tag: `Ref:TEST123` (check Tags section)
   - Contact source shows: `TEST123` (if sourceId is displayed)

### Where to find Ref_no in GHL:

- **Tags section**: Look for tag starting with `Ref:`
- **Source field**: Check the contact's source/attribution field
- **Search**: Filter contacts by tag `Ref:TEST123`

If contacts don’t appear, check Vercel **Functions** → `api/lead` logs for GHL errors (e.g. 401 = wrong API key, 422 = validation/location or field issue).
