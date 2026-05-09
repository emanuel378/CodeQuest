import { PageComponent } from './pageComponent.js';
import { router, setPendingLevelId } from '../routes.js';
import { LevelSelectModal } from '../levelSelectModal.js';

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
        if (this._levelModal) return;
        this._levelModal = new LevelSelectModal((levelId) => {
          this._levelModal = null;
          setPendingLevelId(levelId);
          router.navigate('/game');
        });
        this._levelModal.show();
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
    if (this._levelModal) {
      this._levelModal._destroy();
      this._levelModal = null;
    }
  }
}

export { LandingPage };
