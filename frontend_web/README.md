# Scalyn Frontend Web

## 功能简介

- 展示八个量表入口卡片，点击即可选择对应量表
- 视觉采用低饱和绿、燕麦色、柔粉、雾蓝等莫兰迪配色
- 卡片圆角与柔和阴影，配合 framer-motion 入场与悬停动画
- 技术栈：Vite + React + TypeScript + framer-motion

## 量表入口

1. 生活事件量表（LES）
2. 中国大五人格问卷（CBF-PI-B）
3. 成人依恋量表（AAS）
4. 匹兹堡睡眠质量指数（PSQI）
5. 社会支持评定量表（SSRS）
6. 生活满意度量表（SWLS）
7. DSM-5 人格量表简版（PID-5-BF）
8. SCL-90 症状自评量表

## 启动

需要本机已安装 Node.js（建议 18+）。

```powershell
cd D:\AI_jiweb\Scalyn\frontend_web
npm install
npm run dev
```

浏览器访问：<http://127.0.0.1:3000>

## 其他命令

```powershell
# 生产构建
npm run build

# 预览构建结果
npm run preview
```

## 目录结构

```text
frontend_web/
├─ index.html
├─ package.json
├─ vite.config.ts
└─ src/
   ├─ App.tsx
   ├─ main.tsx
   ├─ data/scales.ts          # 八张量表入口数据
   ├─ components/
   │  ├─ Atmosphere.tsx       # 背景氛围动画
   │  ├─ ScaleCard.tsx        # 单个量表入口卡
   │  └─ ScaleHome.tsx        # 首页布局
   └─ styles/global.css       # 全局样式与莫兰迪变量
```

## 说明

- 本目录与仓库中的 `frontend/`（Next.js 分析台）相互独立。
- 当前点击量表只会提示「答题页稍后开放」，不会进入答题。
- 若本机启用了系统代理，而 `npm install` 异常，可在当前终端先设置：

```powershell
$env:HTTP_PROXY = "http://127.0.0.1:7890"
$env:HTTPS_PROXY = "http://127.0.0.1:7890"
```
