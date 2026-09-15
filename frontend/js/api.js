/**
 * API Service for Campus Lost & Found
 * Communicates with Spring Boot Backend with LocalStorage Fallback
 */

const API_BASE_URL = 'http://localhost:8080/api';

class ApiService {
  constructor() {
    this.storageKeyItems = 'campus_lf_items';
    this.storageKeyClaims = 'campus_lf_claims';
    this.storageKeyMatches = 'campus_lf_matches';
    this.storageKeyUsers = 'campus_lf_users';
    this.initLocalStorage();
  }

  initLocalStorage() {
    const DB_VERSION = 'v2_cloud_clean_live';
    if (localStorage.getItem('campus_lf_db_version') !== DB_VERSION) {
      localStorage.setItem(this.storageKeyItems, JSON.stringify([]));
      localStorage.setItem(this.storageKeyClaims, JSON.stringify([]));
      localStorage.setItem(this.storageKeyMatches, JSON.stringify([]));
      localStorage.setItem(this.storageKeyUsers, JSON.stringify([OFFICIAL_ADMIN]));
      localStorage.setItem('campus_lf_registered_users', JSON.stringify([]));
      localStorage.setItem('campus_lf_db_version', DB_VERSION);
    }
  }

  async getAuthHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    if (window.Clerk && window.Clerk.session) {
      try {
        const token = await window.Clerk.session.getToken();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      } catch (err) {
        console.warn('Could not get Clerk session token:', err);
      }
    }
    return headers;
  }

  // --- Auth & Users API ---

  async registerUser(userData) {
    try {
      const res = await fetch(`${API_BASE_URL}/public/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      if (res.ok) {
        const data = await res.json();
        return data.data;
      }
    } catch (e) {
      console.warn('Backend offline, saving user locally:', e);
    }
    return userData;
  }

  async loginUser(userData) {
    try {
      const res = await fetch(`${API_BASE_URL}/public/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const user = data.data;
        // Update local storage registered users list with server approval status
        let registered = JSON.parse(localStorage.getItem('campus_lf_registered_users') || '[]');
        const idx = registered.findIndex(u => 
          (user.id && u.id === user.id) || 
          (user.email && u.email && u.email.toLowerCase() === user.email.toLowerCase()) ||
          (user.prn && u.prn && u.prn.toLowerCase() === user.prn.toLowerCase())
        );
        if (idx !== -1) {
          registered[idx] = { ...registered[idx], ...user, status: user.status };
        } else {
          registered.unshift(user);
        }
        localStorage.setItem('campus_lf_registered_users', JSON.stringify(registered));
        return user;
      } else if (res.status === 403) {
        throw new Error(data.message || '⏳ Approval Pending: Your account has not been approved yet by Administrator Sanjay Patil.');
      } else if (res.status === 404) {
        throw new Error(data.message || 'Account not found. Please click "Register Account" first.');
      }
    } catch (e) {
      if (e.message && (e.message.includes('Approval Pending') || e.message.includes('Account not found') || e.message.includes('rejected') || e.message.includes('pending'))) {
        throw e;
      }
      console.warn('Backend login fallback to local cache:', e);
    }

    // Local fallback
    const registered = JSON.parse(localStorage.getItem('campus_lf_registered_users') || '[]');
    const identifier = (userData.email || userData.identifier || userData.prn || '').toLowerCase();
    const matched = registered.find(u => 
      (u.email && u.email.toLowerCase() === identifier) ||
      (u.prn && u.prn.toLowerCase() === identifier)
    );

    if (matched) {
      if (matched.status === 'PENDING') {
        throw new Error('⏳ Approval Pending: Your email has not been approved yet by Administrator Sanjay Patil.');
      }
      if (matched.status === 'REJECTED') {
        throw new Error('Your account registration was rejected by the Administrator.');
      }
      return matched;
    }

    throw new Error('Account not found. Please click "Register Account" to submit your details for admin approval.');
  }

  // --- Items API ---

  async getItems(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (filters.query) queryParams.append('query', filters.query);
      if (filters.type) queryParams.append('type', filters.type);
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.location) queryParams.append('location', filters.location);
      if (filters.status) queryParams.append('status', filters.status);

      const res = await fetch(`${API_BASE_URL}/public/items?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        return data.data.content;
      }
    } catch (e) {
      // Backend not running, use local data
    }

    // Local fallback
    let items = JSON.parse(localStorage.getItem(this.storageKeyItems) || '[]');
    if (filters.type) {
      items = items.filter(i => i.type === filters.type);
    }
    if (filters.category) {
      items = items.filter(i => i.category.toLowerCase().includes(filters.category.toLowerCase()));
    }
    if (filters.location) {
      items = items.filter(i => i.location.toLowerCase().includes(filters.location.toLowerCase()));
    }
    if (filters.status) {
      items = items.filter(i => i.status === filters.status);
    }
    if (filters.query) {
      const q = filters.query.toLowerCase();
      items = items.filter(i => i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q));
    }
    return items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  async getItemById(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/public/items/${id}`);
      if (res.ok) {
        const data = await res.json();
        return data.data;
      }
    } catch (e) {}

    const items = JSON.parse(localStorage.getItem(this.storageKeyItems) || '[]');
    return items.find(i => i.id === Number(id)) || null;
  }

  async createItem(itemData, currentUser) {
    try {
      const headers = await this.getAuthHeaders();
      const res = await fetch(`${API_BASE_URL}/items`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(itemData)
      });
      if (res.ok) {
        const data = await res.json();
        return data.data;
      }
    } catch (e) {}

    // Local fallback create
    const items = JSON.parse(localStorage.getItem(this.storageKeyItems) || '[]');
    const newItem = {
      id: Date.now(),
      ...itemData,
      status: 'ACTIVE',
      reporter: currentUser,
      createdAt: new Date().toISOString()
    };
    items.unshift(newItem);
    localStorage.setItem(this.storageKeyItems, JSON.stringify(items));

    // Run local match calculation
    this.computeAndStoreLocalMatches(newItem);

    return newItem;
  }

  computeAndStoreLocalMatches(newItem) {
    const items = JSON.parse(localStorage.getItem(this.storageKeyItems) || '[]');
    const matches = JSON.parse(localStorage.getItem(this.storageKeyMatches) || '[]');
    const oppositeType = newItem.type === 'LOST' ? 'FOUND' : 'LOST';
    
    const candidates = items.filter(i => i.type === oppositeType && i.status === 'ACTIVE' && i.reporter?.id !== newItem.reporter?.id);

    candidates.forEach(candidate => {
      let score = 0;
      if (newItem.category && candidate.category && newItem.category.toLowerCase() === candidate.category.toLowerCase()) {
        score += 0.45;
      }
      
      const wordsA = (newItem.title + ' ' + newItem.description).toLowerCase().split(/\W+/).filter(w => w.length > 2);
      const wordsB = (candidate.title + ' ' + candidate.description).toLowerCase().split(/\W+/).filter(w => w.length > 2);
      const common = wordsA.filter(w => wordsB.includes(w));
      if (common.length > 0) {
        score += Math.min(0.40, common.length * 0.12);
      }

      if (newItem.location && candidate.location && newItem.location.toLowerCase() === candidate.location.toLowerCase()) {
        score += 0.15;
      }

      if (score >= 0.45) {
        const lostItem = newItem.type === 'LOST' ? newItem : candidate;
        const foundItem = newItem.type === 'FOUND' ? newItem : candidate;
        matches.unshift({
          id: Date.now() + Math.floor(Math.random() * 1000),
          lostItem,
          foundItem,
          matchScore: Math.round(score * 100) / 100,
          status: 'SUGGESTED',
          createdAt: new Date().toISOString()
        });
      }
    });

    localStorage.setItem(this.storageKeyMatches, JSON.stringify(matches));
  }

  async updateItemStatus(id, status, currentUser) {
    const items = JSON.parse(localStorage.getItem(this.storageKeyItems) || '[]');
    const item = items.find(i => i.id === Number(id));
    if (item) {
      // Verify permission
      if (currentUser) {
        const isOwner = item.reporter && (
          (currentUser.email && item.reporter.email && currentUser.email.toLowerCase() === item.reporter.email.toLowerCase()) ||
          (currentUser.clerkId && item.reporter.clerkId && currentUser.clerkId === item.reporter.clerkId) ||
          (currentUser.id && item.reporter.id && String(currentUser.id) === String(item.reporter.id))
        );
        const isAdmin = currentUser.role === 'ADMIN';
        if (!isOwner && !isAdmin) {
          throw new Error('Permission denied: You cannot update this item.');
        }
      }

      item.status = status;
      item.updatedAt = new Date().toISOString();
      localStorage.setItem(this.storageKeyItems, JSON.stringify(items));
    }
    return item;
  }

  async deleteItem(id, currentUser) {
    let items = JSON.parse(localStorage.getItem(this.storageKeyItems) || '[]');
    const item = items.find(i => i.id === Number(id));

    if (item && currentUser) {
      const isOwner = item.reporter && (
        (currentUser.email && item.reporter.email && currentUser.email.toLowerCase() === item.reporter.email.toLowerCase()) ||
        (currentUser.clerkId && item.reporter.clerkId && currentUser.clerkId === item.reporter.clerkId) ||
        (currentUser.id && item.reporter.id && String(currentUser.id) === String(item.reporter.id))
      );
      const isAdmin = currentUser.role === 'ADMIN';

      if (!isOwner && !isAdmin) {
        throw new Error('Permission denied: You cannot delete this item.');
      }
    }

    try {
      const headers = await this.getAuthHeaders();
      await fetch(`${API_BASE_URL}/items/${id}`, {
        method: 'DELETE',
        headers: headers
      });
    } catch (e) {}

    items = items.filter(i => i.id !== Number(id));
    localStorage.setItem(this.storageKeyItems, JSON.stringify(items));
    return true;
  }

  // --- Claims API ---

  async createClaim(claimData, currentUser) {
    try {
      const headers = await this.getAuthHeaders();
      const res = await fetch(`${API_BASE_URL}/claims`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(claimData)
      });
      if (res.ok) {
        const data = await res.json();
        return data.data;
      }
    } catch (e) {}

    const claims = JSON.parse(localStorage.getItem(this.storageKeyClaims) || '[]');
    const items = JSON.parse(localStorage.getItem(this.storageKeyItems) || '[]');
    const item = items.find(i => i.id === Number(claimData.itemId));

    const newClaim = {
      id: Date.now(),
      item,
      claimant: currentUser,
      proofDescription: claimData.proofDescription,
      status: 'PENDING',
      handoverToken: 'TK-' + Math.floor(100000 + Math.random() * 900000),
      isHandedOver: false,
      createdAt: new Date().toISOString()
    };
    claims.unshift(newClaim);
    localStorage.setItem(this.storageKeyClaims, JSON.stringify(claims));
    return newClaim;
  }

  async getMyClaims(currentUser) {
    if (!currentUser) return [];
    const claims = JSON.parse(localStorage.getItem(this.storageKeyClaims) || '[]');
    return claims.filter(c => {
      const claimant = c.claimant;
      if (!claimant) return false;
      return (
        (currentUser.email && claimant.email && currentUser.email.toLowerCase() === claimant.email.toLowerCase()) ||
        (currentUser.clerkId && claimant.clerkId && currentUser.clerkId === claimant.clerkId) ||
        (currentUser.id && claimant.id && String(currentUser.id) === String(claimant.id))
      );
    });
  }

  async getReceivedClaims(currentUser) {
    if (!currentUser) return [];
    const claims = JSON.parse(localStorage.getItem(this.storageKeyClaims) || '[]');
    return claims.filter(c => {
      const reporter = c.item?.reporter;
      if (!reporter) return false;
      return (
        (currentUser.email && reporter.email && currentUser.email.toLowerCase() === reporter.email.toLowerCase()) ||
        (currentUser.clerkId && reporter.clerkId && currentUser.clerkId === reporter.clerkId) ||
        (currentUser.id && reporter.id && String(currentUser.id) === String(reporter.id))
      );
    });
  }

  async updateClaimStatus(claimId, status) {
    const claims = JSON.parse(localStorage.getItem(this.storageKeyClaims) || '[]');
    const claim = claims.find(c => c.id === Number(claimId));
    if (claim) {
      claim.status = status;
      if (!claim.handoverToken) {
        claim.handoverToken = 'TK-' + Math.floor(100000 + Math.random() * 900000);
      }
      if (status === 'APPROVED' && claim.item) {
        await this.updateItemStatus(claim.item.id, 'RESOLVED');
      }
      localStorage.setItem(this.storageKeyClaims, JSON.stringify(claims));
    }
    return claim;
  }

  // --- Matches API ---

  async getMyMatches(currentUser) {
    const matches = JSON.parse(localStorage.getItem(this.storageKeyMatches) || '[]');
    return matches.filter(m => m.lostItem?.reporter?.id === currentUser.id || m.foundItem?.reporter?.id === currentUser.id);
  }

  async updateMatchStatus(matchId, status) {
    const matches = JSON.parse(localStorage.getItem(this.storageKeyMatches) || '[]');
    const match = matches.find(m => m.id === Number(matchId));
    if (match) {
      match.status = status;
      localStorage.setItem(this.storageKeyMatches, JSON.stringify(matches));
    }
    return match;
  }

  // --- Admin Analytics API ---

  async getAdminStats() {
    const items = JSON.parse(localStorage.getItem(this.storageKeyItems) || '[]');
    const claims = JSON.parse(localStorage.getItem(this.storageKeyClaims) || '[]');
    const matches = JSON.parse(localStorage.getItem(this.storageKeyMatches) || '[]');
    const users = JSON.parse(localStorage.getItem(this.storageKeyUsers) || '[]');

    const itemsByCategory = {};
    const itemsByLocation = {};

    items.forEach(i => {
      itemsByCategory[i.category] = (itemsByCategory[i.category] || 0) + 1;
      itemsByLocation[i.location] = (itemsByLocation[i.location] || 0) + 1;
    });

    return {
      totalUsers: users.length,
      totalItems: items.length,
      activeLostItems: items.filter(i => i.type === 'LOST' && i.status === 'ACTIVE').length,
      activeFoundItems: items.filter(i => i.type === 'FOUND' && i.status === 'ACTIVE').length,
      resolvedItems: items.filter(i => i.status === 'RESOLVED').length,
      closedItems: items.filter(i => i.status === 'CLOSED').length,
      totalClaims: claims.length,
      pendingClaims: claims.filter(c => c.status === 'PENDING').length,
      approvedClaims: claims.filter(c => c.status === 'APPROVED').length,
      totalMatches: matches.length,
      confirmedMatches: matches.filter(m => m.status === 'CONFIRMED').length,
      itemsByCategory,
      itemsByLocation
    };
  }

  async getAdminUsers() {
    let serverUsers = [];
    try {
      const headers = await this.getAuthHeaders();
      const res = await fetch(`${API_BASE_URL}/admin/users`, { headers });
      if (res.ok) {
        const data = await res.json();
        serverUsers = data.data.content || [];
      }
    } catch (e) {}

    let registered = JSON.parse(localStorage.getItem('campus_lf_registered_users') || '[]');

    if (serverUsers.length > 0) {
      // Sync local cache with live database records
      serverUsers.forEach(su => {
        const idx = registered.findIndex(ru => 
          (su.id && ru.id === su.id) || 
          (ru.email && su.email && ru.email.toLowerCase() === su.email.toLowerCase()) ||
          (ru.prn && su.prn && ru.prn.toLowerCase() === su.prn.toLowerCase())
        );
        if (idx !== -1) {
          registered[idx] = { ...registered[idx], ...su, status: su.status };
        } else {
          registered.push(su);
        }
      });
      localStorage.setItem('campus_lf_registered_users', JSON.stringify(registered));
      return serverUsers;
    }

    const demo = JSON.parse(localStorage.getItem(this.storageKeyUsers) || '[]');
    const allUsers = [...registered];
    demo.forEach(d => {
      if (!allUsers.some(u => u.email === d.email)) {
        allUsers.push({ ...d, status: 'APPROVED' });
      }
    });
    return allUsers;
  }

  async approveUser(userId) {
    let approvedUser = null;
    try {
      const headers = await this.getAuthHeaders();
      const res = await fetch(`${API_BASE_URL}/admin/users/${userId}/approve`, {
        method: 'PUT',
        headers
      });
      if (res.ok) {
        const data = await res.json();
        approvedUser = data.data;
      }
    } catch (e) {
      console.warn('Backend offline, approving user locally:', e);
    }

    // ALWAYS update local storage so immediate logins succeed without reload
    const registered = JSON.parse(localStorage.getItem('campus_lf_registered_users') || '[]');
    const user = registered.find(u => 
      u.id === Number(userId) || 
      String(u.id) === String(userId) || 
      u.clerkId === String(userId) ||
      (approvedUser && u.email && approvedUser.email && u.email.toLowerCase() === approvedUser.email.toLowerCase())
    );
    if (user) {
      user.status = 'APPROVED';
      localStorage.setItem('campus_lf_registered_users', JSON.stringify(registered));
    } else if (approvedUser) {
      registered.unshift({ ...approvedUser, status: 'APPROVED' });
      localStorage.setItem('campus_lf_registered_users', JSON.stringify(registered));
    }
    return approvedUser || user;
  }

  async rejectUser(userId) {
    try {
      const headers = await this.getAuthHeaders();
      await fetch(`${API_BASE_URL}/admin/users/${userId}/reject`, {
        method: 'PUT',
        headers
      });
    } catch (e) {}

    let registered = JSON.parse(localStorage.getItem('campus_lf_registered_users') || '[]');
    registered = registered.filter(u => 
      u.id !== Number(userId) && 
      String(u.id) !== String(userId) && 
      u.clerkId !== String(userId)
    );
    localStorage.setItem('campus_lf_registered_users', JSON.stringify(registered));
    return true;
  }

  async updateUserRole(userId, role) {
    const registered = JSON.parse(localStorage.getItem('campus_lf_registered_users') || '[]');
    const user = registered.find(u => u.id === Number(userId) || u.clerkId === String(userId));
    if (user) {
      user.role = role;
      localStorage.setItem('campus_lf_registered_users', JSON.stringify(registered));
    }
    return user;
  }

  async verifyHandover(claimId, token) {
    const claims = JSON.parse(localStorage.getItem(this.storageKeyClaims) || '[]');
    const claim = claims.find(c => c.id === Number(claimId));
    if (!claim) throw new Error('Claim record not found in system.');

    const cleanInput = String(token).replace(/TK-/i, '').trim().toUpperCase();
    const cleanStored = String(claim.handoverToken || '').replace(/TK-/i, '').trim().toUpperCase();

    if (!cleanStored || cleanInput !== cleanStored) {
      throw new Error(`Invalid Handover PIN. Please check the 6-digit PIN with the claimant.`);
    }

    claim.isHandedOver = true;
    claim.status = 'APPROVED';
    localStorage.setItem(this.storageKeyClaims, JSON.stringify(claims));

    if (claim.item) {
      await this.updateItemStatus(claim.item.id, 'CLOSED');
    }
    return claim;
  }

  // --- Phase 4: Notifications API ---

  async getNotifications(currentUser) {
    let notifs = JSON.parse(localStorage.getItem('campus_lf_notifs') || '[]');
    if (notifs.length === 0 && typeof INITIAL_NOTIFICATIONS !== 'undefined') {
      notifs = INITIAL_NOTIFICATIONS;
      localStorage.setItem('campus_lf_notifs', JSON.stringify(notifs));
    }
    return notifs.filter(n => n.recipientId === currentUser.id);
  }

  async markNotificationRead(notifId) {
    const notifs = JSON.parse(localStorage.getItem('campus_lf_notifs') || '[]');
    const notif = notifs.find(n => n.id === Number(notifId));
    if (notif) {
      notif.isRead = true;
      localStorage.setItem('campus_lf_notifs', JSON.stringify(notifs));
    }
    return notif;
  }

  async markAllNotificationsRead(currentUser) {
    const notifs = JSON.parse(localStorage.getItem('campus_lf_notifs') || '[]');
    notifs.forEach(n => {
      if (n.recipientId === currentUser.id) n.isRead = true;
    });
    localStorage.setItem('campus_lf_notifs', JSON.stringify(notifs));
  }

  // --- Phase 4: CSV Export Trigger ---

  downloadAuditCsv() {
    const items = JSON.parse(localStorage.getItem(this.storageKeyItems) || '[]');
    let csv = 'ID,Type,Title,Category,Location,Status,Reporter,Reporter Email,Date\n';
    items.forEach(i => {
      csv += `${i.id},${i.type},"${(i.title || '').replace(/"/g, '""')}","${(i.category || '').replace(/"/g, '""')}","${(i.location || '').replace(/"/g, '""')}",${i.status},"${i.reporter?.firstName || ''} ${i.reporter?.lastName || ''}","${i.reporter?.email || ''}",${i.itemDate || i.createdAt}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'bscoer_lost_and_found_audit.csv';
    link.click();
  }
}

const api = new ApiService();
