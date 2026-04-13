// Japan Salon Finder - Filter Logic & UI Rendering
(function () {
  "use strict";

  const ENGLISH_LABELS = {
    fluent: "Fluent",
    conversational: "Conversational",
    basic: "Basic",
    staff_available: "Staff Available"
  };

  const PRICE_LABELS = {
    budget: "Budget",
    mid: "Mid-range",
    premium: "Premium"
  };

  const BADGE_CLASS = {
    fluent: "badge-fluent",
    conversational: "badge-conversational",
    basic: "badge-basic",
    staff_available: "badge-staff"
  };

  // State
  let filters = {
    city: "all",
    english_level: "all",
    price_range: "all",
    gender: "all",
    hair_type: "all"
  };

  // DOM refs
  const resultsContainer = document.getElementById("results");
  const resultCount = document.getElementById("result-count");
  const citySelect = document.getElementById("filter-city");

  // Initialize
  function init() {
    populateCityDropdown();
    bindEvents();
    applyURLParams();
    render();
  }

  // Populate city dropdown from data
  function populateCityDropdown() {
    const cities = [...new Set(SALONS.map(s => s.city))].sort();
    cities.forEach(city => {
      const opt = document.createElement("option");
      opt.value = city;
      opt.textContent = city;
      citySelect.appendChild(opt);
    });
  }

  // Bind all filter events
  function bindEvents() {
    citySelect.addEventListener("change", function () {
      filters.city = this.value;
      updateURL();
      render();
    });

    document.querySelectorAll("[data-filter]").forEach(chip => {
      chip.addEventListener("click", function () {
        const filterName = this.dataset.filter;
        const filterValue = this.dataset.value;
        const group = document.querySelectorAll(`[data-filter="${filterName}"]`);

        group.forEach(c => c.classList.remove("active"));
        this.classList.add("active");
        filters[filterName] = filterValue;
        updateURL();
        render();
      });
    });
  }

  // Filter salons
  function getFilteredSalons() {
    return SALONS.filter(s => {
      if (filters.city !== "all" && s.city !== filters.city) return false;
      if (filters.english_level !== "all" && s.english_level !== filters.english_level) return false;
      if (filters.price_range !== "all" && s.price_range !== filters.price_range) return false;
      if (filters.gender !== "all" && s.gender !== filters.gender) return false;
      if (filters.hair_type !== "all" && !s.hair_types.includes(filters.hair_type)) return false;
      return true;
    });
  }

  // Render salon cards
  function render() {
    const filtered = getFilteredSalons();
    resultCount.textContent = `${filtered.length} salon${filtered.length !== 1 ? "s" : ""} found`;

    if (filtered.length === 0) {
      resultsContainer.innerHTML = `
        <div class="no-results" style="grid-column: 1 / -1;">
          <p style="font-size: 18px; margin-bottom: 8px;">No salons match your filters</p>
          <p>Try broadening your search criteria</p>
        </div>`;
      return;
    }

    resultsContainer.innerHTML = filtered.map(s => renderCard(s)).join("");
  }

  // Render a single salon card
  function renderCard(s) {
    const englishBadge = `<span class="badge ${BADGE_CLASS[s.english_level]}">${ENGLISH_LABELS[s.english_level]}</span>`;
    const priceText = s.cut_price_yen ? `&yen;${s.cut_price_yen.toLocaleString()} cut` : PRICE_LABELS[s.price_range];

    let links = "";
    if (s.hot_pepper_url) {
      links += `<a href="${s.hot_pepper_url}" target="_blank" rel="noopener" class="card-link card-link-hotpepper">Hot Pepper</a>`;
    }
    if (s.google_maps_url) {
      links += `<a href="${s.google_maps_url}" target="_blank" rel="noopener" class="card-link card-link-maps">Map</a>`;
    }
    if (s.website_url) {
      links += `<a href="${s.website_url}" target="_blank" rel="noopener" class="card-link card-link-website">Website</a>`;
    }

    const hairTypeTags = s.hair_types.map(t =>
      `<span style="font-size:12px;color:#6b7280;background:#f3f4f6;padding:2px 8px;border-radius:4px;">${capitalize(t)}</span>`
    ).join(" ");

    return `
      <div class="salon-card">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px;">
          <h3 style="font-size:18px;font-weight:700;color:#111827;margin:0;">${escHTML(s.name)}</h3>
          ${englishBadge}
        </div>
        <p style="font-size:14px;color:#6b7280;margin:6px 0 0;">
          ${escHTML(s.area)} &middot; ${escHTML(s.nearest_station)}
        </p>
        <div style="margin:12px 0 8px;display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
          <span class="price-badge">${priceText}</span>
          ${hairTypeTags}
        </div>
        <p style="font-size:13px;color:#4b5563;margin:8px 0 12px;">${escHTML(s.notes)}</p>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">${links}</div>
        <div class="source-tag">Recommended on ${escHTML(s.source)}</div>
      </div>`;
  }

  // URL param sync
  function updateURL() {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== "all") params.set(k, v);
    });
    const qs = params.toString();
    const url = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
    history.replaceState(null, "", url);
  }

  function applyURLParams() {
    const params = new URLSearchParams(window.location.search);
    params.forEach((val, key) => {
      if (key in filters) {
        filters[key] = val;
        // Update UI to match
        if (key === "city") {
          citySelect.value = val;
        } else {
          const chip = document.querySelector(`[data-filter="${key}"][data-value="${val}"]`);
          if (chip) {
            document.querySelectorAll(`[data-filter="${key}"]`).forEach(c => c.classList.remove("active"));
            chip.classList.add("active");
          }
        }
      }
    });
  }

  // Helpers
  function escHTML(str) {
    const d = document.createElement("div");
    d.textContent = str;
    return d.innerHTML;
  }

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // Boot
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
