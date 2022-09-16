import './vite-env';
document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <pre><code>${JSON.stringify({ something: 'here' }, null, 2)}</code></pre>
`;
