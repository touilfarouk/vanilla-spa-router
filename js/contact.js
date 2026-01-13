function init(params = {}) {
  const el = document.getElementById('main-page');
  if (!el) return;

  const values = Object.values(params);
  const queryObj = (window.router && typeof window.router.getCurrentQuery === 'function')
    ? window.router.getCurrentQuery()
    : {};
  const query = Object.keys(queryObj).length ? JSON.stringify(queryObj) : '';

  const info = document.createElement('div');
  info.style.marginTop = '1rem';
  info.innerHTML = `
    <div><strong>Route params:</strong> ${values.length ? values.join(', ') : 'none'}</div>
    ${query ? `<div><strong>Query:</strong> ${query}</div>` : ''}
  `;

  el.appendChild(info);
}

export { init };
