declare module 'cooljs' {
  export class Engine {
    constructor(option?: Record<string, unknown>);
    width: number;
    height: number;
    calWidth: number;
    calHeight: number;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    debug: boolean;
    paused: boolean;
    soundOn: boolean;
    utils: Record<string, unknown>;
    customVariable: Record<string, unknown>;
    startAnimate: (engine: Engine, time: number) => void;
    endAnimate: (engine: Engine, time: number) => void;
    paintUnderInstance: (engine: Engine) => void;
    touchStartListener: (e?: Event) => void;
    animate: (time: number) => void;
    playBgm: () => void;
    pauseBgm: () => void;
    start: () => void;
    load: (
      onload?: () => void,
      loading?: (status: { success: number; total: number; failed: number }) => void,
    ) => void;
    init: () => void;
    addImg: (name: string, src: string, retry?: number) => void;
    addAudio: (name: string, src: string, retry?: number) => void;
    addLayer: (name: string) => void;
    swapLayer: (index1: number, index2: number) => void;
    addInstance: (instance: Instance, layer?: string) => void;
    removeInstance: (name: string) => void;
    getInstance: (name: string) => Instance | undefined;
    setVariable: (key: string, value: unknown) => void;
    getVariable: (key: string, defaultValue?: unknown) => unknown;
    setTimeMovement: (name: string, duration: number) => void;
    checkTimeMovement: (name: string) => boolean;
    getTimeMovement: (...args: unknown[]) => void;
    addKeyDownListener: (key: string, fn: () => void) => void;
    playAudio: (name: string, loop?: boolean) => void;
    pauseAudio: (name: string) => void;
    getAudio: (name: string) => HTMLAudioElement | undefined;
    pixelsPerFrame: (v: number) => number;
    getImg: (name: string) => HTMLImageElement;
    debugLineY: (x: number) => void;
    togglePaused: () => void;
    checkMoveDown?: (name: string) => boolean;
    __towerDisposed?: boolean;
  }

  export class Instance {
    constructor(option: { name: string; action: InstanceAction; painter: InstancePainter });
    name: string;
    visible: boolean;
    ready: boolean;
    status: string;
    x: number;
    y: number;
    width: number;
    height: number;
    angle: number;
    rotate: number;
    index: number;
    count: number;
    imgName: string;
    type: string;
    perfect?: boolean;
    updateWidth: (w: number) => void;
    updateHeight: (h: number) => void;
    calWidth: number;
    weightX: number;
    weightY: number;
    vy: number;
    ay: number;
    vx: number;
    startDropTime: number;
    outwardOffset: number;
    originOutwardAngle: number;
    originHypotenuse: number;
    collisionX: number;
    [key: string]: unknown;
  }

  export type InstanceAction = (instance: Instance, engine: Engine, time: number) => void;
  export type InstancePainter = (instance: Instance, engine: Engine) => void;
}
