import { GameObject } from './GameObject.js';
import { EntityGameType } from './types/enums.js';
import type { Player } from './Player.js';

export class Entity extends GameObject {
  protected _name: string;
  protected _gameType: string;

  constructor(instance: Il2Cpp.Object, gameType: string) {
    super(instance);
    this._name = instance.method<Il2Cpp.String>('get_name').invoke().toString();
    this._gameType = gameType;
  }

  public get name(): string {
    return this._name;
  }

  public get gameType(): string {
    return this._gameType;
  }

  public get isDangerous(): boolean {
    switch (this._gameType) {
      case EntityGameType.Gate:
      case EntityGameType.Ground:
      case EntityGameType.Blocker:
      case EntityGameType.Bush:
      case EntityGameType.Dumpster:
      case EntityGameType.PowerBox:
      case EntityGameType.Pillar:
      case EntityGameType.MovingTrain:
      case EntityGameType.StaticTrain:
        return true;

      default:
        return false;
    }
  }

  public toString(): string {
    return this.instance.toString();
  }
}
