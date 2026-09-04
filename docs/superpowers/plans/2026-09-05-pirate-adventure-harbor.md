# Pirate Adventure Harbor Implementation Plan

## Scope

Implement the approved Pirate Adventure Harbor map as one new selectable stage. Preserve all existing maps and settings. Add only the generic directional-burst capability required for the cannon. Complete local validation before updating remote `main` once.

## Task 1: Define the directional-burst data contract

Files:

- Create `src/types/StageEffect.type.ts`.
- Modify `src/data/maps.ts`.

Steps:

1. Define a discriminated `DirectionalBurstDef` with world position, rectangular bounds, impulse vector, interval, phase, warning duration, and colors.
2. Define `StageEffectDef` as a union beginning with `DirectionalBurstDef` so future effects can be added without changing existing stage fields.
3. Add optional `effects?: StageEffectDef[]` to `StageDef`.
4. Confirm every existing map compiles without declaring effects.
5. Run `npm run typecheck` and the non-mutating Biome check.

## Task 2: Add the bounded physics operation

Files:

- Modify `src/IPhysics.ts`.
- Modify `src/physics-box2d.ts`.

Steps:

1. Add a narrowly scoped `applyDirectionalImpulse` method accepting a rectangular world-space region and one impulse vector.
2. Iterate only current active marble bodies.
3. Use inclusive bounds and apply the same impulse to every marble whose center is inside the region.
4. Return the number of affected marbles for diagnostics.
5. Do not inspect names, ranking, order, color, or route.
6. Keep existing `impact` and anti-stall behavior unchanged.
7. Run type checking and Biome checking.

## Task 3: Implement the cannon controller and rendering

Files:

- Create `src/directionalBurstEffect.ts`.
- Modify `src/roulette.ts`.

Steps:

1. Implement a world-space controller for the deterministic cycle: idle, warning, and firing.
2. Start its clock when a race starts rather than when the menu loads.
3. During warning, render a bright cannon-mouth glow and a translucent influence-direction cue.
4. On the firing transition, call the injected physics callback exactly once and briefly render the burst.
5. Keep stage effects alive until all marbles finish, even after the configured winner has been announced.
6. Recreate and reset controllers when the map or round resets.
7. Include compact stage-effect state and affected-marble counts in `getDebugSnapshot` for browser verification.
8. Reuse the existing world-space effect render pass; do not add DOM overlays or menu controls.
9. Run type checking and Biome checking.

## Task 4: Build the Pirate Adventure Harbor geometry

Files:

- Create `src/data/maps/pirateAdventureHarbor.ts`.

Steps:

1. Add local helpers for rails, boxes, pegs, spinners, and multi-arm rotors.
2. Add continuous outer walls from above the spawn area to below the goal.
3. Implement the 18 approved zones in order:
   - boarding funnel;
   - counter-rotating helms;
   - barrel roller rack;
   - triple oar beaters;
   - six-arm capstan;
   - first split rudder;
   - cabin anchors or hull paddle wheels;
   - rejoin mixer;
   - chain pinwheel corridor;
   - double waterwheel;
   - anchor arm array;
   - three-arm mast carousel;
   - cannonball collision deck;
   - second split rudder;
   - storm rudders or dock cranes;
   - pirate cannon burst;
   - harbor propellers;
   - whirlpool wheel and dock finish.
4. Use physical route gates and rails; never assign a marble to a branch programmatically.
5. Keep large rotors approximately 0.8–1.5 rad/s, medium mechanisms 1.4–2.4 rad/s, and small mechanisms 2.2–3.2 rad/s.
6. Use slightly sloped or short resting surfaces so the geometry cannot hold a stationary marble indefinitely.
7. Configure total height near 260–285 units, small spawn jitter, goal and zoom positions, and progressive anti-stall values near the approved range.
8. Configure one directional burst at the cannon zone with about 600 ms warning.

## Task 5: Register the map without changing old maps

Files:

- Modify `src/data/maps.ts`.

Steps:

1. Import `pirateAdventureHarborStage`.
2. Append it after the existing maps without changing previous entries or their parameters.
3. Verify the menu contains all prior choices plus `Pirate Adventure Harbor`.
4. Confirm the default names and existing settings remain unchanged.

## Task 6: Static and build verification

Commands:

1. `npm run typecheck`
2. `npm run lint:check`
3. `npm run build:online`
4. `npm run build:portable`
5. `git diff --check`

Acceptance:

- All commands succeed.
- Both build privacy checks succeed.
- No old map file is modified.
- Generated build output remains uncommitted.

## Task 7: Browser playtesting and tuning

Use the local game with the existing localhost-only test speed and the canvas `data-roulette-debug` snapshot.

Test matrix:

1. Run at least three rounds with 5 marbles and skills disabled.
2. Run at least three rounds with 10 marbles and skills disabled.
3. Run at least three rounds with 20 marbles and skills disabled.
4. Run representative 10- and 20-marble rounds with skills enabled.

For each run, record simulated finish time, winner order, remaining marble positions, anti-stall nudge count, cannon cycles, and cannon hit counts. Capture screenshots of the opening, central rotating gauntlet, cannon warning or firing, and final whirlpool.

Tune geometry before anti-stall strength. Verify:

- all marbles finish;
- 5/10-marble rounds usually finish in 60–80 seconds;
- 20-marble rounds usually finish in 80–110 seconds;
- both short splits use both branches across repeated rounds;
- rotating mechanisms visibly scatter the pack;
- cannon warning precedes every impulse and only in-region marbles are affected;
- no boundary escape, tunneling, permanent seal, or repeatable spawn-order advantage occurs;
- the console contains no errors at 16:9.

After tuning, rerun Task 6.

## Task 8: Commit and deploy once

1. Review `git status` and the final diff; include only the approved map, directional-burst support, registration, and relevant documentation.
2. Commit the implementation locally with `feat: add Pirate Adventure Harbor map`.
3. Read the current remote `main` immediately before publication.
4. Apply the completed files on top of that remote tree and update `main` with a non-force fast-forward.
5. Let the existing GitHub Actions workflow deploy the site.
6. Inspect the single triggered run and verify the live menu after success.
7. If deployment fails, report the failure and logs without automatically rerunning it.

