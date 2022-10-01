import routes from 'virtual:fs-routes';

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <pre><code>${JSON.stringify(routes, null, 2)}</code></pre>
`;
