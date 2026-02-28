-- 食材包详情字段迁移脚本
-- 为 food_packages 表添加缺失的详情字段
-- 用法: mysql -u food_user -p food_subscription < migrate-add-package-details.sql

USE food_subscription;

-- 添加烹饪时间字段（分钟）
ALTER TABLE food_packages
ADD COLUMN IF NOT EXISTS cook_time INT DEFAULT 0 COMMENT '烹饪时间（分钟）';

-- 添加份量字段（人份）
ALTER TABLE food_packages
ADD COLUMN IF NOT EXISTS serving_size INT DEFAULT 2 COMMENT '适用人数（人份）';

-- 添加难度字段
ALTER TABLE food_packages
ADD COLUMN IF NOT EXISTS difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'medium' COMMENT '难度等级';

-- 添加评分字段（0-5分，保留2位小数）
ALTER TABLE food_packages
ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 4.5 COMMENT '评分（0-5分）';

-- 添加评价数量字段
ALTER TABLE food_packages
ADD COLUMN IF NOT EXISTS review_count INT DEFAULT 0 COMMENT '评价数量';

-- 添加销量字段
ALTER TABLE food_packages
ADD COLUMN IF NOT EXISTS sold_count INT DEFAULT 0 COMMENT '销售数量';

-- 添加限时特惠结束时间字段
ALTER TABLE food_packages
ADD COLUMN IF NOT EXISTS limited_time TIMESTAMP NULL COMMENT '限时特惠结束时间';

-- 为现有数据设置合理的初始值
-- 基于现有JSON字段计算烹饪时间
UPDATE food_packages
SET cook_time = (
  SELECT COALESCE(SUM(step.duration), 0)
  FROM (
    SELECT
      JSON_UNQUOTE(JSON_EXTRACT(recipes, '$[0].steps[*].duration')) AS duration
    FROM (SELECT recipes FROM food_packages WHERE id = food_packages.id) t
  ) step
  WHERE step.duration IS NOT NULL AND step.duration REGEXP '^[0-9]+$'
)
WHERE cook_time = 0 AND recipes IS NOT NULL AND recipes != '[]' AND recipes != 'null';

-- 基于食材数量估算份量
UPDATE food_packages
SET serving_size = (
  SELECT LEAST(2 + FLOOR(JSON_LENGTH(ingredients) / 3), 6)
  FROM (SELECT ingredients FROM food_packages WHERE id = food_packages.id) t
)
WHERE serving_size = 2 AND ingredients IS NOT NULL AND ingredients != '[]' AND ingredients != 'null';

-- 根据等级设置难度
UPDATE food_packages
SET difficulty = CASE
  WHEN level = 'basic' THEN 'easy'
  WHEN level = 'intermediate' THEN 'medium'
  WHEN level = 'advanced' THEN 'hard'
  ELSE 'medium'
END
WHERE difficulty = 'medium';

-- 为活跃商品设置随机销量（100-1000）
UPDATE food_packages
SET sold_count = FLOOR(100 + RAND() * 900)
WHERE status = 'active' AND sold_count = 0;

-- 为活跃商品设置随机评价数量（50-300）
UPDATE food_packages
SET review_count = FLOOR(50 + RAND() * 250)
WHERE status = 'active' AND review_count = 0;

-- 为限时特惠商品设置结束时间（默认7天后）
UPDATE food_packages
SET limited_time = DATE_ADD(NOW(), INTERVAL 7 DAY)
WHERE is_limited = 1 AND limited_time IS NULL;

-- 显示迁移结果
SELECT
  'food_packages表字段迁移完成' AS message,
  COUNT(*) AS total_packages,
  SUM(CASE WHEN cook_time > 0 THEN 1 ELSE 0 END) AS packages_with_cook_time,
  SUM(CASE WHEN serving_size > 2 THEN 1 ELSE 0 END) AS packages_with_serving_size,
  SUM(CASE WHEN difficulty != 'medium' THEN 1 ELSE 0 END) AS packages_with_difficulty,
  SUM(CASE WHEN sold_count > 0 THEN 1 ELSE 0 END) AS packages_with_sales,
  SUM(CASE WHEN review_count > 0 THEN 1 ELSE 0 END) AS packages_with_reviews
FROM food_packages;