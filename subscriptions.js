(() => {
  const rows = [...document.querySelectorAll('#subscriptionRows tr')];
  const search = document.getElementById('subscriptionSearch');
  const summary = document.getElementById('subscriptionSummary');

  function formatDate(date) {
    if (!date) return '—';
    return new Intl.DateTimeFormat('en-CA', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      timeZone: 'UTC'
    }).format(new Date(`${date}T00:00:00Z`));
  }

  function localDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function render() {
    const query = search.value.trim().toLowerCase();
    const counts = { active: 0, trial: 0, 'past-due': 0, ended: 0 };
    let visible = 0;

    rows.forEach(row => {
      const stored = JSON.parse(localStorage.getItem(`subscription-${row.dataset.id}`) || '{}');
      const status = stored.status || row.dataset.status;
      const endDate = stored.endDate || row.dataset.end;
      row.dataset.currentStatus = status;
      row.querySelector('.start-date').textContent = formatDate(stored.startDate || row.dataset.start);
      row.querySelector('.end-date').textContent = formatDate(endDate);

      const statusBadge = row.querySelector('.subscription-status');
      statusBadge.className = `status subscription-status ${status === 'active' ? 'approved' : status === 'ended' ? 'dismissed' : 'pending'}`;
      statusBadge.textContent = status === 'past-due' ? 'Past due' : status === 'ended' ? 'Ended manually' : status === 'trial' ? 'Trial' : 'Active';

      const actionCell = row.querySelector('.row-actions');
      actionCell.replaceChildren();
      if (status !== 'ended') {
        const endButton = document.createElement('button');
        endButton.type = 'button';
        endButton.className = 'mini-btn';
        endButton.dataset.action = 'end-subscription';
        endButton.textContent = 'End manually';
        actionCell.append(endButton);
      }

      counts[status] = (counts[status] || 0) + 1;
      const matches = row.textContent.toLowerCase().includes(query);
      row.hidden = !matches;
      if (matches) visible++;
    });

    document.getElementById('activeCount').textContent = counts.active;
    document.getElementById('trialCount').textContent = counts.trial;
    document.getElementById('pastDueCount').textContent = counts['past-due'];
    document.getElementById('endedCount').textContent = counts.ended;
    summary.textContent = `Showing ${visible} of ${rows.length} sample subscriptions.`;
  }

  search.addEventListener('input', render);
  document.getElementById('subscriptionRows').addEventListener('click', event => {
    const button = event.target.closest('button[data-action="end-subscription"]');
    if (!button) return;
    const row = button.closest('tr');
    const endDate = localDate();
    localStorage.setItem(`subscription-${row.dataset.id}`, JSON.stringify({
      startDate: row.dataset.start,
      endDate,
      status: 'ended'
    }));
    render();
  });
  window.addEventListener('storage', render);
  render();
})();
