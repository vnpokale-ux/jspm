/**
 * Main Application Bootstrapper & Router with TSSM BSCOER & JSPM Footer
 */

async function renderApp() {
  const appContainer = document.getElementById('app');
  if (!appContainer) return;

  const navbarHtml = renderNavbar();
  const modalsHtml = renderModalsContainer();

  let pageHtml = '';
  switch (state.currentRoute) {
    case 'home':
      pageHtml = await renderHomePage();
      break;
    case 'browse':
      pageHtml = await renderBrowsePage();
      break;
    case 'my-items':
      pageHtml = await renderMyItemsPage();
      break;
    case 'matches':
      pageHtml = await renderMatchesPage();
      break;
    case 'claims':
      pageHtml = await renderMyClaimsPage();
      break;
    case 'admin':
      pageHtml = await renderAdminPage();
      break;
    default:
      pageHtml = await renderHomePage();
      break;
  }

  const footerHtml = `
    <footer style="border-top: 1px solid var(--border-subtle); padding: 48px 0 32px; background: var(--bg-secondary); margin-top: 64px;">
      <div class="container">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 24px; margin-bottom: 24px;">
          <div style="display: flex; align-items: center; gap: 14px;">
            <div style="width: 44px; height: 44px; border-radius: 50%; overflow: hidden; background: #fff; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px var(--primary-glow); flex-shrink: 0;">
              <img src="${COLLEGE_LOGO_URL}" alt="BSCOER Logo" style="width: 100%; height: 100%; object-fit: cover; transform: scale(1.18); border-radius: 50%;" />
            </div>
            <div>
              <div style="font-weight: 700; font-family: var(--font-heading); font-size: 1.1rem; color: #fff;">
                TSSM's Bhivarabai Sawant College of Engineering and Research
              </div>
              <div style="font-size: 0.8rem; color: var(--text-dim);">
                JSPM Group of Institutes, Pune • Department of Computer Engineering
              </div>
            </div>
          </div>

          <div style="display: flex; gap: 16px; font-size: 0.85rem; color: var(--text-muted);">
            <span style="cursor: pointer;" onclick="state.setRoute('home')">Home</span>
            <span style="cursor: pointer;" onclick="state.setRoute('browse')">Item Directory</span>
            <span style="cursor: pointer;" onclick="state.setRoute('matches')">AI Matches</span>
            <span style="cursor: pointer;" onclick="state.setRoute('claims')">Claims Hub</span>
          </div>
        </div>

        <div style="text-align: center; border-top: 1px solid var(--border-subtle); padding-top: 20px; font-size: 0.82rem; color: var(--text-dim);">
          © ${new Date().getFullYear()} TSSM BSCOER Lost & Found Services. All rights reserved.
        </div>
      </div>
    </footer>
  `;

  appContainer.innerHTML = `
    ${navbarHtml}
    ${pageHtml}
    ${modalsHtml}
    ${footerHtml}
    <div class="toast-container" id="toastContainer"></div>
  `;
}

// Toast Notification System
function showToast(message, type = 'info') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let icon = 'ℹ️';
  if (type === 'success') icon = '✅';
  else if (type === 'error') icon = '⚠️';

  toast.innerHTML = `<span>${icon}</span> <span>${escapeHtml(message)}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Subscribe AppState to trigger re-renders
state.subscribe(() => {
  renderApp();
  setTimeout(initTiltEffects, 60);
});

// Initial boot
document.addEventListener('DOMContentLoaded', () => {
  renderApp();
  setTimeout(initTiltEffects, 80);
});

// High-Performance 3D Scroll Movement & Perspective Tilt Engine
function updateCampusScrollMotion() {
  const card = document.getElementById('campusTiltCard');
  const img = document.querySelector('.campus-tilt-img');
  if (!card) return;

  const rect = card.getBoundingClientRect();
  const windowHeight = window.innerHeight || document.documentElement.clientHeight;

  // Relative center progress: -1 (top of screen), 0 (center of viewport), +1 (bottom)
  const cardCenter = rect.top + rect.height / 2;
  const progress = (cardCenter - windowHeight / 2) / (windowHeight / 2);

  // Clamp progress smoothly
  const clamped = Math.max(-1.5, Math.min(1.5, progress));

  // 1. Dynamic 3D Rotation (Tilts up +24deg when above, flat 0deg at center, tilts down -20deg as you scroll down)
  const rotateX = (clamped * 22).toFixed(2);

  // 2. Physical 3D Vertical Floating & Parallax Movement
  const translateY = (clamped * -38).toFixed(1);
  const translateZ = ((1 - Math.abs(clamped)) * 30).toFixed(1);

  // 3. Dynamic 3D Scale & Depth
  const scale = Math.max(0.88, (1.03 - Math.abs(clamped) * 0.08)).toFixed(3);

  // 4. Dynamic Deep Elevation Shadow
  const shadowY = Math.max(15, (45 - Math.abs(clamped) * 20)).toFixed(0);
  const shadowBlur = Math.max(30, (80 - Math.abs(clamped) * 35)).toFixed(0);
  const shadowAlpha = Math.max(0.35, (0.85 - Math.abs(clamped) * 0.3)).toFixed(2);

  card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) translateY(${translateY}px) translateZ(${translateZ}px) scale(${scale})`;
  card.style.boxShadow = `0 ${shadowY}px ${shadowBlur}px -15px rgba(0, 0, 0, ${shadowAlpha}), 0 0 45px rgba(99, 102, 241, 0.3)`;

  if (img) {
    img.style.transform = `scale(1.05) translateY(${(clamped * 14).toFixed(1)}px)`;
  }
}

// Global scroll listener
window.addEventListener('scroll', () => {
  requestAnimationFrame(updateCampusScrollMotion);
}, { passive: true });

function initTiltEffects() {
  const card = document.getElementById('campusTiltCard');
  const wrapper = document.getElementById('campusPerspectiveWrapper');
  if (!card || !wrapper) return;

  // Interactive mouse tilt
  wrapper.onmousemove = (e) => {
    const rect = wrapper.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xPct = (x / rect.width - 0.5) * 2;
    const yPct = (y / rect.height - 0.5) * 2;

    const rotateY = (xPct * 15).toFixed(2);
    const rotateX = (-yPct * 16).toFixed(2);

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.04) translateZ(35px)`;
  };

  wrapper.onmouseleave = () => {
    updateCampusScrollMotion();
  };

  // Initial trigger
  updateCampusScrollMotion();
}

// Initialize Clerk Authentication when SDK is ready
window.addEventListener('load', async () => {
  if (window.Clerk) {
    try {
      await window.Clerk.load({
        appearance: {
          variables: {
            colorPrimary: '#6366f1',
            colorBackground: '#131b2e',
            colorText: '#ffffff',
            colorInputBackground: '#0b0f19',
            colorInputText: '#ffffff'
          }
        }
      });
      state.initClerkAuth();

      // Listen for Clerk user session events (login, logout)
      window.Clerk.addListener(({ user }) => {
        state.initClerkAuth();
      });
    } catch (err) {
      console.warn('Clerk initialization notice:', err);
    }
  }
});
