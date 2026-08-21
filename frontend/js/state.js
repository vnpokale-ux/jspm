/**
 * Central State Management
 */

class AppState {
  constructor() {
    const savedUser = localStorage.getItem('campus_lf_auth_user');
    this.currentUser = savedUser ? JSON.parse(savedUser) : null;
    this.isClerkActive = false;
    this.clerkUser = null;
    this.currentRoute = 'home';
    this.filterState = {
      query: '',
      type: null,
      category: null,
      location: null,
      status: 'ACTIVE'
    };
    this.selectedItem = null;
    this.listeners = [];
  }

  initClerkAuth() {
    if (window.Clerk && window.Clerk.user) {
      this.isClerkActive = true;
      this.clerkUser = window.Clerk.user;
      const primaryEmail = this.clerkUser.primaryEmailAddress ? this.clerkUser.primaryEmailAddress.emailAddress : '';
      const role = (primaryEmail.includes('admin') || primaryEmail.includes('faculty') || primaryEmail.includes('kulkarni') || primaryEmail.includes('hod') || primaryEmail.includes('security')) ? 'ADMIN' : 'USER';

      this.currentUser = {
        id: this.clerkUser.id,
        clerkId: this.clerkUser.id,
        email: primaryEmail,
        firstName: this.clerkUser.firstName || 'Student',
        lastName: this.clerkUser.lastName || '',
        role: role,
        avatar: this.clerkUser.firstName ? this.clerkUser.firstName.charAt(0) : 'U',
        imageUrl: this.clerkUser.imageUrl
      };
      localStorage.setItem('campus_lf_auth_user', JSON.stringify(this.currentUser));
      this.notify();
    }
  }

  loginUser(userData) {
    this.currentUser = userData;
    localStorage.setItem('campus_lf_auth_user', JSON.stringify(userData));
    this.notify();
  }

  logoutUser() {
    this.currentUser = null;
    this.isClerkActive = false;
    this.clerkUser = null;
    localStorage.removeItem('campus_lf_auth_user');
    if (window.Clerk && window.Clerk.signOut) {
      window.Clerk.signOut();
    }
    this.notify();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(fn => fn(this));
  }

  setRoute(route, extraData = null) {
    this.currentRoute = route;
    if (extraData) {
      if (extraData.category) this.filterState.category = extraData.category;
      if (extraData.type) this.filterState.type = extraData.type;
      if (extraData.query !== undefined) this.filterState.query = extraData.query;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.notify();
  }

  setUser(userKey) {
    if (DEMO_USERS[userKey]) {
      this.currentUser = DEMO_USERS[userKey];
      this.notify();
    }
  }

  setFilter(key, value) {
    this.filterState[key] = value;
    this.notify();
  }

  resetFilters() {
    this.filterState = {
      query: '',
      type: null,
      category: null,
      location: null,
      status: 'ACTIVE'
    };
    this.notify();
  }

  setSelectedItem(item) {
    this.selectedItem = item;
    this.notify();
  }
}

const state = new AppState();
