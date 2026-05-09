import { HashRouter, ROUTE_CHANGE } from './router.js';
import { GamePage } from './pages/gamePage.js';
import { LandingPage } from './pages/landingPage.js';
import { RankingPage } from './pages/rankingPage.js';

let _pendingLevelId = null;

export function setPendingLevelId(id) {
  _pendingLevelId = id;
}

export function consumePendingLevelId() {
  const val = _pendingLevelId;
  _pendingLevelId = null;
  return val;
}

const router = new HashRouter();

router.register('/', () => new LandingPage());

router.register('/game', () => new GamePage());

router.register('/levels', () => new GamePage());

router.register('/ranking', () => new RankingPage());

export { router, ROUTE_CHANGE };
