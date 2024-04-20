export enum EntityGameType {
  Unknown = 'Unknown',
  Blocker = 'Blocker',
  Bush = 'Bush',
  Dumpster = 'Dumpster',
  Gate = 'Gate',
  Ground = 'Ground',
  LightSignal = 'LightSignal',
  MovingTrain = 'MovingTrain',
  StaticTrain = 'StaticTrain',
  Platform = 'Platform',
  PowerBox = 'PowerBox',
  Ramp = 'Ramp',
  SpawnLocation = 'SpawnLocation',
  Pillar = 'Pillar',
}

export enum TrackLane {
  Left = 'Left',
  Middle = 'Middle',
  Right = 'Right',
}

export enum LaneDirection {
  Left = -1,
  Right = 1,
}

export enum SurfaceKind {
  None = 'None',
  Default = 'Default',
  TrainTop = 'TrainTop',
  Ground = 'Ground',
}
