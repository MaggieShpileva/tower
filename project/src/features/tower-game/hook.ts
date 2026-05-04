import type { Engine, Instance } from 'cooljs';
import { getSwingBlockVelocity } from './utils';
import * as constant from './constant';

export const hookAction = (instance: Instance, engine: Engine, time: number) => {
  const ropeHeight = engine.getVariable(constant.ropeHeight) as number;
  if (!instance.ready) {
    instance.x = engine.width / 2;
    instance.y = ropeHeight * -1.5;
    instance.ready = true;
  }
  engine.getTimeMovement(
    constant.hookUpMovement,
    [[instance.y, instance.y - ropeHeight]],
    (value: number) => {
      instance.y = value;
    },
    {
      after: () => {
        instance.y = ropeHeight * -1.5;
      },
    },
  );
  engine.getTimeMovement(
    constant.hookDownMovement,
    [[instance.y, instance.y + ropeHeight]],
    (value: number) => {
      instance.y = value;
    },
    {
      name: 'hook',
    },
  );
  const initialAngle = engine.getVariable(constant.initialAngle) as number;
  instance.angle = initialAngle * getSwingBlockVelocity(engine, time);
  instance.weightX = instance.x + Math.sin(instance.angle) * ropeHeight;
  instance.weightY = instance.y + Math.cos(instance.angle) * ropeHeight;
};

export const hookPainter = (instance: Instance, engine: Engine) => {
  const { ctx } = engine;
  const ropeHeight = engine.getVariable(constant.ropeHeight) as number;
  const ropeWidth = ropeHeight * 0.1;
  const hook = engine.getImg('hook');
  ctx.save();
  ctx.translate(instance.x, instance.y);
  ctx.rotate(Math.PI * 2 - instance.angle);
  ctx.translate(-instance.x, -instance.y);
  engine.ctx.drawImage(hook, instance.x - ropeWidth / 2, instance.y, ropeWidth, ropeHeight + 5);
  ctx.restore();
};
