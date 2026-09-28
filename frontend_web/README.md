# Scalyn Frontend Web

## 功能简介

- 展示八个量表入口卡片，点击即可选择对应量表
- **生活满意度量表（SWLS）** 已可完整作答：指导语 → 单题作答 → 结果解读
- 视觉采用低饱和绿、燕麦色、柔粉、雾蓝等莫兰迪配色
- 卡片圆角与柔和阴影，配合 framer-motion 入场与悬停动画
- 技术栈：Vite + React + TypeScript + framer-motion

## 量表入口

1. 生活事件量表（LES）
2. 中国大五人格问卷（CBF-PI-B）
3. 成人依恋量表（AAS）
4. 匹兹堡睡眠质量指数（PSQI）
5. 社会支持评定量表（SSRS）
6. 生活满意度量表（SWLS）——可作答
7. DSM-5 人格量表简版（PID-5-BF）
8. SCL-90 症状自评量表

## SWLS 作答说明

1. 进入后先阅读指导语，再点击「进入答题」
2. 共 5 题，每页只显示一题，7 点李克特（1–7）
3. 选择选项后自动跳转下一题；可通过「上一题」修改答案
4. 未完成时可「保存进度」（保存在浏览器 localStorage）
5. 完成后显示总分（5–35）及满意程度解读

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
   ├─ data/
   │  ├─ scales.ts            # 八张量表入口数据
   │  └─ swls.ts              # SWLS 题目、选项与分数解读
   ├─ lib/
   │  └─ swlsProgress.ts      # 本地进度保存
   ├─ components/
   │  ├─ Atmosphere.tsx
   │  ├─ ScaleCard.tsx
   │  ├─ ScaleHome.tsx
   │  └─ swls/SwlsFlow.tsx    # 指导语 / 单题作答 / 结果
   └─ styles/global.css
```

## 说明

- 本目录与仓库中的 `frontend/`（Next.js 分析台）相互独立。
- 目前仅 SWLS 已开放完整答题；其余量表入口会提示稍后开放。
- 若本机启用了系统代理，而 `npm install` 异常，可在当前终端先设置：

```powershell
$env:HTTP_PROXY = "http://127.0.0.1:7890"
$env:HTTPS_PROXY = "http://127.0.0.1:7890"
```
