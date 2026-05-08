const ANIM_DURATION_ENTER = 400;
const ANIM_DURATION_EXIT = 350;

class PageComponent {
  container = document.getElementById('root');
  el = null;
  _boundEvents = [];

  async mount() {
    const frag = this._render();
    this.el = document.createElement('div');
    this.el.className = 'page-view';
    this.el.appendChild(frag);
    this.container.appendChild(this.el);

    this.el.classList.add('page-enter');
    this.el.classList.add('page-enter-active');
    this.el.offsetHeight;
    this._bindEvents();
    this._onDomReady();
    await this._waitForAnimation('slideInFromTop');

    this.el.classList.remove('page-enter', 'page-enter-active');
  }

  async unmount() {
    this._unbindEvents();

    this.el.classList.add('page-exit');
    this.el.classList.add('page-exit-active');
    this.el.offsetHeight;
    await this._waitForAnimation('slideDown');

    if (this.el && this.el.parentNode) {
      this.el.parentNode.removeChild(this.el);
    }
    this.el = null;
  }

  _render() {
    throw new Error('Subclass must implement _render()');
  }

  _bindEvents() {}

  _unbindEvents() {}

  _onDomReady() {}

  _waitForAnimation(name) {
    return new Promise(resolve => {
      const handler = () => {
        this.el.removeEventListener('animationend', handler);
        resolve();
      };
      this.el.addEventListener('animationend', handler);
      const duration =
        name === 'slideInFromTop' ? ANIM_DURATION_ENTER : ANIM_DURATION_EXIT;
      setTimeout(resolve, duration + 50);
    });
  }
}

export { PageComponent };
