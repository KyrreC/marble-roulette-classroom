# GitHub Pages 免费发布指南

本项目已配置自动发布。你只需要完成一次 GitHub 仓库创建和 Pages 开启，后续网址不会改变。

## 第一次发布

1. 注册或登录 [GitHub](https://github.com)。免费个人账号即可，不需要购买套餐。
2. 点击右上角 `+`，选择 `New repository`。
3. 仓库名称建议填写 `marble-roulette-classroom`。
4. 选择 `Public`。不要另外添加 README、License 或 `.gitignore`，因为源码包内已经包含。
5. 创建仓库后，先打开 `Settings → Pages`，把 `Build and deployment → Source` 设为 `GitHub Actions`。
6. 回到仓库首页，选择 `uploading an existing file`，把“GitHub源码包”解压后的全部内容拖进网页。必须包含 `.github`、`src`、`assets`、`portable`、`scripts` 等目录。
7. 点击页面底部的 `Commit changes`。
8. 打开仓库的 `Actions` 页面，等待绿色对勾。首次发布通常需要几分钟。
9. 回到 `Settings → Pages` 查看固定网址，通常是：

   `https://你的用户名.github.io/marble-roulette-classroom/`

如果第一次 Actions 在开启 Pages 之前已经运行并失败，开启 Pages 后进入失败记录，点击 `Re-run all jobs` 即可。

## 以后增加地图

地图只在同一套源码中维护。完成新地图后重新上传更新文件，GitHub Actions 会自动发布到原网址；学校电脑不需要重新设置。与此同时运行 `npm run release` 即可生成新版 U 盘 ZIP。

## 费用与署名

- 公开仓库和 GitHub Pages 可使用 GitHub Free。
- 不需要购买域名；默认 `github.io` 网址可以长期使用。
- 不要删除根目录的 `LICENSE`。
- README 和游戏页已经保留 LazyGyu 原项目署名，并明确标注为非官方课堂版本。
- 本构建不上传学生姓名，不包含统计、广告或外部头像请求。
