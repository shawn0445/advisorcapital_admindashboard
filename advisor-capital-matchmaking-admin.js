(() => {
  const tbody = document.getElementById('matchRows');
  const rows = () => [...tbody.querySelectorAll('tr')];
  const search = document.getElementById('searchInput');
  const regionFilter = document.getElementById('regionFilter');
  const toast = document.getElementById('toast');
  const detailBackdrop = document.getElementById('modalBackdrop');
  const createBackdrop = document.getElementById('createModalBackdrop');
  const suggestionsBackdrop = document.getElementById('matchSuggestionsBackdrop');
  const suggestionsList = document.getElementById('matchSuggestionsList');
  const buyerSelect = document.getElementById('buyerSelect');
  const sellerSelect = document.getElementById('sellerSelect');
  const rationaleInput = document.getElementById('matchRationale');
  const callBuyerBtn = document.getElementById('callBuyerBtn');
  const emailBuyerBtn = document.getElementById('emailBuyerBtn');
  const statusText = { pending: 'Pending review', approved: 'Approved', hold: 'On hold', dismissed: 'Dismissed' };
  const sampleAds = window.SellerOpportunities.sampleAds;
  let selectedRow = null;
  let selectedAd = null;
  let toastTimer;

  function announce(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  }

  function initials(name) {
    return name.split(/\s+/).map(part => part[0]).slice(0, 2).join('').toUpperCase();
  }

  function profileValue(type, name, id, region, label) {
    const profile = window.MemberProfiles.getProfile(type, id, name, region);
    return profile.find(([, field]) => field === label)?.[2] || '';
  }

  function profileRegion(id, fallback) {
    const option = [...sellerSelect.options].find(item => item.value.endsWith(`|${id}`));
    return option?.dataset.region || fallback;
  }

  function scoreLabel(score) {
    if (score > 90) return 'Exceptional';
    if (score >= 81) return 'Very strong';
    if (score >= 70) return 'Strong';
    if (score >= 60) return 'Good';
    return 'Low';
  }

  function scoreRing(score) {
    const ring = document.createElement('div');
    ring.className = `score-gauge ${score < 60 ? 'score-low' : ''}`;
    ring.style.setProperty('--score-angle', `${score * 3.6}deg`);
    ring.setAttribute('role', 'img');
    ring.setAttribute('aria-label', `AC Score ${score} out of 100, ${scoreLabel(score)}`);
    const value = document.createElement('span');
    value.textContent = String(score);
    ring.append(value);
    return ring;
  }

  function getSellerMetrics(row) {
    const profile = window.MemberProfiles.getProfile('seller', row.dataset.sellerId, row.dataset.seller, row.dataset.region);
    const valueFor = label => profile.find(([, field]) => field === label)?.[2] || '—';
    return {
      location: valueFor('Practice city / region'),
      aum: valueFor('Assets under management (CAD)'),
      annualRevenue: valueFor('Annual recurring revenue (CAD)'),
      recurringRevenue: valueFor('Annual recurring revenue (CAD)'),
      askingPrice: valueFor('Indicative asking price (CAD)'),
      timeframe: valueFor('Expected sale timeframe')
    };
  }

  function createCell(text, className = '') {
    const cell = document.createElement('td');
    if (className) cell.className = className;
    cell.textContent = text;
    return cell;
  }

  function renderMatchActions(row) {
    const actions = document.createElement('div');
    actions.className = 'row-actions match-row-actions';
    const details = document.createElement('button');
    details.type = 'button';
    details.className = 'mini-btn';
    details.dataset.action = 'details';
    details.textContent = 'Details';
    actions.append(details);
    if (row.dataset.status === 'pending') {
      const approve = document.createElement('button');
      approve.type = 'button';
      approve.className = 'mini-btn approve';
      approve.dataset.action = 'approve';
      approve.textContent = 'Approve';
      actions.append(approve);
    } else if (row.dataset.status === 'hold') {
      const reopen = document.createElement('button');
      reopen.type = 'button';
      reopen.className = 'mini-btn';
      reopen.dataset.action = 'resume';
      reopen.textContent = 'Reopen';
      actions.append(reopen);
    } else if (row.dataset.status === 'approved') {
      [
        ['buyer', row.dataset.buyer, row.dataset.buyerId, 'Call buyer', 'Phone number', 'tel'],
        ['buyer', row.dataset.buyer, row.dataset.buyerId, 'Email buyer', 'Email address', 'mailto'],
        ['seller', row.dataset.seller, row.dataset.sellerId, 'Call seller', 'Phone number', 'tel'],
        ['seller', row.dataset.seller, row.dataset.sellerId, 'Email seller', 'Email address', 'mailto']
      ].forEach(([type, name, id, label, field, scheme]) => {
        const contact = profileValue(type, name, id, row.dataset.region, field);
        if (!contact) return;
        const link = document.createElement('a');
        link.className = 'mini-btn';
        link.textContent = label;
        link.href = `${scheme}:${scheme === 'tel' ? contact.replace(/[^\d+]/g, '') : contact}`;
        actions.append(link);
      });
    }
    return actions;
  }

  function renderPairRow(row) {
    const rationale = row.dataset.rationale;
    const buyer = row.dataset.buyer;
    const seller = row.dataset.seller;
    const metrics = getSellerMetrics(row);
    const opportunity = document.createElement('td');
    opportunity.innerHTML = `<div class="person"><div class="avatar">${escapeHtml(initials(buyer))}</div><div><div class="person-name">${escapeHtml(buyer)}</div><div class="person-meta">Buyer · ${escapeHtml(row.dataset.buyerId)}</div></div></div><div class="pair-arrow">↔</div><div class="person"><div class="avatar">${escapeHtml(initials(seller))}</div><div><div class="person-name">${escapeHtml(seller)}</div><div class="person-meta">Seller · ${escapeHtml(row.dataset.sellerId)}</div></div></div>`;
    row.replaceChildren(
      opportunity,
      createCell(metrics.location),
      createCell(metrics.aum),
      createCell(metrics.annualRevenue),
      createCell(metrics.recurringRevenue),
      createCell(metrics.askingPrice),
      createCell(metrics.timeframe),
      createCell(row.dataset.createdBy || 'Advisor Capital user'),
      createCell(row.dataset.created || '—'),
      document.createElement('td')
    );
    row.cells[0].classList.add('match-opportunity-cell');
    row.cells[0].title = rationale;
    row.cells[9].append(renderMatchActions(row));
  }

  function renderAdRow(ad, status = 'published') {
    const row = document.createElement('tr');
    row.dataset.kind = 'advertisement';
    row.dataset.adId = ad.adId;
    row.dataset.status = status;
    row.dataset.region = ad.region;
    row.dataset.seller = ad.sellerName;
    row.dataset.sellerId = ad.sellerId;
    row.dataset.rationale = ad.description;
    row.dataset.search = `${ad.title} ${ad.sellerName} ${ad.sellerId} ${ad.region} ${ad.city} ${ad.aum} ${ad.annualRevenue} ${ad.annualRecurringRevenue} ${ad.askingPrice} ${ad.saleTimeframe}`.toLowerCase();
    row.replaceChildren(
      createCell('', 'match-opportunity-cell'),
      createCell(ad.city || ad.region),
      createCell(ad.aum || '—'),
      createCell(ad.annualRevenue || ad.annualRecurringRevenue || '—'),
      createCell(ad.annualRecurringRevenue || '—'),
      createCell(ad.askingPrice || '—'),
      createCell(ad.saleTimeframe || 'Flexible'),
      createCell(status === 'published' ? 'Seller advertisement' : 'Admin Review'),
      createCell(ad.posted || '—'),
      document.createElement('td')
    );
    const summary = document.createElement('div');
    summary.className = 'person';
    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    avatar.textContent = initials(ad.sellerName);
    const identity = document.createElement('div');
    const title = document.createElement('div');
    title.className = 'person-name';
    title.textContent = ad.title;
    const meta = document.createElement('div');
    meta.className = 'person-meta';
    meta.textContent = `${ad.sellerName} · ${ad.sellerId} · ${ad.adId}`;
    identity.append(title, meta);
    summary.append(avatar, identity);
    row.cells[0].append(summary);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'mini-btn approve';
    button.dataset.action = 'suggestions';
    button.textContent = 'Suggested matchmaking';
    row.cells[9].append(button);
    return row;
  }

  function addApprovedSellerAds() {
    const stored = JSON.parse(localStorage.getItem('seller-alerts-approved') || '[]');
    stored.forEach(ad => {
      if (rows().some(row => row.dataset.adId === ad.adId)) return;
      const row = renderAdRow(ad, 'published');
      row.dataset.rationale = ad.description || '';
      row.dataset.seller = ad.sellerName;
      tbody.append(row);
    });
    stored.forEach(ad => {
      if ([...sellerSelect.options].some(option => option.value.endsWith(`|${ad.sellerId}`))) return;
      const option = document.createElement('option');
      option.value = `${ad.sellerName}|${ad.sellerId}`;
      option.textContent = `${ad.sellerName} · ${ad.sellerId}`;
      option.dataset.region = ad.region;
      sellerSelect.append(option);
    });
    updateMemberOptions(sellerSelect);
    updateCounts();
    render();
  }

  function updateCounts() {
    document.getElementById('opportunityCount').textContent =
      rows().filter(row => row.dataset.kind === 'advertisement').length;
    document.getElementById('pairingCount').textContent =
      rows().filter(row => !row.dataset.kind).length;
  }

  function render() {
    const query = search.value.trim().toLowerCase();
    let visible = 0;
    rows().forEach(row => {
      const text = `${row.dataset.search || ''} ${row.textContent}`.toLowerCase();
      const matchSearch = !query || text.includes(query);
      const matchRegion = regionFilter.value === 'all' || row.dataset.region === regionFilter.value;
      row.style.display = matchSearch && matchRegion ? '' : 'none';
      if (matchSearch && matchRegion) visible++;
    });
    document.getElementById('emptyState').style.display = visible ? 'none' : 'block';
    document.getElementById('rowSummary').textContent =
      `Showing ${visible} seller opportunities and pairings · Sample data`;
  }

  function updateMemberOptions(select) {
    [...select.options].forEach(option => {
      if (!option.value) return;
      const memberId = option.value.split('|').pop();
      const approved = !option.dataset.reviewMember ||
        localStorage.getItem(`member-approved-${memberId}`) === 'true';
      option.disabled = !approved || localStorage.getItem(`member-active-${memberId}`) === 'false';
      if (option.disabled && option.selected) select.value = '';
    });
  }

  function updateBuyerContacts() {
    const [name, id] = buyerSelect.value.split('|');
    if (!id) {
      callBuyerBtn.href = '#';
      emailBuyerBtn.href = '#';
      callBuyerBtn.setAttribute('aria-disabled', 'true');
      emailBuyerBtn.setAttribute('aria-disabled', 'true');
      return;
    }
    const phone = profileValue('buyer', name, id, '', 'Phone number').replace(/[^\d+]/g, '');
    const email = profileValue('buyer', name, id, '', 'Email address');
    callBuyerBtn.href = `tel:${phone}`;
    emailBuyerBtn.href = `mailto:${email}`;
    callBuyerBtn.removeAttribute('aria-disabled');
    emailBuyerBtn.removeAttribute('aria-disabled');
  }

  function populateCreateForm(buyer, seller, region, adId) {
    updateMemberOptions(buyerSelect);
    updateMemberOptions(sellerSelect);
    const buyerOption = [...buyerSelect.options].find(option => option.value.endsWith(`|${buyer}`));
    const sellerOption = [...sellerSelect.options].find(option => option.value.endsWith(`|${seller}`));
    if (!buyerOption || !sellerOption || buyerOption.disabled || sellerOption.disabled) {
      announce('The selected buyer or seller is unavailable.');
      return;
    }
    buyerSelect.value = buyerOption.value;
    sellerSelect.value = sellerOption.value;
    document.getElementById('matchRegion').value = region;
    rationaleInput.value = adId
      ? `Suggested pairing from seller advertisement ${adId}; review before contacting the buyer.`
      : '';
    updateBuyerContacts();
    createBackdrop.classList.add('show');
  }

  function closeDetails() {
    detailBackdrop.classList.remove('show');
    selectedRow = null;
  }

  function openDetails(row) {
    if (row.dataset.kind === 'advertisement') {
      openSuggestions(row);
      return;
    }
    selectedRow = row;
    document.getElementById('modalSubtitle').textContent =
      `${row.dataset.region} · Created by ${row.dataset.createdBy || 'Advisor Capital user'} · ${row.dataset.created || ''}`;
    const detailPair = document.getElementById('detailPair');
    detailPair.replaceChildren();
    [
      ['Buyer', 'buyer', row.dataset.buyer, row.dataset.buyerId],
      ['Seller', 'seller', row.dataset.seller, row.dataset.sellerId]
    ].forEach(([label, type, name, id]) => {
      const card = document.createElement('section');
      card.className = 'detail-box match-member-card';
      const heading = document.createElement('h3');
      heading.className = 'detail-label';
      heading.textContent = `${label} · ${id}`;
      card.append(heading);
      window.MemberProfiles.appendProfileFields(card, window.MemberProfiles.getProfile(type, id, name, row.dataset.region));
      detailPair.append(card);
    });
    document.getElementById('detailSignals').textContent = row.dataset.rationale || 'No rationale entered.';
    document.getElementById('modalApprove').style.display = row.dataset.status === 'pending' ? '' : 'none';
    document.getElementById('modalHold').style.display = row.dataset.status === 'pending' ? '' : 'none';
    detailBackdrop.classList.add('show');
  }

  function setStatus(row, status) {
    row.dataset.status = status;
    renderPairRow(row);
    render();
  }

  function makePairRow(buyerName, buyerId, sellerName, sellerId, region, rationale) {
    const today = new Intl.DateTimeFormat('en-CA', { month: 'short', day: '2-digit', year: 'numeric' }).format(new Date());
    const row = document.createElement('tr');
    row.dataset.status = 'approved';
    row.dataset.region = region;
    row.dataset.buyer = buyerName;
    row.dataset.buyerId = buyerId;
    row.dataset.seller = sellerName;
    row.dataset.sellerId = sellerId;
    row.dataset.rationale = rationale;
    row.dataset.createdBy = 'Current admin';
    row.dataset.created = today;
    row.dataset.search = `${buyerName} ${buyerId} ${sellerName} ${sellerId} ${region} ${rationale}`;
    renderPairRow(row);
    tbody.prepend(row);
    updateCounts();
  }

  function openSuggestions(row) {
    selectedAd = row;
    const scores = row._scores || {};
    const buyerScores = { 'M-204': 92, 'M-301': 84, 'M-161': 74, 'M-275': 68, 'M-129': 88, 'M-291': 78, 'M-515': 55, 'M-516': 63 };
    const candidates = [...buyerSelect.options]
      .filter(option => option.value && !option.disabled)
      .filter(option => !option.dataset.reviewMember || localStorage.getItem(`member-approved-${option.value.split('|').pop()}`) === 'true')
      .filter(option => localStorage.getItem(`member-active-${option.value.split('|').pop()}`) !== 'false')
      .map(option => {
        const [name, id] = option.value.split('|');
        const score = scores[id] ?? buyerScores[id] ?? 60;
        return { name, id, region: profileValue('buyer', name, id, row.dataset.region, 'Preferred practice province(s)'), score };
      })
      .sort((left, right) => right.score - left.score);

    document.getElementById('matchSuggestionsTitle').textContent = `Suggested buyers · ${row.dataset.seller}`;
    document.getElementById('matchSuggestionsSubtitle').textContent =
      `${row.dataset.adId} · Buyers ranked by illustrative AC Score; scores are per buyer.`;
    suggestionsList.replaceChildren();
    candidates.forEach(buyer => {
      const item = document.createElement('article');
      item.className = 'seller-match-item';
      const heading = document.createElement('div');
      heading.className = 'seller-match-heading';
      const details = document.createElement('div');
      details.className = 'seller-match-buyer';
      const name = document.createElement('div');
      name.className = 'suggestion-name';
      name.textContent = buyer.name;
      const meta = document.createElement('div');
      meta.className = 'suggestion-meta';
      meta.textContent = `${buyer.id} · Licensed / preferred region: ${buyer.region}`;
      details.append(name, meta);
      heading.append(details, scoreRing(buyer.score));
      const profile = window.MemberProfiles.getProfile('buyer', buyer.id, buyer.name, row.dataset.region);
      const offer = document.createElement('div');
      offer.className = 'seller-buyer-offer';
      window.MemberProfiles.appendProfileFields(offer, profile.filter(([, label]) => [
        'Email address', 'Phone number', 'Province(s) licensed',
        'Professional designation / licence', 'Practice type sought',
        'Preferred practice province(s)', 'Preferred city / region',
        'Target AUM minimum (CAD)', 'Target AUM maximum (CAD)',
        'Acquisition budget minimum (CAD)', 'Acquisition budget maximum (CAD)',
        'Desired acquisition timeframe', 'Financing status',
        'Preferred seller transition support', 'Additional acquisition preferences'
      ].includes(label)));
      const select = document.createElement('button');
      select.type = 'button';
      select.className = 'mini-btn approve';
      select.textContent = 'Select buyer';
      select.addEventListener('click', () => {
        populateCreateForm(buyer.id, row.dataset.sellerId, row.dataset.region, row.dataset.adId);
        closeSuggestions();
      });
      const actions = document.createElement('div');
      actions.className = 'seller-match-actions';
      actions.append(select);
      item.append(heading, offer, actions);
      suggestionsList.append(item);
    });
    if (!candidates.length) {
      const empty = document.createElement('p');
      empty.className = 'suggestion-empty';
      empty.textContent = 'No active approved buyers are available.';
      suggestionsList.append(empty);
    }
    suggestionsBackdrop.classList.add('show');
  }

  function closeSuggestions() {
    suggestionsBackdrop.classList.remove('show');
    selectedAd = null;
  }

  function closeCreate() {
    createBackdrop.classList.remove('show');
    document.getElementById('createMatchForm').reset();
    updateBuyerContacts();
  }

  function addDefaultSellerAds() {
    sampleAds.forEach(ad => {
      if (rows().some(row => row.dataset.adId === ad.adId)) return;
      const row = renderAdRow(ad);
      row._scores = ad.scores;
      row.dataset.rationale = ad.description;
      row.dataset.search = `${ad.title} ${ad.sellerName} ${ad.region} ${ad.city} ${ad.aum} ${ad.annualRecurringRevenue} ${ad.askingPrice}`.toLowerCase();
      tbody.append(row);
    });
  }

  tbody.addEventListener('click', event => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const row = button.closest('tr');
    if (button.dataset.action === 'details') openDetails(row);
    if (button.dataset.action === 'suggestions') openSuggestions(row);
    if (button.dataset.action === 'approve') {
      setStatus(row, 'approved');
      announce('Pairing approved. Use the buyer and seller contact actions to coordinate.');
    }
    if (button.dataset.action === 'resume') {
      setStatus(row, 'pending');
      announce('Pairing reopened.');
    }
  });

  [search, regionFilter].forEach(element => element.addEventListener('input', render));
  regionFilter.addEventListener('change', render);
  buyerSelect.addEventListener('change', updateBuyerContacts);
  document.getElementById('closeModal').addEventListener('click', closeDetails);
  detailBackdrop.addEventListener('click', event => {
    if (event.target === detailBackdrop) closeDetails();
  });
  document.getElementById('closeCreateModal').addEventListener('click', closeCreate);
  document.getElementById('cancelCreate').addEventListener('click', closeCreate);
  createBackdrop.addEventListener('click', event => {
    if (event.target === createBackdrop) closeCreate();
  });
  document.getElementById('closeMatchSuggestions').addEventListener('click', closeSuggestions);
  document.getElementById('cancelMatchSuggestions').addEventListener('click', closeSuggestions);
  suggestionsBackdrop.addEventListener('click', event => {
    if (event.target === suggestionsBackdrop) closeSuggestions();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      closeDetails();
      closeCreate();
      closeSuggestions();
    }
  });
  document.getElementById('modalApprove').addEventListener('click', () => {
    if (!selectedRow) return;
    setStatus(selectedRow, 'approved');
    closeDetails();
    announce('Pairing approved. Use the buyer and seller contact actions to coordinate.');
  });
  document.getElementById('modalHold').addEventListener('click', () => {
    if (!selectedRow) return;
    setStatus(selectedRow, 'hold');
    closeDetails();
    announce('Pairing placed on hold.');
  });
  document.getElementById('createMatchBtn').addEventListener('click', () => createBackdrop.classList.add('show'));
  document.getElementById('createMatchForm').addEventListener('submit', event => {
    event.preventDefault();
    updateMemberOptions(buyerSelect);
    updateMemberOptions(sellerSelect);
    const [buyerName, buyerId] = buyerSelect.value.split('|');
    const [sellerName, sellerId] = sellerSelect.value.split('|');
    const region = document.getElementById('matchRegion').value;
    const rationale = rationaleInput.value.trim();
    if (!buyerName || !sellerName || !region || !rationale) {
      announce('Select an active buyer and seller, region, and rationale before informing the buyer.');
      return;
    }
    if (buyerSelect.selectedOptions[0].disabled || sellerSelect.selectedOptions[0].disabled) {
      announce('Only active approved members can be added to a pairing.');
      return;
    }
    makePairRow(buyerName, buyerId, sellerName, sellerId, region, rationale);
    closeCreate();
    render();
    announce('Pairing added. Use the buyer contact buttons to inform them; no message is sent automatically.');
  });
  document.getElementById('exportBtn').addEventListener('click', () => announce('Export is a visual placeholder in this prototype.'));

  tbody.replaceChildren();
  rows().forEach(row => {
    renderPairRow(row);
  });
  addDefaultSellerAds();
  addApprovedSellerAds();
  window.addEventListener('storage', addApprovedSellerAds);
  updateCounts();
  render();

  const params = new URLSearchParams(window.location.search);
  const buyerId = params.get('buyer');
  const sellerId = params.get('seller');
  if (buyerId && sellerId) {
    const region = params.get('region') || '';
    populateCreateForm(buyerId, sellerId, region, params.get('ad'));
  }
})();
