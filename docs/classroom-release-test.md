# Classroom distribution verification

Date: 2026-08-25
Target: Windows 10-compatible browser and PowerShell 5.1 portable launcher

## Build checks

- `npm run check`: passed.
- Online Parcel build with `/marble-roulette-classroom/` base path: passed.
- Portable Parcel build with relative asset paths: passed.
- Privacy scanner: passed for both 49-file outputs.
- Forbidden runtime strings absent: Umami endpoint, shop/ad endpoint, Google Analytics ID, ad API, external keyword API.

## Portable server checks

- Root HTML: HTTP 200, `text/html; charset=utf-8`.
- JavaScript: HTTP 200, JavaScript MIME type.
- Box2D WebAssembly: HTTP 200, `application/wasm`.
- Content Security Policy restricts resources and connections to self.
- Incorrect health token: HTTP 403.
- Percent-encoded directory traversal: HTTP 403.
- `启动游戏.bat`: starts the server and health endpoint successfully.
- `关闭游戏.bat`: authenticated shutdown succeeds and removes state files.
- Launch from a path containing Chinese characters and spaces: passed.
- Port selection uses the first free port from 8765 through 8775.

## Browser checks

- Privacy notice appears on the first load.
- All upstream maps plus Chaos Factory appear in both builds.
- Portable Chaos Factory, 10 marbles: all finished; 20.545 s simulated time; two anti-stuck nudges.
- Online project-path Wheel of Fortune, 5 marbles: all finished; 27.868 s simulated time.
- A fresh browser tab starts with default names rather than names entered in another tab.
- Classroom HUD, map, ranking, marble labels, and attribution remain readable.
