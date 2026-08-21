/**
 * ItemCard Component
 */

function renderItemCard(item) {
  const isLost = item.type === 'LOST';
  const typeBadgeClass = isLost ? 'badge-lost' : 'badge-found';
  const statusBadgeClass = item.status === 'RESOLVED' ? 'badge-resolved' : (item.status === 'CLOSED' ? 'badge-closed' : 'badge-active');

  const formattedDate = new Date(item.itemDate || item.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });

  const fallbackImage = isLost
    ? 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600&auto=format&fit=crop&q=80'
    : 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80';

  const displayImage = item.imageUrl || fallbackImage;

  return `
    <div class="item-card" id="itemCard-${item.id}" onclick="openItemDetailModal(${item.id})">
      <div class="item-image-wrapper">
        <img class="item-image" src="${displayImage}" alt="${escapeHtml(item.title)}" loading="lazy" onerror="this.src='${fallbackImage}'" />
        <div class="item-badges-overlay">
          <span class="badge ${typeBadgeClass}">
            ${isLost ? '🔴 LOST' : '🟢 FOUND'}
          </span>
          <span class="badge ${statusBadgeClass}">
            ${item.status}
          </span>
        </div>
      </div>

      <div class="item-card-body">
        <div class="item-meta-row">
          <span style="color: var(--primary); font-weight: 600; font-size: 0.78rem;">📁 ${escapeHtml(item.category || 'General')}</span>
          <span>📅 ${formattedDate}</span>
        </div>

        <h3 class="item-card-title">${escapeHtml(item.title)}</h3>
        <p class="item-card-desc">${escapeHtml(item.description)}</p>

        <div class="item-card-footer">
          <div class="item-location" title="${escapeHtml(item.location)}">
            <span>📍</span>
            <span style="max-width: 170px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              ${escapeHtml(item.location)}
            </span>
          </div>
          <button class="btn btn-outline btn-sm" style="border-radius: var(--radius-full); padding: 4px 10px; font-size: 0.75rem;" onclick="event.stopPropagation(); openItemDetailModal(${item.id})">
            Details →
          </button>
        </div>
      </div>
    </div>
  `;
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
