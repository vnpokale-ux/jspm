/**
 * BrowsePage View with Dynamic Filters & Live Search
 */

async function renderBrowsePage() {
  const currentFilters = state.filterState;
  const items = await api.getItems(currentFilters);

  return `
    <div class="container" style="padding-top: 32px; padding-bottom: 64px;">
      <!-- Page Header -->
      <div class="section-header" style="margin-bottom: 24px;">
        <div>
          <h1 class="section-title">Campus Item Directory</h1>
          <p class="section-desc">Search, filter, and discover lost and found items posted by campus members</p>
        </div>
        <button class="btn btn-primary" onclick="openReportModal()">
          <span>➕</span> Report Item
        </button>
      </div>

      <!-- Main Filter Layout -->
      <div class="browse-layout">
        <!-- Sidebar Filter Controls -->
        <aside class="filter-sidebar">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
            <h3 style="font-family: var(--font-heading); font-size: 1.15rem; font-weight: 700;">Filters</h3>
            <button class="btn btn-outline btn-sm" style="font-size: 0.75rem; padding: 4px 8px;" onclick="state.resetFilters()">Reset All</button>
          </div>

          <!-- Type Filter -->
          <div class="filter-group">
            <label class="filter-title">Listing Type</label>
            <div class="type-toggle-group">
              <button class="type-toggle-btn ${!currentFilters.type ? 'active' : ''}" onclick="applyFilter('type', null)">All</button>
              <button class="type-toggle-btn ${currentFilters.type === 'LOST' ? 'active' : ''}" onclick="applyFilter('type', 'LOST')">🔴 Lost</button>
              <button class="type-toggle-btn ${currentFilters.type === 'FOUND' ? 'active' : ''}" onclick="applyFilter('type', 'FOUND')">🟢 Found</button>
            </div>
          </div>

          <!-- Keyword Search -->
          <div class="filter-group">
            <label class="filter-title">Search Keywords</label>
            <input type="text" id="filterKeywordInput" class="form-control" placeholder="Search title, brand, details..." value="${escapeHtml(currentFilters.query || '')}" oninput="debounceFilter('query', this.value)" />
          </div>

          <!-- Category Filter -->
          <div class="filter-group">
            <label class="filter-title">Category</label>
            <select class="form-control" onchange="applyFilter('category', this.value || null)">
              <option value="">All Categories</option>
              ${INITIAL_CATEGORIES.map(c => `
                <option value="${c.name}" ${currentFilters.category === c.name ? 'selected' : ''}>
                  ${c.icon} ${c.name}
                </option>
              `).join('')}
            </select>
          </div>

          <!-- Location Filter -->
          <div class="filter-group">
            <label class="filter-title">Campus Location</label>
            <select class="form-control" onchange="applyFilter('location', this.value || null)">
              <option value="">All Campus Locations</option>
              ${CAMPUS_LOCATIONS.map(loc => `
                <option value="${loc}" ${currentFilters.location === loc ? 'selected' : ''}>
                  ${loc}
                </option>
              `).join('')}
            </select>
          </div>

          <!-- Status Filter -->
          <div class="filter-group">
            <label class="filter-title">Listing Status</label>
            <select class="form-control" onchange="applyFilter('status', this.value)">
              <option value="ACTIVE" ${currentFilters.status === 'ACTIVE' ? 'selected' : ''}>Active Only</option>
              <option value="RESOLVED" ${currentFilters.status === 'RESOLVED' ? 'selected' : ''}>Resolved / Reunited</option>
              <option value="" ${!currentFilters.status ? 'selected' : ''}>All Statuses</option>
            </select>
          </div>
        </aside>

        <!-- Main Items Grid Area -->
        <main>
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; font-size: 0.9rem; color: var(--text-muted);">
            <div>
              Found <strong style="color: var(--text-main);">${items.length}</strong> matching items
            </div>
            <div>
              Sorted by <strong>Most Recent</strong>
            </div>
          </div>

          ${items.length === 0 ? `
            <div style="text-align: center; padding: 64px 20px; background: var(--bg-card); border-radius: var(--radius-lg); border: 1px solid var(--border-subtle);">
              <div style="font-size: 3rem; margin-bottom: 16px;">🔍</div>
              <h3 style="font-size: 1.3rem; font-weight: 700; margin-bottom: 8px;">No Items Found</h3>
              <p style="color: var(--text-muted); max-width: 420px; margin: 0 auto 24px;">
                No lost or found items matched your current filter criteria. Try broadening your keywords or resetting filters.
              </p>
              <button class="btn btn-secondary" onclick="state.resetFilters()">Clear Filters</button>
            </div>
          ` : `
            <div class="items-grid">
              ${items.map(item => renderItemCard(item)).join('')}
            </div>
          `}
        </main>
      </div>
    </div>
  `;
}

let filterDebounceTimer = null;
function debounceFilter(key, value) {
  clearTimeout(filterDebounceTimer);
  filterDebounceTimer = setTimeout(() => {
    state.setFilter(key, value);
  }, 300);
}

function applyFilter(key, value) {
  state.setFilter(key, value);
}
