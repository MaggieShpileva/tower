import type { Engine } from 'cooljs';
import * as constant from './constant';

export const checkMoveDown = (engine: Engine) =>
  engine.checkTimeMovement(constant.moveDownMovement);

export const getMoveDownValue = (
  engine: Engine,
  store?: { pixelsPerFrame: (n: number) => number },
) => {
  const pixelsPerFrame = store ? store.pixelsPerFrame : engine.pixelsPerFrame.bind(engine);
  const successCount = engine.getVariable(constant.successCount) as number;
  const calHeight = (engine.getVariable(constant.blockHeight) as number) * 2;
  if (successCount <= 4) {
    return pixelsPerFrame(calHeight * 1.25);
  }
  return pixelsPerFrame(calHeight);
};

export const getAngleBase = (engine: Engine) => {
  const successCount = engine.getVariable(constant.successCount) as number;
  const gameScore = engine.getVariable(constant.gameScore) as number;
  const gameUserOption = engine.getVariable(constant.gameUserOption) as TowerGameUserOption;
  const { hookAngle } = gameUserOption;
  if (hookAngle) {
    return hookAngle(successCount, gameScore);
  }
  if (engine.getVariable(constant.hardMode)) {
    return 90;
  }
  switch (true) {
    case successCount < 10:
      return 30;
    case successCount < 20:
      return 60;
    default:
      return 80;
  }
};

export const getSwingBlockVelocity = (engine: Engine, time: number) => {
  const successCount = engine.getVariable(constant.successCount) as number;
  const gameScore = engine.getVariable(constant.gameScore) as number;
  const { hookSpeed } = engine.getVariable(constant.gameUserOption) as TowerGameUserOption;
  if (hookSpeed) {
    return hookSpeed(successCount, gameScore);
  }
  let hard: number;
  switch (true) {
    case successCount < 1:
      hard = 0;
      break;
    case successCount < 10:
      hard = 1;
      break;
    case successCount < 20:
      hard = 0.8;
      break;
    case successCount < 30:
      hard = 0.7;
      break;
    default:
      hard = 0.74;
      break;
  }
  if (engine.getVariable(constant.hardMode)) {
    hard = 1.1;
  }
  return Math.sin(time / (200 / hard));
};

export const getLandBlockVelocity = (engine: Engine, time: number) => {
  const successCount = engine.getVariable(constant.successCount) as number;
  const gameScore = engine.getVariable(constant.gameScore) as number;
  const { landBlockSpeed } = engine.getVariable(constant.gameUserOption) as TowerGameUserOption;
  if (landBlockSpeed) {
    return landBlockSpeed(successCount, gameScore);
  }
  const { width } = engine;
  let hard: number;
  switch (true) {
    case successCount < 5:
      hard = 0;
      break;
    case successCount < 13:
      hard = 0.001;
      break;
    case successCount < 23:
      hard = 0.002;
      break;
    default:
      hard = 0.003;
      break;
  }
  return Math.cos(time / 200) * hard * width;
};

export const getHookStatus = (engine: Engine) => {
  if (engine.checkTimeMovement(constant.hookDownMovement)) {
    return constant.hookDown;
  }
  if (engine.checkTimeMovement(constant.hookUpMovement)) {
    return constant.hookUp;
  }
  return constant.hookNormal;
};

export const touchEventHandler = (engine: Engine) => {
  if (!engine.getVariable(constant.gameStartNow)) return;
  if (engine.debug && engine.paused) {
    return;
  }
  if (getHookStatus(engine) !== constant.hookNormal) {
    return;
  }
  engine.removeInstance('tutorial');
  engine.removeInstance('tutorial-arrow');
  const b = engine.getInstance(`block_${engine.getVariable(constant.blockCount)}`);
  if (b && b.status === constant.swing) {
    engine.setTimeMovement(constant.hookUpMovement, 500);
    b.status = constant.beforeDrop;
  }
};

export const addSuccessCount = (engine: Engine) => {
  const { setGameSuccess } = engine.getVariable(constant.gameUserOption) as TowerGameUserOption;
  const lastSuccessCount = engine.getVariable(constant.successCount) as number;
  const success = lastSuccessCount + 1;
  engine.setVariable(constant.successCount, success);
  if (engine.getVariable(constant.hardMode)) {
    engine.setVariable(
      constant.ropeHeight,
      engine.height * (engine.utils.random as (a: number, b: number) => number)(0.35, 0.55),
    );
  }
  if (setGameSuccess) setGameSuccess(success);
};

export const addFailedCount = (engine: Engine) => {
  const { setGameFailed } = engine.getVariable(constant.gameUserOption) as TowerGameUserOption;
  const lastFailedCount = engine.getVariable(constant.failedCount) as number;
  const failed = lastFailedCount + 1;
  engine.setVariable(constant.failedCount, failed);
  engine.setVariable(constant.perfectCount, 0);
  if (setGameFailed) setGameFailed(failed);
  if (failed >= 3) {
    engine.pauseAudio('bgm');
    engine.playAudio('game-over');
    engine.setVariable(constant.gameStartNow, false);
  }
};

export const addScore = (engine: Engine, isPerfect?: boolean) => {
  const { setGameScore, successScore, perfectScore } = engine.getVariable(
    constant.gameUserOption,
  ) as TowerGameUserOption;
  const lastPerfectCount = (engine.getVariable(constant.perfectCount, 0) as number) || 0;
  const lastGameScore = engine.getVariable(constant.gameScore) as number;
  const perfect = isPerfect ? lastPerfectCount + 1 : 0;
  const score = lastGameScore + (successScore || 25) + (perfectScore || 25) * perfect;
  engine.setVariable(constant.gameScore, score);
  engine.setVariable(constant.perfectCount, perfect);
  if (setGameScore) setGameScore(score);
};

export type TowerGameUserOption = {
  width: number;
  height: number;
  canvasId: string;
  soundOn: boolean;
  setGameScore?: (score: number) => void;
  setGameSuccess?: (count: number) => void;
  setGameFailed?: (failed: number) => void;
  hookAngle?: (successCount: number, gameScore: number) => number;
  hookSpeed?: (successCount: number, gameScore: number) => number;
  landBlockSpeed?: (successCount: number, gameScore: number) => number;
  successScore?: number;
  perfectScore?: number;
};

export const drawYellowString = (
  engine: Engine,
  option: {
    string: string | number;
    size: number;
    x: number;
    y: number;
    textAlign?: CanvasTextAlign;
    fontName?: string;
    fontWeight?: string;
  },
) => {
  const {
    string,
    size,
    x,
    y,
    textAlign,
    fontName = 'wenxue',
    fontWeight = 'normal',
  } = option;
  const { ctx } = engine;
  const fontSize = size;
  const lineSize = fontSize * 0.1;
  ctx.save();
  ctx.beginPath();
  const gradient = ctx.createLinearGradient(0, 0, 0, y);
  gradient.addColorStop(0, '#FAD961');
  gradient.addColorStop(1, '#F76B1C');
  ctx.fillStyle = gradient;
  ctx.lineWidth = lineSize;
  ctx.strokeStyle = '#FFF';
  ctx.textAlign = textAlign || 'center';
  ctx.font = `${fontWeight} ${fontSize}px ${fontName}`;
  ctx.strokeText(String(string), x, y);
  ctx.fillText(String(string), x, y);
  ctx.restore();
};
