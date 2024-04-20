import { Entity } from './Entity.js';

export class EntityManager {
  private _entities: Entity[] = [];

  public constructor(entities: Il2Cpp.Array<Il2Cpp.Object>) {
    for (let i = 0; i < entities.length; i++) {
      const entity = entities.get(i);
      const entityType = entity.method<Il2Cpp.Object>('get_EntityType').invoke();
      const entityGameType = entityType.field<Il2Cpp.String>('GameType').value.toString();
      this._entities.push(new Entity(entity, entityGameType));
    }
  }

  public get size(): number {
    return this._entities.length;
  }

  public get entities(): Entity[] {
    return this._entities;
  }

  public at(index: number): Entity {
    return this._entities[index];
  }
}
