(() => {
  const tabs = [...document.querySelectorAll('[role="tab"][aria-controls]')];
  const tables = [...document.querySelectorAll('.review-table')];
  const search = document.getElementById('reviewSearch');
  const toast = document.getElementById('reviewToast');
  let toastTimer;

  function isApproved(memberId) {
    return localStorage.getItem(`member-approved-${memberId}`) === 'true';
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
        const matchesSearch = !query || row.dataset.search.toLowerCase().includes(query);
        row.hidden = approved || !matchesSearch;
        if (!approved) pendingCounts[row.dataset.memberType]++;
        if (!row.hidden && table.hidden === false) visibleCount++;
      });
    });

    document.getElementById('pendingBuyersCount').textContent = pendingCounts.buyer;
    document.getElementById('pendingSellersCount').textContent = pendingCounts.seller;
    document.getElementById('reviewEmpty').style.display = visibleCount ? 'none' : 'block';
    document.getElementById('reviewSummary').textContent =
      `${visibleCount} pending ${tabs.find(tab => tab.getAttribute('aria-selected') === 'true').textContent.trim().split(' ')[0].toLowerCase()} applications · Sample records for demonstration`;
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
    const button = event.target.closest('button[data-action="approve"]');
    if (!button) return;
    const row = button.closest('tr[data-member-id]');
    if (!row || isApproved(row.dataset.memberId)) return;
    localStorage.setItem(`member-approved-${row.dataset.memberId}`, 'true');
    localStorage.removeItem(`member-active-${row.dataset.memberId}`);
    render();
    announce(`${row.cells[0].textContent} approved and added to the Members pool.`);
  });

  window.addEventListener('storage', render);
  render();
})();
