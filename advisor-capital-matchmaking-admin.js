(() => {
      const tbody = document.getElementById('matchRows');
      const rows = () => [...tbody.querySelectorAll('tr')];
      const tabs = [...document.querySelectorAll('#matchStatusTabs .tab')];
      const search = document.getElementById('searchInput');
      const regionFilter = document.getElementById('regionFilter');
      const toast = document.getElementById('toast');
      const detailBackdrop = document.getElementById('modalBackdrop');
      const createBackdrop = document.getElementById('createModalBackdrop');
      const buyerSelect = document.getElementById('buyerSelect');
      const sellerSelect = document.getElementById('sellerSelect');
      const rationaleInput = document.getElementById('matchRationale');
      let activeTab = 'pending';
      let selectedRow = null;
      let toastTimer;
      const statusText = { pending: 'Pending review', approved: 'Approved', hold: 'On hold', dismissed: 'Dismissed' };
      function announce(message) {
        toast.textContent = message;
        toast.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
      }
      function memberIsActive(memberId) {
        return localStorage.getItem(`member-active-${memberId}`) !== 'false';
      }
      function memberIsApproved(option) {
        return !option.dataset.reviewMember ||
          localStorage.getItem(`member-approved-${option.value.split('|').pop()}`) === 'true';
      }
      function updateMemberOptions(select) {
        [...select.options].forEach(option => {
          if (!option.value) return;
          const memberId = option.value.split('|').pop();
          option.disabled = !memberIsApproved(option) || !memberIsActive(memberId);
          if (option.disabled && option.selected) select.value = '';
        });
      }
      function initials(name) { return name.split(/\s+/).map(part => part[0]).slice(0, 2).join('').toUpperCase(); }
      function escapeHtml(value) {
        return String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
      }
      function counts() {
        const c = { pending: 0, approved: 0, hold: 0, dismissed: 0 };
        rows().forEach(row => c[row.dataset.status]++);
        Object.entries(c).forEach(([status, count]) => {
          const tab = document.getElementById(`tab${status[0].toUpperCase()}${status.slice(1)}`);
          if (tab) tab.textContent = count;
          const stat = document.getElementById(`stat${status[0].toUpperCase()}${status.slice(1)}`);
          if (stat) stat.textContent = count;
        });
        document.getElementById('sidebarCount').textContent = c.pending;
      }
      function render() {
        const q = search.value.trim().toLowerCase();
        let visible = 0;
        rows().forEach(row => {
          const matchTab = row.dataset.status === activeTab;
          const matchSearch = !q || row.dataset.search.toLowerCase().includes(q);
          const matchRegion = regionFilter.value === 'all' || row.dataset.region === regionFilter.value;
          const show = matchTab && matchSearch && matchRegion;
          row.style.display = show ? '' : 'none';
          if (show) visible++;
        });
        document.getElementById('emptyState').style.display = visible ? 'none' : 'block';
        const statusLabel = activeTab === 'pending' ? 'pairings awaiting review' : `${statusText[activeTab].toLowerCase()} pairings`;
        document.getElementById('rowSummary').textContent = `Showing ${visible} ${statusLabel} · Sample records for demonstration`;
      }
      function setStatus(row, status) {
        row.dataset.status = status;
        const cell = row.querySelector('.status');
        cell.className = `status ${status}`;
        cell.textContent = statusText[status];
        renderActions(row);
        counts(); render();
      }

      function profileValue(type, name, id, region, label) {
        const profile = window.MemberProfiles.getProfile(type, id, name, region);
        return profile.find(([, field]) => field === label)?.[2] || '';
      }

      function renderActions(row) {
        const actions = row.querySelector('.row-actions');
        actions.replaceChildren();
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
            ['buyer', row.dataset.buyer, row.dataset.buyerId, 'Call buyer', 'phone', 'tel'],
            ['buyer', row.dataset.buyer, row.dataset.buyerId, 'Email buyer', 'email', 'mailto'],
            ['seller', row.dataset.seller, row.dataset.sellerId, 'Call seller', 'phone', 'tel'],
            ['seller', row.dataset.seller, row.dataset.sellerId, 'Email seller', 'email', 'mailto']
          ].forEach(([type, name, id, label, field, scheme]) => {
            const contact = profileValue(type, name, id, row.dataset.region, field === 'phone' ? 'Phone number' : 'Email address');
            if (!contact) return;
            const link = document.createElement('a');
            link.className = 'mini-btn';
            link.textContent = label;
            link.href = `${scheme}:${field === 'phone' ? contact.replace(/[^\d+]/g, '') : contact}`;
            actions.append(link);
          });
        }
      }

      function openDetails(row) {
        selectedRow = row;
        document.getElementById('modalSubtitle').textContent = `${row.dataset.region} · Created by ${row.dataset.createdBy || 'Advisor Capital user'} · ${row.dataset.created || ''}`;
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
      function closeDetails() { detailBackdrop.classList.remove('show'); selectedRow = null; }
      function closeCreate() { createBackdrop.classList.remove('show'); document.getElementById('createMatchForm').reset(); }
      function makePairRow(buyerName, buyerId, sellerName, sellerId, region, rationale) {
        const today = new Intl.DateTimeFormat('en-CA', { month: 'short', day: '2-digit', year: 'numeric' }).format(new Date());
        const searchValue = `${buyerName} ${buyerId} ${sellerName} ${sellerId} ${region}`;
        const row = document.createElement('tr');
        row.dataset.status = 'pending'; row.dataset.region = region;
        row.dataset.buyer = buyerName; row.dataset.buyerId = buyerId;
        row.dataset.seller = sellerName; row.dataset.sellerId = sellerId;
        row.dataset.rationale = rationale; row.dataset.createdBy = 'Current admin'; row.dataset.created = today;
        row.dataset.search = `${searchValue} ${rationale} Current admin`;
        row.innerHTML = `<td><div class="pair-cell"><div class="person"><div class="avatar">${escapeHtml(initials(buyerName))}</div><div><div class="person-name">${escapeHtml(buyerName)}</div><div class="person-meta">Buyer · ${escapeHtml(buyerId)}</div></div></div><span class="pair-arrow">↔</span><div class="person"><div class="avatar">${escapeHtml(initials(sellerName))}</div><div><div class="person-name">${escapeHtml(sellerName)}</div><div class="person-meta">Seller · ${escapeHtml(sellerId)}</div></div></div></div></td><td class="rationale">${escapeHtml(rationale)}</td><td>${escapeHtml(region)}</td><td>Current admin</td><td>${escapeHtml(today)}</td><td><span class="status pending">Pending review</span></td><td><div class="row-actions"></div></td>`;
        renderActions(row);
        tbody.prepend(row);
      }
      tbody.addEventListener('click', e => {
        const button = e.target.closest('button[data-action]');
        if (!button) return;
        const row = button.closest('tr');
        const action = button.dataset.action;
        if (action === 'details') openDetails(row);
        if (action === 'approve') { setStatus(row, 'approved'); announce('Pairing approved in this prototype. No member was contacted.'); }
        if (action === 'resume') { setStatus(row, 'pending'); announce('Pairing returned to the review queue.'); }
      });
      tabs.forEach(tab => tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active'); activeTab = tab.dataset.tab; render();
      }));
      [search, regionFilter].forEach(el => el.addEventListener('input', render));
      regionFilter.addEventListener('change', render);
      document.getElementById('closeModal').addEventListener('click', closeDetails);
      document.getElementById('modalBackdrop').addEventListener('click', e => { if (e.target === detailBackdrop) closeDetails(); });
      document.getElementById('closeCreateModal').addEventListener('click', closeCreate);
      document.getElementById('cancelCreate').addEventListener('click', closeCreate);
      createBackdrop.addEventListener('click', e => { if (e.target === createBackdrop) closeCreate(); });
      document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeDetails(); closeCreate(); } });
      document.getElementById('modalApprove').addEventListener('click', () => { if (selectedRow) { setStatus(selectedRow, 'approved'); closeDetails(); announce('Pairing approved in this prototype. No member was contacted.'); } });
      document.getElementById('modalHold').addEventListener('click', () => { if (selectedRow) { setStatus(selectedRow, 'hold'); closeDetails(); announce('Pairing placed on hold.'); } });
      document.getElementById('createMatchBtn').addEventListener('click', () => createBackdrop.classList.add('show'));
      document.getElementById('createMatchForm').addEventListener('submit', e => {
        e.preventDefault();
        updateMemberOptions(buyerSelect);
        updateMemberOptions(sellerSelect);
        const [buyerName, buyerId] = buyerSelect.value.split('|');
        const [sellerName, sellerId] = sellerSelect.value.split('|');
        const region = document.getElementById('matchRegion').value;
        const rationale = rationaleInput.value.trim();
        if (!buyerName || !sellerName || !region || !rationale) {
          announce('Select an active buyer and seller, region, and rationale before saving.');
          return;
        }
        if (!memberIsActive(buyerId) || !memberIsActive(sellerId)) {
          announce('Disabled members cannot be added to a new matchmaking listing.');
          return;
        }
        makePairRow(buyerName, buyerId, sellerName, sellerId, region, rationale);
        closeCreate(); counts(); render();
        announce('Manual pairing added to the review queue. No member was contacted.');
      });
      document.getElementById('exportBtn').addEventListener('click', () => announce('Export is a visual placeholder in this prototype.'));
      rows().forEach(renderActions);
      updateMemberOptions(buyerSelect);
      updateMemberOptions(sellerSelect);
      const params = new URLSearchParams(window.location.search);
      const buyerId = params.get('buyer');
      const sellerId = params.get('seller');
      const requestedRegion = params.get('region');
      if (buyerId || sellerId) {
        const buyerOption = [...buyerSelect.options].find(option => option.value.endsWith(`|${buyerId}`));
        const sellerOption = [...sellerSelect.options].find(option => option.value.endsWith(`|${sellerId}`));
        if (buyerOption && sellerOption && !buyerOption.disabled && !sellerOption.disabled) {
          buyerSelect.value = buyerOption.value;
          sellerSelect.value = sellerOption.value;
          const regionSelect = document.getElementById('matchRegion');
          if ([...regionSelect.options].some(option => option.value === requestedRegion || option.textContent === requestedRegion)) {
            regionSelect.value = requestedRegion;
          }
          rationaleInput.value = params.get('ad')
            ? `Selected from seller alert ${params.get('ad')}; administrator review required.`
            : 'Suggested pairing selected from the Members workspace; administrator review required.';
          createBackdrop.classList.add('show');
        } else {
          announce('The selected buyer or seller is unavailable. Disabled members cannot be paired.');
        }
      }
      counts();
      render();
    })();