# Debugging Ref_no / ClickID Implementation

## Quick Test Steps

### 1. Test with ClickID in URL
Visit your site with a test clickid:
```
https://yoursite.com/?clickid=TEST123
```

### 2. Check Browser Console
1. Open Developer Tools (F12 or Right-click → Inspect)
2. Go to **Console** tab
3. Look for `[DEBUG]` messages:
   - `[DEBUG] ClickID captured from URL: TEST123`
   - `[DEBUG] Ref_no added to API request: TEST123`
   - `[DEBUG] Form submission parameters: {...}`
   - `[DEBUG] API Response: ...`

### 3. Check Network Tab
1. Go to **Network** tab in Developer Tools
2. Submit the form
3. Find the request to `/api/lead`
4. Click on it → Go to **Payload** or **Request** tab
5. Verify `Ref_no=TEST123` is in the form data

### 4. Check API Proxy Logs
If using Vercel:
- Go to Vercel Dashboard → Your Project → Functions → `/api/lead`
- Check function logs to see the request body being forwarded

## What we send to Granot

We send the clickid in **two** parameters so it shows in Granot:

- **Ref_no** – used by lead provider / Hello Moving
- **sourcereference** – Granot’s official field for “landing page or form where the lead came from”; **this data can be retrieved in reports** (per Granot API docs)

## Where to Find Ref_no / sourcereference in Granot

### Option 1: Granot Admin Dashboard
1. Log into your **Granot/Hello Moving admin panel**
2. Navigate to **Leads** or **Lead Management** section
3. Find the lead you just submitted
4. Look for:
   - **Source Reference** or **sourcereference** (main field for reports)
   - **Reference Number** / **Ref_no** / **Reference**
   - **Notes** or **Comments**

### Option 2: Lead Details Page
1. Click on a specific lead to view details
2. Check the lead detail page for:
   - Reference fields
   - Custom parameters
   - API parameters section
   - Lead source/attribution fields

### Option 3: Export/Reports
1. Export leads to CSV/Excel or run reports
2. Look for columns:
   - **sourcereference** (Granot’s report field for source/click ID)
   - `Ref_no`, `Reference`, `Reference Number`, or `Custom1`

### Option 4: Contact Granot Support
If you can't find it:
- Contact Granot/Hello Moving support
- Ask: "Where can I see the Ref_no parameter that's being sent with lead submissions?"
- They can tell you the exact field name and location

## Manual Testing Checklist

- [ ] Visit site with `?clickid=TEST123`
- [ ] Check console shows ClickID captured
- [ ] Fill out and submit form
- [ ] Check console shows Ref_no added
- [ ] Check Network tab shows Ref_no in request
- [ ] Verify lead appears in Granot
- [ ] Find Ref_no field in Granot lead details

## Common Issues

### Issue: ClickID not captured
**Solution:** 
- Check URL has `?clickid=value` (not `#clickid=value`)
- Check browser console for errors
- Clear sessionStorage and try again

### Issue: Ref_no not in API request
**Solution:**
- Check console logs - should show `[DEBUG] Ref_no added`
- Verify clickid was captured (check first debug log)
- Check Network tab to see actual request payload

### Issue: Ref_no not showing in Granot
**Solution:**
- Verify API is receiving it (check Network tab)
- Contact Granot support to confirm field name
- May need to enable custom field in Granot settings

## Testing Commands

### Clear sessionStorage (if needed)
Open browser console and run:
```javascript
sessionStorage.removeItem('clickid');
```

### Check current ClickID
```javascript
console.log('Current ClickID:', sessionStorage.getItem('clickid'));
```

### Simulate URL with ClickID
```javascript
// This simulates having clickid in URL
sessionStorage.setItem('clickid', 'MANUAL_TEST_123');
console.log('Set ClickID to: MANUAL_TEST_123');
```

## API Request Format

The request should look like this:
```
POST /api/lead
Content-Type: application/x-www-form-urlencoded

label=BESTMOVING&firstname=John&...&servtypeid=102&Ref_no=TEST123&sourcereference=TEST123
```

Notice `Ref_no=TEST123` and `sourcereference=TEST123` – both are sent so Granot shows the click ID in reports (sourcereference).
