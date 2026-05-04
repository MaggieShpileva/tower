import type { Engine, Instance } from 'cooljs';
import { checkMoveDown, getMoveDownValue } from './utils';
import * as constant from './constant';

const randomCloudImg = (instance: Instance) => {
  const { count } = instance;
  const clouds = ['c1', 'c2', 'c3'];
  const stones = ['c4', 'c5', 'c6', 'c7', 'c8'];
  const randomImg = (array: string[]) => array[Math.floor(Math.random() * array.length)];
  instance.imgName = (count as number) > 6 ? randomImg(stones) : randomImg(clouds);
};

export const cloudAction = (instance: Instance, engine: Engine) => {
  const random = engine.utils.random as (min: number, max: number) => number;
  if (!instance.ready) {
    instance.ready = true;
    randomCloudImg(instance);
    instance.width = engine.getVariable(constant.cloudSize) as number;
    instance.height = engine.getVariable(constant.cloudSize) as number;
    const engineW = engine.width;
    const engineH = engine.height;
    const positionArr = [
      { x: engineW * 0.1, y: -engineH * 0.66 },
      { x: engineW * 0.65, y: -engineH * 0.33 },
      { x: engineW * 0.1, y: 0 },
      { x: engineW * 0.65, y: engineH * 0.33 },
    ];
    const position = positionArr[(instance.index as number) - 1];
    instance.x = random(position.x, position.x * 1.2);
    instance.originX = instance.x;
    instance.ax =
      engine.pixelsPerFrame(
        instance.width *
          random(0.05, 0.08) *
          (engine.utils.randomPositiveNegative as () => number)(),
      );
    instance.y = random(position.y, position.y * 1.2);
  }
  instance.x += instance.ax as number;
  if (
    instance.x >= (instance.originX as number) + instance.width ||
    instance.x <= (instance.originX as number) - instance.width
  ) {
    (instance.ax as number) *= -1;
  }
  if (checkMoveDown(engine)) {
    instance.y += getMoveDownValue(engine) * 1.2;
  }
  if (instance.y >= engine.height) {
    instance.y = -engine.height * 0.66;
    instance.count = ((instance.count as number) || 0) + 4;
    randomCloudImg(instance);
  }
};

export const cloudPainter = (instance: Instance, engine: Engine) => {
  const { ctx } = engine;
  const cloud = engine.getImg(instance.imgName as string);
  ctx.drawImage(cloud, instance.x, instance.y, instance.width, instance.height);
};
