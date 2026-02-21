#!/usr/bin/env python3
import json

# 读取原始 Markdown 文件
with open('/Users/cf/Downloads/yijing_full_data - 副本 py 30e133fcfbae8047906fdb9b1ec166bd.md', 'r', encoding='utf-8') as f:
    content = f.read()

# 替换 Unicode 引号为普通引号
content = content.replace('\u201c', '"').replace('\u201d', '"')
content = content.replace('\u2018', "'").replace('\u2019', "'")

# 八卦映射
trigram_map = {
    "qian": "乾",
    "kun": "坤", 
    "zhen": "震",
    "gen": "艮",
    "kan": "坎",
    "li": "离",
    "xun": "巽",
    "dui": "兑"
}

# 提取 YIJING_DATA
import re
pattern = r'YIJING_DATA = \{([\s\S]*?)\n\}\n\n# 卦序列表'
match = re.search(pattern, content)

if not match:
    print("找不到 YIJING_DATA")
    exit(1)

# 解析 Python 字典
data_str = "{" + match.group(1) + "}"

# 处理三引号字符串
data_str = re.sub(r'"""([\s\S]*?)"""', lambda m: json.dumps(m.group(1)), data_str)

# 解析
gua_data = eval(data_str)

# 转换为目标格式
gua_database = {}

for name, data in gua_data.items():
    gua = {
        "卦名全称": data.get("chinese_name", ""),
        "上卦": trigram_map.get(data.get("upper", ""), data.get("upper", "")),
        "下卦": trigram_map.get(data.get("lower", ""), data.get("lower", "")),
        "卦辞": data.get("description", ""),
        "彖辞": data.get("tuan", ""),
        "大象辞": data.get("xiang", ""),
    }
    
    # 添加六爻
    yao_names = ["初爻", "二爻", "三爻", "四爻", "五爻", "上爻"]
    for i, yao in enumerate(data.get("yaos", []), 1):
        yao_name = yao_names[i-1]
        gua[f"爻辞{yao_name}"] = yao.get("text", "")
        gua[f"小象传{i}爻"] = yao.get("xiang", "")
    
    gua_database[name] = gua

# 直接写入文件，不使用 json.dumps 以便更好地控制格式
with open('data.js', 'w', encoding='utf-8') as f:
    f.write('const guaDatabase = {\n')
    
    gua_items = list(gua_database.items())
    for idx, (name, gua) in enumerate(gua_items):
        f.write(f'  "{name}": {{\n')
        
        items = list(gua.items())
        for i, (key, value) in enumerate(items):
            # 确保字符串正确转义
            escaped_value = json.dumps(value, ensure_ascii=False)
            comma = ',' if i < len(items) - 1 else ''
            f.write(f'    "{key}": {escaped_value}{comma}\n')
        
        comma = ',' if idx < len(gua_items) - 1 else ''
        f.write(f'  }}{comma}\n')
    
    f.write('};\n')

print(f"✅ 成功转换 {len(gua_database)} 个卦")

# 验证乾卦
if '乾' in gua_database:
    qian = gua_database['乾']
    print(f"\n乾卦数据验证:")
    print(f"  卦名全称: {qian.get('卦名全称', 'N/A')}")
    print(f"  上卦: {qian.get('上卦', 'N/A')}")
    print(f"  下卦: {qian.get('下卦', 'N/A')}")
    print(f"  卦辞: {qian.get('卦辞', 'N/A')[:50]}...")
    print(f"  爻辞数量: {sum(1 for k in qian.keys() if k.startswith('爻辞'))}")
