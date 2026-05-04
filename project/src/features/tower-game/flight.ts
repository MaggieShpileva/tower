import type { Engine, Instance } from 'cooljs';
import { Instance as CoolInstance } from 'cooljs';
import * as constant from './constant';

type FlightType = 'bottomToTop' | 'leftToRight' | 'rightToLeft' | 'rightTopToLeft';

const getActionConfig = (engine: Engine, type: FlightType) => {
  const { width, height, utils } = engine;
  const { random } = utils as { random: (min: number, max: number) => number };
  const size = engine.getVariable(constant.cloudSize) as number;
  const actionTypes: Record<
    FlightType,
    { x: number; y: number; vx: number; vy: number }
  > = {
    bottomToTop: {
      x: width * random(0.3, 0.7),
      y: height,
      vx: 0,
      vy: engine.pixelsPerFrame(height) * 0.7 * -1,
    },
    leftToRight: {
      x: size * -1,
      y: height * random(0.3, 0.6),
      vx: engine.pixelsPerFrame(width) * 0.4,
      vy: engine.pixelsPerFrame(height) * 0.1 * -1,
    },
    rightToLeft: {
      x: width,
      y: height * random(0.2, 0.5),
      vx: engine.pixelsPerFrame(width) * 0.4 * -1,
      vy: engine.pixelsPerFrame(height) * 0.1,
    },
    rightTopToLeft: {
      x: width,
      y: 0,
      vx: engine.pixelsPerFrame(width) * 0.6 * -1,
      vy: engine.pixelsPerFrame(height) * 0.5,
    },
  };
  return actionTypes[type];
};

export const flightAction = (instance: Instance, engine: Engine) => {
  const { visible, ready, type } = instance;
  if (!visible) return;
  const size = engine.getVariable(constant.cloudSize) as number;
  if (!ready) {
    const action = getActionConfig(engine, type as FlightType);
    instance.ready = true;
    instance.width = size;
    instance.height = size;
    instance.x = action.x;
    instance.y = action.y;
    instance.vx = action.vx;
    instance.vy = action.vy;
  }
  instance.x += instance.vx as number;
  instance.y += instance.vy as number;
  if (
    instance.y + size < 0 ||
    instance.y > engine.height ||
    instance.x + size < 0 ||
    instance.x > engine.width
  ) {
    instance.visible = false;
  }
};

export const flightPainter = (instance: Instance, engine: Engine) => {
  const { ctx } = engine;
  const flight = engine.getImg(instance.imgName as string);
  ctx.drawImage(flight, instance.x, instance.y, instance.width, instance.height);
};

export const addFlight = (engine: Engine, number: number, type: FlightType) => {
  const flightCount = engine.getVariable(constant.flightCount) as number;
  if (flightCount === number) return;
  const flight = new CoolInstance({
    name: `flight_${number}`,
    action: flightAction,
    painter: flightPainter,
  }) as Instance;
  flight.imgName = `f${number}`;
  flight.type = type;
  engine.addInstance(flight, constant.flightLayer);
  engine.setVariable(constant.flightCount, number);
};
