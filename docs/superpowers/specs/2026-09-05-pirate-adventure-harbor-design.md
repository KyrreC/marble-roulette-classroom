# Pirate Adventure Harbor Design

## Objective

Add **Pirate Adventure Harbor / 海盗冒险港** as a new selectable Marble Roulette map. Preserve every existing map and the original game flow. The new map should answer the classroom feedback that recent maps relied too heavily on horizontally moving platforms: most of its active obstacles must rotate, sweep, tumble, or swing and should repeatedly break up the marble pack.

The map is designed for classroom projection and should remain easy to understand at a glance. It must use physical simulation to determine results rather than selecting winners directly.

## Experience Goals

- Use a cartoon pirate harbor theme suitable for primary-school students.
- Create continuous, medium-strong physical chaos without repeatedly throwing marbles far backward.
- Arrange approximately 18 obstacle zones; each marble should encounter roughly 16 to 17 meaningful mechanisms because two zones contain short alternate routes.
- Escalate danger from the ship's upper deck to the final harbor whirlpool.
- Target 60 to 80 seconds for most 5- and 10-marble rounds.
- Target 80 to 110 seconds for most 20-marble rounds.
- Permit an occasional lagging marble to take longer, but never impose a forced race timeout and never allow a permanent stall.
- Keep marble names, ranking, and obstacle silhouettes legible on a 16:9 classroom display.

## Route Structure

The course is a long main channel with two short physical splits. Both splits rejoin quickly so that every marble sees nearly all of the map.

1. The starting pack enters through a wide boarding funnel.
2. The upper-deck mechanisms immediately scramble the spawn order.
3. A rotating rudder sends marbles into a short ship-cabin or hull-side route.
4. Both routes rejoin before a denser central sequence of anchors, waterwheels, and mast arms.
5. A second rotating rudder creates a short fast-risk or long-safe split.
6. Both routes rejoin before the cannon burst, harbor propellers, final whirlpool, and dock finish.

The course grows visually and mechanically more dangerous toward the finish. Ordinary left-right platforms may appear only when needed for routing and must not be used as the primary repeated obstacle.

## Obstacle Zones

### 1. Boarding Funnel

A broad entrance narrows toward the center, forcing the initially aligned marbles into contact before the first active obstacle.

### 2. Counter-Rotating Helms

Two large six-arm ship wheels rotate in opposite directions at different speeds. Their collision coverage should split the central pack toward both sides.

### 3. Barrel Roller Rack

Several offset rotating barrel-shaped bars carry marbles sideways before releasing them through gaps. Their stagger prevents the mechanism from behaving like one flat platform.

### 4. Triple Oar Beaters

Three rows of different-length rotating oars strike the pack in alternating directions. The oars should prevent the marbles from reforming into a straight queue.

### 5. Six-Arm Capstan

A slower, wide six-arm rotor makes some marbles travel partway around its hub before being released. Its large coverage creates bunching followed by separation.

### 6. First Split Rudder

A continuously rotating physical rudder determines which short route each marble enters. Route assignment must emerge from collision timing and must not be chosen in code.

### 7. Cabin and Hull Routes

- The shorter cabin route contains two stronger rotating anchor arms.
- The slightly longer hull-side route contains two consecutive paddle wheels with steadier motion.

Both branches remain enclosed and reconnect promptly.

### 8. Rejoin Mixer

A funnel recombines the two branches. A four-arm rotor at its exit keeps the first arrivals from immediately escaping and remixes the group.

### 9. Chain Pinwheel Corridor

Five small pinwheels alternate side, rotation direction, and speed. They create continuous small deflections instead of duplicating a conventional static pegboard.

### 10. Double Waterwheel

A clockwise upper wheel feeds an anticlockwise lower wheel. The second collision should be capable of reversing the lateral direction created by the first.

### 11. Anchor Arm Array

Three anchor-shaped rotating bars use different lengths and speeds. Their open phases must not synchronize, preventing a single permanent passage or blockage.

### 12. Three-Arm Mast Carousel

A large, slow three-arm mast covers much of the channel. It briefly holds the pack and then releases marbles in smaller groups. The remaining clearance must always exceed a marble diameter.

### 13. Cannonball Collision Deck

Large round bumpers and angled rails remix the pack before the second split. This zone provides visual and physical contrast between the major rotating assemblies.

### 14. Second Split Rudder

A rotating physical gate separates the pack again without scripted route selection.

### 15. Storm Passage and Dock Cranes

- The short storm route uses three fast compact rudders and has a greater chance of repeated hits or short backward movement.
- The longer dock route uses two slower long anchor arms and is more predictable.

The route lengths and obstacle strength should offset one another so neither branch is consistently superior.

### 16. Pirate Cannon Burst

This is the map's only new special-effect mechanism. The cannon gives approximately 0.6 seconds of bright visual warning, then applies a brief directional physical impulse to every marble inside its configured rectangular influence area. The firing interval is deterministic; variation comes from arrival timing, collisions, and marble position. The effect must never inspect marble names, rank, or spawn order.

### 17. Harbor Propeller Group

Three differently sized propellers overlap the main travel corridor without closing it. They remix the two routes and create late-race overtakes.

### 18. Whirlpool Wheel and Dock Finish

A large, slow eight-arm rotor sweeps marbles around the final basin before an enclosed funnel narrows to the goal. The funnel should permit temporary congestion and overtaking but must not combine with the rotor to form a permanent seal.

## Architecture

### Map Isolation

- Add `src/data/maps/pirateAdventureHarbor.ts` as the self-contained stage module.
- Import and append the stage in `src/data/maps.ts` without editing existing map definitions or changing their order.
- Reuse the existing static polyline, box, circle, angular-velocity, and linear-motion entity formats.
- Keep all pirate-specific geometry, colors, and helper functions inside the new module.

### Directional Burst Extension

Add one optional generic stage-effect definition for the cannon. A directional burst configuration should contain:

- position and rectangular influence dimensions;
- impulse direction and strength;
- firing interval and phase;
- warning duration;
- warning and burst colors.

The runtime should update configured bursts only for stages that declare them. The physics layer should expose a narrowly scoped operation that applies the same configured directional impulse to all active marble bodies inside the region. The renderer should show the warning and firing state without creating a collision object that could block the course.

Existing stages declare no burst effects and therefore retain identical behavior. No water currents, teleporters, accelerators, or other new effect types are included in this version.

## Physics Guidance

- Total map height: approximately 260 to 285 physics units.
- Large rotating mechanisms: approximately 0.8 to 1.5 radians per second.
- Medium helms and waterwheels: approximately 1.4 to 2.4 radians per second.
- Small oars and pinwheels: approximately 2.2 to 3.2 radians per second.
- Most surfaces: low to medium restitution so the course does not become an uncontrolled launch field.
- Cannonball bumpers and selected striking faces: higher restitution for visible deflection.
- Spawn position: small horizontal jitter only; do not choose routes or winners randomly.
- Boundary rails: continuous from above the spawn area to below the goal.
- Resting surfaces: slightly sloped or short enough for gravity to carry a marble to an edge.

Every visible moving obstacle must use a real kinematic collision body. Purely decorative animation must not be presented as a gameplay mechanism.

## Anti-Stall Behavior

The stage may configure the existing progressive anti-stall system. A marble that makes no meaningful downward progress for approximately 2.5 to 3 seconds receives a small randomized horizontal impulse and a small downward impulse. Repeated rescue attempts may scale gradually within the existing cap.

Geometry must be corrected before rescue strength is increased. The rescue system must not affect normally moving marbles, choose routes, determine ranking, or end the race after a fixed duration.

## Visual Direction

- Background: deep navy night sea.
- Structural rails and barrels: warm orange-brown wood.
- Helms and capstans: gold.
- Waterwheels and propellers: cyan or turquoise.
- Dangerous striking arms: coral red.
- Cannon warning: bright yellow with a clear warm-up state.
- Goal: bright, high-contrast dock light.

Avoid gambling imagery, weapons directed at characters, blood, frightening decoration, and large explanatory labels. Decorative pirate elements must not obscure marble names or imply collision where none exists.

## Verification Plan

Run at least three rounds each with 5, 10, and 20 marbles using skills disabled. Run additional representative rounds with skills enabled to check interaction with the cannon burst.

For every round, verify:

- all marbles eventually finish;
- no marble escapes the boundary or crosses a solid rail;
- every visible rotor, wheel, anchor, and mast has physical collision;
- the cannon affects only marbles inside its region and always shows its warning first;
- both sides of each split are reachable in repeated testing;
- branch choice and winner are not tied consistently to spawn order;
- the final rotor and funnel cannot permanently seal the goal;
- race timing remains near the target ranges;
- ranking and long names remain readable at 16:9;
- the browser console has no errors.

Run TypeScript checking, formatting/lint checking, the online build, the portable build, and the privacy verification included in both build workflows.

## Delivery Rules

- Preserve all old maps and settings.
- Commit only the new map, the generic directional-burst support, tests or diagnostics needed for it, and the map-list registration.
- Do not redesign menus or unrelated engine systems.
- Push one completed change to `main` and let the existing GitHub Actions workflow deploy it.
- If deployment fails, report the cause before attempting any retry.

