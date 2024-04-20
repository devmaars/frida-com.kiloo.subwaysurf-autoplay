import 'frida-il2cpp-bridge';
import { Player } from './Player.js';
import { Entity } from './Entity.js';
import { EntityManager } from './EntityManager.js';
import { EntityGameType, LaneDirection, SurfaceKind, TrackLane } from './types/enums.js';
import { getRandomNumber, sleep } from './util.js';

console.log('Script loaded successfully');

Il2Cpp.perform(() => {
  main().catch((err) => console.error(err));
});

const MASK_LAYER = -1;
const OBSTACLE_RANGE_THRESHOLD = 30;

async function main() {
  // Assemblies
  const Asm = Il2Cpp.domain.assembly('Assembly-CSharp');
  const UnityEngine = Il2Cpp.domain.assembly('UnityEngine.PhysicsModule');
  const UnityEngineCoreModule = Il2Cpp.domain.assembly('UnityEngine.CoreModule');

  // Classes & Structs
  // const RaycastHit = UnityEngine.image.class('UnityEngine.RaycastHit');
  const Physics = UnityEngine.image.class('UnityEngine.Physics');
  const Vector3 = UnityEngineCoreModule.image.class('UnityEngine.Vector3');
  const CharacterMotor = Asm.image.class('SYBO.RunnerCore.Character.CharacterMotor');
  const SubwayEntityHelper = Asm.image.class('SYBO.Subway.SubwayEntityHelper');

  // Methods
  // const Physics$Raycast = Physics.method('Raycast').overload(
  //   'UnityEngine.Vector3',
  //   'UnityEngine.Vector3',
  //   'UnityEngine.RaycastHit&',
  // );

  const Physics$RaycastAll = Physics.method<Il2Cpp.Array<Il2Cpp.Object>>('RaycastAll').overload(
    'UnityEngine.Vector3',
    'UnityEngine.Vector3',
  );

  // public static RaycastHit[] RaycastAll(Vector3 origin, Vector3 direction, float maxDistance, int layerMask)
  const Physics$RaycastAll$ = Physics.method<Il2Cpp.Array<Il2Cpp.Object>>('RaycastAll').overload(
    'UnityEngine.Vector3',
    'UnityEngine.Vector3',
    'System.Single',
    'System.Int32',
  );

  CharacterMotor.method('UpdateMovement').implementation = function () {
    const player = new Player(this as Il2Cpp.Object);

    // console.log(`Player on surface: ${player.surfaceKind}`);

    const entityManager = new EntityManager(
      SubwayEntityHelper.method<Il2Cpp.Object>('FindEntitiesWithinBox')
        .invoke(player.position.field<number>('z').value, 60)
        .method<Il2Cpp.Array<Il2Cpp.Object>>('ToArray')
        .invoke(),
    );

    for (let i = 0; i < entityManager.size; i++) {
      const entity = entityManager.at(i);

      if (!entity.isDangerous) {
        // console.log(`Entity ${entity.name} (${entity.gameType}) is not dangerous`);
        continue;
      }

      if (
        Vector3.method<number>('Dot').invoke(
          Vector3.method<Il2Cpp.Object>('op_Subtraction').invoke(entity.position, player.position),
          player.positionForward,
        ) < 0
      ) {
        // console.log(`Entity ${entity.name} (${entity.gameType}) is behind player`);
        continue;
      }

      // Check if the entity is within the range of the player
      const distance = parseFloat(
        Vector3.method<number>('Distance').invoke(entity.position, player.position).toFixed(2),
      );

      if (distance > OBSTACLE_RANGE_THRESHOLD) {
        // console.log(`Entity ${entity.name} is too far away from the player`);
        continue;
      }

      if (entity.lane !== player.lane && entity.gameType !== EntityGameType.Gate) {
        // console.log(`Entity ${entity.name} is not in the same lane as the player`);
        continue;
      }

      console.log(`${entity.name} (${entity.gameType}) is ${distance} units away from the player`);

      switch (entity.gameType) {
        case EntityGameType.Blocker:
          if (entity.name.toLocaleLowerCase().includes('jump')) this.method('Jump').invoke();
          else this.method('Dive').invoke();
          break;

        // TODO: Fix ugly code
        case EntityGameType.Gate:
          if (entity.name.toLocaleLowerCase().includes('sides')) {
            if (player.lane !== TrackLane.Left && player.lane !== TrackLane.Right)
              this.method('ChangeLane').invoke(LaneDirection.Left);
          } else if (entity.name.toLocaleLowerCase().includes('mid')) {
            if (player.lane === TrackLane.Left) this.method('ChangeLane').invoke(LaneDirection.Right);
            if (player.lane === TrackLane.Right) this.method('ChangeLane').invoke(LaneDirection.Left);
          } else if (entity.name.toLocaleLowerCase().includes('left')) {
            if (player.lane === TrackLane.Middle) this.method('ChangeLane').invoke(LaneDirection.Left);
            if (player.lane === TrackLane.Right)
              for (let i = 0; i < 2; i++) this.method('ChangeLane').invoke(LaneDirection.Left);
          } else if (entity.name.toLocaleLowerCase().includes('right')) {
            if (player.lane === TrackLane.Middle) this.method('ChangeLane').invoke(LaneDirection.Right);
            if (player.lane === TrackLane.Left)
              for (let i = 0; i < 2; i++) this.method('ChangeLane').invoke(LaneDirection.Right);
          }

          break;

        case EntityGameType.Bush:
        case EntityGameType.Dumpster:
        case EntityGameType.PowerBox:
          this.method('Jump').invoke();
          break;

        case EntityGameType.Platform:
        case EntityGameType.Ramp:
          break;

        case EntityGameType.Pillar:
        case EntityGameType.MovingTrain:
        case EntityGameType.StaticTrain:
          if (player.lane === TrackLane.Left) this.method('ChangeLane').invoke(LaneDirection.Right);
          else if (player.lane === TrackLane.Right) this.method('ChangeLane').invoke(LaneDirection.Left);
          else {
            // Raycast sideways to check for obstacles before changing lanes

            const positionLeft = Vector3.method<Il2Cpp.Object>('op_Multiply').invoke(player.positionRight, -1);

            // console.log(`player.position: ${player.position}`);
            // console.log(`player.positionRight: ${player.positionRight}`);
            // console.log(`positionLeft: ${positionLeft}`);

            // TODO: Fix raycast hit seem to be inverted on some occasions
            //  TODO:  Fix the raycast not hitting on some occasions

            const hitLeft = Physics$RaycastAll$.invoke(player.position, positionLeft, Infinity, MASK_LAYER);
            const hitRight = Physics$RaycastAll$.invoke(player.position, player.positionRight, Infinity, MASK_LAYER);

            console.log(`hitLeft: ${hitLeft}`);
            console.log(`hitRight: ${hitRight}`);

            const isHitLeft = hitLeft.length > 0;
            const isHitRight = hitRight.length > 0;

            if (isHitLeft && !isHitRight) this.method('ChangeLane').invoke(LaneDirection.Right);
            else if (!isHitLeft && isHitRight) this.method('ChangeLane').invoke(LaneDirection.Left);
            else {
              const direction = getRandomNumber(0, 1) === 0 ? LaneDirection.Left : LaneDirection.Right;
              this.method('ChangeLane').invoke(direction);
            }
          }

          // this.method('Fly').invoke(100, 1, 200, 0.5, 1);
          break;

        default:
          break;
      }
    }

    this.method('UpdateMovement').invoke();
  };
}
