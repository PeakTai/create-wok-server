## 核心规则

### 技能文档

在回答问题前，首先尝试寻找合适的 wok-server 的技能文档，了解框架如何使用再回答问题。

如果找不到文档，请为项目安装 wok-server 的技能文档：

* 安装 wok-server 的技能文档：`npx skills add https://gitee.com/tai/wok-server.git --all`

### 消除幻觉，禁止瞎编

按照技能文档中的指导，寻找 api 的定义文件，阅读参数信息，禁止瞎猜。

也可以通过下面的路径来寻找定义文件，了解框架的完整 api 定义。

wok-server 框架的定义文件在 node_modules/wok-server/types 目录下。

### 不要急着写代码

如果对话里只是让分析问题，要求给出计划或者方案，不要直接写代码。先
给出分析结果或者完整方案，最后询问是否按计划来执行，在得到明确的确认回复后才开始写代码。

## 代码对比示例（AI 易错点）

### 后端规范

#### 1. 错误处理与接口反馈

**禁止静默返回**，必须给出明确的错误提示。唯一例外：删除接口中，如果要删除的数据本来就不存在，可以静默返回。

```ts
// ❌ 错误：权限校验静默返回
if (!session || session.user_id !== user.user_id) {
  return  // 错误：权限校验失败不应静默返回
}

// ✅ 删除接口正确做法：数据不存在可静默，权限不足必须抛出异常
if (!session) {
  return  // OK：删除接口中数据不存在可静默返回
}
if (session.user_id !== user.user_id) {
  throw new ForbiddenBizException()  // 必须抛出：权限不足
}

// ✅ 非删除接口：必须明确反馈
if (!session) {
  throw new BusinessException('Session not found')
}
if (session.user_id !== user.user_id) {
  throw new ForbiddenBizException()
}
```


#### 2. MySQL 更新方法传参

利用框架自动忽略 `undefined`，**不要**手动构建 `updateData` 对象：

```ts
// ❌ 啰嗦，不推荐
const updateData: Partial<Knowledge> = {}
if (body.name !== undefined) updateData.name = body.name
if (body.desc !== undefined) updateData.desc = body.desc

await session.updateOne(tableKnowledge, where, updateData)
```

```ts
// ✅ 简洁直观，推荐
await session.updateOne(tableKnowledge, where, {
  name: body.name,
  desc: body.desc,
  question_prompt: body.question_prompt
})
```

#### 3. MySQL 更新接口参数必填性

更新接口出现的字段其必填性应与实体类一致：

```ts
// ❌ 不推荐：name 在实体中是必填，这里却设成了可选
interface UpdateForm {
  id: string
  name?: string
  desc?: string
}

// ✅ 推荐：出现的字段与实体类保持一致的必填性
interface UpdateForm {
  id: string
  name: string
  desc?: string
}
```

#### 4. Entity 状态字段约束

Entity 中的**状态字段禁止使用 `string` 类型**，必须使用**联合类型**精确约束所有合法值：

```ts
// ❌ 错误：使用 string 类型，没有任何约束
interface Session {
  status: string  // 任何字符串都可以通过编译
}

// ✅ 正确：使用联合类型，精确约束
interface Session {
  /**
   * 会话状态：临时、活跃
   */
  status: 'temporary' | 'active'
}

interface Article {
  /**
   * 状态：草稿、已发布
   */
  status: 'draft' | 'published'
}
```

**为什么必须这样做**：联合类型提供编译期检查，`string` 类型允许任何值，一旦写错（如 `'temprary'` vs `'temporary'`）不会报错，运行时难以排查。

**检查方法**：定义或修改 Entity 时，检查每个 `status` 字段，确保它是联合类型而非 `string`。

#### 5. API Response 接口中枚举/联合类型必须引用实体类型

在 API 的 Response 接口中定义字段时：
- **枚举/联合类型字段**（如 `status`、`type`）**必须引用实体的类型定义**，禁止手写字面量值或使用 `number`/`string`
- **原始类型字段**（如 `number`、`string`、`boolean`）直接用原始类型，不要过度引用

```ts
// ❌ 错误：手写字面量值，与实体定义脱节
interface Resp {
  status?: number  // number 无法约束合法值
  task?: {
    type: 'video' | 'document' | 'exam'  // 实体变了这里不会同步
  }
}

// ❌ 错误：原始类型也去引用实体，过度设计
interface Resp {
  duration: Task['duration']  // duration 本来就是 number，没必要
}

// ✅ 正确：枚举/联合类型引用实体，原始类型直接用
import { User } from './user'
import { Task } from './task'

interface Resp {
  status?: User['status']              // 引用实体的联合类型
  task?: {
    type: Task['type']                 // 引用实体的联合类型
    duration: number                   // 原始类型直接用
  }
}
```

**为什么**：联合类型的手写字面量会与实体定义脱节。当实体新增/修改合法值时，Response 接口不会被同步更新，导致类型泄露。引用实体类型确保两者始终一致。
