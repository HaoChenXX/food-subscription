import re

with open('frontend-src/src/lib/i18n.ts', 'r', encoding='utf-8') as f:
    content = f.read()

lines = content.split('\n')
result_lines = []
seen_zh = set()
seen_en = set()
in_zh = True

for line in lines:
    match = re.match(r"\s+'([\w.]+)':\s*'", line)
    if match:
        key = match.group(1)
        if key == 'brand.slogan' and 'Farm-to-Table' in line:
            in_zh = False
        
        if in_zh:
            if key in seen_zh:
                continue
            seen_zh.add(key)
        else:
            if key in seen_en:
                continue
            seen_en.add(key)
    
    result_lines.append(line)

with open('frontend-src/src/lib/i18n.ts', 'w', encoding='utf-8') as f:
    f.write('\n'.join(result_lines))

print('Removed duplicate keys')
print(f'ZH keys: {len(seen_zh)}, EN keys: {len(seen_en)}')
