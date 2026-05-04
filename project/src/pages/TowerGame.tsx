import type { FC } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Engine } from 'cooljs';
import { createTowerGame } from '@/features/tower-game/createTowerGame';
import styles from './TowerGame.module.scss';

const CANVAS_ID = 'tower-game-canvas';

function computeGameSize() {
  const gameHeight = window.innerHeight;
  let gameWidth = window.innerWidth;
  const ratio = 1.5;
  if (gameHeight / gameWidth < ratio) {
    gameWidth = Math.ceil(gameHeight / ratio);
  }
  return { gameWidth, gameHeight };
}

export const TowerGame: FC = () => {
  const gameRef = useRef<Engine | null>(null);
  const gameStartedRef = useRef(false);
  const scoreRef = useRef(0);
  const loadErrorRef = useRef(false);
  const domReadyRef = useRef(document.readyState === 'complete');
  const canvasReadyRef = useRef(false);
  const revealScheduledRef = useRef(false);

  const [{ gameWidth, gameHeight }] = useState(computeGameSize);
  const [loadingPercent, setLoadingPercent] = useState('0%');
  const [phase, setPhase] = useState<'loading' | 'landing' | 'playing'>(
    'loading'
  );
  const [showCanvas, setShowCanvas] = useState(false);
  const [landingExiting, setLandingExiting] = useState(false);
  const [gameOverOpen, setGameOverOpen] = useState(false);
  const [modalScore, setModalScore] = useState(0);
  const [wxShareOpen, setWxShareOpen] = useState(false);

  const tryRevealLanding = useCallback(() => {
    if (
      !domReadyRef.current ||
      !canvasReadyRef.current ||
      revealScheduledRef.current
    )
      return;
    revealScheduledRef.current = true;
    setShowCanvas(true);
    window.setTimeout(() => {
      setPhase('landing');
    }, 1000);
  }, []);

  useEffect(() => {
    const scheduleReveal = () => {
      queueMicrotask(() => tryRevealLanding());
    };
    const onLoad = () => {
      domReadyRef.current = true;
      scheduleReveal();
    };
    if (document.readyState === 'complete') {
      domReadyRef.current = true;
      scheduleReveal();
    } else {
      window.addEventListener('load', onLoad);
    }
    return () => window.removeEventListener('load', onLoad);
  }, [tryRevealLanding]);

  const updateLoading = useCallback(
    (status: { success: number; total: number; failed: number }) => {
      const { success, total, failed } = status;
      if (failed > 0 && !loadErrorRef.current) {
        loadErrorRef.current = true;
        alert('Ошибка сети при загрузке. Попробуйте обновить страницу.');
        return;
      }
      let percent = total ? Math.floor((success / total) * 100) : 0;
      if (percent === 100 && !canvasReadyRef.current) {
        canvasReadyRef.current = true;
        tryRevealLanding();
      }
      percent = percent > 98 ? 98 : percent;
      setLoadingPercent(`${percent}%`);
    },
    [tryRevealLanding]
  );

  useEffect(() => {
    const canvas = document.getElementById(CANVAS_ID);
    if (!canvas) return;

    const option = {
      width: gameWidth,
      height: gameHeight,
      canvasId: CANVAS_ID,
      soundOn: true,
      assetsBaseUrl: '/tower-game/assets/',
      setGameScore: (s: number) => {
        scoreRef.current = s;
      },
      setGameFailed: (failed: number) => {
        setModalScore(scoreRef.current);
        if (failed >= 3) {
          setGameOverOpen(true);
        }
      },
    };

    const game = createTowerGame(option);
    gameRef.current = game;

    game.load(() => {
      game.init();
      // Не вызываем playBgm здесь: браузеры блокируют звук без явного действия пользователя (NotAllowedError).
    }, updateLoading);

    return () => {
      game.__towerDisposed = true;
      game.pauseBgm();
      game.touchStartListener = () => {};
      gameRef.current = null;
      gameStartedRef.current = false;
      canvasReadyRef.current = false;
      loadErrorRef.current = false;
      revealScheduledRef.current = false;
    };
  }, [gameWidth, gameHeight, updateLoading]);

  const handleStart = () => {
    const game = gameRef.current;
    if (!game || gameStartedRef.current) return;
    gameStartedRef.current = true;
    void game.playBgm();
    setLandingExiting(true);
    window.setTimeout(() => {
      setPhase('playing');
    }, 950);
    window.setTimeout(() => {
      game.start();
    }, 400);
  };

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div
      className={styles.root}
      style={{
        width: gameWidth,
        height: gameHeight,
        maxWidth: '100vw',
        margin: '0 auto',
      }}
    >
      <canvas
        id={CANVAS_ID}
        className={`${styles.canvas} ${showCanvas ? styles.canvasVisible : styles.canvasHidden}`}
      />

      {phase === 'loading' && (
        <div className={styles.loading}>
          <div className={styles.loadingMain}>
            <img src="/tower-game/assets/main-loading.gif" alt="" />
            <div className={styles.progress}>
              <div className={`${styles.title} ${styles.fontWenxue}`}>
                {loadingPercent}
              </div>
              <div className={styles.bar}>
                <div className={styles.sub}>
                  <div
                    className={styles.percent}
                    style={{ width: loadingPercent }}
                  />
                </div>
              </div>
              <div className={styles.text}>Загрузка…</div>
            </div>
          </div>
        </div>
      )}

      {(phase === 'landing' || phase === 'playing') && (
        <div
          className={`${styles.landing} ${phase === 'playing' ? styles.landingBehind : ''} ${landingExiting ? styles.landingExit : ''}`}
          aria-hidden={phase === 'playing'}
        >
          <div
            className={`${styles.action1} ${landingExiting ? styles.slideTop : ''}`}
          >
            <img
              src="/tower-game/assets/main-index-title.png"
              className={`${styles.titleImg} ${styles.swing}`}
              alt="Tower"
            />
          </div>
          <div
            className={`${styles.action2} ${landingExiting ? styles.slideBottom : ''}`}
          >
            <button
              type="button"
              className={styles.startBtn}
              onClick={handleStart}
            >
              <img
                src="/tower-game/assets/main-index-start.png"
                className={styles.startImg}
                alt="Старт"
              />
            </button>
          </div>
        </div>
      )}

      {gameOverOpen && (
        <div className={styles.modal}>
          <div className={styles.mask} />
          <div className={styles.modalContent} style={{ width: gameWidth }}>
            <div className={styles.modalMain}>
              <div className={styles.container}>
                <img
                  src="/tower-game/assets/main-modal-bg.png"
                  className={styles.modalBg}
                  alt=""
                />
                <div className={styles.modalInner}>
                  <img
                    src="/tower-game/assets/main-modal-over.png"
                    className={styles.overImg}
                    alt="Игра окончена"
                  />
                  <div className={`${styles.overScore} ${styles.fontWenxue}`}>
                    {modalScore}
                  </div>
                  <div className={styles.tip}>
                    <p>Попробуйте ещё раз!</p>
                    <button
                      type="button"
                      className={styles.modalBtn}
                      onClick={handleReload}
                    >
                      <img
                        src="/tower-game/assets/main-modal-again-b.png"
                        alt="Заново"
                      />
                    </button>
                    <button
                      type="button"
                      className={styles.modalBtn}
                      onClick={() => setWxShareOpen(true)}
                    >
                      <img
                        src="/tower-game/assets/main-modal-invite-b.png"
                        alt="Поделиться"
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {wxShareOpen && (
        <button
          type="button"
          className={styles.wxShare}
          aria-label="Закрыть"
          onClick={() => setWxShareOpen(false)}
        >
          <img src="/tower-game/assets/main-share-icon.png" alt="" />
        </button>
      )}
    </div>
  );
};
