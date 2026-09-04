import Box2DFactory from 'box2d-wasm';
import type { StageDef } from './data/maps';
import type { IPhysics } from './IPhysics';
import type { EntityLinearMotion, MapEntity, MapEntityState } from './types/MapEntity.type';
import type { VectorLike } from './types/VectorLike';

type PhysicsEntity = {
  body: Box2D.b2Body;
  originX: number;
  originY: number;
  motionDirection: number;
  linearMotion?: EntityLinearMotion;
} & MapEntityState;

export class Box2dPhysics implements IPhysics {
  private Box2D!: typeof Box2D & EmscriptenModule;
  private gravity!: Box2D.b2Vec2;
  private world!: Box2D.b2World;

  private marbleMap: { [id: number]: Box2D.b2Body } = {};
  private entities: PhysicsEntity[] = [];

  private spawnJitterX = 0;
  private antiStuck?: StageDef['antiStuck'];
  private nudgeCount = 0;

  private deleteCandidates: Box2D.b2Body[] = [];

  async init(): Promise<void> {
    this.Box2D = await Box2DFactory();
    this.gravity = new this.Box2D.b2Vec2(0, 10);
    this.world = new this.Box2D.b2World(this.gravity);
    console.log('box2d ready');
  }

  clear(): void {
    this.clearEntities();
  }

  clearMarbles(): void {
    Object.values(this.marbleMap).forEach((body) => {
      this.world.DestroyBody(body);
    });
    this.marbleMap = {};
  }

  createStage(stage: StageDef): void {
    this.spawnJitterX = stage.spawnJitterX ?? 0;
    this.antiStuck = stage.antiStuck;
    this.nudgeCount = 0;
    this.createEntities(stage.entities);
  }

  createEntities(entities?: MapEntity[]) {
    if (!entities) return;

    const bodyTypes = {
      static: this.Box2D.b2_staticBody,
      kinematic: this.Box2D.b2_kinematicBody,
    } as const;

    entities.forEach((entity) => {
      const bodyDef = new this.Box2D.b2BodyDef();
      bodyDef.set_type(bodyTypes[entity.type]);
      const body = this.world.CreateBody(bodyDef);

      const fixtureDef = new this.Box2D.b2FixtureDef();
      fixtureDef.set_density(entity.props.density);
      fixtureDef.set_restitution(entity.props.restitution);

      let shape;
      switch (entity.shape.type) {
        case 'box':
          shape = new this.Box2D.b2PolygonShape();
          shape.SetAsBox(entity.shape.width, entity.shape.height, 0, entity.shape.rotation);
          fixtureDef.set_shape(shape);
          body.CreateFixture(fixtureDef);
          break;
        case 'polyline':
          shape = new this.Box2D.b2EdgeShape();
          for (let i = 0; i < entity.shape.points.length - 1; i++) {
            const p1 = entity.shape.points[i];
            const p2 = entity.shape.points[i + 1];
            const v1 = new this.Box2D.b2Vec2(p1[0], p1[1]);
            const v2 = new this.Box2D.b2Vec2(p2[0], p2[1]);
            const edge = new this.Box2D.b2EdgeShape();
            edge.SetTwoSided(v1, v2);
            body.CreateFixture(edge, 1);
          }
          break;
        case 'circle':
          shape = new this.Box2D.b2CircleShape();
          shape.set_m_radius(entity.shape.radius);
          fixtureDef.set_shape(shape);
          body.CreateFixture(fixtureDef);
          break;
      }

      const phaseAngle = (entity.linearMotion?.phase ?? 0) * Math.PI * 2;
      const motionOffset = entity.linearMotion ? Math.sin(phaseAngle) * entity.linearMotion.distance : 0;
      const x = entity.position.x + (entity.linearMotion?.axis === 'x' ? motionOffset : 0);
      const y = entity.position.y + (entity.linearMotion?.axis === 'y' ? motionOffset : 0);
      let motionDirection = Math.cos(phaseAngle) >= 0 ? 1 : -1;
      if (motionOffset >= (entity.linearMotion?.distance ?? Infinity)) motionDirection = -1;
      if (motionOffset <= -(entity.linearMotion?.distance ?? Infinity)) motionDirection = 1;

      body.SetAngularVelocity(entity.props.angularVelocity);
      body.SetTransform(new this.Box2D.b2Vec2(x, y), 0);
      this.entities.push({
        body,
        x,
        y,
        angle: 0,
        shape: entity.shape,
        life: entity.props.life ?? -1,
        originX: entity.position.x,
        originY: entity.position.y,
        motionDirection,
        linearMotion: entity.linearMotion,
      });
    });

    this.updateLinearMovers();
  }

  clearEntities() {
    this.entities.forEach((entity) => {
      this.world.DestroyBody(entity.body);
    });
    this.entities = [];
  }

  createMarble(id: number, x: number, y: number): void {
    const circleShape = new this.Box2D.b2CircleShape();
    circleShape.set_m_radius(0.25);

    const bodyDef = new this.Box2D.b2BodyDef();
    bodyDef.set_type(this.Box2D.b2_dynamicBody);
    const jitterX = this.spawnJitterX ? (Math.random() * 2 - 1) * this.spawnJitterX : 0;
    bodyDef.set_position(new this.Box2D.b2Vec2(x + jitterX, y));
    bodyDef.set_bullet(true);

    const body = this.world.CreateBody(bodyDef);
    body.CreateFixture(circleShape, 1 + Math.random());
    body.SetAwake(false);
    body.SetEnabled(false);
    this.marbleMap[id] = body;
  }

  shakeMarble(id: number, rescueLevel: number = 0): void {
    const body = this.marbleMap[id];
    if (body) {
      if (this.antiStuck) {
        const multiplier = Math.min(2.5, 1 + rescueLevel * 0.45);
        const horizontal = (Math.random() * 2 - 1) * this.antiStuck.horizontalImpulse * multiplier;
        const downward = this.antiStuck.downwardImpulse * multiplier;
        body.ApplyLinearImpulseToCenter(new this.Box2D.b2Vec2(horizontal, downward), true);
        this.nudgeCount++;
      } else {
        body.ApplyLinearImpulseToCenter(new this.Box2D.b2Vec2(Math.random() * 10 - 5, Math.random() * 10 - 5), true);
      }
    }
  }

  removeMarble(id: number): void {
    const marble = this.marbleMap[id];
    if (marble) {
      this.world.DestroyBody(marble);
      delete this.marbleMap[id];
    }
  }

  getMarblePosition(id: number): { x: number; y: number; angle: number } {
    const marble = this.marbleMap[id];
    if (marble) {
      const pos = marble.GetPosition();
      return { x: pos.x, y: pos.y, angle: marble.GetAngle() };
    } else {
      return { x: 0, y: 0, angle: 0 };
    }
  }

  getMarbleMotion(id: number): { x: number; y: number; angle: number; vx: number; vy: number } {
    const marble = this.marbleMap[id];
    if (!marble) return { x: 0, y: 0, angle: 0, vx: 0, vy: 0 };

    const pos = marble.GetPosition();
    const velocity = marble.GetLinearVelocity();
    return { x: pos.x, y: pos.y, angle: marble.GetAngle(), vx: velocity.x, vy: velocity.y };
  }

  getEntities(): MapEntityState[] {
    return this.entities.map((entity) => {
      const position = entity.body.GetPosition();
      return {
        x: position.x,
        y: position.y,
        angle: entity.body.GetAngle(),
        shape: entity.shape,
        life: entity.life,
      };
    });
  }

  impact(id: number): void {
    const src = this.marbleMap[id];
    if (!src) return;

    Object.values(this.marbleMap).forEach((body) => {
      if (body === src) return;

      const distVector = new this.Box2D.b2Vec2(body.GetPosition().x, body.GetPosition().y);
      distVector.op_sub(src.GetPosition());
      const distSq = distVector.LengthSquared();

      if (distSq < 100) {
        distVector.Normalize();
        const power = 1 - distVector.Length() / 10;
        distVector.op_mul(power * power * 5);
        body.ApplyLinearImpulseToCenter(distVector, true);
      }
    });
  }

  applyDirectionalImpulse(
    region: { x: number; y: number; width: number; height: number },
    impulse: VectorLike
  ): number {
    const minX = region.x - region.width / 2;
    const maxX = region.x + region.width / 2;
    const minY = region.y - region.height / 2;
    const maxY = region.y + region.height / 2;
    let affectedCount = 0;

    Object.values(this.marbleMap).forEach((body) => {
      const position = body.GetPosition();
      if (position.x < minX || position.x > maxX || position.y < minY || position.y > maxY) return;

      body.ApplyLinearImpulseToCenter(new this.Box2D.b2Vec2(impulse.x, impulse.y), true);
      affectedCount++;
    });

    return affectedCount;
  }

  getNudgeCount(): number {
    return this.nudgeCount;
  }

  start(): void {
    for (const key in this.marbleMap) {
      const marble = this.marbleMap[key];
      marble.SetAwake(true);
      marble.SetEnabled(true);
    }
  }

  step(deltaSeconds: number): void {
    this.deleteCandidates.forEach((body) => {
      this.world.DestroyBody(body);
    });
    this.deleteCandidates = [];

    this.updateLinearMovers();
    this.world.Step(deltaSeconds, 6, 2);

    for (let i = this.entities.length - 1; i >= 0; i--) {
      const entity = this.entities[i];
      if (entity.life > 0) {
        const edge = entity.body.GetContactList();
        if (edge.contact?.IsTouching()) {
          this.deleteCandidates.push(entity.body);
          this.entities.splice(i, 1);
        }
      }
    }
  }

  private updateLinearMovers() {
    this.entities.forEach((entity) => {
      const motion = entity.linearMotion;
      if (!motion) return;

      const position = entity.body.GetPosition();
      const current = motion.axis === 'x' ? position.x : position.y;
      const origin = motion.axis === 'x' ? entity.originX : entity.originY;
      if (current >= origin + motion.distance && entity.motionDirection > 0) entity.motionDirection = -1;
      if (current <= origin - motion.distance && entity.motionDirection < 0) entity.motionDirection = 1;

      const velocity = motion.speed * entity.motionDirection;
      entity.body.SetLinearVelocity(
        new this.Box2D.b2Vec2(motion.axis === 'x' ? velocity : 0, motion.axis === 'y' ? velocity : 0)
      );
    });
  }
}
