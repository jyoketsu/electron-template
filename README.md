# electron-template

An Electron application with React and TypeScript

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## Project Setup

### Install

```bash
$ pnpm install
```

### Development

```bash
$ pnpm dev
```

### Build

准备一张 1024x1024 的 PNG，用 electron-icon-builder 一键生成三个平台所需格式：

```bash
$ npx electron-icon-builder --input=icon.png --output=build
```
会自动生成 icon.ico、icon.icns、以及各尺寸 PNG。

```bash
# For windows
$ pnpm build:win

# For macOS
$ pnpm build:mac

# For Linux
$ pnpm build:linux
```

- mac 未签名：用户首次安装后可能提示"已损坏"，执行 `xattr -cr /Applications/Electron\ Template.app` 即可