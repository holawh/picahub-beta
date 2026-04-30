/* PICA HUB — 통합 인증 모듈
 * 세션은 sessionStorage 에 저장한다 (브라우저 탭이 닫히면 만료).
 * 3개 테스트 계정만 인정한다.
 */
(function (global) {
  const KEY = 'picahub.session.v1';

  const ACCOUNTS = {
    owner: {
      id: 'owner',
      pw: 'owner1234',
      role: 'owner',
      roleLabel: '피카 가맹점주',
      name: '김사장님',
      avatar: '김',
      desc: '강남구 PC방그라운드 · 피카 가맹점주 · 오늘 매출: ₩842,000',
      email: 'owner@pcbang.test',
    },
    pro: {
      id: 'pro',
      pw: 'pro1234',
      role: 'pro',
      roleLabel: '게임트릭스 PRO',
      name: '이분석가',
      avatar: '이',
      desc: '게임코리아(주) · PRO 플랜 · 이번 달 GT리포트 3건 다운로드',
      email: 'pro@gametrics.test',
    },
    user: {
      id: 'user',
      pw: 'user1234',
      role: 'gamer',
      roleLabel: '일반 회원',
      name: '미디어웹',
      avatar: '미',
      desc: '피카플레이 연동 계정 · 마일리지 2,002 M · 오늘 방문 PC방: 강남점',
      email: 'user@pcbang.test',
    },
  };

  function getAccountById(id) {
    return ACCOUNTS[id] || null;
  }

  function listAccounts() {
    return Object.values(ACCOUNTS).map(({ pw, ...rest }) => rest);
  }

  function login(id, pw) {
    const acc = ACCOUNTS[id];
    if (!acc || acc.pw !== pw) {
      return { ok: false, message: '아이디 또는 비밀번호가 올바르지 않습니다.' };
    }
    const session = {
      id: acc.id,
      role: acc.role,
      roleLabel: acc.roleLabel,
      name: acc.name,
      avatar: acc.avatar,
      desc: acc.desc,
      email: acc.email,
      loginAt: new Date().toISOString(),
    };
    sessionStorage.setItem(KEY, JSON.stringify(session));
    return { ok: true, session };
  }

  function logout() {
    sessionStorage.removeItem(KEY);
  }

  function getSession() {
    try {
      const raw = sessionStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function requireSession(redirectTo) {
    const s = getSession();
    if (!s) {
      const target = redirectTo || 'login.html';
      window.location.replace(target);
      return null;
    }
    return s;
  }

  global.PicaAuth = {
    login,
    logout,
    getSession,
    requireSession,
    listAccounts,
    getAccountById,
  };
})(window);
