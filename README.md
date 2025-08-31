# 江南电缆数据转化工具

> 🔧 专业的电缆规格数据处理解决方案 | 在线试用版

[![在线访问](https://img.shields.io/badge/在线访问-liuyouchen--ai.github.io/JNDL-blue?style=for-the-badge)](https://liuyouchen-ai.github.io/JNDL/)

## 🎯 项目简介

江南电缆数据转化工具是一个专业的Web应用，专门用于处理电缆规格数据的格式转换。能够将包含完整电缆规格描述的Excel文件自动转换为标准化的5列格式，支持多种电缆类型和电压等级的智能识别与标准化。

### ✨ 主要特性

- 🚀 **智能解析**：自动识别和解析复杂电缆规格字符串
- 📊 **格式标准化**：统一电压等级和规格描述格式  
- 🔄 **批量处理**：支持一次处理多条记录（26条+）
- 👀 **实时预览**：转换结果即时预览，确保准确性
- 📥 **一键导出**：生成标准化Excel文件
- 📱 **响应式设计**：支持桌面和移动设备
- 🎨 **现代化UI**：直观友好的用户界面

### 🛠 支持的电缆类型

| 类型 | 全称 | 示例 |
|-----|-----|-----|
| **YJV22** | 交联聚乙烯绝缘钢带铠装 | `ZC-YJV22-6/10kV-3*70` |
| **YJV** | 交联聚乙烯绝缘电缆 | `ZC-YJV-0.6/1kV-3*2.5` |
| **KVV22** | 聚氯乙烯绝缘控制电缆 | `ZC-KVV22-450/750V-10*2.5` |
| **DJYVRP** | 计算机用屏蔽电缆 | `ZC-DJYVRP-300/500V-1*2*2.5` |
| **DJYPVPR** | 计算机用屏蔽电缆 | `ZC-DJYPVPR-300/500V-5*2*2.5` |
| **KYJVP** | 控制用电缆 | `ZC-KYJVP-450/750V-12*1` |
| **KVVRP** | 控制用屏蔽电缆 | `ZC-KVVRP-450/750V-4*1.5` |
| **KYJVP22** | 控制用铠装电缆 | `ZC-KYJVP22-450/750V-12*1` |
| **DJYVRP22** | 计算机用铠装屏蔽电缆 | `ZC-DJYVRP22-300/500V-1*2*1` |

## 🚀 快速开始

### 在线试用
直接访问：**https://liuyouchen-ai.github.io/JNDL/**

### 本地部署

#### 方法1：GitHub Pages部署
1. Fork本仓库到你的GitHub账号
2. 进入仓库设置 → Pages
3. Source选择"Deploy from a branch"
4. Branch选择"main"，文件夹选择"/ (root)"
5. 点击Save，等待部署完成

#### 方法2：本地运行
```bash
# 克隆仓库
git clone https://github.com/liuyouchen-AI/JNDL.git
cd JNDL

# 使用Python启动本地服务器
python -m http.server 8080
# 或使用Node.js
npx serve .
# 或使用任何静态文件服务器

# 浏览器访问
http://localhost:8080
```

## 📋 使用说明

### 1. 数据准备
- 确保Excel文件包含Sheet1工作表
- 第6列为"项目/服务描述"，包含电缆规格数据
- 支持格式：`.xlsx` `.xls`
- 文件大小：≤ 10MB

### 2. 转换流程
1. **上传文件**：拖拽或点击选择Excel文件
2. **开始转换**：点击"🚀 开始转换"按钮
3. **预览结果**：查看统计数据和转换结果
4. **下载文件**：点击"📥 下载转换结果"

### 3. 输入输出格式

**输入格式（Sheet1）：**
```
任务号 | 采购备注 | 采购员 | 物料信息 | 物料编号 | 项目/服务描述 | 外径 | 数量 | 单位 | 分段
LR454 | 示例项目 | P030-张三 | 单根 | C02002035 | ZC-YJV22-6/10kV-3*70 | 53.3 | 1200 | 米 | 整根
```

**输出格式（Sheet2）：**
```
前缀 | 电缆类型 | 组合型号 | 电压等级 | 规格
ZC   | YJV22   | ZC-YJV22 | 6/10kV  | 3*70
```

## ⚡ 技术特性

### 核心算法
- **智能解析引擎**：基于正则表达式的电缆规格识别
- **电压标准化**：支持多种电压格式的统一转换
- **格式处理**：自动处理规格中的小数点和特殊字符
- **顺序保持**：完全保持原始数据的记录顺序

### 电压等级转换规则
```javascript
0.6/1kV, 0.6/1KV    → 0.6/1kV
6/10kV              → 6/10kV  
0.45/0.75KV         → 450/750V
0.3-0.5KV, 0.3/0.5KV → 300/500V
450/750V            → 450/750V
```

### 技术栈
- **前端**：原生HTML5 + CSS3 + JavaScript ES6+
- **数据处理**：SheetJS (xlsx库)
- **UI设计**：响应式设计 + CSS Grid/Flexbox
- **部署**：GitHub Pages（静态托管）

## 📁 项目结构

```
JNDL/
├── index.html          # 主页面
├── script.js          # 核心JavaScript逻辑  
├── 示例数据.xlsx       # 演示用示例数据
├── 使用说明.md         # 详细使用说明
└── README.md          # 项目说明（本文件）
```

## 🔧 部署指南

### GitHub Pages部署（推荐）

1. **创建仓库**
   ```bash
   # 在GitHub创建新仓库：liuyouchen-AI/JNDL
   ```

2. **上传文件**
   ```bash
   git clone https://github.com/liuyouchen-AI/JNDL.git
   cd JNDL
   # 将准备好的文件复制到此目录
   git add .
   git commit -m "🚀 部署江南电缆数据转化工具"
   git push origin main
   ```

3. **启用GitHub Pages**
   - 进入仓库 Settings → Pages
   - Source: Deploy from a branch
   - Branch: main / (root)
   - 保存后等待部署完成

4. **访问地址**
   ```
   https://liuyouchen-ai.github.io/JNDL/
   ```

### 自定义域名（可选）
```bash
# 在仓库根目录创建CNAME文件
echo "tool.yourcompany.com" > CNAME
git add CNAME
git commit -m "添加自定义域名"
git push origin main
```

## 🛡️ 数据安全

- ✅ **纯前端处理**：所有数据在浏览器本地处理，不上传到服务器
- ✅ **隐私保护**：无用户数据收集，无需注册登录
- ✅ **文件安全**：支持现代浏览器的文件API安全机制
- ✅ **开源透明**：代码完全开源，可审计

## 🔄 版本历史

### v1.0.0 (2024-12-XX)
- ✨ 首次发布
- ✅ 基础电缆规格解析功能
- ✅ 9种主要电缆类型支持
- ✅ 电压等级标准化处理
- ✅ 响应式Web界面
- ✅ GitHub Pages部署支持

## 🤝 贡献指南

欢迎贡献代码和建议！

```bash
# Fork项目
git fork https://github.com/liuyouchen-AI/JNDL.git

# 创建功能分支
git checkout -b feature/new-feature

# 提交更改
git commit -m "✨ 添加新功能"

# 推送分支
git push origin feature/new-feature

# 创建Pull Request
```

## 📞 联系方式

- **GitHub Issues**: [提交问题](https://github.com/liuyouchen-AI/JNDL/issues)
- **邮箱**: support@jndl.com
- **在线演示**: https://liuyouchen-ai.github.io/JNDL/

## 📄 许可证

本项目基于 MIT 许可证开源 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🌟 致谢

感谢所有为电缆行业数字化转型做出贡献的开发者和用户！

---

⭐ **如果这个工具对你有帮助，请给个Star支持一下！**