import { GameObject } from './GameObject.js';

export class Player extends GameObject {
  constructor(instance: Il2Cpp.Object) {
    super(instance);
  }

  public get surfaceKind(): string {
    return this.instance.method<Il2Cpp.String>('GetSurfaceKind').invoke().toString();
  }
}
