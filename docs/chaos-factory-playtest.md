# Chaos Factory playtest report

Tested at a 1600×900 browser viewport on 2026-08-25. Skills were disabled so the results exercised map physics rather than optional marble powers. The localhost-only `testSpeed=3` switch accelerated wall-clock execution; the table records fixed-step simulated time.

| Marbles | Rounds | Simulated duration | Completed | Out of bounds | Winners |
| --- | ---: | ---: | ---: | ---: | --- |
| 5 | 5 | 16.2–18.5 s | 5/5 | 0 | #5, #4, #1, #2, #3 |
| 10 | 5 | 16.5–23.5 s | 5/5 | 0 | #10, #10, #1, #10, #7 |
| 20 | 5 | 16.4–33.2 s | 5/5 | 0 | #2, #7, #11, #19, #9 |

Across the 20-ball runs, the windmill rotated 46.0–99.9 radians during a race. The three sliding gates moved roughly 1.4–4.0 map units over sampled frames. Anti-stuck nudges occurred only when progress stopped (1, 3, 9, 1, and 3 nudges respectively); every marble still finished. Route sampling observed both branches, and winners varied between rounds.

Additional checks:

- All five map-selector options load: the four upstream maps plus Chaos Factory.
- Long marble labels are grapheme-truncated and staggered above/below adjacent balls.
- Long winner names shrink, truncate when extreme, and use a canvas maximum width.
- Resetting and starting successive races does not leave ghost bodies or remove new marbles.
- The windmill and moving gates are Box2D kinematic bodies, not render-only animation.
