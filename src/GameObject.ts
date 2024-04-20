import { TrackLane } from './types/enums.js';

export abstract class GameObject {
  private _instance: Il2Cpp.Object;
  private _transform: Il2Cpp.Object;
  private _position: Il2Cpp.Object;
  private _positionForward: Il2Cpp.Object;
  private _positionRight: Il2Cpp.Object;

  constructor(instance: Il2Cpp.Object) {
    this._instance = instance;
    this._transform = this._instance.method<Il2Cpp.Object>('get_transform').invoke();
    this._position = this._transform.method<Il2Cpp.Object>('get_position').invoke();
    this._positionForward = this._transform.method<Il2Cpp.Object>('get_forward').invoke();
    this._positionRight = this._transform.method<Il2Cpp.Object>('get_right').invoke();
  }

  public get lane(): TrackLane {
    const x = this.position.field<number>('x').value;

    if (x < -1) return TrackLane.Left;
    if (x > 1) return TrackLane.Right;

    return TrackLane.Middle;
  }

  public get position(): Il2Cpp.Object {
    return this._position;
  }

  public get positionRight(): Il2Cpp.Object {
    return this._positionRight;
  }

  public get positionForward(): Il2Cpp.Object {
    return this._positionForward;
  }

  public get transform(): Il2Cpp.Object {
    return this._transform;
  }

  public get instance(): Il2Cpp.Object {
    return this._instance;
  }
}
