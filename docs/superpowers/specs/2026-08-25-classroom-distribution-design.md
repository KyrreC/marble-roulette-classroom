# Marble Roulette Classroom Distribution Design

Date: 2026-08-25
Status: Approved direction, pending written-spec review

## Objective

Deliver the existing Marble Roulette project, including all four upstream maps and Chaos Factory, in two forms generated from one source tree:

1. A free GitHub Pages site with a stable URL for normal classroom use.
2. A Windows 10 portable ZIP that runs from a USB drive without Node.js, administrator rights, or internet access.

Future maps must be implemented once and appear in both outputs after the normal release build.

## Licensing and attribution

- Keep the upstream MIT `LICENSE` and its LazyGyu copyright notice in all source distributions.
- Add a clear README attribution and upstream repository link.
- Describe this project as an unofficial classroom-oriented derivative, not an official LazyGyu release.
- Do not copy code or art from the other reference projects; they remain implementation references only.
- No custom domain or paid GitHub feature is required. The intended deployment uses a public GitHub repository and GitHub Pages on GitHub Free.

## Classroom privacy profile

The classroom builds must not send student names or race participation to third-party services.

- Remove the Umami analytics script and all analytics calls, including marble-name tracking.
- Disable external advertisement retrieval and impression reporting.
- Remove the shop and advertising links from the classroom UI.
- Disable external keyword/sprite lookup so entered names never reach the upstream shop service.
- Keep name entry, colors, local rendering, maps, physics, ranking, Start, Reset, themes, recording, and locally packaged assets.
- Add a concise notice stating that entered names are processed only in the current browser session and are not uploaded by this build.
- Do not add cookies, accounts, databases, or server-side storage.

## Shared build architecture

The TypeScript/Parcel game remains the single source of truth. The release process produces two static builds:

- `dist-online`: assets use a GitHub Pages-compatible project path selected from the repository name during CI.
- `dist-portable`: assets use relative URLs and contain no dependency on the GitHub Pages path.

Both builds use the same compiled game code and map data. No portable-only map fork is allowed.

## Online edition

- A GitHub Actions workflow installs locked npm dependencies, runs lint and typecheck, builds the online artifact, and deploys it through the official GitHub Pages Actions flow.
- Deployment occurs on pushes to the default branch and can also be triggered manually.
- The repository name determines the project-site base path, avoiding a hard-coded `/roulette/` dependency.
- The site remains a static application; it does not require a backend.
- README contains the one-time GitHub setup steps and explains that updates retain the same site URL.

## Portable Windows 10 edition

The ZIP layout is:

```text
Marble-Roulette-Classroom/
  启动游戏.bat
  关闭游戏.bat
  使用说明.txt
  server.ps1
  game/
    index.html
    compiled assets...
```

`启动游戏.bat` launches a minimized PowerShell process and opens the system browser at a loopback address. `server.ps1` implements a small static-file server using `TcpListener`, so it does not require Node.js, Python, installation, network access, URL ACL registration, or administrator rights. It serves only `127.0.0.1`, rejects traversal outside `game/`, assigns MIME types required by JavaScript and WebAssembly, and writes its process ID beside the launcher. `关闭游戏.bat` stops only that recorded process.

If the preferred port is occupied, the server checks a short defined range, records the chosen port, and the launcher opens that address. Startup errors are written in clear Chinese and the window remains visible long enough to read them.

## Release workflow

A single local release command performs:

1. Lint and TypeScript checks.
2. Online static build.
3. Portable relative-path build.
4. Portable ZIP assembly.
5. A manifest containing build date, commit, and SHA-256 checksum.

Adding a future map requires only a new `StageDef` module plus registration in the existing stage list. Running the release command updates both delivery forms.

## Verification

Before delivery:

- Confirm lint, typecheck, and both production builds pass.
- Search built online and portable files for the removed analytics, ad, shop, and keyword service URLs.
- Verify all five map options load in the online build.
- Verify the portable build from a path containing Chinese characters and spaces.
- Verify portable startup without Node.js or internet dependency.
- Verify HTML, CSS, JavaScript, images, and Box2D WebAssembly return correct MIME types.
- Run a Chaos Factory race and an upstream-map smoke test in each distribution form.
- Confirm Start, Reset, ranking, long-name rendering, and anti-stuck behavior remain functional.
- Confirm the stop launcher does not terminate unrelated PowerShell processes.

## Non-goals

- No Windows executable installer or Electron wrapper.
- No paid hosting or custom domain.
- No user accounts, cloud name storage, telemetry, or advertising.
- No gameplay rewrite and no removal of upstream maps.
