(() => {
  const buyers = [
    { id: 'M-204', name: 'Maya Chen', region: 'Ontario' },
    { id: 'M-301', name: 'Prairie Financial Group', region: 'Alberta' },
    { id: 'M-161', name: 'Ava Thompson', region: 'British Columbia' },
    { id: 'M-275', name: 'Groupe Conseil Laurentides', region: 'Quebec' },
    { id: 'M-129', name: 'Oliver Grant', region: 'Ontario' },
    { id: 'M-291', name: 'Summit Wealth', region: 'Alberta' },
    { id: 'M-515', name: 'Emma Wilson', region: 'Ontario', requiresApproval: true },
    { id: 'M-516', name: 'Capital Path Partners', region: 'Alberta', requiresApproval: true }
  ];
  const backdrop = document.getElementById('sellerSuggestionsBackdrop');
  const matchList = document.getElementById('sellerMatchList');
  const toast = document.getElementById('sellerAlertsToast');
  const sellerAdList = document.getElementById('sellerAdList');
  let activeAd = null;
  let toastTimer;

  function scoreLabel(score) {
    if (score > 90) return 'Exceptional';
    if (score >= 81) return 'Very strong';
    if (score >= 70) return 'Strong';
    if (score >= 60) return 'Good';
    return 'Low';
  }

  function announce(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
  }

  function getScoreMap(ad) {
    if (ad.dataset.scores) {
      return new Map(ad.dataset.scores.split(',').map(entry => {
        const [id, value] = entry.split(':');
        return [id, Number(value)];
      }));
    }
    return new Map(buyers.map((buyer, index) => [buyer.id, Math.max(61, 88 - index * 4)]));
  }

  function scoreRing(score) {
    const ring = document.createElement('div');
    ring.className = 'score-gauge';
    ring.style.setProperty('--score-angle', `${score * 3.6}deg`);
    ring.setAttribute('role', 'img');
    ring.setAttribute('aria-label', `AC Score ${score} out of 100, ${scoreLabel(score)}`);
    const value = document.createElement('span');
    value.textContent = String(score);
    ring.append(value);
    return ring;
  }

  function getOfferSummary(profile) {
    const included = new Set([
      'Email address', 'Phone number', 'Province(s) licensed',
      'Professional designation / licence', 'Practice type sought',
      'Preferred practice province(s)', 'Preferred city / region',
      'Target AUM minimum (CAD)', 'Target AUM maximum (CAD)',
      'Acquisition budget minimum (CAD)', 'Acquisition budget maximum (CAD)',
      'Desired acquisition timeframe', 'Financing status',
      'Preferred seller transition support', 'Additional acquisition preferences'
    ]);
    return profile.filter(([, label]) => included.has(label));
  }

  function closeSuggestions() {
    backdrop.classList.remove('show');
    activeAd = null;
  }

  function openSuggestions(ad) {
    activeAd = ad;
    const scores = getScoreMap(ad);
    const available = buyers
      .filter(buyer => !buyer.requiresApproval || localStorage.getItem(`member-approved-${buyer.id}`) === 'true')
      .filter(buyer => localStorage.getItem(`member-active-${buyer.id}`) !== 'false')
      .map(buyer => ({ ...buyer, score: scores.get(buyer.id) }))
      .filter(buyer => Number.isFinite(buyer.score) && buyer.score >= 0 && buyer.score <= 100)
      .sort((left, right) => right.score - left.score);

    document.getElementById('sellerSuggestionsTitle').textContent = `Buyer suggestions · ${ad.dataset.seller}`;
    document.getElementById('sellerSuggestionsSubtitle').textContent =
      `${ad.dataset.adId} · Active buyers ranked by illustrative AC Score.`;
    matchList.replaceChildren();

    if (!available.length) {
      const empty = document.createElement('p');
      empty.className = 'suggestion-empty';
      empty.textContent = 'There are no active buyers available for suggestions.';
      matchList.append(empty);
    }

    available.forEach(buyer => {
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
      meta.textContent = `${buyer.id} · ${buyer.region}`;
      details.append(name, meta);
      heading.append(details, scoreRing(buyer.score));
      const profile = window.MemberProfiles.getProfile('buyer', buyer.id, buyer.name, buyer.region);
      const offer = document.createElement('div');
      offer.className = 'seller-buyer-offer';
      window.MemberProfiles.appendProfileFields(offer, getOfferSummary(profile));
      const actions = document.createElement('div');
      actions.className = 'seller-match-actions';
      const select = document.createElement('button');
      select.type = 'button';
      select.className = 'mini-btn approve';
      select.textContent = 'Open matchmaking';
      select.addEventListener('click', () => navigateToMatchmaking(buyer));
      actions.append(select);
      item.append(heading, offer, actions);
      matchList.append(item);
    });

    backdrop.classList.add('show');
  }

  function navigateToMatchmaking(buyer) {
    if (!activeAd || localStorage.getItem(`member-active-${buyer.id}`) === 'false' ||
      (buyer.requiresApproval && localStorage.getItem(`member-approved-${buyer.id}`) !== 'true')) {
      closeSuggestions();
      announce('This buyer is no longer available and cannot be selected.');
      return;
    }
    const params = new URLSearchParams({
      buyer: buyer.id,
      seller: activeAd.dataset.sellerId,
      region: activeAd.dataset.region,
      ad: activeAd.dataset.adId
    });
    window.location.href = `advisor-capital-matchmaking-admin.html?${params.toString()}`;
  }

  function addApprovedSellerAds() {
    const ads = JSON.parse(localStorage.getItem('seller-alerts-approved') || '[]');
    ads.forEach(ad => {
      if ([...sellerAdList.querySelectorAll('.seller-ad-card')].some(card => card.dataset.adId === ad.adId)) return;
      const card = document.createElement('article');
      card.className = 'seller-ad-card';
      card.dataset.adId = ad.adId;
      card.dataset.sellerId = ad.sellerId;
      card.dataset.seller = ad.sellerName;
      card.dataset.region = ad.region;

      const header = document.createElement('div');
      header.className = 'seller-ad-head';
      const text = document.createElement('div');
      const title = document.createElement('h2');
      title.className = 'seller-ad-title';
      title.textContent = ad.title;
      const meta = document.createElement('div');
      meta.className = 'seller-ad-meta';
      meta.textContent = `${ad.sellerName} · ${ad.sellerId} · ${ad.region} · Posted ${ad.posted}`;
      text.append(title, meta);
      const suggestions = document.createElement('button');
      suggestions.type = 'button';
      suggestions.className = 'btn btn-primary';
      suggestions.dataset.action = 'suggestions';
      suggestions.textContent = 'Suggested matchmaking';
      header.append(text, suggestions);

      const description = document.createElement('p');
      description.className = 'seller-ad-description';
      description.textContent = ad.description;
      const details = document.createElement('div');
      details.className = 'seller-ad-details';
      [
        ad.aum && `${ad.aum} AUM`,
        ad.askingPrice && `${ad.askingPrice} indicative asking price`,
        ad.clients && `${ad.clients} clients`,
        ad.transition && `${ad.transition} transition support`
      ].filter(Boolean).forEach(label => {
        const signal = document.createElement('span');
        signal.className = 'signal';
        signal.textContent = label;
        details.append(signal);
      });
      card.append(header, description, details);
      sellerAdList.append(card);
    });
  }

  function addDefaultSellerAds() {
    window.SellerOpportunities.sampleAds.forEach(ad => {
      if ([...sellerAdList.querySelectorAll('.seller-ad-card')].some(card => card.dataset.adId === ad.adId)) return;
      const card = document.createElement('article');
      card.className = 'seller-ad-card';
      card.dataset.adId = ad.adId;
      card.dataset.sellerId = ad.sellerId;
      card.dataset.seller = ad.sellerName;
      card.dataset.region = ad.region;
      card.dataset.scores = Object.entries(ad.scores).map(([id, score]) => `${id}:${score}`).join(',');

      const header = document.createElement('div');
      header.className = 'seller-ad-head';
      const text = document.createElement('div');
      const title = document.createElement('h2');
      title.className = 'seller-ad-title';
      title.textContent = ad.title;
      const meta = document.createElement('div');
      meta.className = 'seller-ad-meta';
      meta.textContent = `${ad.sellerName} · ${ad.sellerId} · ${ad.region} · Posted ${ad.posted}`;
      text.append(title, meta);
      const suggestions = document.createElement('button');
      suggestions.type = 'button';
      suggestions.className = 'btn btn-primary';
      suggestions.dataset.action = 'suggestions';
      suggestions.textContent = 'Suggested matchmaking';
      header.append(text, suggestions);

      const description = document.createElement('p');
      description.className = 'seller-ad-description';
      description.textContent = ad.description;
      const details = document.createElement('div');
      details.className = 'seller-ad-details';
      [
        `${ad.city} · ${ad.aum} AUM`,
        `${ad.annualRevenue} annual revenue`,
        `${ad.annualRecurringRevenue} annual recurring revenue`,
        `${ad.askingPrice} asking price`,
        `Sale timeframe: ${ad.saleTimeframe}`
      ].forEach(label => {
        const signal = document.createElement('span');
        signal.className = 'signal';
        signal.textContent = label;
        details.append(signal);
      });
      card.append(header, description, details);
      sellerAdList.append(card);
    });
  }

  sellerAdList.addEventListener('click', event => {
    const button = event.target.closest('button[data-action="suggestions"]');
    if (!button) return;
    openSuggestions(button.closest('.seller-ad-card'));
  });

  document.getElementById('closeSellerSuggestions').addEventListener('click', closeSuggestions);
  document.getElementById('cancelSellerSuggestions').addEventListener('click', closeSuggestions);
  backdrop.addEventListener('click', event => {
    if (event.target === backdrop) closeSuggestions();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeSuggestions();
  });
  window.addEventListener('storage', addApprovedSellerAds);
  addDefaultSellerAds();
  addApprovedSellerAds();
})();
