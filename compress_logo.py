from PIL import Image
import os

# 读取原图
img = Image.open('logo.png')
original_size = os.path.getsize('logo.png') / 1024
print(f'Original: {img.size}, {original_size:.1f} KB')

# 生成多个尺寸的优化版本
sizes = [512, 256, 128]
for size in sizes:
    # 使用LANCZOS重采样
    resized = img.resize((size, size), Image.LANCZOS)
    # 保存为优化PNG
    output_path = f'logo-{size}.png'
    resized.save(output_path, 'PNG', optimize=True)
    file_size = os.path.getsize(output_path) / 1024
    print(f'{size}x{size}: {file_size:.1f} KB')

# 使用256x256作为网站logo（平衡清晰度和大小）
best = Image.open('logo-256.png')
best.save('logo-optimized.png', 'PNG', optimize=True)
print(f'\nOptimized logo saved: logo-optimized.png ({os.path.getsize("logo-optimized.png") / 1024:.1f} KB)')
