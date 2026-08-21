/**
 * AdminPage View with Analytics Dashboard & Moderation
 */

async function renderAdminPage() {
  const currentUser = state.currentUser;

  if (!currentUser || currentUser.role !== 'ADMIN') {
    return `
      <div class="container" style="padding: 80px 20px; text-align: center;">
        <div style="max-width: 480px; margin: 0 auto; background: var(--bg-card); padding: 40px; border-radius: var(--radius-lg); border: 1px solid rgba(244, 63, 94, 0.4); box-shadow: var(--shadow-lg);">
          <div style="font-size: 3rem; margin-bottom: 16px;">⛔</div>
          <h2 style="font-size: 1.4rem; font-weight: 700; color: #fff; margin-bottom: 8px;">Access Restricted</h2>
          <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 24px; line-height: 1.5;">
            The Admin & Security Moderation Portal is restricted to authorized College Administrators and Security Officers.
          </p>
          <button class="btn btn-outline" onclick="state.setRoute('home')">
            Back to Home
          </button>
        </div>
      </div>
    `;
  }

  const stats = await api.getAdminStats();
  const users = await api.getAdminUsers();
  const allItems = await api.getItems({});

  return `
    <div class="container" style="padding-top: 32px; padding-bottom: 64px;">
      <div class="section-header" style="margin-bottom: 28px;">
        <div>
          <div class="hero-pill" style="border-color: rgba(245, 158, 11, 0.3); background: rgba(245, 158, 11, 0.1); color: #fbbf24; margin-bottom: 8px;">
            ⚡ Campus Administration & Moderation Portal
          </div>
          <h1 class="section-title">System Analytics & Management</h1>
          <p class="section-desc">Real-time system health metrics, category distribution, user access controls, and item moderation</p>
        </div>
        <button class="btn btn-primary" onclick="api.downloadAuditCsv()">
          <span>📥</span> Export Security Log Sheet (CSV)
        </button>
      </div>

      <!-- KPI Metrics Cards Grid -->
      <div class="stats-strip" style="grid-template-columns: repeat(4, 1fr); margin-bottom: 32px;">
        <div class="stat-card">
          <div class="stat-value" style="color: #818cf8;">${stats.totalUsers}</div>
          <div class="stat-label">Registered Campus Users</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" style="color: #f43f5e;">${stats.activeLostItems}</div>
          <div class="stat-label">Active Missing Reports</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" style="color: #34d399;">${stats.activeFoundItems}</div>
          <div class="stat-label">Active Found Items</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" style="color: #c084fc;">${stats.resolvedItems}</div>
          <div class="stat-label">Reunited Items</div>
        </div>
      </div>

      <!-- Distribution Grid -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 40px;">
        <!-- Category Distribution -->
        <div style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 24px;">
          <h3 style="font-family: var(--font-heading); font-size: 1.15rem; font-weight: 700; margin-bottom: 18px;">📊 Items by Category</h3>
          <div style="display: flex; flex-direction: column; gap: 12px;">
            ${Object.entries(stats.itemsByCategory || {}).map(([cat, count]) => {
              const pct = Math.round((count / Math.max(1, stats.totalItems)) * 100);
              return `
                <div>
                  <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 4px;">
                    <span>${escapeHtml(cat)}</span>
                    <strong>${count} items (${pct}%)</strong>
                  </div>
                  <div style="width: 100%; height: 6px; background: var(--bg-tertiary); border-radius: var(--radius-full); overflow: hidden;">
                    <div style="width: ${pct}%; height: 100%; background: linear-gradient(90deg, var(--primary), #8b5cf6); border-radius: var(--radius-full);"></div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Location Distribution -->
        <div style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 24px;">
          <h3 style="font-family: var(--font-heading); font-size: 1.15rem; font-weight: 700; margin-bottom: 18px;">📍 Top Campus Hotspots</h3>
          <div style="display: flex; flex-direction: column; gap: 12px;">
            ${Object.entries(stats.itemsByLocation || {}).slice(0, 5).map(([loc, count]) => {
              const pct = Math.round((count / Math.max(1, stats.totalItems)) * 100);
              return `
                <div>
                  <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 4px;">
                    <span style="max-width: 260px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml(loc)}</span>
                    <strong>${count} items</strong>
                  </div>
                  <div style="width: 100%; height: 6px; background: var(--bg-tertiary); border-radius: var(--radius-full); overflow: hidden;">
                    <div style="width: ${pct}%; height: 100%; background: linear-gradient(90deg, #10b981, #06b6d4); border-radius: var(--radius-full);"></div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>

       <!-- Student Approvals & User Access Control -->
      <div style="margin-bottom: 40px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 12px;">
          <div>
            <h3 style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 700;">
              🎓 Student Registration & Email Approvals Hub
            </h3>
            <p style="color: var(--text-muted); font-size: 0.85rem;">Review, verify, and approve personal email registrations from campus students</p>
          </div>
          ${users.some(u => u.status === 'PENDING') ? `
            <div class="badge" style="background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); font-size: 0.8rem; padding: 6px 12px;">
              ⏳ ${users.filter(u => u.status === 'PENDING').length} Student Approvals Pending
            </div>
          ` : `
            <div class="badge" style="background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); font-size: 0.8rem; padding: 6px 12px;">
              ✅ All Students Verified
            </div>
          `}
        </div>

        <div class="data-table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Student / Staff</th>
                <th>Email Address</th>
                <th>PRN / Roll No</th>
                <th>Department</th>
                <th>Role</th>
                <th>Status</th>
                <th>Admin Actions</th>
              </tr>
            </thead>
            <tbody>
              ${users.map(u => {
                const isPending = u.status === 'PENDING';
                return `
                  <tr style="${isPending ? 'background: rgba(245, 158, 11, 0.05);' : ''}">
                    <td>
                      <div style="display: flex; align-items: center; gap: 10px;">
                        <div class="user-avatar" style="width: 30px; height: 30px; font-size: 0.8rem; background: ${isPending ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'var(--primary)'};">${u.firstName.charAt(0)}</div>
                        <div>
                          <strong>${escapeHtml(u.firstName)} ${escapeHtml(u.lastName)}</strong>
                          ${isPending ? '<span style="font-size: 0.68rem; color: #fbbf24; display: block; font-weight: 700;">NEW REGISTRATION</span>' : ''}
                        </div>
                      </div>
                    </td>
                    <td><strong style="color: #fff;">${escapeHtml(u.email)}</strong></td>
                    <td><code>${escapeHtml(u.prn || 'N/A')}</code></td>
                    <td>${escapeHtml(u.department || 'General Campus')}</td>
                    <td>
                      <span class="user-role-tag ${u.role === 'ADMIN' ? 'role-admin' : 'role-user'}">${u.role}</span>
                    </td>
                    <td>
                      ${isPending ? `
                        <span class="badge" style="background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.4); font-size: 0.72rem;">
                          ⏳ PENDING
                        </span>
                      ` : `
                        <span class="badge" style="background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.4); font-size: 0.72rem;">
                          ✅ APPROVED
                        </span>
                      `}
                    </td>
                    <td>
                      <div style="display: flex; gap: 6px; align-items: center;">
                        ${isPending ? `
                          <button class="btn btn-found btn-sm" style="padding: 4px 10px; font-size: 0.75rem;" onclick="adminApproveUserAction(${u.id})">
                            <span>✅</span> Approve
                          </button>
                          <button class="btn btn-secondary btn-sm" style="padding: 4px 8px; font-size: 0.75rem;" onclick="adminRejectUserAction(${u.id})">
                            <span>❌</span> Reject
                          </button>
                        ` : `
                          <button class="btn btn-outline btn-sm" style="font-size: 0.72rem; padding: 4px 8px;" onclick="toggleAdminRole(${u.id}, '${u.role}')">
                            ${u.role === 'ADMIN' ? 'Demote to User' : 'Promote Admin'}
                          </button>
                          <button class="btn btn-secondary btn-sm" style="font-size: 0.72rem; padding: 4px 8px;" onclick="adminRejectUserAction(${u.id})">
                            Remove
                          </button>
                        `}
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Item Moderation Table -->
      <div>
        <h3 style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 700; margin-bottom: 16px;">🛠️ Global Item Moderation</h3>
        <div class="data-table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Type</th>
                <th>Category</th>
                <th>Location</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${allItems.map(item => `
                <tr>
                  <td>
                    <strong>${escapeHtml(item.title)}</strong>
                  </td>
                  <td>
                    <span class="badge ${item.type === 'LOST' ? 'badge-lost' : 'badge-found'}">${item.type}</span>
                  </td>
                  <td>${escapeHtml(item.category)}</td>
                  <td>${escapeHtml(item.location)}</td>
                  <td>
                    <span class="badge ${item.status === 'RESOLVED' ? 'badge-resolved' : 'badge-active'}">${item.status}</span>
                  </td>
                  <td>
                    <div style="display: flex; gap: 8px;">
                      <button class="btn btn-outline btn-sm" onclick="openItemDetailModal(${item.id})">Details</button>
                      <button class="btn btn-secondary btn-sm" onclick="adminDeleteItemAction(${item.id})">Delete</button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

async function adminApproveUserAction(userId) {
  await api.approveUser(userId);
  showToast('Student account approved! The student can now sign in.', 'success');
  state.notify();
}

async function adminRejectUserAction(userId) {
  if (confirm('Are you sure you want to reject/remove this user account?')) {
    await api.rejectUser(userId);
    showToast('Student registration removed.', 'info');
    state.notify();
  }
}

async function toggleAdminRole(userId, currentRole) {
  const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
  await api.updateUserRole(userId, newRole);
  showToast(`User role updated to ${newRole}`, 'success');
  state.notify();
}

async function adminDeleteItemAction(itemId) {
  if (confirm('Are you sure you want to permanently delete this item report?')) {
    await api.deleteItem(itemId);
    showToast('Item deleted by administrator.', 'info');
    state.notify();
  }
}
