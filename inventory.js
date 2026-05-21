/**
 * Inventory page: categories, item list with qty, search, add new item, total volume.
 */
(function () {
    var $ = function (id) { return document.getElementById(id); };
    var qs = function (sel) { return document.querySelector(sel); };
    var catalog = window.INVENTORY_CATALOG || [];
    var categories = window.INVENTORY_CATEGORIES || [];
    var quantities = {}; // id -> qty (number)
    var customItems = []; // { id, name, volume, category: 'Miscellaneous', custom: true }
    var nextCustomId = 10000;
    var currentCategory = null;
    var currentFilter = 'all'; // all | selected | added | clear
    var searchQuery = '';
    var searchWithinName = true;

    function getQty(id) {
        var q = quantities[id];
        return typeof q === 'number' ? q : 0;
    }

    function setQty(id, qty) {
        qty = Math.max(0, parseInt(qty, 10) || 0);
        quantities[id] = qty;
    }

    function getAllItems() {
        return catalog.concat(customItems);
    }

    function getFilteredItems() {
        var items = getAllItems();
        if (currentCategory) {
            items = items.filter(function (it) { return it.category === currentCategory; });
        }
        if (searchQuery) {
            var q = searchQuery.toUpperCase().trim();
            if (q) {
                items = items.filter(function (it) {
                    if (searchWithinName) return it.name.toUpperCase().indexOf(q) >= 0;
                    return it.name.toUpperCase() === q;
                });
            }
        }
        if (currentFilter === 'selected') {
            items = items.filter(function (it) { return getQty(it.id) > 0; });
        } else if (currentFilter === 'added') {
            items = items.filter(function (it) { return it.custom; });
        }
        return items;
    }

    function totalVolumeCf() {
        var total = 0;
        getAllItems().forEach(function (it) {
            total += (it.volume || 0) * getQty(it.id);
        });
        return total;
    }

    function renderCategories() {
        var el = $('categoryList');
        if (!el) return;
        el.innerHTML = '';
        categories.forEach(function (cat) {
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'btn-category' + (currentCategory === cat ? ' active' : '');
            btn.textContent = cat;
            btn.dataset.category = cat;
            btn.addEventListener('click', function () {
                currentCategory = currentCategory === cat ? null : cat;
                document.querySelectorAll('.btn-category').forEach(function (b) {
                    b.classList.toggle('active', b.dataset.category === currentCategory);
                });
                renderTable();
            });
            el.appendChild(btn);
        });
    }

    function renderTable() {
        var tbody = $('inventoryTableBody');
        if (!tbody) return;
        var items = getFilteredItems();
        tbody.innerHTML = '';
        items.forEach(function (it, index) {
            var row = document.createElement('tr');
            var qty = getQty(it.id);
            row.innerHTML =
                '<td class="col-num">' + (index + 1) + '</td>' +
                '<td class="col-item">' + escapeHtml(it.name) + '</td>' +
                '<td class="col-volume">' + (it.volume || 0) + ' cf</td>' +
                '<td class="col-actions">' +
                '<button type="button" class="btn-qty btn-x" data-id="' + it.id + '" title="Remove">X</button>' +
                '<button type="button" class="btn-qty btn-minus" data-id="' + it.id + '">-1</button>' +
                '<button type="button" class="btn-qty btn-plus" data-id="' + it.id + '">+1</button>' +
                '<button type="button" class="btn-qty btn-plus10" data-id="' + it.id + '">+10</button>' +
                '</td>' +
                '<td class="col-qty">' + qty + '</td>';
            tbody.appendChild(row);
        });
        bindQtyButtons();
    }

    function escapeHtml(s) {
        var div = document.createElement('div');
        div.textContent = s;
        return div.innerHTML;
    }

    function bindQtyButtons() {
        tbody = $('inventoryTableBody');
        if (!tbody) return;
        tbody.querySelectorAll('.btn-qty').forEach(function (btn) {
            var id = parseInt(btn.dataset.id, 10);
            var action = btn.classList.contains('btn-x') ? 'x' : btn.classList.contains('btn-minus') ? '-1' : btn.classList.contains('btn-plus10') ? '+10' : '+1';
            btn.addEventListener('click', function () {
                var q = getQty(id);
                if (action === 'x') setQty(id, 0);
                else if (action === '-1') setQty(id, q - 1);
                else if (action === '+1') setQty(id, q + 1);
                else if (action === '+10') setQty(id, q + 10);
                renderTable();
                updateTotal();
            });
        });
    }

    function updateTotal() {
        var el = $('totalVolume');
        if (el) el.textContent = totalVolumeCf();
    }

    function bindActionFilters() {
        document.querySelectorAll('.btn-cat[data-filter]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var filter = btn.dataset.filter;
                if (filter === 'clear') {
                    getAllItems().forEach(function (it) { setQty(it.id, 0); });
                    currentFilter = 'all';
                    document.querySelectorAll('.btn-cat[data-filter]').forEach(function (b) { b.classList.remove('active'); });
                    var allBtn = document.querySelector('.btn-cat[data-filter="all"]');
                    if (allBtn) allBtn.classList.add('active');
                } else {
                    currentFilter = filter;
                    document.querySelectorAll('.btn-cat[data-filter]').forEach(function (b) { b.classList.remove('active'); });
                    btn.classList.add('active');
                }
                renderTable();
                updateTotal();
            });
        });
    }

    function bindSearch() {
        var input = $('searchInput');
        var within = $('searchWithinName');
        if (input) {
            input.addEventListener('input', function () {
                searchQuery = input.value;
                renderTable();
            });
        }
        if (within) {
            within.addEventListener('change', function () {
                searchWithinName = within.checked;
                renderTable();
            });
        }
    }

    function addNewItem() {
        var nameEl = $('newItemName');
        var volEl = $('newItemVolume');
        var qtyEl = $('newItemQty');
        var name = (nameEl && nameEl.value || '').trim();
        var vol = parseInt(volEl && volEl.value, 10) || 0;
        var qty = parseInt(qtyEl && qtyEl.value, 10) || 1;
        if (!name) return;
        var custom = {
            id: nextCustomId++,
            name: name,
            volume: vol,
            category: 'Miscellaneous',
            custom: true
        };
        customItems.push(custom);
        setQty(custom.id, qty);
        if (nameEl) nameEl.value = '';
        if (volEl) volEl.value = '0';
        if (qtyEl) qtyEl.value = '1';
        renderTable();
        updateTotal();
    }

    function initFromParams() {
        var params = new URLSearchParams(window.location.search);
        var firstname = params.get('firstname') || '';
        var lastname = params.get('lastname') || '';
        var jobNo = params.get('jobNo') || params.get('job') || '2325462';
        var customer = [firstname, lastname].filter(Boolean).join(' ') || 'Dwight Spears';
        var jobEl = $('jobNumber');
        var custEl = $('customerName');
        if (jobEl) jobEl.textContent = jobNo;
        if (custEl) custEl.textContent = customer;
    }

    function init() {
        initFromParams();
        renderCategories();
        renderTable();
        updateTotal();
        bindActionFilters();
        bindSearch();
        var addBtn = $('addNewItemBtn');
        if (addBtn) addBtn.addEventListener('click', addNewItem);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
