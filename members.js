(() => {
  const tabs = [...document.querySelectorAll('[role="tab"][aria-controls]')];
  const rows = [...document.querySelectorAll('.member-table tbody tr[data-type]')];
  const profileBackdrop = document.getElementById('memberModalBackdrop');
  const toast = document.getElementById('memberToast');
  let toastTimer;

  const scores = {
    'M-204': 92, 'M-301': 84, 'M-161': 74, 'M-275': 68, 'M-129': 88, 'M-291': 78,
    'M-515': 55, 'M-516': 63, 'M-118': 92, 'M-087': 84, 'M-442': 74, 'M-056': 68,
    'M-082': 88, 'M-330': 78, 'M-620': 57, 'M-621': 66
  };

  document.querySelectorAll('.member-table table').forEach(table => {
    if (table.querySelector('th.member-score-heading')) return;
    const heading = document.createElement('th');
    heading.className = 'member-score-heading';
    heading.textContent = 'AC Score';
    table.querySelector('thead tr th:nth-child(4)').before(heading);
  });

  function isActive(memberId) {
    return localStorage.getItem(`member-active-${memberId}`) !== 'false';
  }

  function isApproved(row) {
    return row.dataset.defaultApproved !== 'false' ||
      localStorage.getItem(`member-approved-${row.dataset.id}`) === 'true';
  }

  function announce(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
  }

  function renderMemberRows() {
    rows.forEach(row => {
      if (!row.querySelector('.member-score-cell')) {
        const cell = document.createElement('td');
        cell.className = 'member-score-cell';
        const score = scores[row.dataset.id] ?? 60;
        cell.innerHTML = `<span class="score ${score < 60 ? 'score-low' : ''}">${score}<span>/100</span></span><span class="member-score-label">Top sample match</span>`;
        row.insertBefore(cell, row.querySelector('.member-status').closest('td'));
      }
      const approved = isApproved(row);
      const active = isActive(row.dataset.id);
      row.hidden = !approved;
      row.dataset.active = String(active);
      const status = row.querySelector('.member-status');
      status.className = `status member-status ${!approved ? 'pending' : active ? 'approved' : 'hold'}`;
      status.textContent = !approved ? 'Pending approval' : active ? 'Active' : 'Disabled';
      const toggle = row.querySelector('[data-action="toggle"]');
      toggle.textContent = approved ? active ? 'Disable' : 'Activate' : 'Pending approval';
      toggle.disabled = !approved;
      toggle.classList.toggle('approve', !active);
    });
    ['buyer', 'seller'].forEach(type => {
      const panel = document.getElementById(type === 'buyer' ? 'buyersPanel' : 'sellersPanel');
      const tab = document.getElementById(type === 'buyer' ? 'buyersTab' : 'sellersTab');
      const count = rows.filter(row => row.dataset.type === type && isApproved(row)).length;
      tab.querySelector('.tab-count').textContent = count;
      panel.querySelector('.panel-title').textContent = `${type === 'buyer' ? 'Buyer' : 'Seller'} members (${count})`;
    });
  }

  function closeModal() {
    profileBackdrop.classList.remove('show');
  }

  function showProfile(row) {
    document.getElementById('memberModalTitle').textContent = row.dataset.name;
    document.getElementById('memberModalSubtitle').textContent = `${row.dataset.type === 'buyer' ? 'Buyer' : 'Seller'} · ${row.dataset.id}`;
    const info = document.getElementById('memberModalInfo');
    info.replaceChildren();
    const box = document.createElement('div');
    box.className = 'detail-box member-profile-modal';
    window.MemberProfiles.appendProfileFields(box, window.MemberProfiles.getProfile(
      row.dataset.type,
      row.dataset.id,
      row.dataset.name,
      row.dataset.region
    ));
    info.append(box);
    profileBackdrop.classList.add('show');
  }

  tabs.forEach(tab => tab.addEventListener('click', () => {
    tabs.forEach(item => {
      const selected = item === tab;
      item.classList.toggle('active', selected);
      item.setAttribute('aria-selected', String(selected));
      document.getElementById(item.getAttribute('aria-controls')).hidden = !selected;
    });
  }));

  document.querySelectorAll('.member-table input[type="search"]').forEach(input => {
    input.addEventListener('input', () => {
      const query = input.value.trim().toLowerCase();
      input.closest('.member-table').querySelectorAll('tbody tr[data-type]').forEach(row => {
        const searchable = `${row.dataset.name} ${row.dataset.id} ${row.dataset.region}`.toLowerCase();
        row.hidden = !isApproved(row) || !searchable.includes(query);
      });
    });
  });

  rows.forEach(row => {
    const actions = row.querySelector('.row-actions');
    const profile = document.createElement('button');
    profile.type = 'button';
    profile.className = 'mini-btn';
    profile.dataset.action = 'profile';
    profile.textContent = 'View profile';
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'mini-btn';
    toggle.dataset.action = 'toggle';
    actions.classList.add('member-actions');
    actions.append(profile, toggle);
  });

  document.addEventListener('click', event => {
    const button = event.target.closest('button[data-action]');
    if (!button || !button.closest('.member-table')) return;
    const row = button.closest('tr[data-type]');
    if (!row) return;
    if (button.dataset.action === 'profile') showProfile(row);
    if (button.dataset.action === 'toggle') {
      const nextActive = !isActive(row.dataset.id);
      localStorage.setItem(`member-active-${row.dataset.id}`, String(nextActive));
      renderMemberRows();
      announce(`${row.dataset.name} ${nextActive ? 'activated' : 'disabled'}.`);
    }
  });

  document.getElementById('closeMemberModal').addEventListener('click', closeModal);
  document.getElementById('closeMemberModalFooter').addEventListener('click', closeModal);
  profileBackdrop.addEventListener('click', event => {
    if (event.target === profileBackdrop) closeModal();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeModal();
  });

  window.addEventListener('storage', renderMemberRows);
  renderMemberRows();
})();
