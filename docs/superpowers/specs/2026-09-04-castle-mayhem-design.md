# Castle Mayhem Map Design

## Goal

Add one optional high-density map, `Castle Mayhem`, to the existing Marble Roulette game. Preserve every existing map without changing its files, order, physics parameters, or behavior.

The new map should respond to classroom feedback that Chaos Factory and Spring Canyon finish too quickly and contain too few mechanisms. Most Castle Mayhem races should last roughly 40–60 seconds, while every marble remains able to finish without a forced timeout.

## Scope

- Add `Castle Mayhem` as the final option in the existing map selector.
- Implement the map in a standalone `src/data/maps/castleMayhem.ts` module.
- Register the exported stage in `src/data/maps.ts`.
- Use only existing Box2D-backed static, rotating kinematic, and linearly moving kinematic entities.
- Do not add scripted boosts, slow zones, portals, or other special-effect systems.
- Keep Pirate Adventure Harbor and Space Station as future map ideas only.

## Course Structure

The course is approximately 215–235 physics units long, about 1.6–1.8 times the length of Spring Canyon. Mechanism groups are separated by only 6–12 units so the race feels like continuous action rather than isolated set pieces.

The course contains 14 groups:

1. **Castle gate funnel** gathers the starting line into a crowded central entrance.
2. **Swaying drawbridges** lift, slide, and redirect marbles with two slowly rotating long boards.
3. **Triple pendulums** use different speeds and directions to disrupt the order repeatedly.
4. **Cross guard gate** creates a large rotating timing obstacle.
5. **Shield bumper field** uses high-restitution circles and angled pads for visible ricochets.
6. **Rising portcullis** periodically delays the pack while leaving permanent escape gaps.
7. **Roller corridor** alternates rotation directions to speed up, slow down, or briefly reverse marbles.
8. **Squeezing stone walls** vary the corridor width without fully closing it.
9. **Central tower split** divides the pack into similar-length left and right routes.
10. **Left hammer route** uses rotating bars for forceful downward and sideways hits.
11. **Right spiral-stair route** uses staggered rotating boards for a stepped descent.
12. **Courtyard peg field** rejoins and remixes both routes.
13. **Staggered sliding gates** provide three offset openings that force repeated lane changes.
14. **Crown finish gate** combines a final rotating obstacle with a narrow funnel for late overtakes.

Every marble passes the shared groups and one of the two tower routes, experiencing roughly 12–13 distinct mechanism groups per race.

## Physical Effects

Different fixture properties and motions make each mechanism visibly distinct:

- Bumpers and shields use higher restitution for directional ricochets.
- Pendulums, cross gates, and hammers use varied angular velocities for light pushes, sweeps, and stronger hits.
- Portcullises and sliding gates create short waits that let trailing marbles catch up.
- Rollers and rotating stairs can accelerate a marble or briefly send it backward.
- The central tower separates the pack before the courtyard mixes it again.
- The crown gate can interrupt the leader without selecting a winner in code.

Results remain driven by Box2D simulation, marble-to-marble collisions, moving fixtures, and small spawn jitter. No random winner selection is introduced.

## Safety and Anti-Stuck Rules

- Continuous outer walls guard the full course.
- A moving mechanism must leave at least about two marble widths open at every extreme position.
- Avoid sharp V-shaped pockets and maintain clearance between moving bodies and nearby rails.
- Stagger pendulum and roller heights so two bodies cannot clamp the same marble.
- Use angled, open rejoin rails instead of narrow opposing corners that can form multi-marble arches.
- Enable the existing stage-specific anti-stuck behavior: after several seconds without meaningful downward progress, apply a gentle horizontal impulse and downward impulse.
- Do not enforce a maximum race duration or teleport marbles to the finish.

## Visual Direction

Use a child-friendly arcade castle palette rather than realistic medieval darkness:

- cool blue stone rails;
- gold drawbridges and shields;
- purple rotating gates;
- warm orange hammer route;
- green spiral-stair route;
- bright crown-colored finish funnel.

Obstacles must remain thick and high-contrast enough for a 16:9 classroom projector. Avoid explanatory text inside the playfield; color and shape should communicate route differences.

## Architecture

`castleMayhem.ts` owns its colors, helper constructors, generated bumper arrays, generated mechanism arrays, and exported `StageDef`. The core map registry receives one import and one appended array entry. The physics engine, camera, ranking, marble creation, UI, and all existing map modules remain unchanged.

The implementation uses the current entity capabilities:

- static polylines for continuous rails;
- static boxes and circles for shields, pads, and pegs;
- kinematic boxes with angular velocity for pendulums, hammers, rollers, stairs, and cross gates;
- kinematic boxes with linear motion for portcullises, squeezing walls, and sliding gates.

## Verification

Run the existing formatter check, TypeScript check, online build, and portable build. Then perform 16:9 browser playtests with skills disabled:

- multiple 5-marble races;
- multiple 10-marble races;
- multiple 20-marble races.

Verify that:

- all existing maps remain selectable and unchanged;
- Castle Mayhem loads and starts normally;
- all 14 groups render and collide physically;
- both central-tower routes are used across repeated races;
- no marble escapes, tunnels through walls, or remains permanently stalled;
- most observed races finish around 40–60 seconds, with reasonable variation allowed;
- winners and running order vary between races;
- names, ranking, minimap, and mechanisms remain readable at 16:9;
- the browser console contains no new errors.

## Delivery

After local verification, submit only the necessary new map module, map-registry change, and this design document to the existing GitHub `main` branch. Let GitHub Actions deploy automatically. Inspect the resulting workflow once; if it fails, report the cause before any retry.
