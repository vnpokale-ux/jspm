/**
 * MyItemsPage View
 */

async function renderMyItemsPage() {
  const currentUser = state.currentUser;

  if (!currentUser) {
    return `
      <div class="container" style="padding: 80px 20px; text-align: center;">
        <div style="max-width: 480px; margin: 0 auto; background: var(--bg-card); padding: 40px; border-radius: var(--radius-lg); border: 1px solid var(--border-medium); box-shadow: var(--shadow-lg);">
          <div style="font-size: 3rem; margin-bottom: 16px;">🔐</div>
          <h2 style="font-size: 1.4rem; font-weight: 700; color: #fff; margin-bottom: 8px;">Sign In Required</h2>
          <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 24px; line-height: 1.5;">
            Please sign in with your college account to view and manage your reported lost and found items.
          </p>
          <button class="btn btn-primary" onclick="openClerkSignIn()" style="width: 100%;">
            <span>🔐</span> Sign In with College Account
          </button>
        </div>
      </div>
    `;
  }

  const allItems = await api.getItems();
  const myItems = allItems.filter(i => {
    if (!i.reporter || !currentUser) return false;
    return (
      (currentUser.email && i.reporter.email && currentUser.email.toLowerCase() === i.reporter.email.toLowerCase()) ||
      (currentUser.clerkId && i.reporter.clerkId && currentUser.clerkId === i.reporter.clerkId) ||
      (currentUser.id && i.reporter.id && String(currentUser.id) === String(i.reporter.id))
    );
  });

  const activeCount = myItems.filter(i => i.status === 'ACTIVE').length;
  const resolvedCount = myItems.filter(i => i.status === 'RESOLVED').length;

  return `
    <div class="container" style="padding-top: 32px; padding-bottom: 64px;">
      <div class="section-header" style="margin-bottom: 24px;">
        <div>
          <h1 class="section-title">My Reported Items</h1>
          <p class="section-desc">Manage all lost and found listings reported by you (${currentUser.firstName} ${currentUser.lastName})</p>
        </div>
        <button class="btn btn-primary" onclick="openReportModal()">
          <span>➕</span> Report New Item
        </button>
      </div>

      <!-- User Stats Summary -->
      <div class="stats-strip" style="grid-template-columns: repeat(3, 1fr); margin-bottom: 36px;">
        <div class="stat-card">
          <div class="stat-value" style="color: #818cf8;">${myItems.length}</div>
          <div class="stat-label">Total Listings Posted</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" style="color: #f43f5e;">${activeCount}</div>
          <div class="stat-label">Currently Active</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" style="color: #10b981;">${resolvedCount}</div>
          <div class="stat-label">Resolved / Reunited</div>
        </div>
      </div>

      ${myItems.length === 0 ? `
        <div style="text-align: center; padding: 64px 20px; background: var(--bg-card); border-radius: var(--radius-lg); border: 1px solid var(--border-subtle);">
          <div style="font-size: 3rem; margin-bottom: 16px;">📦</div>
          <h3 style="font-size: 1.3rem; font-weight: 700; margin-bottom: 8px;">No Listings Yet</h3>
          <p style="color: var(--text-muted); max-width: 420px; margin: 0 auto 24px;">
            You haven't reported any lost or found items yet. If you have misplaced an item or found one on campus, submit a report!
          </p>
          <button class="btn btn-primary" onclick="openReportModal()">Report an Item</button>
        </div>
      ` : `
        <div class="items-grid">
          ${myItems.map(item => `
            <div style="position: relative;">
              ${renderItemCard(item)}
            </div>
          `).join('')}
        </div>
      `}
    </div>
  `;
}
