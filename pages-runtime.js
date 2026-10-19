// The source CMS uses inclusive query-string ranges. Static hosting returns
// complete files, so reproduce the preview server's slicing in the browser.
(() => {
  const fetchOriginal = window.fetch.bind(window);
  window.fetch = async (input, init) => {
    const url = new URL(input instanceof Request ? input.url : input, location.href);
    const range = url.searchParams.get('range');
    if (url.origin !== location.origin || !url.pathname.endsWith('.framercms') || !range) {
      return fetchOriginal(input, init);
    }
    url.searchParams.delete('range');
    const response = await fetchOriginal(input instanceof Request ? new Request(url, input) : url, init);
    if (!response.ok) return response;
    const bytes = new Uint8Array(await response.arrayBuffer());
    const parts = range.split(',').map(part => {
      const match = /^(\d+)-(\d+)$/.exec(part);
      if (!match) throw new Error('Invalid CMS range');
      return bytes.slice(Number(match[1]), Number(match[2]) + 1);
    });
    return new Response(new Blob(parts), {status: 200, headers: {'Content-Type': 'application/octet-stream'}});
  };
})();
