# Scalyn

Scalyn 是一个使用前沿AI模型对同一用户的多个心理、行为或能力量表进行综合分析，并返回结构化多维度完整报告的 FastAPI 框架。

## 已实现

- 支持同时输入多个量表的总分、维度分和逐题回答。
- 使用OpenAI 兼容接口。
- 支持 `json_object` 和严格 `json_schema` 两种结构化输出方式。
- 对模型输出进行 Pydantic 二次校验，避免不完整 JSON 直接进入业务系统。
- 输出优势、关注点、跨量表洞察、风险、分阶段建议、追问与报告局限。
- 提示词约束模型不虚构常模、不进行医学诊断，并对高风险线索进行升级提示。
- API Key、模型、接口地址、超时等均使用环境变量配置。

## 项目结构

```text
Scalyn/
├─ examples/analysis-request.json  # 多量表示例请求
├─ src/scalyn/
│  ├─ api.py                       # HTTP API
│  ├─ config.py                    # 环境变量
│  ├─ main.py                      # FastAPI 入口
│  ├─ models.py                    # 输入与报告模型
│  ├─ prompts.py                   # 分析规则和提示词
│  ├─ qwen.py                      # 千问客户端及结构化输出
│  └─ service.py                   # 报告编排服务
└─ tests/
```

## 快速开始

项目使用名为 `scalyn` 的 Conda 环境，并通过 pip 安装 Python 依赖：

```powershell
cd D:\Code\VScode_File\Syapp\Scalyn
conda create -n scalyn python=3.11 -y
conda activate scalyn
python -m pip install -r requirements.txt
python -m pip install -e . --no-deps
Copy-Item .env.example .env
```

编辑 `.env`，至少填写：

```env
QWEN_API_KEY=你的千问API_Key
QWEN_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
QWEN_MODEL=qwen-plus
```

如千问工作空间提供了专属 API Host，应把 `QWEN_BASE_URL` 替换为控制台提供的完整 OpenAI 兼容地址。真实 `.env` 已被 Git 忽略。

启动：

```powershell
conda activate scalyn
cd D:\Code\VScode_File\Syapp\Scalyn
uvicorn scalyn.main:app --reload --host 127.0.0.1 --port 8000
```

接口文档：

- Swagger UI：<http://127.0.0.1:8000/docs>
- 健康检查：<http://127.0.0.1:8000/health>

## 调用示例

```powershell
$body = Get-Content .\examples\analysis-request.json -Raw
Invoke-RestMethod `
  -Uri http://127.0.0.1:8000/api/v1/reports/analyze `
  -Method Post `
  -ContentType "application/json; charset=utf-8" `
  -Body $body
```

请求中的每个量表至少应提供以下一种数据：

1. `total_score`；
2. `dimensions`；
3. `answers`。

量表计分和常模换算应尽量由确定性业务代码提前完成，再把结果交给大模型综合解释。不要让大模型替代量表原始计分程序。

## 结构化输出模式

默认使用兼容性更好的：

```env
QWEN_RESPONSE_FORMAT=json_object
```

如果所选模型明确支持严格 JSON Schema，可改为：

```env
QWEN_RESPONSE_FORMAT=json_schema
```

无论使用哪种模式，服务都会使用 `FullAnalysisReport` 对返回结果再次校验，并在失败时自动重试。

## 服务调用测试

在项目根目录直接调用分析服务（会真实请求千问）：

```powershell
conda activate scalyn
cd D:\Code\VScode_File\Syapp\Scalyn
python tests/test_call_service.py
```

如果服务已启动，也可走 HTTP：

```powershell
python tests/test_call_service.py --http
python tests/test_call_service.py --http --save .\tmp\report.json
```

## 测试与代码检查

```powershell
pytest
ruff check .
```

## 生产环境建议

- 不要上传姓名、手机号、证件号等非必要直接身份信息。
- 在网关增加认证、限流、请求体大小限制及审计日志。
- 对输入、模型原文和报告设置加密、脱敏及生命周期策略。
- 紧急风险不能只依赖大模型判断，应增加关键词、规则引擎和人工复核。
- 正式量表应遵守版权、适用人群、常模和专业人员解释要求。
- 报告应始终展示“不能替代专业诊断和紧急援助”的声明。

## 千问文档

- [OpenAI Chat API 参考](https://platform.qianwenai.com/docs/api-reference/chat/openai-chat)
- [结构化输出说明](https://platform.qianwenai.com/docs/developer-guides/text-generation/structured-output)

