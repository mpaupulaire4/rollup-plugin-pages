import routes from 'virtual:fs-routes';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <pre><code>${JSON.stringify(routes, null, 2)}</code></pre>
`;
