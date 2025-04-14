# AI Town

AI Town是一个交互式3D模拟游戏，您可以在其中建造和管理自己的未来主义小镇，并与AI驱动的角色互动。建造建筑、管理资源，并与AI角色交流，发展您繁荣的社区。

<img width="1059" alt="Screenshot 2025-04-14 at 1 16 13 PM" src="https://github.com/user-attachments/assets/54a5b168-2fd8-4cfa-aef1-6a538b9c3cbd" />

## 功能特点

- **交互式3D环境**：探索完全渲染的3D世界，包含动态光照、水效果和植被。
- **小镇建设**：建造各种建筑，包括住宅、农场、工厂和研究实验室。
- **资源管理**：平衡小镇的金钱、人口、食物和能源资源。
- **AI驱动的角色**：与具有独特个性和角色的AI角色互动。
- **动态聊天系统**：使用自然语言与小镇居民和建筑物交流。
- **可定制的LLM集成**：配置您自己的AI模型以实现更高级的互动。

## 使用的技术

- Next.js (App Router)
- React Three Fiber (Three.js)
- Tailwind CSS
- shadcn/ui组件
- OpenAI API（可选）

## 开始使用

### 前提条件

- Node.js 18.0.0或更高版本
- npm或yarn

### 安装

1. 克隆仓库：
   \`\`\`bash
   git clone https://github.com/yourusername/ai-town.git
   cd ai-town
   \`\`\`

2. 安装依赖：
   \`\`\`bash
   npm install
   
   yarn install
   \`\`\`

3. 启动开发服务器：
   \`\`\`bash
   npm run dev
   
   yarn dev
   \`\`\`

4. 在浏览器中打开[http://localhost:3000](http://localhost:3000)查看应用程序。

## 使用指南

### 基本控制

- **相机导航**：左键单击并拖动旋转相机，右键单击并拖动平移，使用滚轮放大和缩小。
- **建筑建造**：点击左下角面板中的"建造"选项卡来建造新建筑。
- **角色互动**：点击角色开始与他们对话。
- **建筑管理**：点击建筑查看详情和升级选项。

### 游戏机制

- 每种建筑都有不同的用途，建造和升级都需要消耗资源。
- 随着住房容量的扩大，小镇的人口会增长。
- 资源会根据您的建筑随时间自动生成。
- 与AI角色互动，获取建议并了解小镇的状态。

## LLM配置

AI Town支持与大型语言模型（LLM）集成，以实现更高级的AI互动：

1. 点击右上角的"配置LLM"按钮。
2. 输入您的API密钥并选择首选模型。
3. 测试连接以确保一切正常工作。
4. 保存配置以启用AI驱动的对话。

如果您没有API密钥，可以使用内置的模拟模式，它提供模拟响应。

### 支持的LLM提供商

- OpenAI（GPT模型）
- 自定义API端点（兼容OpenAI API格式）

## 项目结构

```
ai-town/
├── app/                  # Next.js应用目录
├── components/           # React组件
│   ├── environment/      # 3D环境组件
│   ├── town/             # 小镇相关组件
│   └── ui/               # 用户界面组件
├── context/              # React上下文提供者
├── services/             # 服务函数
├── types/                # TypeScript类型定义
└── public/               # 静态资源
    ├── models/           # 3D模型
    └── textures/         # 3D模型纹理
```

## 贡献

欢迎贡献！请随时提交Pull Request。

1. Fork仓库
2. 创建您的功能分支（`git checkout -b feature/amazing-feature`）
3. 提交您的更改（`git commit -m 'Add some amazing feature'`）
4. 推送到分支（`git push origin feature/amazing-feature`）
5. 打开Pull Request

## 许可证

该项目采用MIT许可证 - 详情请参阅LICENSE文件。

## 致谢

- Three.js和React Three Fiber用于3D渲染
- shadcn/ui用于UI组件
- OpenAI提供AI能力
