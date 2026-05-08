import { PageComponent } from './pageComponent.js';
import { router } from '../routes.js';

class LandingPage extends PageComponent {
  _render() {
    const template = document.getElementById('page-landing');
    return template.content.cloneNode(true);
  }

  _bindEvents() {
    this._handlers = [];

    const playBtns = this.el.querySelectorAll('[data-action="play"]');
    for (const btn of playBtns) {
      const handler = (e) => {
        e.preventDefault();
        router.navigate('/game');
      };
      btn.addEventListener('click', handler);
      this._handlers.push({ el: btn, type: 'click', handler });
    }

    const rankingBtn = this.el.querySelector('[data-action="ranking"]');
    if (rankingBtn) {
      const handler = (e) => {
        e.preventDefault();
        router.navigate('/ranking');
      };
      rankingBtn.addEventListener('click', handler);
      this._handlers.push({ el: rankingBtn, type: 'click', handler });
    }
  }

  _unbindEvents() {
    for (const { el, type, handler } of this._handlers) {
      el.removeEventListener(type, handler);
    }
    this._handlers = [];
  }
}

export { LandingPage };
