/**
 * Navbar Component with TSSM BSCOER Branding & Persona Switcher
 */

function renderNavbar() {
  const user = state.currentUser;
  const currentRoute = state.currentRoute;

  return `
    <nav class="navbar" id="mainNavbar">
      <div class="container nav-container">
        <!-- Brand Logo with College Emblem -->
        <div class="brand-logo" id="navBrand" onclick="state.setRoute('home')">
          <div class="college-logo-wrapper" style="width: 44px; height: 44px; border-radius: 50%; overflow: hidden; background: #fff; border: 2px solid var(--primary); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px var(--primary-glow); flex-shrink: 0;">
            <img src="${COLLEGE_LOGO_URL}" alt="TSSM BSCOER Logo" style="width: 100%; height: 100%; object-fit: cover; transform: scale(1.18); border-radius: 50%;" onerror="this.src='https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=100'" />
          </div>
          <div>
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="font-weight: 800; color: #fff;">TSSM's BSCOER</span>
              <span class="badge" style="background: rgba(244, 63, 94, 0.15); color: #fb7185; border: 1px solid rgba(244, 63, 94, 0.3); font-size: 0.65rem; padding: 1px 6px;">JSPM</span>
            </div>
            <div style="font-size: 0.65rem; color: var(--text-muted); font-weight: 600; font-family: var(--font-body); letter-spacing: 0.04em; text-transform: uppercase;">
              Campus Lost & Found Portal
            </div>
          </div>
        </div>

        <!-- Navigation Links -->
        <ul class="nav-links">
          <li class="nav-item ${currentRoute === 'home' ? 'active' : ''}" id="navHome" onclick="state.setRoute('home')">
            <span>🏠</span> Home
          </li>
          <li class="nav-item ${currentRoute === 'browse' ? 'active' : ''}" id="navBrowse" onclick="state.setRoute('browse')">
            <span>🔎</span> Directory
          </li>
          <li class="nav-item ${currentRoute === 'matches' ? 'active' : ''}" id="navMatches" onclick="state.setRoute('matches')">
            <span>✨</span> AI Matches
          </li>
          <li class="nav-item ${currentRoute === 'my-items' ? 'active' : ''}" id="navMyItems" onclick="state.setRoute('my-items')">
            <span>📋</span> My Items
          </li>
          <li class="nav-item ${currentRoute === 'claims' ? 'active' : ''}" id="navClaims" onclick="state.setRoute('claims')">
            <span>🛡️</span> Claims
          </li>
          ${user && user.role === 'ADMIN' ? `
            <li class="nav-item ${currentRoute === 'admin' ? 'active' : ''}" id="navAdmin" onclick="state.setRoute('admin')">
              <span>⚡</span> Admin Portal
            </li>
          ` : ''}
        </ul>

        <!-- Action, Notifications & User Switcher -->
        <div class="nav-actions">
          <button class="btn btn-primary btn-sm" id="btnNavReport" onclick="openReportModal()">
            <span>➕</span> Report Item
          </button>

          <!-- Notification Bell -->
          <div class="notif-btn-wrapper" id="notifWrapper">
            <button class="notif-bell-btn" id="btnNotifBell" onclick="toggleNotificationDrawer(event)" title="Notifications & Activity">
              🔔
              <span class="notif-badge-counter" id="notifBadge" style="display: none;">0</span>
            </button>
            <div class="notif-dropdown" id="notifDropdown">
              <div class="notif-dropdown-header">
                <strong style="font-size: 0.9rem; color: #fff;">Notifications & Alerts</strong>
                <button class="btn btn-outline btn-sm" style="font-size: 0.72rem; padding: 2px 8px;" onclick="markAllNotifsRead()">Mark all read</button>
              </div>
              <div class="notif-list" id="notifList">
                <!-- Populated dynamically -->
              </div>
            </div>
          </div>

          <!-- User Authentication Profile -->
          ${user ? `
            <div class="user-badge" id="userRoleSwitcher" title="Click to view Profile" onclick="openClerkUserProfile()">
              ${user.imageUrl ? `<img src="${user.imageUrl}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; border: 1px solid var(--primary);" />` : `<div class="user-avatar">${user.avatar || 'U'}</div>`}
              <div style="text-align: left; display: flex; flex-direction: column;">
                <span style="font-size: 0.85rem; font-weight: 600; line-height: 1.1; color: #fff;">${escapeHtml(user.firstName || 'User')}</span>
                <span class="user-role-tag ${user.role === 'ADMIN' ? 'role-admin' : 'role-user'}">${user.role}</span>
              </div>
              <button class="btn btn-outline btn-sm" style="padding: 2px 8px; font-size: 0.72rem; margin-left: 6px;" onclick="clerkSignOut(event)">Logout</button>
            </div>
          ` : `
            <button class="btn btn-outline btn-sm" id="btnClerkSignIn" onclick="openClerkSignIn()" style="border-color: rgba(99, 102, 241, 0.5); background: rgba(99, 102, 241, 0.12); font-weight: 600; padding: 8px 16px;">
              <span>🔐</span> Sign In
            </button>
          `}
        </div>
      </div>
    </nav>
  `;
}

function openClerkSignIn() {
  openAuthModal();
}

function openClerkUserProfile() {
  if (state.currentUser) {
    showToast(`Signed in as: ${state.currentUser.firstName} (${state.currentUser.email}) • ${state.currentUser.role}`, 'info');
  }
}

async function clerkSignOut(e) {
  if (e) e.stopPropagation();
  state.logoutUser();
  showToast('Signed out of campus account', 'info');
}

function toggleUserDropdown() {
  const currentClerkId = state.currentUser.clerkId;
  let nextKey = 'student';
  if (currentClerkId === DEMO_USERS.student.clerkId) nextKey = 'finder';
  else if (currentClerkId === DEMO_USERS.finder.clerkId) nextKey = 'admin';
  else nextKey = 'student';

  state.setUser(nextKey);
  showToast(`Switched persona to: ${state.currentUser.firstName} (${state.currentUser.role})`, 'info');
}

async function toggleNotificationDrawer(e) {
  if (e) e.stopPropagation();
  const dropdown = document.getElementById('notifDropdown');
  if (!dropdown) return;

  const isShowing = dropdown.classList.contains('show');
  if (isShowing) {
    dropdown.classList.remove('show');
  } else {
    dropdown.classList.add('show');
    await loadNotificationsList();
  }
}

async function loadNotificationsList() {
  const listEl = document.getElementById('notifList');
  if (!listEl) return;

  const notifs = await api.getNotifications(state.currentUser);
  if (notifs.length === 0) {
    listEl.innerHTML = `
      <div style="padding: 24px; text-align: center; color: var(--text-dim); font-size: 0.85rem;">
        No notifications right now
      </div>
    `;
    return;
  }

  listEl.innerHTML = notifs.map(n => {
    let icon = '🔔';
    if (n.type === 'MATCH_FOUND') icon = '✨';
    else if (n.type === 'CLAIM_APPROVED') icon = '🎉';
    else if (n.type === 'CLAIM_FILED') icon = '🛡️';
    else if (n.type === 'ITEM_RESOLVED') icon = '✅';

    return `
      <div class="notif-item ${!n.isRead ? 'unread' : ''}" onclick="handleNotifClick(${n.id}, '${n.type}', ${n.referenceId})">
        <div style="font-size: 1.3rem;">${icon}</div>
        <div style="flex: 1;">
          <div style="font-weight: 700; font-size: 0.85rem; color: #fff; margin-bottom: 2px;">${escapeHtml(n.title)}</div>
          <div style="font-size: 0.78rem; color: var(--text-muted); line-height: 1.4;">${escapeHtml(n.message)}</div>
          <div style="font-size: 0.68rem; color: var(--text-dim); margin-top: 4px;">${new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
      </div>
    `;
  }).join('');
}

async function handleNotifClick(notifId, type, refId) {
  await api.markNotificationRead(notifId);
  const dropdown = document.getElementById('notifDropdown');
  if (dropdown) dropdown.classList.remove('show');

  if (type === 'MATCH_FOUND') {
    state.setRoute('matches');
  } else if (type === 'CLAIM_FILED' || type === 'CLAIM_APPROVED') {
    state.setRoute('claims');
  } else {
    state.notify();
  }
}

async function markAllNotifsRead() {
  await api.markAllNotificationsRead(state.currentUser);
  await loadNotificationsList();
  showToast('All notifications marked as read', 'info');
  state.notify();
}

// Close drawer on click outside
document.addEventListener('click', (e) => {
  const notifWrapper = document.getElementById('notifWrapper');
  const dropdown = document.getElementById('notifDropdown');
  if (dropdown && notifWrapper && !notifWrapper.contains(e.target)) {
    dropdown.classList.remove('show');
  }
});
