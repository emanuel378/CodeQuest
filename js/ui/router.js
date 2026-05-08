const ROUTE_CHANGE = 'router:change';

class HashRouter {
  constructor() {
    this.routes = new Map();
    this.currentPage = null;
    this.currentPath = '';
    this._resolving = false;
    this._pendingData = null;
  }

  register(path, pageFactory) {
    this.routes.set(path, pageFactory);
  }

  navigate(path, data = {}) {
    this._pendingData = data;
    if (window.location.hash === `#${path}`) {
      this._resolve(data);
    } else {
      window.location.hash = `#${path}`;
    }
  }

  start() {
    window.addEventListener('hashchange', () => this._resolve());
    window.addEventListener('popstate', () => this._resolve());
    this._resolve();
    if (!this.currentPage && !window.location.hash) {
      this.navigate('/');
    }
  }

  async _resolve(data) {
    if (this._resolving) return;
    this._resolving = true;

    if (data === undefined) {
      data = this._pendingData ?? {};
    }
    this._pendingData = null;

    const path = window.location.hash.slice(1) || '/';
    this.currentPath = path;

    if (this.currentPage) {
      await this.currentPage.unmount().catch(() => {});
      this.currentPage = null;
    }

    const factory = this.routes.get(path);
    if (factory) {
      try {
        this.currentPage = factory();
        await this.currentPage.mount();
      } catch (err) {
        console.error('[Router] Falha ao montar página:', err);
      }
    }

    document.dispatchEvent(new CustomEvent(ROUTE_CHANGE, { detail: { path, data } }));

    this._resolving = false;
  }
}

export { HashRouter, ROUTE_CHANGE };
