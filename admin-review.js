(() => {
  const tabs = [...document.querySelectorAll('[role="tab"][aria-controls]')];
  const tables = [...document.querySelectorAll('.review-table')];
  const search = document.getElementById('reviewSearch');
  const toast = document.getElementById('reviewToast');
  const infoBackdrop = document.getElementById('reviewInfoBackdrop');
  const infoFields = document.getElementById('reviewInfoFields');
  let activeApplication = null;
  let toastTimer;

  function isApproved(memberId) {
    return localStorage.getItem(`member-approved-${memberId}`) === 'true';
  }

  function isRejected(memberId) {
    return localStorage.getItem(`member-rejected-${memberId}`) === 'true';
  }

  function announce(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
  }

  function render() {
    const query = search.value.trim().toLowerCase();
    let visibleCount = 0;
    const pendingCounts = { buyer: 0, seller: 0 };
    tables.forEach(table => {
      table.querySelectorAll('tbody tr').forEach(row => {
        const approved = isApproved(row.dataset.memberId);
        const rejected = isRejected(row.dataset.memberId);
        const matchesSearch = !query || row.dataset.search.toLowerCase().includes(query);
        row.hidden = approved || rejected || !matchesSearch;
        if (!approved && !rejected) pendingCounts[row.dataset.memberType]++;
        if (!row.hidden && table.hidden === false) visibleCount++;
      });
    });

    document.getElementById('pendingBuyersCount').textContent = pendingCounts.buyer;
    document.getElementById('pendingSellersCount').textContent = pendingCounts.seller;
    document.getElementById('reviewEmpty').style.display = visibleCount ? 'none' : 'block';
    document.getElementById('reviewSummary').textContent =
      `${visibleCount} pending ${tabs.find(tab => tab.getAttribute('aria-selected') === 'true').textContent.trim().split(' ')[0].toLowerCase()} requests · Sample records for demonstration`;
  }

  function closeInfo() {
    infoBackdrop.classList.remove('show');
    activeApplication = null;
  }

  function showInfo(row) {
    activeApplication = row;
    const name = row.cells[0].textContent;
    const profile = window.MemberProfiles.getProfile(
      row.dataset.memberType,
      row.dataset.memberId,
      name,
      row.dataset.region
    );
    document.getElementById('reviewInfoTitle').textContent = name;
    document.getElementById('reviewInfoSubtitle').textContent =
      `${row.dataset.memberType === 'buyer' ? 'Buyer request' : 'Seller request'} · ${row.dataset.memberId}`;
    infoFields.replaceChildren();
    window.MemberProfiles.appendProfileFields(infoFields, profile);
    document.getElementById('approveFromInfo').disabled = isApproved(row.dataset.memberId);
    document.getElementById('rejectFromInfo').disabled = isApproved(row.dataset.memberId);
    infoBackdrop.classList.add('show');
  }

  function saveSellerAlert(row) {
    const name = row.cells[0].textContent;
    const profile = window.MemberProfiles.getProfile('seller', row.dataset.memberId, name, row.dataset.region);
    const valueFor = label => profile.find(([, field]) => field === label)?.[2] || '';
    const ads = JSON.parse(localStorage.getItem('seller-alerts-approved') || '[]');
    if (ads.some(ad => ad.sellerId === row.dataset.memberId)) return;
    ads.push({
      adId: `SA-${row.dataset.memberId}`,
      sellerId: row.dataset.memberId,
      sellerName: name,
      region: row.dataset.region,
      title: `New seller request from ${name}`,
      description: valueFor('Buyer requirements or preferences') || 'Seller request approved and available for buyer review.',
      aum: valueFor('Assets under management (CAD)'),
      askingPrice: valueFor('Indicative asking price (CAD)'),
      clients: valueFor('Approximate client count'),
      annualRevenue: valueFor('Annual recurring revenue (CAD)'),
      transition: valueFor('Transition support offered'),
      licensed: valueFor('Province(s) licensed'),
      practiceType: valueFor('Practice type'),
      city: valueFor('Practice city / region'),
      saleTimeframe: valueFor('Expected sale timeframe'),
      posted: new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: 'short', day: '2-digit' }).format(new Date())
    });
    localStorage.setItem('seller-alerts-approved', JSON.stringify(ads));
  }

  function approve(row) {
    if (isApproved(row.dataset.memberId)) return;
    localStorage.removeItem(`member-rejected-${row.dataset.memberId}`);
    localStorage.setItem(`member-approved-${row.dataset.memberId}`, 'true');
    localStorage.removeItem(`member-active-${row.dataset.memberId}`);
    if (row.dataset.memberType === 'seller') {
      saveSellerAlert(row);
      announce(`${row.cells[0].textContent} approved and added to Matchmaking opportunities.`);
    } else {
      announce(`${row.cells[0].textContent} approved and added to the global buyer pool.`);
    }
    render();
  }

  function reject(row) {
    if (isApproved(row.dataset.memberId) || isRejected(row.dataset.memberId)) return;
    localStorage.setItem(`member-rejected-${row.dataset.memberId}`, 'true');
    render();
    announce(`${row.cells[0].textContent} request rejected.`);
  }

  tabs.forEach(tab => tab.addEventListener('click', () => {
    tabs.forEach(item => {
      const selected = item === tab;
      item.classList.toggle('active', selected);
      item.setAttribute('aria-selected', String(selected));
      document.getElementById(item.getAttribute('aria-controls')).hidden = !selected;
    });
    render();
  }));

  search.addEventListener('input', render);
  document.addEventListener('click', event => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const row = button.closest('tr[data-member-id]');
    if (!row) return;
    if (button.dataset.action === 'view-info') showInfo(row);
    if (button.dataset.action === 'approve') approve(row);
    if (button.dataset.action === 'reject') reject(row);
  });

  document.getElementById('approveFromInfo').addEventListener('click', () => {
    if (activeApplication) approve(activeApplication);
    closeInfo();
  });
  document.getElementById('rejectFromInfo').addEventListener('click', () => {
    if (activeApplication) reject(activeApplication);
    closeInfo();
  });
  document.getElementById('closeReviewInfo').addEventListener('click', closeInfo);
  document.getElementById('cancelReviewInfo').addEventListener('click', closeInfo);
  infoBackdrop.addEventListener('click', event => {
    if (event.target === infoBackdrop) closeInfo();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeInfo();
  });

  window.addEventListener('storage', render);
  render();
})();
