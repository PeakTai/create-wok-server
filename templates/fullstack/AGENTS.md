## 核心规则

### 技能文档

在回答问题前，首先尝试寻找合适的 wok-server 或 wok-ui 的技能文档，了解框架如何使用再回答问题。

如果找不到文档，请为项目安装这两个框架的技能文档。

* 安装 wok-server 的技能文档：`npx skills add https://gitee.com/tai/wok-server.git --all`
* 安装 wok-ui 的技能文档：`npx skills add https://gitee.com/tai/wok-ui.git --all`

### 消除幻觉，禁止瞎编

按照技能文档中的指导，寻找 api 的定义文件，阅读参数信息，禁止瞎猜。

也可以通过下面的路径来寻找定义文件，了解框架的完整 api 定义。

wok-server 框架的定义文件在 backend/node_modules/wok-server/types 目录下。
wok-ui 框架的定义文件在 frontend/node_modules/wok-ui/types 目录下。

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

---

### 前端规范

#### 1. 类型定义规范

类型定义**必须包含注释**说明字段含义：

```ts
// ❌ 错误：缺少字段注释
interface CreateForm {
  name: string
}

// ✅ 正确：包含字段注释
interface Form {
  /**
   * Department ID
   */
  dept_id?: number
  
  /**
   * Course name
   */
  name: string
  
  /**
   * Whether to enable chapters
   */
  enable_chapter: boolean
}
```

#### 2. 返回值规范

函数如果不需要返回值给调用方，**必须返回 `void`**，不应返回类似状态码的数字类型：

```ts
// ❌ 错误：返回状态码数字
async refreshQuestions(corpId: string, paragraph: KnowledgeParagraph): Promise<number> {
  if (!llmConfig) {
    return 0  // 调用方还得检查返回值
  }
  // ...
  return questions.length
}

// ✅ 正确：不需要返回值则返回 void
async refreshQuestions(corpId: string, paragraph: KnowledgeParagraph): Promise<void> {
  if (!llmConfig) {
    throw new BusinessException('未配置大模型')  // 错误直接抛异常
  }
  // ... 正常执行完就是成功
}
```

#### 3. 前后端 API 参数一致性

调用后端接口时，**前端传参的字段名必须与后端 `interface` 定义完全一致**，不能使用不同的命名风格：

```ts
// ❌ 错误：后端定义的是 chatbotId（camelCase），前端传 chatbot_id（snake_case）
// 后端
interface CreateForm {
  chatbotId: string  // camelCase
}
// 前端
getTempSession(chatbotId: string) {
  return this.ajax.post({
    data: { chatbot_id }  // ❌ 参数名不一致，后端收到 undefined
  })
}

// ✅ 正确：前后端字段名完全一致
// 后端
interface CreateForm {
  chatbotId: string
}
// 前端
getSession(chatbotId: string) {
  return this.ajax.post({
    data: { chatbotId }  // ✅ 与后端一致
  })
}
```

**检查方法**：在写前端 API 调用时，必须打开后端接口的 `interface` 定义，逐字段对照前端传参，确保字段名、类型完全一致，不可凭感觉推断。

#### 4. 路由模块写法

路由的 `module` 回调中**直接返回页面实例**，不要声明临时变量或用 `as unknown as Module` 做类型断言：

```ts
// ❌ 错误：声明临时变量 + as unknown as Module
{
  path: '/chatbots',
  module: () => {
    const page = new FsChatbotListPage()
    return page as unknown as Module
  }
}

// ❌ 错误：在路由回调中获取路径参数再传给构造函数
{
  path: '/chatbots/:id',
  module: () => {
    const id = getRouter().getPathVar('id')  // ❌ 在路由回调中获取参数
    return new FsChatbotChatPage(id || '')
  }
}

// ✅ 正确：直接返回实例，路径参数在页面构造函数内获取
{
  path: '/chatbots',
  module: () => new FsChatbotListPage()
}

// ✅ 正确：路径参数在页面内部获取（构造函数内调用 getRouter().getPathVar()）
{
  path: '/chatbots/:id',
  module: () => new FsChatbotChatPage()
}

// 页面模块内部获取路径参数
class FsChatbotChatPage extends ... {
  constructor() {
    super(...)
    const id = getRouter().getPathVar('id')  // ✅ 允许
  }
}
```

**检查方法**：路由定义中如果出现 `as unknown as Module` 或在路由回调中调用 `getRouter()`，说明写法不对。

#### 5. FullRenderingModule 正确用法

`FullRenderingModule` 适用于数据变化后需要整体重新渲染的模块。**子类需要实现 `buildContent()` 方法，用于构建完整内容。在需要渲染的时候调用 `render()` 方法**。

核心规则：

1. **`buildContent()` 的签名是 `void`**，不是 `SubModulesOpt`
2. **在 `buildContent()` 内部通过 `this.addChild()` 来添加子模块**

```ts
// ❌ 错误1：buildContent 返回 SubModulesOpt
class MyModule extends FullRenderingModule {
  buildContent(): SubModulesOpt {
    return { classNames: 'xxx', children: ... }  // 错！buildContent 是 void
  }
}

// ❌ 错误2：构造器没有调用 this.render()，页面空白
class MyModule extends FullRenderingModule {
  constructor() {
    super('my-module')
  }
  buildContent(): void {
    this.addChild(...)
  }
}

// ✅ 正确用法
class MyModule extends FullRenderingModule {
  constructor() {
    super('my-module')
    this.render()  // 必须调用！
  }
  buildContent(): void {
    this.addChild({ classNames: 'xxx', children: ... })
    this.addChild(new SomeOtherModule())
  }

  onSomeChange() {
    // 数据变了，触发重新渲染
    this.render()
  }
}
```

> **补充**：项目中另有 `FsLayout`（继承自 `ResponsiveModule`），它的 `buildContent` 已由框架实现，子类不需要也不会去覆盖它，而是实现 `buildPcMainContent()` 和 `buildMobileMainContent()`（均返回 `SubModulesOpt`）。注意区分两者，不要混用。

#### 6. cacheModule 缓存子模块并保持引用的正确写法

`cacheModule` 返回的是 `Module` 基类类型，**不要将其赋值给具体子模块类型的字段**，否则类型不匹配且无法保留子模块特有的方法引用。

```ts
// ❌ 错误：提前声明子模块字段，在 buildContent 外做 if/else 判断
private chatInput?: ChatInput

buildContent() {
  if (!this.chatInput) {
    this.chatInput = new ChatInput({...})
  } else {
    // cacheModule 返回 Module 类型，赋值给 ChatInput 字段是错的
    this.chatInput = this.cacheModule({
      key: 'chatInput',
      module: () => this.chatInput!
    })
  }
  // ...
}

// ✅ 正确：不在 buildContent 外提前声明，直接在 children 中使用 cacheModule
// 如果需要保存引用供外部调用，在 factory 函数内赋值
buildContent() {
  this.addChild({
    children: this.cacheModule({
      key: 'chatInput',
      module: () => {
        this.chatInput = new ChatInput({...})
        return this.chatInput
      }
    })
  })
}
```

**为什么**：
1. `cacheModule` 的返回类型是 `Module`，不是具体的子模块类型，直接赋值会导致类型错误
2. 为了代码结构清晰，不在 `buildContent` 外提前声明子模块字段做条件判断
3. 如果页面需要调用子模块的方法（如 `this.chatInput.setSending()`），在 `cacheModule` 的 factory 函数内赋值即可保留引用

#### 7. DivModule 多个类名不能空格拼接，必须用多个参数

`DivModule` 构造器接受多个类名参数，**不能**用空格拼接成一个字符串传入：

```ts
// ❌ 错误：空格拼接类名
class MyBubble extends DivModule {
  constructor() {
    super('chatbot-chat-message chatbot-chat-msg-reply')  // 不支持！
  }
}

// ✅ 正确：类名用多个参数传入
class MyBubble extends DivModule {
  constructor() {
    super('chatbot-chat-message', 'chatbot-chat-msg-reply')
  }
}
```

> 注意：这和 `classNames` 选项不同——`classNames` 接受字符串、字符串数组都可以；但 `DivModule` 构造器参数是多个独立参数，空格分割的字符串会被当作**一个**整体类名。

#### 8. 禁止大量 HTML 代码字符串，用字面量构建 + FullRenderingModule

**禁止**使用 `innerHTML` 拼接大段 HTML 字符串构建内容。应使用 wok-ui 的**字面量构建**方式（`CreateDomModuleOptions`），通过 `addChild()` 添加子模块。对于需要动态更新内容的场景，使用 `FullRenderingModule` + `render()` 全量重绘。

```ts
// ❌ 错误：大量 innerHTML 拼接 + querySelectorAll 绑定事件
class MyList extends DivModule {
  private listEl: HTMLElement

  constructor() {
    super('my-list')
    this.listEl = document.createElement('div')
    this.el.appendChild(this.listEl)
  }

  private rebuildList() {
    this.listEl.innerHTML = items.map(item => `
      <div class="item">
        <svg ...>...</svg>
        <span>${item.name}</span>
      </div>
    `).join('')
    this.listEl.querySelectorAll('.item').forEach((el, i) => {
      el.addEventListener('click', () => this.onClick(items[i]))
    })
  }
}

// ✅ 正确：FullRenderingModule + addChild + 字面量
class MyList extends FullRenderingModule {
  private items: Item[] = []

  constructor() {
    super('my-list')
    this.render()
  }

  buildContent(): void {
    this.addChild({
      classNames: 'list',
      children: this.items.map(item => ({
        classNames: 'item',
        children: [
          new RemoteSvgIcon({ iconUrl: '/icons/doc.svg', size: 14 }),
          { tag: 'span', innerText: item.name }
        ],
        onClick: () => this.onClick(item)
      }))
    })
  }

  setItems(items: Item[]) {
    this.items = items
    this.render()
  }
}
```

**为什么**：
1. HTML 字符串中 SVG、样式、事件绑定混在一起，难以维护和复用
2. `querySelectorAll` + `addEventListener` 绕过了框架的事件绑定机制
3. 手动 `createElement` / `appendChild` 破坏了框架的模块树管理
4. `FullRenderingModule` + 字面量构建，模块树完整，框架自动管理渲染、事件和生命周期

#### 9. 输入框持续输入与渲染隔离

wok-ui 没有虚拟 DOM，`FullRenderingModule.render()` 会全量销毁并重建 DOM。当 textarea/input 和动态变化的内容放在同一个 `FullRenderingModule` 中，输入触发 `render()` 会导致输入框被重建，失去焦点和光标位置。

**但并非所有场景都需要隔离**，要区分两种情况：

| 场景 | 举例 | 需要隔离？ |
|------|------|-----------|
| **即时响应**：输入过程中触发 `render()`，使其他部分实时变化 | 即时搜索、自动补全、实时预览 | 是，否则每输入一个字符都会使输入框失去焦点 |
| **延时触发**：输入结束后通过回车或按钮等明确操作才触发变化 | 搜索框（回车后搜索）、表单输入 | 否，输入过程中不会调用 `render()`，放在 `buildContent()` 中无问题 |

**需要隔离时的正确做法**：将输入框放在父模块（DivModule）中只创建一次，把需要动态变化的部分拆成独立的 `FullRenderingModule` 子模块，子模块自行管理自己的 `render()`，不影响输入框。

```ts
// ❌ 错误（即时搜索场景）：textarea 放在 FullRenderingModule 中，每输入一个字符就重建
export class InstantSearch extends FullRenderingModule {
  private results: string[] = []
  buildContent(): void {
    this.addChild({
      tag: 'textarea',
      events: {
        input: (e) => {
          this.search((e.target as HTMLTextAreaElement).value)
        }
      }
    })
    this.addChild({ children: this.results.map(r => ({ tag: 'div', innerText: r })) })
  }
  private search(keyword: string) {
    this.results = doSearch(keyword)
    this.render()  // ❌ 重建 textarea，失去焦点
  }
}

// ✅ 正确（即时搜索场景）：父模块保留 textarea，子模块独立管理变化
// 父模块 - textarea 只创建一次
export class SearchBox extends DivModule {
  private resultList: SearchResultList
  constructor() {
    super('search-box')
    this.resultList = new SearchResultList()
    this.addChild({
      classNames: 'search-input-area',
      children: [
        new TextArea({  // 直接用 wok-ui TextArea，只创建一次
          onInput: (value) => this.resultList.search(value)
        }),
        this.resultList  // 独立 FullRenderingModule 子模块
      ]
    })
  }
}

// 子模块 - 触发 render 时只重建自己，不影响 textarea
class SearchResultList extends FullRenderingModule {
  private results: string[] = []
  constructor() { super('search-result-list') }

  search(keyword: string) {
    this.results = doSearch(keyword)
    this.render()  // ✅ 只重建结果列表，textarea 不受影响
  }

  buildContent(): void {
    this.addChild({ children: this.results.map(r => ({ tag: 'div', innerText: r })) })
  }
}
```

**关键点**：
1. 判断是否要隔离的标准：输入过程中是否频繁调用 `render()`
2. 输入框直接使用 wok-ui 内置的 `TextArea`，复用自动高度、输入法过滤等功能，一般不需要继承
3. 变化的部分拆为独立子模块，通过调用子模块方法触发其 `render()`，隔绝影响范围
4. 父模块用 `addChild` 字面量形式组织 DOM 结构，不要手动 `createElement`/`appendChild`
5. 对于延时触发场景（回车后搜索），无需隔离，直接放在 `FullRenderingModule.buildContent()` 中即可

#### 10. 禁止在调用方不处理的地方使用 async

`async` 函数返回 `Promise`，如果调用方不 `.catch()`（如构造器、事件回调、生命周期钩子等），Promise 被丢弃会导致：
- 异常被静默吞掉，难以排查
- 浏览器发出未处理 Promise rejection 警告

**禁止在构造器、事件回调等调用方不处理的地方直接调用 async 函数**，应改用链式 `.then().catch()`：

```ts
// ❌ 错误：构造器调用 async 方法，Promise 没人 catch
class MyModule {
  constructor() {
    this.loadData()  // 返回的 Promise 无人处理
  }

  private async loadData() {
    const resp = await sdk.api.xxx()  // 抛异常 → 未捕获 Promise rejection
    // ...
  }
}

// ✅ 正确：构造器调用普通方法，方法内用链式调用
class MyModule {
  constructor() {
    this.loadData()
  }

  private loadData() {
    sdk.api.xxx().then(resp => {
      // ...
    }).catch(e => {
      console.error('加载失败', e)
    })
  }
}
```

#### 11. 优先使用 children 回调构建子模块，避免声明中间变量

构建 `children` 时，**禁止声明中间变量（如 const xxx = [...]）再拼装**，应使用 `SubModulesOpt` 的**回调函数形式** `add => { ... }`，在回调内直接通过 `add()` 动态添加子模块。

这样做的好处：
- DOM 层级结构一目了然，缩进即体现嵌套关系
- 没有中间变量，代码更简洁
- 条件构建（`if`）和循环构建（`for`/`map`）直接在回调内完成

```ts
// ❌ 错误：声明中间变量拼装，代码繁琐且结构不直观
buildMainContent(): SubModulesOpt {
  const layoutChildren: SubModulesOpt = []
  if (this.showCategory) {
    layoutChildren.push({
      classNames: 'course-list-category',
      children: this.cacheModule({ ... })
    })
  }
  layoutChildren.push({
    classNames: 'course-list-toggle',
    children: new FontAwesomeIcon({ ... })
  })
  layoutChildren.push({
    classNames: 'course-list-content',
    children: tableCard
  })
  return {
    classNames: 'course-list-layout',
    children: layoutChildren
  }
}

// ✅ 正确：直接用 children 回调，结构清晰
buildMainContent(): SubModulesOpt {
  return {
    classNames: 'course-list-layout',
    children: add => {
      if (this.showCategory) {
        add({
          classNames: 'course-list-category',
          children: this.cacheModule({ ... })
        })
      }
      add({
        classNames: 'course-list-toggle',
        children: new FontAwesomeIcon({ ... })
      })
      add({
        classNames: 'course-list-content',
        children: tableCard
      })
    }
  }
}
```

注意：回调函数的参数 `add` 就是 `addChild`，支持一次传多个参数（`add(a, b, c)`）。
