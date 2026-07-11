(function initializeLaneGuard(root) {
  'use strict';

  const defaultPattern = Object.freeze([0, 2, 1, 2, 0, 1]);

  function createLaneDodgeGame(options = {}) {
    const sourcePattern = Array.isArray(options.obstaclePattern)
      ? options.obstaclePattern
      : defaultPattern;
    const obstaclePattern = sourcePattern.length >= 1
      && sourcePattern.length <= 12
      && sourcePattern.every(value => Number.isInteger(value) && value >= 0 && value <= 2)
      ? [...sourcePattern]
      : [...defaultPattern];
    const reducedMotion = options.reducedMotion === true;
    const onUpdate = typeof options.onUpdate === 'function' ? options.onUpdate : () => {};
    const onComplete = typeof options.onComplete === 'function' ? options.onComplete : () => {};
    const setTimeoutFn = options.setTimeoutFn || setTimeout;
    const clearTimeoutFn = options.clearTimeoutFn || clearTimeout;
    const movementStepMs = reducedMotion ? 650 : 220;
    const feedbackDurationMs = reducedMotion ? 300 : 420;

    let status = 'idle';
    let wave = 0;
    let score = 0;
    let playerLane = 1;
    let obstacleLane = null;
    let obstacleStep = 0;
    let feedback = null;
    let timerId = null;

    function getState() {
      return Object.freeze({
        status,
        wave,
        waves: obstaclePattern.length,
        score,
        playerLane,
        obstacleLane,
        obstacleStep,
        feedback,
        reducedMotion
      });
    }

    function emitUpdate() {
      const snapshot = getState();
      onUpdate(snapshot);
      return snapshot;
    }

    function clearTimer() {
      if (timerId !== null) {
        clearTimeoutFn(timerId);
        timerId = null;
      }
    }

    function schedule(callback, milliseconds) {
      clearTimer();
      timerId = setTimeoutFn(() => {
        timerId = null;
        callback();
      }, milliseconds);
    }

    function complete() {
      clearTimer();
      status = 'complete';
      feedback = null;
      const snapshot = emitUpdate();
      onComplete(snapshot);
      return snapshot;
    }

    function resolveWave() {
      if (status !== 'running') return getState();
      obstacleStep = 3;
      status = 'feedback';

      if (playerLane === obstacleLane) {
        feedback = 'hit';
        const snapshot = emitUpdate();
        schedule(complete, feedbackDurationMs);
        return snapshot;
      }

      score += 100;
      feedback = 'clear';
      const snapshot = emitUpdate();
      schedule(() => {
        if (status !== 'feedback') return;
        if (wave >= obstaclePattern.length) complete();
        else beginWave();
      }, feedbackDurationMs);
      return snapshot;
    }

    function advanceObstacle() {
      if (status !== 'running') return;
      obstacleStep += 1;
      if (obstacleStep >= 3) {
        resolveWave();
        return;
      }
      emitUpdate();
      schedule(advanceObstacle, movementStepMs);
    }

    function beginWave() {
      clearTimer();
      wave += 1;
      status = 'running';
      obstacleLane = obstaclePattern[wave - 1];
      obstacleStep = 0;
      feedback = null;
      const snapshot = emitUpdate();
      schedule(advanceObstacle, movementStepMs);
      return snapshot;
    }

    function start() {
      clearTimer();
      status = 'idle';
      wave = 0;
      score = 0;
      playerLane = 1;
      obstacleLane = null;
      obstacleStep = 0;
      feedback = null;
      return beginWave();
    }

    function chooseLane(lane) {
      if (status !== 'running' || !Number.isInteger(lane) || lane < 0 || lane > 2) {
        return getState();
      }
      playerLane = lane;
      return emitUpdate();
    }

    function reset() {
      clearTimer();
      status = 'idle';
      wave = 0;
      score = 0;
      playerLane = 1;
      obstacleLane = null;
      obstacleStep = 0;
      feedback = null;
      return emitUpdate();
    }

    function destroy() {
      clearTimer();
    }

    return Object.freeze({ start, chooseLane, reset, destroy, getState });
  }

  function createLaneGuardResultSummary(score, durationSeconds) {
    if (!Number.isInteger(score) || score < 0 || score > 600) {
      throw new TypeError('Lane Guard score must be an integer from 0 to 600.');
    }
    if (durationSeconds !== 18) {
      throw new TypeError('Lane Guard duration must be 18 seconds.');
    }

    let message = 'Choose a new lane and stay clear of the next obstacle.';
    if (score >= 600) message = 'Perfect escape. Can a friend clear every wave?';
    else if (score >= 300) message = 'Strong dodge. One cleaner lane choice can raise it.';
    else if (score > 0) message = 'Good start. Read the lane and move earlier.';
    return Object.freeze({ taps: score, durationSeconds, message });
  }

  function extendAppExports(app) {
    if (!app || typeof app !== 'object') throw new TypeError('App exports are required.');
    return Object.freeze({
      ...app,
      createLaneDodgeGame,
      getChallengeFormat(challenge = app.featuredChallenge) {
        if (challenge?.mechanic === 'lane-dodge') return `${challenge.waves} waves`;
        return app.getChallengeFormat(challenge);
      },
      createResultSummary(score, durationSeconds, challenge = app.featuredChallenge) {
        if (challenge?.mechanic === 'lane-dodge') {
          return createLaneGuardResultSummary(score, durationSeconds);
        }
        return app.createResultSummary(score, durationSeconds, challenge);
      }
    });
  }

  function installBrowserAdapter() {
    if (typeof root.__restoreLaneGuardCatalogBootstrap === 'function') {
      root.__restoreLaneGuardCatalogBootstrap();
      delete root.__restoreLaneGuardCatalogBootstrap;
    }

    if (!root.document
      || typeof root.createTapSprintGame !== 'function'
      || typeof root.getChallengeFormat !== 'function'
      || typeof root.createResultSummary !== 'function') return false;

    const documentObject = root.document;
    const originalCreateTapSprintGame = root.createTapSprintGame;
    const originalGetChallengeFormat = root.getChallengeFormat;
    const originalCreateResultSummary = root.createResultSummary;
    const laneNames = ['Left', 'Center', 'Right'];
    const stepNames = ['far away', 'approaching', 'close', 'at your row'];
    let laneSelected = new URLSearchParams(root.location.hash.slice(1)).get('challenge') === 'lane-guard';
    let activeLaneGame = null;
    let board = null;
    let lanes = [];
    let buttons = [];
    let obstacle = null;
    let player = null;
    let focusPending = false;

    const timingBoard = documentObject.querySelector('#timing-board');
    const timingTrack = timingBoard?.querySelector('.timing-track');
    const timingReadout = documentObject.querySelector('#timing-readout');
    const tapButton = documentObject.querySelector('#tap-button');
    const timeLabel = documentObject.querySelector('#time-label');
    const timeValue = documentObject.querySelector('#time-value');
    const tapCount = documentObject.querySelector('#tap-count');
    const scoreUnit = documentObject.querySelector('#score-unit');
    const gameStatus = documentObject.querySelector('#game-status');

    if (!timingBoard || !timingTrack || !timingReadout || !tapButton
      || !timeLabel || !timeValue || !tapCount || !scoreUnit || !gameStatus) return false;

    function ensureBoard() {
      if (board) return;

      const style = documentObject.createElement('style');
      style.id = 'lane-guard-styles';
      style.textContent = `
        .lane-guard-board { margin-block: 0.1rem 0.8rem; }
        .lane-guard-arena {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 0.45rem;
          min-height: 8.5rem;
        }
        .lane-guard-lane {
          position: relative;
          min-width: 0;
          overflow: hidden;
          border: 2px solid rgba(125, 211, 252, 0.35);
          border-radius: 0.85rem;
          background: rgba(15, 23, 42, 0.78);
        }
        .lane-guard-lane-label {
          position: absolute;
          inset: 0.25rem 0 auto;
          color: #cbd5e1;
          font-size: 0.72rem;
          font-weight: 700;
          text-align: center;
        }
        .lane-guard-obstacle,
        .lane-guard-player {
          position: absolute;
          left: 50%;
          width: 2rem;
          height: 1.25rem;
          border-radius: 0.45rem;
          transform: translateX(-50%);
        }
        .lane-guard-obstacle {
          top: 1.55rem;
          background: #f97316;
          border: 2px solid #fed7aa;
          transform: translate(-50%, calc(var(--obstacle-step, 0) * 1.55rem));
          transition: transform 180ms linear;
        }
        .lane-guard-player {
          bottom: 0.45rem;
          background: #38bdf8;
          border: 2px solid #e0f2fe;
        }
        .lane-guard-controls {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 0.45rem;
          margin-top: 0.6rem;
        }
        .lane-guard-choice {
          min-width: 0;
          min-height: 3rem;
          border: 2px solid rgba(125, 211, 252, 0.45);
          border-radius: 0.8rem;
          background: rgba(15, 23, 42, 0.9);
          color: #f8fafc;
          font-weight: 800;
          cursor: pointer;
        }
        .lane-guard-choice[aria-pressed="true"] {
          border-color: #f8fafc;
          background: #0369a1;
        }
        .lane-guard-choice:disabled { cursor: default; opacity: 0.76; }
        .lane-guard-choice:focus-visible {
          outline: 3px solid #c4b5fd;
          outline-offset: 3px;
        }
        .timing-board[data-mode="lane-guard"][data-feedback="clear"] .lane-guard-obstacle {
          animation: lane-guard-clear 320ms ease;
          background: #15803d;
        }
        .timing-board[data-mode="lane-guard"][data-feedback="hit"] .lane-guard-player {
          animation: lane-guard-hit 320ms ease;
          background: #b91c1c;
        }
        @keyframes lane-guard-clear {
          50% { opacity: 0.35; transform: translate(-50%, 4.65rem) scale(0.8); }
        }
        @keyframes lane-guard-hit {
          33% { transform: translateX(calc(-50% - 0.35rem)); }
          66% { transform: translateX(calc(-50% + 0.35rem)); }
        }
        @media (prefers-reduced-motion: reduce) {
          .lane-guard-obstacle { transition: none; }
          .timing-board[data-mode="lane-guard"] .lane-guard-obstacle,
          .timing-board[data-mode="lane-guard"] .lane-guard-player { animation: none !important; }
        }
      `;
      documentObject.head.append(style);

      board = documentObject.createElement('div');
      board.className = 'lane-guard-board';
      board.setAttribute('role', 'group');
      board.setAttribute('aria-label', 'Choose a safe lane');

      const arena = documentObject.createElement('div');
      arena.className = 'lane-guard-arena';
      lanes = laneNames.map(name => {
        const lane = documentObject.createElement('div');
        lane.className = 'lane-guard-lane';
        const label = documentObject.createElement('span');
        label.className = 'lane-guard-lane-label';
        label.textContent = name;
        lane.append(label);
        arena.append(lane);
        return lane;
      });

      obstacle = documentObject.createElement('span');
      obstacle.className = 'lane-guard-obstacle';
      obstacle.setAttribute('aria-hidden', 'true');
      player = documentObject.createElement('span');
      player.className = 'lane-guard-player';
      player.setAttribute('aria-hidden', 'true');

      const controls = documentObject.createElement('div');
      controls.className = 'lane-guard-controls';
      buttons = laneNames.map((name, index) => {
        const button = documentObject.createElement('button');
        button.type = 'button';
        button.className = 'lane-guard-choice';
        button.textContent = name;
        button.setAttribute('aria-label', `Move to ${name.toLowerCase()} lane`);
        button.setAttribute('aria-pressed', index === 1 ? 'true' : 'false');
        button.addEventListener('click', () => activeLaneGame?.chooseLane(index));
        controls.append(button);
        return button;
      });

      board.append(arena, controls);
      timingBoard.prepend(board);
    }

    function hideBoard() {
      if (board) board.hidden = true;
      timingBoard.removeAttribute('data-mode');
      timingBoard.removeAttribute('data-feedback');
      timingTrack.hidden = false;
      tapButton.hidden = false;
    }

    function render(state) {
      ensureBoard();
      timingBoard.hidden = false;
      timingBoard.dataset.mode = 'lane-guard';
      timingBoard.setAttribute('aria-label', 'Lane Guard dodge board');
      timingBoard.removeAttribute('data-feedback');
      timingTrack.hidden = true;
      board.hidden = false;
      tapButton.hidden = true;
      timeLabel.textContent = 'waves';
      scoreUnit.textContent = 'points';
      timeValue.textContent = `${state.wave}/${state.waves}`;
      tapCount.textContent = String(state.score);

      if (state.obstacleLane !== null) {
        lanes[state.obstacleLane].append(obstacle);
        obstacle.style.setProperty('--obstacle-step', String(state.obstacleStep));
      }
      lanes[state.playerLane].append(player);

      for (const [index, button] of buttons.entries()) {
        button.disabled = state.status !== 'running';
        button.setAttribute('aria-pressed', state.playerLane === index ? 'true' : 'false');
      }

      if (state.status === 'running') {
        timingReadout.textContent = `Wave ${state.wave}. ${laneNames[state.obstacleLane]} obstacle ${stepNames[state.obstacleStep]}.`;
        gameStatus.textContent = `You are in the ${laneNames[state.playerLane].toLowerCase()} lane`;
        if (focusPending) {
          focusPending = false;
          buttons[state.playerLane].focus();
        }
      } else if (state.status === 'feedback') {
        timingBoard.dataset.feedback = state.feedback;
        timingReadout.textContent = state.feedback === 'clear'
          ? `Clear. ${state.score} points.`
          : `Collision in the ${laneNames[state.obstacleLane].toLowerCase()} lane. ${state.score} points.`;
        gameStatus.textContent = state.feedback === 'clear' ? 'Wave cleared' : 'Obstacle hit';
      } else if (state.status === 'complete') {
        timingReadout.textContent = `Attempt complete. ${state.score} points.`;
        gameStatus.textContent = 'Dodge attempt complete';
      } else {
        timingReadout.textContent = 'Choose a safe lane before the obstacle arrives.';
        gameStatus.textContent = 'Ready';
      }
    }

    function mapState(state) {
      return Object.freeze({
        status: state.status === 'feedback' ? 'running' : state.status,
        taps: state.score,
        remainingSeconds: Math.max(0, state.waves - state.wave + (state.status === 'complete' ? 0 : 1)),
        durationSeconds: 18
      });
    }

    root.getChallengeFormat = function getChallengeFormatWithLaneGuard(challenge) {
      if (challenge?.mechanic === 'lane-dodge') return `${challenge.waves} waves`;
      return originalGetChallengeFormat(challenge);
    };

    root.createResultSummary = function createResultSummaryWithLaneGuard(score, durationSeconds, challenge) {
      if (challenge?.mechanic === 'lane-dodge') {
        return createLaneGuardResultSummary(score, durationSeconds);
      }
      return originalCreateResultSummary(score, durationSeconds, challenge);
    };

    root.createTapSprintGame = function createGameWithLaneGuard(options = {}) {
      if (!laneSelected || options.durationSeconds !== 18) {
        hideBoard();
        return originalCreateTapSprintGame(options);
      }

      const reducedMotion = typeof root.matchMedia === 'function'
        && root.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const coreOnUpdate = typeof options.onUpdate === 'function' ? options.onUpdate : () => {};
      const coreOnComplete = typeof options.onComplete === 'function' ? options.onComplete : () => {};
      const laneGame = createLaneDodgeGame({
        obstaclePattern: defaultPattern,
        reducedMotion,
        onUpdate(state) {
          coreOnUpdate(mapState(state));
          render(state);
        },
        onComplete(state) {
          coreOnComplete(mapState(state));
        }
      });
      activeLaneGame = laneGame;

      return Object.freeze({
        start() {
          focusPending = true;
          return mapState(laneGame.start());
        },
        tap() { return mapState(laneGame.getState()); },
        reset() { return mapState(laneGame.reset()); },
        destroy() {
          laneGame.destroy();
          if (activeLaneGame === laneGame) activeLaneGame = null;
        },
        getState() { return mapState(laneGame.getState()); }
      });
    };

    function refreshLaneCatalogOption() {
      const option = documentObject.querySelector('[data-challenge-id="lane-guard"]');
      if (!option) return;
      const meta = option.querySelector('.challenge-option-meta');
      if (meta) meta.textContent = 'Easy · 6 waves';
      option.setAttribute('aria-label', 'Lane Guard, Dodge, Easy, 6 waves');
    }

    documentObject.querySelector('#challenge-list')?.addEventListener('click', event => {
      const option = event.target.closest('[data-challenge-id]');
      if (!option) return;
      laneSelected = option.dataset.challengeId === 'lane-guard';
      if (!laneSelected) hideBoard();
      else refreshLaneCatalogOption();
    });

    refreshLaneCatalogOption();
    if (laneSelected) {
      const friendDuration = documentObject.querySelector('#friend-duration');
      if (friendDuration) friendDuration.textContent = '6 waves';
      const friendAnnouncement = documentObject.querySelector('#friend-announcement');
      const target = documentObject.querySelector('#friend-target-score')?.textContent;
      if (friendAnnouncement && target) {
        friendAnnouncement.textContent = `Lane Guard challenge. Beat ${target} points in 6 waves.`;
      }
    }

    return true;
  }

  if (typeof module !== 'undefined') {
    module.exports = {
      defaultPattern,
      createLaneDodgeGame,
      createLaneGuardResultSummary,
      extendAppExports
    };
  }

  if (typeof document !== 'undefined') installBrowserAdapter();
})(typeof globalThis !== 'undefined' ? globalThis : this);
