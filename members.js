(() => {
  const tabs = [...document.querySelectorAll('[role="tab"][aria-controls]')];
  const rows = [...document.querySelectorAll('.member-table tbody tr')];
  const profileBackdrop = document.getElementById('memberModalBackdrop');
  const suggestionsBackdrop = document.getElementById('suggestionsModalBackdrop');
  const suggestionList = document.getElementById('suggestionList');
  const toast = document.getElementById('memberToast');
  let activeMember = null;
  let toastTimer;

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
      const approved = isApproved(row);
      const active = isActive(row.dataset.id);
      row.hidden = !approved;
      row.dataset.active = String(active);
      row.querySelector('.member-status').className = `status member-status ${!approved ? 'pending' : active ? 'approved' : 'hold'}`;
      row.querySelector('.member-status').textContent = !approved ? 'Pending approval' : active ? 'Active' : 'Disabled';
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

  function closeModal(backdrop) {
    backdrop.classList.remove('show');
    activeMember = null;
  }

  function showProfile(row) {
    document.getElementById('memberModalTitle').textContent = row.dataset.name;
    document.getElementById('memberModalSubtitle').textContent = `${row.dataset.type === 'buyer' ? 'Buyer' : 'Seller'} · ${row.dataset.id}`;
    document.getElementById('memberModalInfo').innerHTML =
      `<div class="detail-box"><div class="detail-label">Region</div><div class="person-name">${row.dataset.region}</div></div>` +
      `<div class="detail-box"><div class="detail-label">Status</div><div class="person-name">${isActive(row.dataset.id) ? 'Active' : 'Disabled'}</div></div>`;
    document.getElementById('memberModalProfile').textContent = row.dataset.profile;
    profileBackdrop.classList.add('show');
  }

  function showSuggestions(row) {
    activeMember = row;
    const memberType = row.dataset.type;
    const oppositeType = memberType === 'buyer' ? 'seller' : 'buyer';
    const available = rows.filter(candidate =>
      candidate.dataset.type === oppositeType && isApproved(candidate) && isActive(candidate.dataset.id)
    );
    document.getElementById('suggestionsModalTitle').textContent =
      `${memberType === 'buyer' ? 'Seller' : 'Buyer'} suggestions for ${row.dataset.name}`;
    document.getElementById('suggestionsModalSubtitle').textContent =
      `All active ${oppositeType} members are shown as sample suggestions.`;
    suggestionList.replaceChildren();

    if (!available.length) {
      const empty = document.createElement('div');
      empty.className = 'suggestion-empty';
      empty.textContent = `There are no active ${oppositeType} members available for suggestions.`;
      suggestionList.append(empty);
    } else {
      available.forEach(candidate => {
        const item = document.createElement('div');
        item.className = 'suggestion-item';
        const details = document.createElement('div');
        const name = document.createElement('div');
        name.className = 'suggestion-name';
        name.textContent = candidate.dataset.name;
        const meta = document.createElement('div');
        meta.className = 'suggestion-meta';
        meta.textContent = `${candidate.dataset.id} · ${candidate.dataset.region}`;
        details.append(name, meta);
        const select = document.createElement('button');
        select.type = 'button';
        select.className = 'mini-btn approve';
        select.dataset.action = 'select-suggestion';
        select.dataset.memberId = candidate.dataset.id;
        select.textContent = 'Select';
        item.append(details, select);
        suggestionList.append(item);
      });
    }

    suggestionsBackdrop.classList.add('show');
  }

  function navigateToMatchmaking(candidateId) {
    const candidate = rows.find(row => row.dataset.id === candidateId);
    if (!activeMember || !isApproved(activeMember) || !candidate ||
      !isApproved(candidate) || !isActive(activeMember.dataset.id) || !isActive(candidateId)) {
      announce('This member is disabled and cannot be used for a new pairing.');
      closeModal(suggestionsBackdrop);
      renderMemberRows();
      return;
    }
    const buyerId = activeMember.dataset.type === 'buyer' ? activeMember.dataset.id : candidateId;
    const sellerId = activeMember.dataset.type === 'seller' ? activeMember.dataset.id : candidateId;
    const buyer = activeMember.dataset.type === 'buyer' ? activeMember : candidate;
    const params = new URLSearchParams({ buyer: buyerId, seller: sellerId, region: buyer.dataset.region });
    window.location.href = `advisor-capital-matchmaking-admin.html?${params.toString()}`;
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
      input.closest('.member-table').querySelectorAll('tbody tr').forEach(row => {
        const searchable = `${row.dataset.name} ${row.dataset.id} ${row.dataset.region}`.toLowerCase();
        row.hidden = !isApproved(row) || !searchable.includes(query);
      });
    });
  });

  document.querySelectorAll('.member-table tbody tr').forEach(row => {
    const actions = row.querySelector('.row-actions');
    const profile = document.createElement('button');
    profile.type = 'button';
    profile.className = 'mini-btn';
    profile.dataset.action = 'profile';
    profile.textContent = 'View profile';
    const suggestions = document.createElement('button');
    suggestions.type = 'button';
    suggestions.className = 'mini-btn';
    suggestions.dataset.action = 'suggestions';
    suggestions.textContent = 'Matchmaking suggestions';
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'mini-btn';
    toggle.dataset.action = 'toggle';
    actions.classList.add('member-actions');
    actions.append(profile, suggestions, toggle);
  });

  document.addEventListener('click', event => {
    const button = event.target.closest('button[data-action]');
    if (button?.dataset.action === 'select-suggestion') {
      navigateToMatchmaking(button.dataset.memberId);
      return;
    }
    if (!button || !button.closest('.member-table')) return;
    const row = button.closest('tr');
    if (button.dataset.action === 'profile') showProfile(row);
    if (button.dataset.action === 'suggestions') {
      if (!isActive(row.dataset.id)) {
        announce('Activate this member before viewing matchmaking suggestions.');
        return;
      }
      showSuggestions(row);
    }
    if (button.dataset.action === 'toggle') {
      const nextActive = !isActive(row.dataset.id);
      localStorage.setItem(`member-active-${row.dataset.id}`, String(nextActive));
      renderMemberRows();
      announce(`${row.dataset.name} ${nextActive ? 'activated' : 'disabled'}.`);
      if (activeMember?.dataset.id === row.dataset.id && !nextActive) {
        closeModal(suggestionsBackdrop);
      }
    }
  });

  document.getElementById('closeMemberModal').addEventListener('click', () => closeModal(profileBackdrop));
  document.getElementById('closeMemberModalFooter').addEventListener('click', () => closeModal(profileBackdrop));
  document.getElementById('closeSuggestionsModal').addEventListener('click', () => closeModal(suggestionsBackdrop));
  [profileBackdrop, suggestionsBackdrop].forEach(backdrop => backdrop.addEventListener('click', event => {
    if (event.target === backdrop) closeModal(backdrop);
  }));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      closeModal(profileBackdrop);
      closeModal(suggestionsBackdrop);
    }
  });

  renderMemberRows();
})();
