# Marble Roulette Classroom

这是基于 [LazyGyu Marble Roulette](https://github.com/lazygyu/roulette) 制作的非官方课堂版本，遵循原项目 MIT License。

本版本保留原有地图与功能，并增加 Chaos Factory。课堂构建不使用统计、广告或外部头像服务，输入的姓名不会上传到服务器。

# Requirements

- Typescript
- Parcel
- box2d-wasm

# Maps

All original maps are preserved. `Chaos Factory` is appended as a fifth option in the existing Map selector.

Its course contains a gathering funnel, a physical six-arm windmill, asymmetric route split, compact pachinko field, three kinematic sliding gates, and a narrow glowing final funnel. It also enables a map-specific progress watchdog that applies a small physical impulse only when a marble has stopped making downward progress.

## 本地开发

```shell
npm install
npm run dev
```

打开 <http://localhost:1235>，选择 `Chaos Factory`，输入姓名并开始。仅在 localhost 下可使用 `?testSpeed=3` 加速重复测试，不改变固定步长物理参数。

## 构建与检查

```shell
npm run typecheck
npm run build
```

同时生成在线版和 Windows 便携版：

```powershell
npm run release
```

输出位于 `dist-online/`、`dist-portable/` 和 `release/`。

## 发布到免费的 GitHub Pages

1. 在 GitHub 创建一个公开仓库，例如 `marble-roulette-classroom`。
2. 上传本项目全部源码，保留 `LICENSE` 文件。
3. 打开仓库的 `Settings → Pages`。
4. 在 `Build and deployment → Source` 中选择 `GitHub Actions`。
5. 推送到 `main` 或 `master` 后，`.github/workflows/deploy.yml` 会自动检查、构建和发布。

项目网址通常为 `https://你的用户名.github.io/仓库名/`。以后添加地图并推送代码，网址保持不变。

更详细的逐步说明见 `docs/GITHUB_PAGES_上传指南.md`。

## Windows 10 U盘备用版

运行 `npm run release:portable` 后，将 `release/Marble-Roulette-Classroom-Windows.zip` 复制到 U 盘。学校电脑完整解压后双击“启动游戏.bat”即可，不需要 Node.js、管理员权限或互联网；使用结束后双击“关闭游戏.bat”。

## 添加下一张地图

Create a stage module under `src/data/maps/`, export a `StageDef`, then append it to `stages` in `src/data/maps.ts`. Static rails, circles, rotating kinematic boxes, and bounded linear kinematic movers can all be expressed as map entities; no core-game rewrite is required.
