/**
 * Modal Components: Item Detail, Report Item, Submit Claim
 */

function renderModalsContainer() {
  return `
    <!-- Item Detail Modal -->
    <div class="modal-backdrop" id="itemDetailModal" onclick="closeAllModals(event)">
      <div class="modal-content" onclick="event.stopPropagation()">
        <div class="modal-header">
          <h2 class="modal-title" id="modalItemTitle">Item Details</h2>
          <button class="modal-close" onclick="closeAllModals()">✕</button>
        </div>
        <div id="modalItemBody">
          <!-- Dynamic Content -->
        </div>
      </div>
    </div>

    <!-- Report Item Modal -->
    <div class="modal-backdrop" id="reportItemModal" onclick="closeAllModals(event)">
      <div class="modal-content" style="max-width: 680px;" onclick="event.stopPropagation()">
        <div class="modal-header">
          <h2 class="modal-title">Report an Item</h2>
          <button class="modal-close" onclick="closeAllModals()">✕</button>
        </div>
        <form id="reportItemForm" onsubmit="handleReportSubmit(event)">
          <div class="filter-group">
            <label class="filter-title">Item Type *</label>
            <div class="type-toggle-group">
              <button type="button" class="type-toggle-btn active" id="typeToggleLost" onclick="setReportType('LOST')">
                🔴 I Lost an Item
              </button>
              <button type="button" class="type-toggle-btn" id="typeToggleFound" onclick="setReportType('FOUND')">
                🟢 I Found an Item
              </button>
            </div>
            <input type="hidden" id="reportTypeInput" value="LOST" />
          </div>

          <div class="filter-group">
            <label class="filter-title">Title *</label>
            <input type="text" id="reportTitleInput" class="form-control" placeholder="e.g. Sony WH-1000XM4 Headphones (Silver)" required minlength="3" />
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <div class="filter-group">
              <label class="filter-title">Category *</label>
              <select id="reportCategoryInput" class="form-control" required>
                ${INITIAL_CATEGORIES.map(c => `<option value="${c.name}">${c.icon} ${c.name}</option>`).join('')}
              </select>
            </div>

            <div class="filter-group">
              <label class="filter-title">Date & Time *</label>
              <input type="datetime-local" id="reportDateInput" class="form-control" required />
            </div>
          </div>

          <div class="filter-group">
            <label class="filter-title">Campus Location *</label>
            <input type="text" id="reportLocationInput" list="locationsList" class="form-control" placeholder="e.g. Library 2nd Floor, SAC Cafeteria..." required />
            <datalist id="locationsList">
              ${CAMPUS_LOCATIONS.map(l => `<option value="${l}">`).join('')}
            </datalist>
          </div>

          <div class="filter-group">
            <label class="filter-title">Upload Photo (Drag & Drop or Choose File)</label>
            <div class="file-upload-zone" onclick="document.getElementById('reportFileInput').click()">
              <input type="file" id="reportFileInput" accept="image/*" style="display: none;" onchange="handleFileSelect(event)" />
              <div style="font-size: 1.6rem; margin-bottom: 6px;">📷</div>
              <div style="font-size: 0.88rem; font-weight: 600; color: var(--text-main);">Click to browse image or take photo</div>
              <div style="font-size: 0.75rem; color: var(--text-dim);">JPEG, PNG, or WebP up to 5MB</div>
            </div>
            <div id="filePreviewContainer" style="display: none; margin-top: 10px; position: relative;">
              <img id="filePreviewImg" src="" style="width: 100%; height: 160px; object-fit: cover; border-radius: var(--radius-md); border: 1px solid var(--border-medium);" />
              <button type="button" class="btn btn-secondary btn-sm" style="position: absolute; top: 8px; right: 8px; font-size: 0.7rem; padding: 2px 8px;" onclick="removeUploadedFile()">Remove</button>
            </div>
            <input type="hidden" id="reportImageInput" />
          </div>

          <div class="filter-group">
            <label class="filter-title">Detailed Description *</label>
            <textarea id="reportDescInput" class="form-control" rows="4" placeholder="Provide distinct markings, color, brand, or unique details that will help identify the item..." required></textarea>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px;">
            <button type="button" class="btn btn-secondary" onclick="closeAllModals()">Cancel</button>
            <button type="submit" class="btn btn-primary" id="btnSubmitReport">
              <span>🚀</span> Publish Report
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Official College Campus Authentication Modal -->
    <div class="modal-backdrop" id="authModal" onclick="closeAllModals(event)">
      <div class="modal-content" style="max-width: 500px; max-height: 90vh; overflow-y: auto;" onclick="event.stopPropagation()">
        <div class="modal-header">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 32px; height: 32px; border-radius: 50%; background: #fff; display: flex; align-items: center; justify-content: center; overflow: hidden;">
              <img src="${COLLEGE_LOGO_URL}" style="width: 100%; height: 100%; object-fit: cover; transform: scale(1.15);" />
            </div>
            <h2 class="modal-title" style="font-size: 1.15rem;">Campus Identity Portal</h2>
          </div>
          <button class="modal-close" onclick="closeAllModals()">✕</button>
        </div>

        <div style="padding: 8px 0 0;">
          <!-- Auth Tabs -->
          <div style="display: flex; background: var(--bg-tertiary); padding: 4px; border-radius: var(--radius-md); margin-bottom: 20px; border: 1px solid var(--border-subtle);">
            <button type="button" id="tabSignInBtn" class="btn" style="flex: 1; padding: 8px; font-size: 0.85rem; font-weight: 700; border-radius: var(--radius-sm); background: var(--primary); color: #fff; border: none;" onclick="switchAuthTab('signin')">
              🔑 Sign In
            </button>
            <button type="button" id="tabRegisterBtn" class="btn" style="flex: 1; padding: 8px; font-size: 0.85rem; font-weight: 600; border-radius: var(--radius-sm); background: transparent; color: var(--text-muted); border: none;" onclick="switchAuthTab('register')">
              📝 Register Account
            </button>
          </div>

          <!-- SIGN IN FORM -->
          <form id="campusSignInForm" onsubmit="handleCampusSignIn(event)">
            <div class="filter-group">
              <label class="filter-title">College Email or Student PRN *</label>
              <input type="text" id="loginIdentifierInput" class="form-control" placeholder="e.g. rohit.patil@bscoer.jspm.edu.in or 72189342" required />
            </div>

            <div class="filter-group">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <label class="filter-title" style="margin-bottom: 0;">Password *</label>
                <span style="font-size: 0.75rem; color: var(--primary); cursor: pointer;" onclick="showToast('For college accounts, use your portal password or default: 123456', 'info')">Forgot?</span>
              </div>
              <input type="password" id="loginPasswordInput" class="form-control" placeholder="••••••••" required />
            </div>

            <button type="submit" class="btn btn-primary" style="width: 100%; padding: 12px; margin-top: 12px; font-size: 0.95rem;">
              <span>🚀</span> Sign In to Portal
            </button>
          </form>

          <!-- REGISTER FORM (Hidden by default) -->
          <form id="campusRegisterForm" style="display: none;" onsubmit="handleCampusRegister(event)">
            <div class="filter-group">
              <label class="filter-title">Full Name *</label>
              <input type="text" id="regNameInput" class="form-control" placeholder="e.g. Rohit Patil" required />
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="filter-group">
                <label class="filter-title">Email Address (Personal / College) *</label>
                <input type="email" id="regEmailInput" class="form-control" placeholder="e.g. rohit123@gmail.com" required />
              </div>
              <div class="filter-group">
                <label class="filter-title">Student PRN / Roll No *</label>
                <input type="text" id="regPrnInput" class="form-control" placeholder="e.g. 72189342" required />
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="filter-group">
                <label class="filter-title">Department *</label>
                <select id="regDeptInput" class="form-control" required>
                  <option value="Computer Engineering">Computer Engineering</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                  <option value="E&TC Engineering">E&TC Engineering</option>
                  <option value="First Year Engineering">First Year Engineering</option>
                  <option value="Campus Security Office">Campus Security Office</option>
                </select>
              </div>
              <div class="filter-group">
                <label class="filter-title">Account Type *</label>
                <select id="regRoleInput" class="form-control" required>
                  <option value="USER">Student / Finder</option>
                  <option value="ADMIN">Faculty / Security Admin</option>
                </select>
              </div>
            </div>

            <div class="filter-group">
              <label class="filter-title">Create Password *</label>
              <input type="password" id="regPasswordInput" class="form-control" placeholder="At least 6 characters" minlength="6" required />
            </div>

            <button type="submit" class="btn btn-primary" style="width: 100%; padding: 12px; margin-top: 12px; font-size: 0.95rem;">
              <span>✨</span> Create Verified Account
            </button>
          </form>

        </div>
      </div>
    </div>

    <!-- Handover Verification QR Modal -->
    <div class="modal-backdrop" id="handoverModal" onclick="closeAllModals(event)">
      <div class="modal-content" style="max-width: 520px;" onclick="event.stopPropagation()">
        <div class="modal-header">
          <h2 class="modal-title">Official Handover Pass</h2>
          <button class="modal-close" onclick="closeAllModals()">✕</button>
        </div>
        <div id="handoverModalBody">
          <!-- Dynamic Content -->
        </div>
      </div>
    </div>

    <!-- Direct Contact Modal (Fixes blank page issue) -->
    <div class="modal-backdrop" id="directContactModal" onclick="closeAllModals(event)">
      <div class="modal-content" style="max-width: 500px;" onclick="event.stopPropagation()">
        <div class="modal-header">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 1.4rem;">💬</span>
            <h2 class="modal-title">Campus Direct Contact</h2>
          </div>
          <button class="modal-close" onclick="closeAllModals()">✕</button>
        </div>
        <div id="directContactModalBody">
          <!-- Dynamic Content -->
        </div>
      </div>
    </div>

    <!-- Claim Item Modal -->
    <div class="modal-backdrop" id="claimItemModal" onclick="closeAllModals(event)">
      <div class="modal-content" style="max-width: 580px;" onclick="event.stopPropagation()">
        <div class="modal-header">
          <h2 class="modal-title">Claim Item Ownership</h2>
          <button class="modal-close" onclick="closeAllModals()">✕</button>
        </div>
        <form id="claimItemForm" onsubmit="handleClaimSubmit(event)">
          <input type="hidden" id="claimItemIdInput" />
          <div style="margin-bottom: 20px; padding: 14px; background: var(--bg-glass); border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
            <div style="font-size: 0.8rem; color: var(--text-dim); text-transform: uppercase; font-weight: 700;">Claiming Item:</div>
            <div id="claimItemSummaryTitle" style="font-weight: 700; font-size: 1.05rem; color: var(--text-main); margin-top: 4px;"></div>
          </div>

          <div class="filter-group">
            <label class="filter-title">Proof of Ownership / Distinct Details *</label>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 8px;">
              Please provide private details only the rightful owner would know (e.g. wallpaper description, engraved initials, serial number, pouch contents).
            </p>
            <textarea id="claimProofInput" class="form-control" rows="5" placeholder="Describe the item's contents, exact lockscreen message, distinguishing marks, etc." required minlength="10"></textarea>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px;">
            <button type="button" class="btn btn-secondary" onclick="closeAllModals()">Cancel</button>
            <button type="submit" class="btn btn-found" id="btnSubmitClaim">
              <span>🛡️</span> Submit Claim
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}

// Modal Control Helpers
async function openItemDetailModal(itemId) {
  const item = await api.getItemById(itemId);
  if (!item) return;

  const modal = document.getElementById('itemDetailModal');
  const modalBody = document.getElementById('modalItemBody');
  const currentUser = state.currentUser;

  const isLost = item.type === 'LOST';
  const isOwner = currentUser && item.reporter && (
    (currentUser.email && item.reporter.email && currentUser.email.toLowerCase() === item.reporter.email.toLowerCase()) ||
    (currentUser.clerkId && item.reporter.clerkId && currentUser.clerkId === item.reporter.clerkId) ||
    (currentUser.id && item.reporter.id && String(currentUser.id) === String(item.reporter.id))
  );
  const isAdmin = currentUser && currentUser.role === 'ADMIN';

  const formattedDate = new Date(item.itemDate || item.createdAt).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  const fallbackImage = isLost
    ? 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600&auto=format&fit=crop&q=80'
    : 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80';

  modalBody.innerHTML = `
    <div style="margin-bottom: 20px; border-radius: var(--radius-md); overflow: hidden; height: 260px; background: #0f172a;">
      <img src="${item.imageUrl || fallbackImage}" alt="${escapeHtml(item.title)}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='${fallbackImage}'" />
    </div>

    <div style="display: flex; gap: 8px; margin-bottom: 16px;">
      <span class="badge ${isLost ? 'badge-lost' : 'badge-found'}">${item.type}</span>
      <span class="badge ${item.status === 'RESOLVED' ? 'badge-resolved' : 'badge-active'}">${item.status}</span>
      <span class="badge" style="background: var(--bg-glass); border: 1px solid var(--border-medium);">${escapeHtml(item.category)}</span>
    </div>

    <h2 style="font-family: var(--font-heading); font-size: 1.4rem; margin-bottom: 12px;">${escapeHtml(item.title)}</h2>
    
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 18px; padding: 14px; background: var(--bg-card); border-radius: var(--radius-md); border: 1px solid var(--border-subtle); font-size: 0.875rem;">
      <div>
        <span style="color: var(--text-dim); display: block;">📍 Location</span>
        <strong>${escapeHtml(item.location)}</strong>
      </div>
      <div>
        <span style="color: var(--text-dim); display: block;">📅 Date Reported</span>
        <strong>${formattedDate}</strong>
      </div>
      <div>
        <span style="color: var(--text-dim); display: block;">👤 Reported By</span>
        <strong>${escapeHtml(item.reporter?.firstName || 'Campus User')} (${escapeHtml(item.reporter?.role || 'USER')})</strong>
      </div>
      <div>
        <span style="color: var(--text-dim); display: block;">📧 Contact</span>
        <strong style="word-break: break-all;">${escapeHtml(item.reporter?.email || 'N/A')}</strong>
      </div>
    </div>

    <div style="margin-bottom: 24px;">
      <h4 style="font-size: 0.95rem; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">Description</h4>
      <p style="color: var(--text-main); line-height: 1.6; font-size: 0.95rem;">${escapeHtml(item.description)}</p>
    </div>

    <div style="display: flex; gap: 12px; justify-content: flex-end; padding-top: 16px; border-top: 1px solid var(--border-subtle);">
      ${!isLost && !isOwner && item.status === 'ACTIVE' ? `
        <button class="btn btn-found" onclick="openClaimModal(${item.id}, '${escapeHtml(item.title)}')">
          <span>🛡️</span> Claim Ownership
        </button>
      ` : ''}

      ${(isOwner || isAdmin) && item.status === 'ACTIVE' ? `
        <button class="btn btn-primary" onclick="markItemResolved(${item.id})">
          <span>✅</span> Mark Resolved
        </button>
        <button class="btn btn-secondary" onclick="deleteItemAction(${item.id})">
          <span>🗑️</span> Delete
        </button>
      ` : ''}
      <button class="btn btn-outline" onclick="closeAllModals()">Close</button>
    </div>
  `;

  modal.classList.add('show');
}

function openReportModal() {
  if (window.Clerk && !window.Clerk.user && state.isClerkActive) {
    showToast('Please sign in with your college account to report an item', 'info');
    window.Clerk.openSignIn();
    return;
  }

  const modal = document.getElementById('reportItemModal');
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  document.getElementById('reportDateInput').value = now.toISOString().slice(0, 16);
  modal.classList.add('show');
}

function openClaimModal(itemId, itemTitle) {
  if (window.Clerk && !window.Clerk.user && state.isClerkActive) {
    showToast('Please sign in with your college account to claim an item', 'info');
    window.Clerk.openSignIn();
    return;
  }

  closeAllModals();
  const modal = document.getElementById('claimItemModal');
  document.getElementById('claimItemIdInput').value = itemId;
  document.getElementById('claimItemSummaryTitle').textContent = itemTitle;
  modal.classList.add('show');
}

function closeAllModals(e) {
  if (e && e.target !== e.currentTarget) return;
  document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('show'));
}

function setReportType(type) {
  document.getElementById('reportTypeInput').value = type;
  const lostBtn = document.getElementById('typeToggleLost');
  const foundBtn = document.getElementById('typeToggleFound');
  if (type === 'LOST') {
    lostBtn.classList.add('active');
    foundBtn.classList.remove('active');
  } else {
    foundBtn.classList.add('active');
    lostBtn.classList.remove('active');
  }
}

async function handleReportSubmit(e) {
  e.preventDefault();
  const type = document.getElementById('reportTypeInput').value;
  const title = document.getElementById('reportTitleInput').value;
  const category = document.getElementById('reportCategoryInput').value;
  const location = document.getElementById('reportLocationInput').value;
  const itemDate = document.getElementById('reportDateInput').value;
  const imageUrl = document.getElementById('reportImageInput').value;
  const description = document.getElementById('reportDescInput').value;

  const newItem = await api.createItem({
    type,
    title,
    category,
    location,
    itemDate,
    imageUrl: imageUrl || null,
    description
  }, state.currentUser);

  closeAllModals();
  document.getElementById('reportItemForm').reset();
  showToast(`Item reported successfully! Checking for automated matches...`, 'success');
  
  // Refresh and switch to browse or matches view
  state.setRoute('browse');
}

async function handleClaimSubmit(e) {
  e.preventDefault();
  const itemId = document.getElementById('claimItemIdInput').value;
  const proofDescription = document.getElementById('claimProofInput').value;

  await api.createClaim({
    itemId,
    proofDescription
  }, state.currentUser);

  closeAllModals();
  document.getElementById('claimItemForm').reset();
  showToast('Claim submitted for verification by the reporter!', 'success');
  state.setRoute('claims');
}

async function markItemResolved(itemId) {
  const currentUser = state.currentUser;
  if (!currentUser) {
    showToast('Please sign in to manage items', 'error');
    return;
  }

  const item = await api.getItemById(itemId);
  if (!item) return;

  const isOwner = item.reporter && (
    (currentUser.email && item.reporter.email && currentUser.email.toLowerCase() === item.reporter.email.toLowerCase()) ||
    (currentUser.clerkId && item.reporter.clerkId && currentUser.clerkId === item.reporter.clerkId) ||
    (currentUser.id && item.reporter.id && String(currentUser.id) === String(item.reporter.id))
  );
  const isAdmin = currentUser.role === 'ADMIN';

  if (!isOwner && !isAdmin) {
    showToast('Permission Denied: Only the reporter or a college administrator can resolve this item.', 'error');
    return;
  }

  await api.updateItemStatus(itemId, 'RESOLVED', currentUser);
  closeAllModals();
  showToast('Item marked as RESOLVED!', 'success');
  state.notify();
}

async function deleteItemAction(itemId) {
  const currentUser = state.currentUser;
  if (!currentUser) {
    showToast('Please sign in to manage items', 'error');
    return;
  }

  const item = await api.getItemById(itemId);
  if (!item) return;

  const isOwner = item.reporter && (
    (currentUser.email && item.reporter.email && currentUser.email.toLowerCase() === item.reporter.email.toLowerCase()) ||
    (currentUser.clerkId && item.reporter.clerkId && currentUser.clerkId === item.reporter.clerkId) ||
    (currentUser.id && item.reporter.id && String(currentUser.id) === String(item.reporter.id))
  );
  const isAdmin = currentUser.role === 'ADMIN';

  if (!isOwner && !isAdmin) {
    showToast('Permission Denied: Only the reporter or a college administrator can delete this item.', 'error');
    return;
  }

  if (confirm('Are you sure you want to delete this item report?')) {
    await api.deleteItem(itemId, currentUser);
    closeAllModals();
    showToast('Item deleted successfully.', 'info');
    state.notify();
  }
}

// Phase 4: File Selection & Preview Handler
function handleFileSelect(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    showToast('File size must be under 5MB', 'error');
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    const dataUrl = e.target.result;
    document.getElementById('reportImageInput').value = dataUrl;
    document.getElementById('filePreviewImg').src = dataUrl;
    document.getElementById('filePreviewContainer').style.display = 'block';
    showToast('Photo attached successfully!', 'success');
  };
  reader.readAsDataURL(file);
}

function removeUploadedFile() {
  document.getElementById('reportFileInput').value = '';
  document.getElementById('reportImageInput').value = '';
  document.getElementById('filePreviewContainer').style.display = 'none';
  document.getElementById('filePreviewImg').src = '';
}

// Direct Contact Modal (Clean claimId-based lookup)
function openDirectContactModal(claimId) {
  closeAllModals();
  const modal = document.getElementById('directContactModal');
  const body = document.getElementById('directContactModalBody');
  if (!modal || !body) return;

  const claims = JSON.parse(localStorage.getItem('campus_lf_claims') || '[]');
  const claim = claims.find(c => c.id === Number(claimId));
  if (!claim) {
    showToast('Claim record not found', 'error');
    return;
  }

  const isReceived = typeof activeClaimsTab !== 'undefined' && activeClaimsTab === 'received';
  const person = isReceived ? claim.claimant : claim.item?.reporter;
  const name = `${person?.firstName || 'Campus'} ${person?.lastName || 'User'}`.trim();
  const email = person?.email || 'Not Provided';
  const prn = person?.prn || 'N/A';
  const dept = person?.department || 'BSCOER';
  const itemTitle = claim.item?.title || 'Campus Item';
  const roleLabel = isReceived ? 'Claimant' : 'Item Finder';

  body.innerHTML = `
    <div style="padding: 10px 0;">
      <div style="text-align: center; margin-bottom: 20px;">
        <div class="user-avatar" style="width: 56px; height: 56px; font-size: 1.5rem; margin: 0 auto 12px; background: linear-gradient(135deg, #6366f1, #06b6d4); box-shadow: 0 4px 16px var(--primary-glow);">
          ${name ? name.charAt(0).toUpperCase() : 'U'}
        </div>
        <h3 style="font-size: 1.3rem; font-weight: 700; color: #fff; margin-bottom: 4px;">${escapeHtml(name)}</h3>
        <span class="badge" style="background: rgba(99, 102, 241, 0.15); color: #818cf8; border: 1px solid rgba(99, 102, 241, 0.3);">
          🎓 Verified ${escapeHtml(roleLabel)}
        </span>
      </div>

      <div style="background: var(--bg-tertiary); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 16px; margin-bottom: 20px; font-size: 0.9rem;">
        <div style="display: flex; justify-content: space-between; padding-bottom: 10px; border-bottom: 1px solid var(--border-subtle); margin-bottom: 10px;">
          <span style="color: var(--text-muted);">📧 Email Address</span>
          <strong style="color: #fff; word-break: break-all;">${escapeHtml(email)}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; padding-bottom: 10px; border-bottom: 1px solid var(--border-subtle); margin-bottom: 10px;">
          <span style="color: var(--text-muted);">🆔 Student PRN</span>
          <strong>${escapeHtml(prn)}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; padding-bottom: 10px; border-bottom: 1px solid var(--border-subtle); margin-bottom: 10px;">
          <span style="color: var(--text-muted);">🏛️ Department</span>
          <strong>${escapeHtml(dept)}</strong>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="color: var(--text-muted);">📦 Regarding Item</span>
          <strong style="color: var(--primary);">${escapeHtml(itemTitle)}</strong>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px;">
        <button class="btn btn-outline" style="padding: 10px; font-size: 0.85rem;" onclick="navigator.clipboard.writeText('${escapeHtml(email)}'); showToast('Email copied: ${escapeHtml(email)}', 'success')">
          <span>📋</span> Copy Email
        </button>
        <button class="btn btn-primary" style="padding: 10px; font-size: 0.85rem;" onclick="window.location.href='mailto:${escapeHtml(email)}?subject=TSSM%20Lost%20and%20Found:%20Regarding%20${encodeURIComponent(itemTitle)}'">
          <span>✉️</span> Open Email App
        </button>
      </div>

      <button class="btn btn-secondary" style="width: 100%;" onclick="closeAllModals()">Close</button>
    </div>
  `;

  modal.classList.add('show');
}

// Handover Verification (PIN-Only, No QR) Modal
function openHandoverModal(claimId, isFinder = false) {
  closeAllModals();
  const modal = document.getElementById('handoverModal');
  const body = document.getElementById('handoverModalBody');
  if (!modal || !body) return;

  const claims = JSON.parse(localStorage.getItem('campus_lf_claims') || '[]');
  const claim = claims.find(c => c.id === Number(claimId));
  if (!claim) {
    showToast('Claim record not found', 'error');
    return;
  }

  // Ensure handover token exists
  if (!claim.handoverToken) {
    claim.handoverToken = 'TK-' + Math.floor(100000 + Math.random() * 900000);
    localStorage.setItem('campus_lf_claims', JSON.stringify(claims));
  }

  const token = claim.handoverToken;
  const itemTitle = claim.item?.title || 'Campus Item';

  if (isFinder) {
    // FINDER / SECURITY DESK VERIFICATION VIEW
    body.innerHTML = `
      <div style="text-align: center; padding: 6px 0;">
        <div style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 14px; background: rgba(99, 102, 241, 0.15); color: #818cf8; border: 1px solid rgba(99, 102, 241, 0.3); border-radius: var(--radius-full); font-size: 0.78rem; font-weight: 700; margin-bottom: 12px;">
          🔑 SECURITY DESK VERIFICATION
        </div>

        <h3 style="font-size: 1.3rem; font-weight: 700; color: #fff; margin-bottom: 6px;">
          ${escapeHtml(itemTitle)}
        </h3>
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 20px;">
          Ask the student / claimant for their 6-Digit Handover PIN to complete physical exchange.
        </p>

        <div style="background: var(--bg-tertiary); border: 1px solid var(--border-medium); border-radius: var(--radius-lg); padding: 24px 20px; box-shadow: var(--shadow-md); margin-bottom: 20px; text-align: left;">
          <label style="display: block; font-size: 0.85rem; font-weight: 700; color: #fff; margin-bottom: 8px;">
            Enter Claimant's 6-Digit PIN:
          </label>
          <div style="display: flex; gap: 10px; margin-bottom: 14px;">
            <input type="text" id="verifyPinInput" class="form-control" placeholder="e.g. ${token}" style="text-align: center; font-weight: 800; font-size: 1.3rem; letter-spacing: 0.12em; text-transform: uppercase; font-family: monospace;" autofocus />
            <button class="btn btn-found" style="white-space: nowrap; padding: 12px 22px; font-weight: 700;" onclick="confirmPhysicalHandover(${claim.id})">
              <span>✓</span> Verify PIN
            </button>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.78rem; color: var(--text-dim); background: rgba(0,0,0,0.25); padding: 8px 12px; border-radius: var(--radius-sm);">
            <span>Demo Auto-Fill:</span>
            <button type="button" style="background: none; border: none; color: #38bdf8; text-decoration: underline; cursor: pointer; font-weight: 700; font-size: 0.8rem;" onclick="document.getElementById('verifyPinInput').value='${token}'">
              Fill Code (${token})
            </button>
          </div>
        </div>

        <button class="btn btn-secondary" style="width: 100%; padding: 10px;" onclick="closeAllModals()">Cancel</button>
      </div>
    `;
  } else {
    // CLAIMANT PASS VIEW (PIN ONLY, NO QR)
    body.innerHTML = `
      <div style="text-align: center; padding: 6px 0;">
        <div style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 14px; background: rgba(16, 185, 129, 0.12); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); border-radius: var(--radius-full); font-size: 0.78rem; font-weight: 700; margin-bottom: 12px;">
          🛡️ OFFICIAL HANDOVER SECURITY PASS
        </div>

        <h3 style="font-size: 1.3rem; font-weight: 700; color: #fff; margin-bottom: 6px;">
          ${escapeHtml(itemTitle)}
        </h3>
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 20px;">
          Present this 6-digit PIN code to the Finder or Security Officer at BSCOER Campus to receive your item.
        </p>

        <div style="background: var(--bg-tertiary); border: 1px solid var(--border-medium); border-radius: var(--radius-lg); padding: 32px 24px; box-shadow: var(--shadow-md); margin-bottom: 20px;">
          <div style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; margin-bottom: 12px;">
            Your Unique Handover PIN
          </div>

          <div style="display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 20px;">
            <div style="font-family: monospace; font-size: 2.2rem; font-weight: 900; letter-spacing: 0.15em; color: #38bdf8; background: #0b0f19; padding: 14px 28px; border-radius: var(--radius-md); border: 2px solid rgba(56, 189, 248, 0.5); box-shadow: 0 0 30px rgba(56, 189, 248, 0.25);">
              ${token}
            </div>
            <button class="btn btn-outline" style="padding: 14px 18px; font-size: 1rem; font-weight: 700;" title="Copy PIN" onclick="navigator.clipboard.writeText('${token}'); showToast('Handover PIN copied: ${token}', 'success')">
              <span>📋</span> Copy
            </button>
          </div>

          <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: var(--radius-sm); padding: 10px 14px; font-size: 0.8rem; color: #34d399;">
            🔒 Security Verified • Pass is valid for one-time physical retrieval
          </div>
        </div>

        <button class="btn btn-outline" style="width: 100%; padding: 10px;" onclick="closeAllModals()">Close Pass</button>
      </div>
    `;
  }

  modal.classList.add('show');
}

async function confirmPhysicalHandover(claimId) {
  const pinInput = document.getElementById('verifyPinInput');
  if (!pinInput || !pinInput.value.trim()) {
    showToast('Please enter the 6-digit PIN code', 'error');
    return;
  }

  const pin = pinInput.value.trim();

  try {
    await api.verifyHandover(claimId, pin);
    closeAllModals();
    showToast('🎉 Handover Confirmed! Physical exchange verified and listing marked as CLOSED.', 'success');
    state.notify();
  } catch (err) {
    showToast(err.message || 'Verification failed. Please check the PIN with the claimant.', 'error');
  }
}

// Authentication Handlers
function openAuthModal() {
  closeAllModals();
  const modal = document.getElementById('authModal');
  if (!modal) return;
  modal.classList.add('show');
  switchAuthTab('signin');
}

function switchAuthTab(tab) {
  const signInForm = document.getElementById('campusSignInForm');
  const registerForm = document.getElementById('campusRegisterForm');
  const signInBtn = document.getElementById('tabSignInBtn');
  const registerBtn = document.getElementById('tabRegisterBtn');

  if (tab === 'signin') {
    signInForm.style.display = 'block';
    registerForm.style.display = 'none';
    signInBtn.style.background = 'var(--primary)';
    signInBtn.style.color = '#fff';
    registerBtn.style.background = 'transparent';
    registerBtn.style.color = 'var(--text-muted)';
  } else {
    signInForm.style.display = 'none';
    registerForm.style.display = 'block';
    registerBtn.style.background = 'var(--primary)';
    registerBtn.style.color = '#fff';
    signInBtn.style.background = 'transparent';
    signInBtn.style.color = 'var(--text-muted)';
  }
}

async function handleCampusSignIn(e) {
  e.preventDefault();
  const identifier = document.getElementById('loginIdentifierInput').value.trim();
  const password = document.getElementById('loginPasswordInput').value.trim();

  if (!identifier || !password) {
    showToast('Please enter your email/PRN and password', 'error');
    return;
  }

  // 1. Official Private Administrator Account (Sanjay Patil)
  if (identifier.toLowerCase() === 'sb@patil.bscoer.gmail.com' || identifier.toLowerCase() === 'admin') {
    if (password === 'SB_patil@123') {
      const adminUser = {
        id: 1,
        clerkId: 'admin_sanjay_patil',
        email: 'sb@patil.bscoer.gmail.com',
        firstName: 'Sanjay',
        lastName: 'Patil',
        role: 'ADMIN',
        status: 'APPROVED',
        avatar: 'SP'
      };
      state.loginUser(adminUser);
      closeAllModals();
      showToast('Welcome, Administrator Sanjay Patil! Signed in.', 'success');
      return;
    } else {
      showToast('Incorrect password for Administrator Sanjay Patil.', 'error');
      return;
    }
  }

  // 2. Check against Backend & LocalStorage with Live Status Validation
  try {
    const user = await api.loginUser({
      email: identifier,
      prn: identifier,
      password: password
    });

    if (user) {
      if (user.status === 'PENDING') {
        showToast('⏳ Approval Pending: Your account has not been approved yet by Administrator Sanjay Patil.', 'error');
        return;
      }
      if (user.status === 'REJECTED') {
        showToast('Your account registration was rejected by the Administrator.', 'error');
        return;
      }

      // Check stored password if present
      const registeredUsers = JSON.parse(localStorage.getItem('campus_lf_registered_users') || '[]');
      const localRecord = registeredUsers.find(u => 
        (u.email && u.email.toLowerCase() === identifier.toLowerCase()) ||
        (u.prn && u.prn.toLowerCase() === identifier.toLowerCase()) ||
        (user.id && u.id === user.id)
      );

      if (localRecord && localRecord.password && localRecord.password !== password) {
        showToast('Incorrect password. Please try again.', 'error');
        return;
      }

      state.loginUser(user);
      closeAllModals();
      showToast(`Welcome back, ${user.firstName || 'Student'}! Signed in.`, 'success');
      return;
    }
  } catch (err) {
    showToast(err.message || 'Login failed. Please check your credentials.', 'error');
  }
}

async function handleCampusRegister(e) {
  e.preventDefault();
  const name = document.getElementById('regNameInput').value.trim();
  const email = document.getElementById('regEmailInput').value.trim();
  const prn = document.getElementById('regPrnInput').value.trim();
  const dept = document.getElementById('regDeptInput').value;
  const role = document.getElementById('regRoleInput').value;
  const password = document.getElementById('regPasswordInput').value;

  if (!name || !email || !password) {
    showToast('Please fill all required fields', 'error');
    return;
  }

  const names = name.split(' ');
  const isAdmin = email.toLowerCase() === 'sb@patil.bscoer.gmail.com';
  const status = isAdmin ? 'APPROVED' : 'PENDING';

  const newUser = {
    id: Date.now(),
    clerkId: 'user_reg_' + Date.now(),
    email: email,
    prn: prn,
    department: dept,
    firstName: names[0],
    lastName: names.slice(1).join(' ') || '',
    role: isAdmin ? 'ADMIN' : 'USER',
    status: status,
    password: password,
    avatar: names[0].charAt(0).toUpperCase(),
    createdAt: new Date().toISOString()
  };

  // Sync to Spring Boot Backend (Inserts into MySQL users table)
  const savedUser = await api.registerUser(newUser);

  // Save locally including password for offline validation
  let registeredUsers = JSON.parse(localStorage.getItem('campus_lf_registered_users') || '[]');
  registeredUsers = registeredUsers.filter(u => u.email.toLowerCase() !== email.toLowerCase());
  const combinedUser = { ...newUser, ...(savedUser || {}) };
  registeredUsers.unshift(combinedUser);
  localStorage.setItem('campus_lf_registered_users', JSON.stringify(registeredUsers));

  document.getElementById('campusRegisterForm').reset();

  if (status === 'PENDING') {
    switchAuthTab('signin');
    showToast('Registration submitted! Your email is pending approval by Administrator Sanjay Patil.', 'info');
  } else {
    state.loginUser(combinedUser);
    closeAllModals();
    showToast(`Administrator account created and approved! Welcome, ${newUser.firstName}.`, 'success');
  }
}
