# Illustrated Map Builder

一个用于制作插画式可交互地图的 Codex Skill。它把容易反复返工的部分固定成稳定框架：同画布透明分区、逐区点亮、柔光悬浮、卡片联动、鼠标缩放，以及全选后切换为完整原图。

视觉风格和地图形状可以自由更换；资产契约、状态模型、单屏布局和验收流程保持不变。

## 适用场景

- 情绪地图、知识地图、流程地图
- 手绘大陆、拼贴地图、纸雕、像素、3D 等非 GIS 插画地图
- 3–9 个可独立点击的区域
- 左侧文字 40% / 右侧地图 60% 的 16:9 单屏页面

## 核心约束

- 一张审核通过的完整母图
- 每个区域一张透明 PNG
- 所有区域图与完整图必须使用相同画布尺寸和原点
- 未选择时显示原图的中性灰阶，不使用半透明褪色
- 选择时恢复原色、轻微升起并增加克制的边缘柔光
- 全部选择后使用完整原图合拢，避免缝隙和文字遮挡
- 首次打开时不自动选中任何区域

## 安装

```bash
git clone https://github.com/lucxixi/illustrated-map-builder.git
cp -R illustrated-map-builder/illustrated-map-builder ~/.codex/skills/
```

重新启动 Codex 后，可以直接使用：

```text
使用 $illustrated-map-builder，根据我的内容和视觉参考制作一张可逐区点亮、最终合拢的交互地图。
```

## 使用流程

1. 准备完整母图和透明分区图；如果只有完整图，先完成真正的分区资产制作。
2. 生成项目：

   ```bash
   python3 illustrated-map-builder/scripts/scaffold_map.py ./my-map
   ```

3. 把图片放入项目的 `assets/`，并编辑 `map.config.json`。
4. 在制作交互前运行资产验证：

   ```bash
   uv run illustrated-map-builder/scripts/validate_map_assets.py ./my-map
   ```

5. 依次验收空状态、单区点亮、取消点亮、全部合拢、卡片联动、缩放、无滚动条和生产地址。

## 仓库结构

```text
illustrated-map-builder/
├── SKILL.md
├── agents/openai.yaml
├── assets/frontend-template/
├── references/
└── scripts/
```

详细规则请从 [`illustrated-map-builder/SKILL.md`](illustrated-map-builder/SKILL.md) 开始阅读。

