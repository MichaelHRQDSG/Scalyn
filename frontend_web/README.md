# Scalyn Frontend Web

## 功能简介

- 展示八个量表入口卡片，点击即可选择对应量表
- **生活事件量表（LES）**、**中国大五人格问卷（CBF-PI-B）**、**匹兹堡睡眠质量指数（PSQI）**、**生活满意度量表（SWLS）** 已可完整作答
- 视觉采用低饱和绿、燕麦色、柔粉、雾蓝等莫兰迪配色
- 卡片圆角与柔和阴影，配合 framer-motion 入场与悬停动画
- 技术栈：Vite + React + TypeScript + framer-motion

## 量表入口

1. 生活事件量表（LES）——可作答
2. 中国大五人格问卷（CBF-PI-B）——可作答
3. 成人依恋量表（AAS）
4. 匹兹堡睡眠质量指数（PSQI）——可作答
5. 社会支持评定量表（SSRS）
6. 生活满意度量表（SWLS）——可作答
7. DSM-5 人格量表简版（PID-5-BF）
8. SCL-90 症状自评量表

## LES 作答说明

1. 进入后先阅读指导语，再点击「进入答题」
2. 共 48 项常见事件 + 2 项可自行补充；每页一题
3. 每题需回答：事件发生时间、性质、精神影响程度、影响持续时间
4. 每题四个维度全部选完后自动进入下一题；可通过「上一题」修改；未完成时可「保存进度」
5. 刺激量 = 影响程度 × 持续时间 × 发生次数；结果页展示总分、正/负性分与解读
6. 完成后结果写入 `frontend_web/result/les-*.json`

## CBF-PI-B 作答说明

1. 进入后先阅读指导语，再点击「进入答题」
2. 共 40 题，五个维度各 8 题：神经质（N）、尽责性（C）、宜人性（A）、开放性（O）、外向性（E）
3. 6 级计分：1=完全不符合 … 6=完全符合；每页一题，选完自动下一题
4. 反向题（5、8、13、15、18、32、36）在结果中按 `7 - 原始分` 换算
5. 结果页展示五维得分；结果写入 `frontend_web/result/cbf-*.json`

## PSQI 作答说明

1. 进入后先阅读指导语，再点击「进入答题」
2. 共 18 个作答页：上床时间、入睡分钟、起床时间、实际睡眠小时、睡眠困扰 a–j、总体睡眠质量、催眠药物、困倦、精力不足
3. 选择类题目选完自动下一题；时间/数值题填写后点击「确认并下一题」
4. Q5j 若非「无」，需补充说明
5. 结果按七成分计分（总分 0–21）；写入 `frontend_web/result/psqi-*.json`

## SWLS 作答说明

1. 进入后先阅读指导语，再点击「进入答题」
2. 共 5 题，每页只显示一题，7 点李克特（1–7）
3. 选择选项后自动跳转下一题；可通过「上一题」修改答案
4. 未完成时可「保存进度」（保存在浏览器 localStorage）
5. 完成后显示总分（5–35）及满意程度解读，并把结果写入 `frontend_web/result/*.json`

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
├─ result/                    # 作答结果 JSON（*.json 已忽略提交）
├─ index.html
├─ package.json
├─ vite.config.ts
├─ vite.plugins.ts            # 本地写入 result 的开发接口
└─ src/
   ├─ App.tsx
   ├─ main.tsx
   ├─ data/
   │  ├─ scales.ts
   │  ├─ swls.ts
   │  ├─ les.ts
   │  ├─ cbf.ts
   │  └─ psqi.ts
   ├─ lib/
   │  ├─ swlsProgress.ts
   │  ├─ saveSwlsResult.ts
   │  ├─ lesProgress.ts
   │  ├─ saveLesResult.ts
   │  ├─ cbfProgress.ts
   │  ├─ saveCbfResult.ts
   │  ├─ psqiProgress.ts
   │  └─ savePsqiResult.ts
   ├─ components/
   │  ├─ Atmosphere.tsx
   │  ├─ ScaleCard.tsx
   │  ├─ ScaleHome.tsx
   │  ├─ swls/SwlsFlow.tsx
   │  ├─ les/LesFlow.tsx
   │  ├─ cbf/CbfFlow.tsx
   │  └─ psqi/PsqiFlow.tsx
   └─ styles/global.css
```

## 说明

- 本目录与仓库中的 `frontend/`（Next.js 分析台）相互独立。
- 目前 LES、CBF-PI-B、PSQI、SWLS 已开放完整答题；其余量表入口会提示稍后开放。
- 若本机启用了系统代理，而 `npm install` 异常，可在当前终端先设置：

```powershell
$env:HTTP_PROXY = "http://127.0.0.1:7890"
$env:HTTPS_PROXY = "http://127.0.0.1:7890"
```
