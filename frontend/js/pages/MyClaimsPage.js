/**
 * MyClaimsPage View (Claims Submitted & Received)
 */

let activeClaimsTab = 'my'; // 'my' or 'received'

async function renderMyClaimsPage() {
  const currentUser = state.currentUser;

  if (!currentUser) {
    return `
      <div class="container" style="padding: 80px 20px; text-align: center;">
        <div style="max-width: 480px; margin: 0 auto; background: var(--bg-card); padding: 40px; border-radius: var(--radius-lg); border: 1px solid var(--border-medium); box-shadow: var(--shadow-lg);">
          <div style="font-size: 3rem; margin-bottom: 16px;">🛡️</div>
          <h2 style="font-size: 1.4rem; font-weight: 700; color: #fff; margin-bottom: 8px;">Sign In to Manage Claims</h2>
          <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 24px; line-height: 1.5;">
            Sign in with your college account to view your filed ownership claims, verify received claims, and access your Handover QR passes.
          </p>
          <button class="btn btn-primary" onclick="openClerkSignIn()" style="width: 100%;">
            <span>🔐</span> Sign In with College Account
          </button>
        </div>
      </div>
    `;
  }

  const myClaims = await api.getMyClaims(currentUser);
  const receivedClaims = await api.getReceivedClaims(currentUser);

  const displayClaims = activeClaimsTab === 'my' ? myClaims : receivedClaims;

  return `
    <div class="container" style="padding-top: 32px; padding-bottom: 64px;">
      <div class="section-header" style="margin-bottom: 24px;">
        <div>
          <h1 class="section-title">Claims & Verification Hub</h1>
          <p class="section-desc">Manage your filed ownership claims and review claims submitted on your found listings</p>
        </div>
      </div>

      <!-- How Handover Verification Works Guide -->
      <div style="background: rgba(99, 102, 241, 0.08); border: 1px solid rgba(99, 102, 241, 0.25); border-radius: var(--radius-lg); padding: 20px; margin-bottom: 28px; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px;">
        <div style="display: flex; gap: 12px;">
          <div style="font-size: 1.5rem;">1️⃣</div>
          <div>
            <strong style="color: #fff; font-size: 0.9rem;">Submit Private Proof</strong>
            <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 2px;">Claimant describes distinct hidden features only the real owner knows.</p>
          </div>
        </div>
        <div style="display: flex; gap: 12px;">
          <div style="font-size: 1.5rem;">2️⃣</div>
          <div>
            <strong style="color: #fff; font-size: 0.9rem;">Finder / Admin Review</strong>
            <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 2px;">Finder verifies the proof and clicks "Approve".</p>
          </div>
        </div>
        <div style="display: flex; gap: 12px;">
          <div style="font-size: 1.5rem;">3️⃣</div>
          <div>
            <strong style="color: #fff; font-size: 0.9rem;">6-Digit Security PIN</strong>
            <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 2px;">System generates an encrypted security PIN pass (e.g. TK-749182).</p>
          </div>
        </div>
        <div style="display: flex; gap: 12px;">
          <div style="font-size: 1.5rem;">4️⃣</div>
          <div>
            <strong style="color: #fff; font-size: 0.9rem;">Physical Verification</strong>
            <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 2px;">Finder types the PIN at security desk to close the listing permanently.</p>
          </div>
        </div>
      </div>

      <!-- Tabs Switcher -->
      <div style="display: flex; gap: 12px; margin-bottom: 32px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 16px;">
        <button class="btn ${activeClaimsTab === 'my' ? 'btn-primary' : 'btn-outline'}" onclick="setClaimsTab('my')">
          <span>📤</span> My Filed Claims (${myClaims.length})
        </button>
        <button class="btn ${activeClaimsTab === 'received' ? 'btn-primary' : 'btn-outline'}" onclick="setClaimsTab('received')">
          <span>📥</span> Claims Received on My Found Items (${receivedClaims.length})
        </button>
      </div>

      ${displayClaims.length === 0 ? `
        <div style="text-align: center; padding: 64px 20px; background: var(--bg-card); border-radius: var(--radius-lg); border: 1px solid var(--border-subtle);">
          <div style="font-size: 3rem; margin-bottom: 16px;">🛡️</div>
          <h3 style="font-size: 1.3rem; font-weight: 700; margin-bottom: 8px;">No Claims in this Category</h3>
          <p style="color: var(--text-muted); max-width: 440px; margin: 0 auto 24px;">
            ${activeClaimsTab === 'my'
              ? "You haven't filed any ownership claims on found items yet. If you recognize your missing item in the public directory, open it and click 'Claim Ownership'."
              : "No one has filed a claim on items you've found yet. You'll be notified here when someone submits proof of ownership."}
          </p>
          <button class="btn btn-outline" onclick="state.setRoute('browse')">Browse Public Directory</button>
        </div>
      ` : `
        <div style="display: flex; flex-direction: column; gap: 20px;">
          ${displayClaims.map(claim => {
            const item = claim.item;
            const isReceived = activeClaimsTab === 'received';
            const statusClass = claim.status === 'APPROVED' ? 'badge-active' : (claim.status === 'REJECTED' ? 'badge-lost' : 'badge-match');
            const contactPerson = isReceived ? claim.claimant : item?.reporter;
            const contactName = `${contactPerson?.firstName || 'Campus'} ${contactPerson?.lastName || 'User'}`.trim();

            return `
              <div style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 24px; display: flex; flex-direction: column; gap: 16px;">
                <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
                  <div>
                    <span style="font-size: 0.78rem; color: var(--text-dim); text-transform: uppercase; font-weight: 700;">Claim ID #${claim.id} • ${new Date(claim.createdAt).toLocaleDateString()}</span>
                    <h3 style="font-size: 1.2rem; font-weight: 700; color: var(--text-main); margin-top: 4px;">${escapeHtml(item?.title || 'Unknown Item')}</h3>
                  </div>
                  <div style="display: flex; align-items: center; gap: 12px;">
                    <span class="badge ${statusClass}">${claim.status}</span>
                    <button class="btn btn-outline btn-sm" onclick="openDirectContactModal(${claim.id})">
                      <span>💬</span> Contact ${isReceived ? 'Claimant' : 'Finder'}
                    </button>
                    <button class="btn btn-outline btn-sm" onclick="openItemDetailModal(${item?.id})">
                      View Item →
                    </button>
                  </div>
                </div>

                <div style="background: var(--bg-tertiary); padding: 16px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
                  <div style="font-size: 0.8rem; color: var(--text-dim); font-weight: 700; text-transform: uppercase; margin-bottom: 6px;">
                    ${isReceived ? `Proof Provided by Claimant (${escapeHtml(claim.claimant?.firstName || 'User')}):` : 'Your Submitted Proof of Ownership:'}
                  </div>
                  <p style="color: var(--text-main); font-size: 0.925rem; line-height: 1.5;">
                    "${escapeHtml(claim.proofDescription)}"
                  </p>
                </div>

                ${!isReceived && claim.status === 'APPROVED' ? `
                  <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: var(--radius-md); padding: 12px 18px; flex-wrap: wrap; gap: 10px;">
                    <div>
                      <div style="font-size: 0.8rem; color: #34d399; font-weight: 700;">Handover PIN: ${claim.handoverToken || 'TK-749182'}</div>
                      <div style="font-size: 0.75rem; color: var(--text-muted);">${claim.isHandedOver ? '✅ Physical Handover Verified & Completed' : 'Present this 6-digit code at the security desk to collect.'}</div>
                    </div>
                    <button class="btn btn-found btn-sm" onclick="openHandoverModal(${claim.id}, false)">
                      🔑 View Handover Pass & PIN
                    </button>
                  </div>
                ` : ''}

                ${isReceived && claim.status === 'APPROVED' && !claim.isHandedOver ? `
                  <div style="display: flex; justify-content: flex-end; gap: 12px; border-top: 1px solid var(--border-subtle); padding-top: 14px;">
                    <button class="btn btn-found btn-sm" onclick="openHandoverModal(${claim.id}, true)">
                      🔑 Enter Claimant PIN & Verify Handover
                    </button>
                  </div>
                ` : ''}

                ${isReceived && claim.status === 'APPROVED' && claim.isHandedOver ? `
                  <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: var(--radius-md); padding: 12px 16px; display: flex; align-items: center; justify-content: space-between; gap: 10px;">
                    <div style="font-size: 0.85rem; color: #34d399; font-weight: 700;">
                      ✅ Physical Handover Confirmed (PIN: ${claim.handoverToken || 'Verified'})
                    </div>
                    <span class="badge badge-active">Recovery Complete</span>
                  </div>
                ` : ''}

                ${isReceived && claim.status === 'PENDING' ? `
                  <div style="display: flex; justify-content: flex-end; gap: 12px; border-top: 1px solid var(--border-subtle); padding-top: 16px;">
                    <button class="btn btn-secondary btn-sm" onclick="handleClaimDecision(${claim.id}, 'REJECTED')">
                      <span>✕</span> Reject Claim
                    </button>
                    <button class="btn btn-found btn-sm" onclick="handleClaimDecision(${claim.id}, 'APPROVED')">
                      <span>✓</span> Approve & Generate Handover Pass
                    </button>
                  </div>
                ` : ''}
              </div>
            `;
          }).join('')}
        </div>
      `}
    </div>
  `;
}

function setClaimsTab(tab) {
  activeClaimsTab = tab;
  state.notify();
}

async function handleClaimDecision(claimId, status) {
  await api.updateClaimStatus(claimId, status);
  showToast(`Claim #${claimId} marked as ${status}!`, status === 'APPROVED' ? 'success' : 'info');
  state.notify();
}
