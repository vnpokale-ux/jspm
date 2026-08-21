/**
 * HomePage View tailored for TSSM's BSCOER & JSPM Institutes
 */

async function renderHomePage() {
  const items = await api.getItems({ status: 'ACTIVE' });
  const recentItems = items.slice(0, 4);
  const stats = await api.getAdminStats();

  return `
    <div class="home-page">
      <!-- Hero Section with College Branding & Landmark Banner -->
      <section class="hero-section" style="padding-top: 48px;">
        <div class="container">
          
          <!-- College Affiliation Tag -->
          <div style="display: inline-flex; align-items: center; gap: 10px; padding: 6px 18px; background: rgba(99, 102, 241, 0.12); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: var(--radius-full); margin-bottom: 24px; box-shadow: 0 4px 16px rgba(99, 102, 241, 0.15);">
            <div style="width: 28px; height: 28px; border-radius: 50%; overflow: hidden; display: flex; align-items: center; justify-content: center; background: #fff; flex-shrink: 0;">
              <img src="${COLLEGE_LOGO_URL}" alt="BSCOER Crest" style="width: 100%; height: 100%; object-fit: cover; transform: scale(1.2); border-radius: 50%;" />
            </div>
            <span style="color: #c7d2fe; font-size: 0.9rem; font-weight: 600;">
              TSSM's Bhivarabai Sawant College of Engineering & Research, Pune
            </span>
          </div>
          
          <h1 class="hero-title">
            Campus Lost & Found Portal <br />
            <span class="gradient-text">JSPM University Recovery Hub</span>
          </h1>

          <p class="hero-subtitle">
            An intelligent lost and found network connecting BSCOER students, professors, and campus security. Report lost items in labs or library, track smart AI matches, and safely claim possessions.
          </p>

          <!-- Featured JSPM Landmark Campus Showcase Banner with 3D Scroll Perspective Tilt -->
          <div class="campus-perspective-wrapper" id="campusPerspectiveWrapper">
            <div class="campus-tilt-card" id="campusTiltCard">
              <div class="campus-tilt-media">
                <img src="${CAMPUS_BANNER_URL}" alt="JSPM Institutes Campus Landmark" class="campus-tilt-img" />
              </div>
              <div style="padding: 16px 12px 8px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
                <div style="text-align: left;">
                  <span class="badge" style="background: #f43f5e; color: #fff; border: none; font-weight: 700; margin-bottom: 4px;">JSPM GROUP OF INSTITUTES</span>
                  <h3 style="font-family: var(--font-heading); font-size: 1.2rem; color: #fff; font-weight: 700;">TSSM's Bhivarabai Sawant College of Engineering & Research (BSCOER)</h3>
                </div>
                <div style="display: flex; gap: 10px;">
                  <span class="badge" style="background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.4); font-size: 0.8rem; padding: 6px 12px;">
                    🟢 Live Campus Lost & Found Active
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Search Bar -->
          <div class="hero-search-box">
            <span style="font-size: 1.3rem; margin-left: 8px;">🔍</span>
            <input type="text" id="heroQuickSearchInput" class="hero-search-input" placeholder="Search by item name, PRN, lab name, or campus spot (e.g. Lab 204, Library, ID Card)..." onkeydown="if(event.key === 'Enter') handleHeroSearch()" />
            <button class="btn btn-primary" id="btnHeroSearch" onclick="handleHeroSearch()">
              Search
            </button>
          </div>

          <!-- Hero Action Buttons -->
          <div class="hero-cta-group">
            <button class="btn btn-lost btn-lg" onclick="openReportModalWithPreset('LOST')">
              <span>📢</span> Report Lost Item
            </button>
            <button class="btn btn-found btn-lg" onclick="openReportModalWithPreset('FOUND')">
              <span>🙌</span> Report Found Item
            </button>
          </div>

          <!-- Live Metrics Counter Strip -->
          <div class="stats-strip">
            <div class="stat-card">
              <div class="stat-value" style="color: #818cf8;">${stats.totalItems}+</div>
              <div class="stat-label">Total Listings Tracked</div>
            </div>
            <div class="stat-card">
              <div class="stat-value" style="color: #34d399;">${stats.resolvedItems}</div>
              <div class="stat-label">Successfully Returned</div>
            </div>
            <div class="stat-card">
              <div class="stat-value" style="color: #f43f5e;">${stats.activeLostItems}</div>
              <div class="stat-label">Active Missing Reports</div>
            </div>
            <div class="stat-card">
              <div class="stat-value" style="color: #c084fc;">94%</div>
              <div class="stat-label">AI Match Accuracy Rate</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Category Explorer Section -->
      <section class="container" style="margin-bottom: 64px;">
        <div class="section-header">
          <div>
            <h2 class="section-title">Explore by Category</h2>
            <p class="section-desc">Quickly browse commonly misplaced items across TSSM departments & labs</p>
          </div>
          <button class="btn btn-outline btn-sm" onclick="state.setRoute('browse')">
            View All Categories →
          </button>
        </div>

        <div class="categories-grid">
          ${INITIAL_CATEGORIES.map(cat => `
            <div class="category-card" onclick="filterByCategory('${cat.name}')">
              <div class="category-icon">${cat.icon}</div>
              <div class="category-name">${cat.name}</div>
              <div class="category-count">${cat.count} listings</div>
            </div>
          `).join('')}
        </div>
      </section>

      <!-- Recent Items Showcase -->
      <section class="container" style="margin-bottom: 80px;">
        <div class="section-header">
          <div>
            <h2 class="section-title">Recent Campus Listings</h2>
            <p class="section-desc">Recently reported lost and found items in library, classrooms, and cafeteria</p>
          </div>
          <button class="btn btn-primary btn-sm" onclick="state.setRoute('browse')">
            Browse Directory (${items.length}) →
          </button>
        </div>

        <div class="items-grid">
          ${recentItems.map(item => renderItemCard(item)).join('')}
        </div>
      </section>

      <!-- How It Works Section -->
      <section class="container" style="margin-bottom: 96px;">
        <div style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 48px 36px; text-align: center;">
          <div class="hero-pill" style="margin-bottom: 16px;">TSSM BSCOER Recovery Workflow</div>
          <h2 class="section-title" style="margin-bottom: 36px;">How the Campus Lost & Found Network Works</h2>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 32px; text-align: left;">
            <div style="background: var(--bg-tertiary); padding: 24px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
              <div style="font-size: 2.2rem; margin-bottom: 12px;">1️⃣</div>
              <h3 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 8px;">Submit Report</h3>
              <p style="color: var(--text-muted); font-size: 0.9rem;">Fill in the location (e.g. Lab 204 or Reading Hall), category, photo, and details of what was lost or found.</p>
            </div>

            <div style="background: var(--bg-tertiary); padding: 24px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
              <div style="font-size: 2.2rem; margin-bottom: 12px;">2️⃣</div>
              <h3 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 8px;">Multi-Factor AI Matching</h3>
              <p style="color: var(--text-muted); font-size: 0.9rem;">The backend scoring engine cross-evaluates descriptions, categories, timestamps, and locations to suggest candidate matches.</p>
            </div>

            <div style="background: var(--bg-tertiary); padding: 24px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
              <div style="font-size: 2.2rem; margin-bottom: 12px;">3️⃣</div>
              <h3 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 8px;">Safe Claim & Handover</h3>
              <p style="color: var(--text-muted); font-size: 0.9rem;">Provide private proof (such as PRN number, lockscreen wallpaper, or unique marks) and recover your item at the designated desk.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  `;
}

function handleHeroSearch() {
  const query = document.getElementById('heroQuickSearchInput').value;
  state.setRoute('browse', { query });
}

function filterByCategory(categoryName) {
  state.setRoute('browse', { category: categoryName });
}

function openReportModalWithPreset(type) {
  openReportModal();
  setReportType(type);
}
