/**
 * MatchesPage View with AI-Powered Similarity Visualization
 */

async function renderMatchesPage() {
  const currentUser = state.currentUser;

  if (!currentUser) {
    return `
      <div class="container" style="padding: 80px 20px; text-align: center;">
        <div style="max-width: 480px; margin: 0 auto; background: var(--bg-card); padding: 40px; border-radius: var(--radius-lg); border: 1px solid var(--border-medium); box-shadow: var(--shadow-lg);">
          <div style="font-size: 3rem; margin-bottom: 16px;">✨</div>
          <h2 style="font-size: 1.4rem; font-weight: 700; color: #fff; margin-bottom: 8px;">Sign In to View Matches</h2>
          <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 24px; line-height: 1.5;">
            Sign in with your college account to view automated AI match suggestions for your reported belongings.
          </p>
          <button class="btn btn-primary" onclick="openClerkSignIn()" style="width: 100%;">
            <span>🔐</span> Sign In with College Account
          </button>
        </div>
      </div>
    `;
  }

  const matches = await api.getMyMatches(currentUser);

  return `
    <div class="container" style="padding-top: 32px; padding-bottom: 64px;">
      <div class="section-header" style="margin-bottom: 24px;">
        <div>
          <div class="hero-pill" style="margin-bottom: 8px;">✨ Intelligent Multi-Factor Engine</div>
          <h1 class="section-title">Automated Match Suggestions</h1>
          <p class="section-desc">AI-suggested pairings between your reported items and matching listings across campus</p>
        </div>
      </div>

      ${matches.length === 0 ? `
        <div style="text-align: center; padding: 64px 20px; background: var(--bg-card); border-radius: var(--radius-lg); border: 1px solid var(--border-subtle);">
          <div style="font-size: 3rem; margin-bottom: 16px;">✨</div>
          <h3 style="font-size: 1.3rem; font-weight: 700; margin-bottom: 8px;">No Matches Found Currently</h3>
          <p style="color: var(--text-muted); max-width: 480px; margin: 0 auto 24px;">
            The matching engine automatically analyzes newly submitted items against your listings. As soon as a complementary item with $\\ge 45\\%$ similarity is reported, it will appear here.
          </p>
          <button class="btn btn-outline" onclick="state.setRoute('browse')">Browse Public Directory</button>
        </div>
      ` : `
        <div>
          ${matches.map(match => {
            const lost = match.lostItem;
            const found = match.foundItem;
            const scorePercent = Math.round((match.matchScore || 0.85) * 100);
            const isConfirmed = match.status === 'CONFIRMED';
            const isRejected = match.status === 'REJECTED';

            return `
              <div class="match-comparison-card" id="matchCard-${match.id}">
                <!-- Left: Lost Item -->
                <div style="background: rgba(244, 63, 94, 0.05); border: 1px solid var(--lost-border); border-radius: var(--radius-md); padding: 18px;">
                  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                    <span class="badge badge-lost">🔴 Lost Item</span>
                    <span style="font-size: 0.8rem; color: var(--text-dim);">${escapeHtml(lost?.category || 'General')}</span>
                  </div>
                  <h4 style="font-size: 1.1rem; font-weight: 700; color: var(--text-main); margin-bottom: 6px;">${escapeHtml(lost?.title || 'Untitled')}</h4>
                  <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 12px; line-height: 1.4;">${escapeHtml(lost?.description || '')}</p>
                  <div style="font-size: 0.8rem; color: var(--text-dim);">
                    <div>📍 ${escapeHtml(lost?.location || 'Unknown location')}</div>
                    <div>👤 Reporter: ${escapeHtml(lost?.reporter?.firstName || 'User')}</div>
                  </div>
                </div>

                <!-- Middle: Match Confidence Score -->
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px;">
                  <div class="match-score-badge">
                    <span class="match-score-num">${scorePercent}%</span>
                    <span class="match-score-label">Confidence</span>
                  </div>
                  <span class="badge badge-match">${match.status}</span>
                </div>

                <!-- Right: Found Item -->
                <div style="background: rgba(16, 185, 129, 0.05); border: 1px solid var(--found-border); border-radius: var(--radius-md); padding: 18px;">
                  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                    <span class="badge badge-found">🟢 Found Item</span>
                    <span style="font-size: 0.8rem; color: var(--text-dim);">${escapeHtml(found?.category || 'General')}</span>
                  </div>
                  <h4 style="font-size: 1.1rem; font-weight: 700; color: var(--text-main); margin-bottom: 6px;">${escapeHtml(found?.title || 'Untitled')}</h4>
                  <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 12px; line-height: 1.4;">${escapeHtml(found?.description || '')}</p>
                  <div style="font-size: 0.8rem; color: var(--text-dim); margin-bottom: 12px;">
                    <div>📍 ${escapeHtml(found?.location || 'Unknown location')}</div>
                    <div>👤 Finder: ${escapeHtml(found?.reporter?.firstName || 'User')}</div>
                  </div>

                  <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                    <button class="btn btn-found btn-sm" onclick="openItemDetailModal(${found?.id})">
                      View Item Details
                    </button>
                    ${!isConfirmed ? `
                      <button class="btn btn-primary btn-sm" onclick="handleMatchStatus(${match.id}, 'CONFIRMED')">
                        Confirm Match
                      </button>
                    ` : `
                      <span style="color: #34d399; font-weight: 600; font-size: 0.85rem;">✓ Confirmed</span>
                    `}
                    ${!isRejected && !isConfirmed ? `
                      <button class="btn btn-outline btn-sm" onclick="handleMatchStatus(${match.id}, 'REJECTED')">
                        Dismiss
                      </button>
                    ` : ''}
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `}
    </div>
  `;
}

async function handleMatchStatus(matchId, status) {
  await api.updateMatchStatus(matchId, status);
  showToast(`Match status updated to ${status}!`, 'info');
  state.notify();
}
