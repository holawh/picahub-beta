(function (global) {
  const API_BASE = '';

  async function getContent() {
    const res = await fetch(`${API_BASE}/api/content`, { cache: 'no-store' });
    if (!res.ok) throw new Error('콘텐츠 데이터를 불러오지 못했습니다.');
    return res.json();
  }

  async function adminLogin(id, password) {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, password })
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.message || '관리자 로그인이 실패했습니다.');
    sessionStorage.setItem('picahub.admin.token', body.token);
    return body;
  }

  async function saveContent(content) {
    const token = sessionStorage.getItem('picahub.admin.token') || '';
    const res = await fetch(`${API_BASE}/api/content`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(content)
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.message || '저장에 실패했습니다.');
    return body;
  }

  function toRankShape(item) {
    const changeMap = { up: 'up', down: 'dn', same: 'eq' };
    return {
      n: Number(item.rank),
      name: item.name,
      pub: item.publisher,
      g: item.genre,
      pct: Number(item.share),
      d: changeMap[item.change] || item.change || 'eq',
      i: item.icon || String(item.name || '?').slice(0, 1)
    };
  }

  function renderServerNotices(notices) {
    const el = document.getElementById('noticeList');
    if (!el || !Array.isArray(notices)) return;
    const toneMap = { ai: 't-ai', gt: 't-gt', food: 't-food', sys: 't-sys', comm: 't-comm' };
    el.innerHTML = notices.map(item => {
      const tone = toneMap[item.tone] || 't-sys';
      return `<div class="ni"><span class="ntag ${tone}">${item.category}</span><span class="n-text">${item.title}</span><span class="n-date">${item.date}</span></div>`;
    }).join('');
  }

  async function hydrateDashboard() {
    if (!document.getElementById('rankList') && !document.getElementById('noticeList')) return;
    try {
      const content = await getContent();
      if (Array.isArray(content.rankings) && global.RANKS) {
        global.RANKS.splice(0, global.RANKS.length, ...content.rankings.map(toRankShape));
        if (global.renderRank) {
          global.renderRank('rankList', 10, true);
          global.renderRank('gamerRankList', 10, false);
        }
        if (global.renderProRank) global.renderProRank();
      }
      renderServerNotices(content.notices);
    } catch (error) {
      console.warn(error);
    }
  }

  global.PicaApi = { getContent, saveContent, adminLogin, hydrateDashboard };
})(window);
