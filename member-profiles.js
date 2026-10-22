(() => {
  const overrides = {
    'M-204': { email: 'maya.chen@example.com', phone: '(416) 555-0104', licensed: 'ON', credentials: 'CFP, CIRO registration', practiceTypes: 'Financial planning, Investment advisory', cities: 'Toronto, ON', aumMin: '$10,000,000', aumMax: '$50,000,000', budgetMin: '$500,000', budgetMax: '$1,000,000', timeframe: '6–12 months', financing: 'Pre-approved', transition: '6 months', preferences: 'Open to a phased succession in the Greater Toronto Area.' },
    'M-301': { email: 'contact@prairiefinancial.example', phone: '(403) 555-0130', licensed: 'AB', credentials: 'CFP, CIRO registration', practiceTypes: 'Financial planning, Investment advisory', cities: 'Calgary, Edmonton', aumMin: '$20,000,000', aumMax: '$80,000,000', budgetMin: '$750,000', budgetMax: '$2,000,000', timeframe: '12–24 months', financing: 'Available cash', transition: '12 months', preferences: 'Interested in established Alberta practices with recurring revenue.' },
    'M-161': { email: 'ava.thompson@example.com', phone: '(604) 555-0161', licensed: 'BC, AB', credentials: 'CFP', practiceTypes: 'Financial planning, Insurance', cities: 'Vancouver, Victoria', aumMin: '$8,000,000', aumMax: '$35,000,000', budgetMin: '$400,000', budgetMax: '$900,000', timeframe: '0–6 months', financing: 'Pre-approved', transition: '6 months', preferences: 'Prefers a client-first transition and a practice near Vancouver Island.' },
    'M-275': { email: 'info@laurentides.example', phone: '(514) 555-0275', licensed: 'QC', credentials: 'CFP, Other', practiceTypes: 'Financial planning, Investment advisory', cities: 'Montréal, Laurentides', aumMin: '$12,000,000', aumMax: '$45,000,000', budgetMin: '$500,000', budgetMax: '$1,200,000', timeframe: 'Flexible', financing: 'Seeking financing', transition: 'Flexible', preferences: 'French-speaking client service is preferred.' },
    'M-129': { email: 'oliver.grant@example.com', phone: '(416) 555-0129', licensed: 'ON', credentials: 'CFP, CIRO registration', practiceTypes: 'Investment advisory', cities: 'Toronto, Ottawa', aumMin: '$15,000,000', aumMax: '$60,000,000', budgetMin: '$600,000', budgetMax: '$1,500,000', timeframe: '6–12 months', financing: 'Available cash', transition: '3 months', preferences: 'Interested in investment advisory practices in Ontario.' },
    'M-291': { email: 'acquisitions@summitwealth.example', phone: '(780) 555-0291', licensed: 'AB, BC', credentials: 'CFP, CIRO registration', practiceTypes: 'Financial planning, Investment advisory', cities: 'Edmonton, Calgary', aumMin: '$25,000,000', aumMax: '$100,000,000', budgetMin: '$1,000,000', budgetMax: '$3,000,000', timeframe: '12–24 months', financing: 'Undecided', transition: '12 months', preferences: 'Seeking a larger growth opportunity with an orderly handover.' },
    'M-515': { email: 'emma.wilson@example.com', phone: '(416) 555-0515', licensed: 'ON', credentials: 'CFP', practiceTypes: 'Financial planning', cities: 'Toronto, ON', aumMin: '$10,000,000', aumMax: '$50,000,000', budgetMin: '$500,000', budgetMax: '$1,000,000', timeframe: '6–12 months', financing: 'Undecided', transition: 'Flexible', preferences: 'Interested in an Ontario advisory practice.' },
    'M-516': { email: 'contact@capitalpath.example', phone: '(403) 555-0516', licensed: 'AB', credentials: 'CFP, CIRO registration', practiceTypes: 'Financial planning, Investment advisory', cities: 'Calgary, AB', aumMin: '$15,000,000', aumMax: '$60,000,000', budgetMin: '$750,000', budgetMax: '$1,500,000', timeframe: '12–24 months', financing: 'Pre-approved', transition: '6 months', preferences: 'Exploring established Alberta opportunities.' },
    'M-118': { email: 'succession@cedarridge.example', phone: '(416) 555-0118', licensed: 'ON', credentials: 'CFP, CIRO registration', practiceTypes: 'Financial planning, Investment advisory', city: 'Toronto, ON', aum: '$35,000,000', askingPrice: '$750,000', saleTimeframe: '6–12 months', sellerTransition: '6 months', clients: '250', revenue: '$500,000', preferences: 'Seeking a buyer who will preserve the client-first service model.' },
    'M-087': { email: 'noah.patel@example.com', phone: '(403) 555-0087', licensed: 'AB', credentials: 'CFP', practiceTypes: 'Financial planning', city: 'Calgary, AB', aum: '$28,000,000', askingPrice: '$620,000', saleTimeframe: '0–6 months', sellerTransition: '3 months', clients: '190', revenue: '$390,000', preferences: 'Flexible on timing for a well-qualified local buyer.' },
    'M-442': { email: 'info@northshore.example', phone: '(604) 555-0442', licensed: 'BC', credentials: 'CFP, CIRO registration', practiceTypes: 'Investment advisory, Financial planning', city: 'Vancouver, BC', aum: '$42,000,000', askingPrice: '$900,000', saleTimeframe: '12–24 months', sellerTransition: '12 months', clients: '310', revenue: '$610,000', preferences: 'Values continuity and a gradual client introduction.' },
    'M-056': { email: 'louis.martin@example.com', phone: '(514) 555-0056', licensed: 'QC', credentials: 'CFP', practiceTypes: 'Financial planning, Insurance', city: 'Montréal, QC', aum: '$19,000,000', askingPrice: '$480,000', saleTimeframe: 'Flexible', sellerTransition: 'Flexible', clients: '165', revenue: '$320,000', preferences: 'French-language client service is important.' },
    'M-082': { email: 'sales@mapleleaf.example', phone: '(416) 555-0082', licensed: 'ON', credentials: 'CIRO registration', practiceTypes: 'Investment advisory', city: 'Ottawa, ON', aum: '$31,000,000', askingPrice: '$700,000', saleTimeframe: '6–12 months', sellerTransition: '6 months', clients: '225', revenue: '$460,000', preferences: 'Open to a buyer with investment advisory experience.' },
    'M-330': { email: 'sophie.tremblay@example.com', phone: '(780) 555-0330', licensed: 'AB', credentials: 'CFP, Insurance licence', practiceTypes: 'Financial planning, Insurance', city: 'Edmonton, AB', aum: '$24,000,000', askingPrice: '$590,000', saleTimeframe: '0–6 months', sellerTransition: '3 months', clients: '205', revenue: '$410,000', preferences: 'Would like to retire within the next year.' },
    'M-620': { email: 'succession@willowcreek.example', phone: '(604) 555-0620', licensed: 'BC', credentials: 'CFP', practiceTypes: 'Financial planning, Investment advisory', city: 'Vancouver, BC', aum: '$22,000,000', askingPrice: '$575,000', saleTimeframe: '6–12 months', sellerTransition: '6 months', clients: '180', revenue: '$365,000', preferences: 'Seeking a qualified buyer for a British Columbia practice.' },
    'M-621': { email: 'info@laurentianwealth.example', phone: '(514) 555-0621', licensed: 'QC', credentials: 'CFP, Insurance licence', practiceTypes: 'Financial planning, Insurance', city: 'Montréal, QC', aum: '$27,000,000', askingPrice: '$680,000', saleTimeframe: '12–24 months', sellerTransition: '12 months', clients: '215', revenue: '$430,000', preferences: 'French-speaking buyer preferred; flexible transition.' }
  };

  function getProfile(type, id, name, region) {
    const data = overrides[id] || {};
    if (type === 'buyer') {
      return [
        ['Account', 'Full name', name],
        ['Account', 'Email address', data.email || `${id.toLowerCase()}@example.com`],
        ['Account', 'Phone number', data.phone || '(416) 555-0515'],
        ['Professional', 'Province(s) licensed', data.licensed || region],
        ['Professional', 'Professional designation / licence', data.credentials || 'CFP'],
        ['Professional', 'Practice type sought', data.practiceTypes || 'Financial planning'],
        ['Acquisition', 'Preferred practice province(s)', data.licensed || region],
        ['Acquisition', 'Preferred city / region', data.cities || region],
        ['Acquisition', 'Target AUM minimum (CAD)', data.aumMin || '$10,000,000'],
        ['Acquisition', 'Target AUM maximum (CAD)', data.aumMax || '$50,000,000'],
        ['Acquisition', 'Acquisition budget minimum (CAD)', data.budgetMin || '$500,000'],
        ['Acquisition', 'Acquisition budget maximum (CAD)', data.budgetMax || '$1,000,000'],
        ['Acquisition', 'Desired acquisition timeframe', data.timeframe || 'Flexible'],
        ['Readiness', 'Financing status', data.financing || 'Undecided'],
        ['Transition', 'Preferred seller transition support', data.transition || 'Flexible'],
        ['Preferences', 'Additional acquisition preferences', data.preferences || 'Open to suitable advisory practice opportunities.']
      ];
    }
    return [
      ['Account', 'Full name', name],
      ['Account', 'Email address', data.email || `${id.toLowerCase()}@example.com`],
      ['Account', 'Phone number', data.phone || '(416) 555-0620'],
      ['Professional', 'Province(s) licensed', data.licensed || region],
      ['Professional', 'Professional designation / licence', data.credentials || 'CFP'],
      ['Practice', 'Practice type', data.practiceTypes || 'Financial planning'],
      ['Practice', 'Practice province', region],
      ['Practice', 'Practice city / region', data.city || `${region}, Canada`],
      ['Practice', 'Assets under management (CAD)', data.aum || '$25,000,000'],
      ['Valuation', 'Indicative asking price (CAD)', data.askingPrice || '$650,000'],
      ['Timeline', 'Expected sale timeframe', data.saleTimeframe || 'Flexible'],
      ['Transition', 'Transition support offered', data.sellerTransition || '6 months'],
      ['Practice', 'Approximate client count', data.clients || '200'],
      ['Practice', 'Annual recurring revenue (CAD)', data.revenue || '$400,000'],
      ['Preferences', 'Buyer requirements or preferences', data.preferences || 'Open to a qualified buyer with a thoughtful transition plan.']
    ];
  }

  function appendProfileFields(container, profile) {
    const grid = document.createElement('dl');
    grid.className = 'member-profile-grid';
    profile.forEach(([group, label, value]) => {
      const item = document.createElement('div');
      item.className = 'member-profile-field';
      const heading = document.createElement('dt');
      heading.textContent = `${group} · ${label}`;
      const description = document.createElement('dd');
      description.textContent = value;
      item.append(heading, description);
      grid.append(item);
    });
    container.append(grid);
  }

  window.MemberProfiles = { getProfile, appendProfileFields };
})();
