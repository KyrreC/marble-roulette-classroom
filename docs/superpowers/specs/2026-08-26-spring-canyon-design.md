# Spring Canyon Map Design

## Goal

Add one optional `Spring Canyon` map to the existing Marble Roulette game while preserving every existing map and the current game architecture. The map should be suitable for classroom projection, use genuine Box2D collisions, support longer races without permanent stalls, and require only narrowly scoped changes.

Also update the default marble names and remove the classroom privacy notice UI.

## Scope

- Add `Spring Canyon` as the final option in the existing map selector.
- Keep all existing maps unchanged and selectable.
- Change the default names to `A*2, B*2, C*2, D*2, E*2`.
- Remove the privacy notice button, modal, scripts, session-storage behavior, and now-unused notice styles.
- Keep the existing LazyGyu/MIT attribution.
- Do not recreate the repository or replace the physics/game framework.

## Implementation Approach

Create `src/data/maps/springCanyon.ts` following the established standalone map-module pattern used by Chaos Factory. Register one exported `StageDef` in `src/data/maps.ts`.

Spring behavior will use high-restitution static Box2D fixtures. This keeps every launch collision-driven and avoids adding contact hooks or map-specific behavior to the physics engine. Existing rotating and linearly moving kinematic bodies may be used for gates because they already participate in physical collisions.

## Course Layout

1. **Opening funnel** — wide rails gather the simultaneously released marbles and encourage early marble-to-marble collisions.
2. **Alternating spring descent** — three staggered, brightly colored high-restitution pads redirect marbles through a zigzag canyon.
3. **Two-route split** — one short route requires a stronger spring launch and has more interference; the longer switchback route is easier and more stable.
4. **Mechanical gate section** — a rotating gate and a small bumper group disrupt established order without fully sealing the course.
5. **Rejoin and final chute** — both routes merge into a narrowing descent where congestion and late overtakes can occur before the goal line.

Continuous outer rails and guarded transitions prevent marbles from leaving the playable area. Openings must remain wider than a marble diameter even at the most restrictive moving-obstacle position.

## Physics and Anti-Stuck Behavior

- Gravity remains the existing global Box2D gravity.
- Spring pads use fixture restitution rather than scripted winner selection or arbitrary upward teleportation.
- A small spawn-position jitter supplies initial variation.
- The stage enables the existing gentle anti-stuck impulse after several seconds without meaningful downward progress.
- There is no forced maximum race duration. Rescue impulses only restore motion and must remain weak enough not to dominate normal collisions.
- The map goal is placed below the guarded final chute so every valid finish is detected by the existing ranking system.

## UI Cleanup

Update the names textarea contents to `A*2, B*2, C*2, D*2, E*2`.

Remove the notice button, notice modal markup, notice open/close/session-storage JavaScript, and unused notice-specific CSS. Do not remove the attribution or change unrelated controls.

## Verification

Run the existing lint/type checks and produce both online and portable builds. Then run browser playtests with 5, 10, and 20 marbles, covering multiple races where practical. Verify:

- all old maps remain selectable;
- Spring Canyon is selectable and starts normally;
- spring pads and moving/rotating gates collide physically;
- marbles do not escape, tunnel through walls, or remain permanently stalled;
- both routes are used across repeated races;
- finish order is detected correctly;
- the default names and privacy-notice removal appear in built output;
- browser console contains no new errors.

## Delivery

After local verification, commit only the necessary changes to the branch that publishes as GitHub `main`, push once, and inspect the resulting GitHub Actions deployment once. If deployment fails, report the observed cause without repeatedly retrying.

