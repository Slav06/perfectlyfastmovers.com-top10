/**
 * Lead Profile - Long Distance Charges
 * Populates from URL params and runs basic price calculations.
 */

(function () {
    const $ = (id) => document.getElementById(id);
    const qs = (sel) => document.querySelector(sel);

    // Populate from URL query string (e.g. ?firstname=Bob&ozip=89134&dzip=33180&...)
    function initFromParams() {
        const params = new URLSearchParams(window.location.search);
        const firstname = params.get('firstname') || '';
        const lastname = params.get('lastname') || '';
        const email = params.get('email') || '';
        const phone1 = params.get('phone1') || '';
        const ozip = params.get('ozip') || '';
        const dzip = params.get('dzip') || '';
        const movedte = params.get('movedte') || '';
        const movesize = params.get('movesize') || '';

        const clientName = [firstname, lastname].filter(Boolean).join(' ') || '—';

        const fromClientName = $('fromClientName');
        const toClientName = $('toClientName');
        const fromAddress = $('fromAddress');
        const toAddress = $('toAddress');
        const fromPhone = $('fromPhone');
        const fromEmail = $('fromEmail');

        if (fromClientName) fromClientName.textContent = clientName || '—';
        if (toClientName) toClientName.textContent = clientName || '—';
        if (fromAddress) fromAddress.textContent = ozip ? `Zip: ${ozip}` : '—';
        if (toAddress) toAddress.textContent = dzip ? `Zip: ${dzip}` : '—';
        if (fromPhone) fromPhone.textContent = phone1 || '—';
        if (fromEmail) fromEmail.textContent = email || '—';

        if ($('emailStatus')) $('emailStatus').textContent = email ? '—' : '—';
        if ($('esignStatus')) $('esignStatus').textContent = '—';
        if ($('reference')) $('reference').textContent = params.get('label') || 'BESTMOVING';
    }

    // Price calculations
    function getNum(id, def = 0) {
        const el = $(id);
        if (!el) return def;
        const v = parseFloat(el.value);
        return isNaN(v) ? def : v;
    }

    function setText(id, text) {
        const el = $(id);
        if (el) el.textContent = text;
    }

    function recalc() {
        const cf = getNum('volumeCf', 354);
        const perCf = getNum('pricePerCf', 14);
        const fuelPct = getNum('fuelPct', 15) / 100;
        const discount = getNum('discountAmount', 2700);

        const initial = cf * perCf;
        const fuel = initial * fuelPct;
        const subtotal = initial + fuel;
        const total = Math.max(0, subtotal - discount);

        setText('initialPriceCalc', initial.toFixed(2));
        setText('fuelSurchargeCalc', '$' + fuel.toFixed(2));
        setText('subtotalCalc', '$' + subtotal.toFixed(2));
        setText('subtotalAfterCoupon', '$' + subtotal.toFixed(2));
        setText('packingSubtotal', '$' + subtotal.toFixed(2));
        setText('totalEstimate', '$' + total.toFixed(2));
    }

    function bindRecalc() {
        ['volumeCf', 'pricePerCf', 'fuelPct', 'discountAmount'].forEach((id) => {
            const el = $(id);
            if (el) el.addEventListener('input', recalc);
        });
    }

    function setInventoryLink() {
        var link = document.getElementById('inventoryLink');
        if (link && window.location.search) {
            link.href = 'inventory.html' + window.location.search;
        }
    }

    function init() {
        initFromParams();
        recalc();
        bindRecalc();
        setInventoryLink();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
