export function navigate(path: string) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export function setupLinkInterception() {
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const link = target.closest('a');

    if (link && link.href && link.href.startsWith(window.location.origin)) {
      const url = new URL(link.href);

      if (url.pathname !== window.location.pathname) {
        e.preventDefault();
        navigate(url.pathname);
      }
    }
  });
}
