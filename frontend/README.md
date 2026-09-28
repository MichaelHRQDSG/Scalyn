# Scalyn Frontend

简单的 Next.js 文本分析台。

## 启动

先启动后端（8000），再启动前端：

```powershell
cd D:\Code\VScode_File\Syapp\Scalyn\frontend
npm install
npm run dev
```

访问 http://127.0.0.1:3000

## 功能

- 输入任意文本并生成分析报告
- 每次调用保存为 `data/history/<id>.json`
- 右侧展示历史调用列表

## 环境变量

见 `.env.example`：

```env
SCALYN_API_BASE_URL=http://127.0.0.1:8000
```
