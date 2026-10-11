(() => {
  'use strict';
  const root = document.getElementById('calos-site-statistics');
  if (!root || root.dataset.initialized) return;
  root.dataset.initialized = 'true';

  const runtime = root.querySelector('[data-calos-runtime]');
  const startedAt = Date.parse(root.dataset.startedAt);
  if (runtime && Number.isFinite(startedAt)) {
    const pad = number => String(number).padStart(2, '0');
    const tick = () => {
      const total = Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
      const days = Math.floor(total / 86400);
      const hours = Math.floor(total % 86400 / 3600);
      const minutes = Math.floor(total % 3600 / 60);
      const seconds = total % 60;
      runtime.textContent = `${days} 天 ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    };
    tick();
    setInterval(tick, 1000);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) tick(); });
  }

  if (root.dataset.visits !== 'true') return;
  const values = ['vercount_value_site_uv', 'vercount_value_site_pv'].map(id => document.getElementById(id));
  const host = location.hostname.toLowerCase();
  const local = !/^https?:$/.test(location.protocol) || host === 'localhost' || host.endsWith('.localhost') ||
    host === '::1' || host === '[::1]' || /^127\./.test(host) || /^10\./.test(host) || /^192\.168\./.test(host) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(host) || host.endsWith('.test');
  if (local) {
    values.forEach(value => { if (value) value.textContent = '上线后统计'; });
    return;
  }

  const isCount = text => /^\d[\d,]*$/.test(text.trim());
  const unavailable = () => values.forEach(value => {
    if (value && !isCount(value.textContent)) value.textContent = '暂不可用';
  });
  const observer = new MutationObserver(() => {
    values.forEach(value => {
      if (value && isCount(value.textContent)) {
        const number = Number(value.textContent.replace(/,/g, ''));
        const formatted = number.toLocaleString('zh-CN');
        if (value.textContent !== formatted) value.textContent = formatted;
      }
    });
  });
  values.forEach(value => { if (value) observer.observe(value, { childList: true, characterData: true, subtree: true }); });
  const script = document.createElement('script');
  script.src = 'https://events.vercount.one/js';
  script.defer = true;
  script.onerror = unavailable;
  document.head.append(script);
  setTimeout(unavailable, 12000);
})();
