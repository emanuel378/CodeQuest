import { HashRouter, ROUTE_CHANGE } from './router.js';
import { GamePage } from './pages/gamePage.js';
import { LandingPage } from './pages/landingPage.js';
import { RankingPage } from './pages/rankingPage.js';

const router = new HashRouter();

router.register('/', () => new LandingPage());

router.register('/game', () => new GamePage());

router.register('/levels', () => new GamePage());

router.register('/ranking', () => new RankingPage());

export { router, ROUTE_CHANGE };
