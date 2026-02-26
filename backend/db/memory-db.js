/**
 * 内存数据库 - MySQL的临时替代方案
 * 用于开发和测试环境
 */

class MemoryDB {
  constructor() {
    this.tables = {
      users: [],
      food_packages: [],
      orders: [],
      subscriptions: [],
      diet_profiles: [],
      addresses: [],
      suppliers: [],
      inventory_logs: [],
      payments: [],
      uploads: []
    };
    this.initialized = false;
  }

  // 模拟SQL查询
  async query(sql, params = []) {
    console.log('[MemoryDB] 执行查询:', sql, params);

    // 简单的SQL解析（仅支持基本操作）
    const sqlLower = sql.toLowerCase().trim();

    try {
      if (sqlLower.startsWith('select')) {
        return this.handleSelect(sql, params);
      } else if (sqlLower.startsWith('insert')) {
        return this.handleInsert(sql, params);
      } else if (sqlLower.startsWith('update')) {
        return this.handleUpdate(sql, params);
      } else if (sqlLower.startsWith('delete')) {
        return this.handleDelete(sql, params);
      } else if (sqlLower.includes('create table')) {
        console.log('[MemoryDB] 创建表操作已跳过');
        return [];
      }
    } catch (error) {
      console.error('[MemoryDB] 查询错误:', error);
      throw error;
    }

    return [];
  }

  // 处理SELECT查询
  handleSelect(sql, params) {
    // 解析表名
    const fromMatch = sql.match(/from\s+(\w+)/i);
    if (!fromMatch) return [];

    const tableName = fromMatch[1];
    const table = this.tables[tableName];

    if (!table) {
      throw new Error(`表 ${tableName} 不存在`);
    }

    let results = [...table];

    // 处理WHERE条件（简单实现）
    const whereMatch = sql.match(/where\s+(.+?)(?:\s+order|\s+limit|$)/i);
    if (whereMatch) {
      const whereClause = whereMatch[1];
      results = this.applyWhere(results, whereClause, params);
    }

    // 处理ORDER BY
    const orderMatch = sql.match(/order\s+by\s+(\w+)(?:\s+(desc|asc))?/i);
    if (orderMatch) {
      const [, column, direction] = orderMatch;
      results.sort((a, b) => {
        if (direction?.toLowerCase() === 'desc') {
          return b[column] > a[column] ? 1 : -1;
        }
        return a[column] > b[column] ? 1 : -1;
      });
    }

    // 处理LIMIT
    const limitMatch = sql.match(/limit\s+(\d+)/i);
    if (limitMatch) {
      const limit = parseInt(limitMatch[1]);
      results = results.slice(0, limit);
    }

    return results;
  }

  // 处理WHERE条件（简单实现）
  applyWhere(results, whereClause, params) {
    // 替换参数占位符
    let condition = whereClause;
    params.forEach((param, index) => {
      condition = condition.replace(/\?/, `'${param}'`);
    });

    // 简单的等值匹配
    const equalMatch = condition.match(/(\w+)\s*=\s*['"]?([^'"\s]+)['"]?/);
    if (equalMatch) {
      const [, column, value] = equalMatch;
      return results.filter(row => row[column] == value);
    }

    return results;
  }

  // 处理INSERT查询
  handleInsert(sql, params) {
    const intoMatch = sql.match(/into\s+(\w+)/i);
    if (!intoMatch) throw new Error('无法解析INSERT语句');

    const tableName = intoMatch[1];
    const table = this.tables[tableName];

    if (!table) {
      throw new Error(`表 ${tableName} 不存在`);
    }

    // 解析列名和值
    const columnsMatch = sql.match(/\(([^)]+)\)\s*values/i);
    if (!columnsMatch) throw new Error('无法解析列名');

    const columns = columnsMatch[1].split(',').map(c => c.trim());
    const values = [...params];

    // 创建新记录
    const newRecord = {};
    columns.forEach((column, index) => {
      // 移除反引号
      const cleanColumn = column.replace(/`/g, '');
      newRecord[cleanColumn] = values[index];
    });

    // 设置自增ID
    if (tableName === 'users' || tableName === 'food_packages' ||
        tableName === 'diet_profiles' || tableName === 'addresses' ||
        tableName === 'suppliers' || tableName === 'inventory_logs' ||
        tableName === 'payments' || tableName === 'uploads') {
      const maxId = Math.max(...table.map(r => r.id || 0));
      newRecord.id = maxId + 1;
    }

    // 设置时间戳
    if (!newRecord.created_at) {
      newRecord.created_at = new Date().toISOString();
    }
    if (!newRecord.updated_at) {
      newRecord.updated_at = new Date().toISOString();
    }

    table.push(newRecord);

    return { insertId: newRecord.id };
  }

  // 处理UPDATE查询
  handleUpdate(sql, params) {
    const updateMatch = sql.match(/update\s+(\w+)/i);
    if (!updateMatch) throw new Error('无法解析UPDATE语句');

    const tableName = updateMatch[1];
    const table = this.tables[tableName];

    if (!table) {
      throw new Error(`表 ${tableName} 不存在`);
    }

    // 解析SET子句
    const setMatch = sql.match(/set\s+(.+?)\s+where/i);
    if (!setMatch) throw new Error('无法解析SET子句');

    const setClause = setMatch[1];
    const assignments = setClause.split(',').map(s => s.trim());

    // 获取WHERE条件
    const whereMatch = sql.match(/where\s+(.+?)$/i);
    let targetRows = table;
    if (whereMatch) {
      targetRows = this.applyWhere(table, whereMatch[1], params.slice(assignments.length));
    }

    // 应用更新
    assignments.forEach(assignment => {
      const [column, value] = assignment.split('=').map(s => s.trim());
      const cleanColumn = column.replace(/`/g, '');
      const cleanValue = value.replace(/['"]/g, '');

      targetRows.forEach(row => {
        row[cleanColumn] = cleanValue;
        row.updated_at = new Date().toISOString();
      });
    });

    return { affectedRows: targetRows.length };
  }

  // 处理DELETE查询
  handleDelete(sql, params) {
    const fromMatch = sql.match(/from\s+(\w+)/i);
    if (!fromMatch) throw new Error('无法解析DELETE语句');

    const tableName = fromMatch[1];
    const table = this.tables[tableName];

    if (!table) {
      throw new Error(`表 ${tableName} 不存在`);
    }

    // 获取WHERE条件
    const whereMatch = sql.match(/where\s+(.+?)$/i);
    if (!whereMatch) {
      // 没有WHERE条件，清空表
      const deletedCount = table.length;
      this.tables[tableName] = [];
      return { affectedRows: deletedCount };
    }

    // 根据条件删除
    const targetRows = this.applyWhere(table, whereMatch[1], params);
    targetRows.forEach(row => {
      const index = table.indexOf(row);
      if (index > -1) {
        table.splice(index, 1);
      }
    });

    return { affectedRows: targetRows.length };
  }

  // 初始化数据
  async initializeData() {
    if (this.initialized) return;

    console.log('[MemoryDB] 初始化数据...');

    // 插入初始用户
    const bcrypt = require('bcryptjs');
    const hashedAdminPassword = await bcrypt.hash('admin123', 10);
    const hashedMerchantPassword = await bcrypt.hash('merchant123', 10);
    const hashedUserPassword = await bcrypt.hash('user123', 10);

    this.tables.users = [
      {
        id: 1,
        email: 'admin@example.com',
        password: hashedAdminPassword,
        name: '管理员',
        phone: '13800138000',
        role: 'admin',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 2,
        email: 'merchant@example.com',
        password: hashedMerchantPassword,
        name: '李供应商',
        phone: '13900139000',
        role: 'merchant',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=merchant',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 3,
        email: 'user@example.com',
        password: hashedUserPassword,
        name: '张三',
        phone: '13700137000',
        role: 'user',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    // 插入初始食材包（包含新增的9个县域特色食材包）
    this.tables.food_packages = [
      // 原有的基础食材包
      {
        id: 1,
        name: '健康减脂套餐',
        description: '低卡路里、高蛋白的健康食材组合，适合减脂期食用',
        level: 'basic',
        price: 89,
        original_price: 109,
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop',
        tags: ["减脂", "高蛋白", "低卡"],
        ingredients: [{"id": "1", "name": "鸡胸肉", "category": "肉类", "quantity": 500, "unit": "g", "origin": "山东"}, {"id": "2", "name": "西兰花", "category": "蔬菜", "quantity": 300, "unit": "g", "origin": "云南"}, {"id": "3", "name": "胡萝卜", "category": "蔬菜", "quantity": 200, "unit": "g", "origin": "山东"}, {"id": "4", "name": "糙米", "category": "主食", "quantity": 500, "unit": "g", "origin": "东北"}],
        recipes: [{"id": "1", "name": "香煎鸡胸肉配蔬菜", "description": "低脂高蛋白的经典减脂餐", "steps": [{"order": 1, "description": "鸡胸肉洗净切片，用盐和黑胡椒腌制15分钟", "duration": 15}, {"order": 2, "description": "西兰花和胡萝卜焯水备用", "duration": 5}, {"order": 3, "description": "平底锅少油煎鸡胸肉至两面金黄", "duration": 8}, {"order": 4, "description": "搭配蔬菜装盘即可", "duration": 2}], "tips": ["鸡胸肉不要煎太久，避免口感柴", "可以搭配低脂沙拉酱"]}],
        seasonings: [{"id": "1", "name": "海盐", "quantity": "适量", "included": true}, {"id": "2", "name": "黑胡椒", "quantity": "适量", "included": true}, {"id": "3", "name": "橄榄油", "quantity": "30ml", "included": true}],
        nutrition_info: {"calories": 450, "protein": 35, "carbs": 45, "fat": 12, "fiber": 8},
        is_limited: false,
        stock_quantity: 100,
        merchant_id: 2,
        status: 'active',
        cookTime: 30,
        servingSize: 2,
        difficulty: 'easy',
        rating: 4.8,
        reviewCount: 156,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      // ... 其他原有食材包

      // 新增的9个县域特色食材包
      {
        id: 4,
        name: '秦岭山珍野菌宴',
        description: '精选秦岭深处野生菌菇，搭配农家土鸡，汤鲜味美，营养丰富',
        level: 'advanced',
        price: 168,
        original_price: 208,
        image: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=800&auto=format&fit=crop',
        tags: ["山珍", "野生菌", "滋补", "高端"],
        ingredients: [{"id": "13", "name": "野生牛肝菌", "category": "菌菇", "quantity": 200, "unit": "g", "origin": "陕西秦岭"}, {"id": "14", "name": "农家土鸡", "category": "肉类", "quantity": 1, "unit": "只", "origin": "陕西商洛"}, {"id": "15", "name": "竹荪", "category": "菌菇", "quantity": 50, "unit": "g", "origin": "陕西安康"}, {"id": "16", "name": "枸杞", "category": "干货", "quantity": 30, "unit": "g", "origin": "宁夏中宁"}, {"id": "17", "name": "红枣", "category": "干货", "quantity": 100, "unit": "g", "origin": "陕西延安"}],
        recipes: [{"id": "4", "name": "野生菌土鸡汤", "description": "秦岭深处的美味，滋补养生", "steps": [{"order": 1, "description": "土鸡洗净切块，冷水焯水去血沫", "duration": 10}, {"order": 2, "description": "野生菌提前温水泡发30分钟", "duration": 30}, {"order": 3, "description": "砂锅加水，放入鸡块姜片大火煮开", "duration": 15}, {"order": 4, "description": "转小火炖煮40分钟后加入菌菇", "duration": 40}, {"order": 5, "description": "继续炖煮30分钟，加入枸杞红枣", "duration": 30}, {"order": 6, "description": "调味出锅，撒上葱花", "duration": 5}], "tips": ["菌菇要充分泡发，泡发水可入汤", "土鸡炖煮时间要够"]}],
        seasonings: [{"id": "10", "name": "姜片", "quantity": "20g", "included": true}, {"id": "11", "name": "盐", "quantity": "适量", "included": true}, {"id": "12", "name": "料酒", "quantity": "30ml", "included": true}],
        nutrition_info: {"calories": 520, "protein": 45, "carbs": 25, "fat": 28, "fiber": 8},
        is_limited: true,
        stock_quantity: 30,
        merchant_id: 2,
        status: 'active',
        cookTime: 120,
        servingSize: 4,
        difficulty: 'medium',
        rating: 4.9,
        reviewCount: 89,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 5,
        name: '洞庭湖鲜鱼宴',
        description: '精选洞庭湖新鲜活鱼，搭配当地特色莲藕，鲜美可口',
        level: 'intermediate',
        price: 118,
        original_price: 148,
        image: 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=800&auto=format&fit=crop',
        tags: ["湖鲜", "水产", "鲜美", "地方特色"],
        ingredients: [{"id": "18", "name": "鲜活草鱼", "category": "水产", "quantity": 1, "unit": "条", "origin": "湖南洞庭湖"}, {"id": "19", "name": "洪湖莲藕", "category": "蔬菜", "quantity": 500, "unit": "g", "origin": "湖北洪湖"}, {"id": "20", "name": "嫩豆腐", "category": "豆制品", "quantity": 300, "unit": "g", "origin": "本地"}, {"id": "21", "name": "香菜", "category": "蔬菜", "quantity": 50, "unit": "g", "origin": "本地"}],
        recipes: [{"id": "5", "name": "洞庭湖鱼头豆腐汤", "description": "汤色奶白，鱼头鲜嫩，豆腐滑嫩", "steps": [{"order": 1, "description": "鱼头洗净，盐和料酒腌制15分钟", "duration": 15}, {"order": 2, "description": "莲藕去皮切片，豆腐切块备用", "duration": 10}, {"order": 3, "description": "热锅凉油，鱼头两面煎至金黄", "duration": 8}, {"order": 4, "description": "加开水大火煮15分钟至汤色奶白", "duration": 15}, {"order": 5, "description": "加莲藕片煮10分钟", "duration": 10}, {"order": 6, "description": "加入豆腐调味，撒香菜出锅", "duration": 5}], "tips": ["一定要用大火煮，汤才会奶白", "鱼头要煎透去腥增香"]}],
        seasonings: [{"id": "14", "name": "盐", "quantity": "适量", "included": true}, {"id": "15", "name": "料酒", "quantity": "30ml", "included": true}, {"id": "16", "name": "白胡椒粉", "quantity": "适量", "included": true}, {"id": "17", "name": "姜片", "quantity": "15g", "included": true}],
        nutrition_info: {"calories": 380, "protein": 38, "carbs": 18, "fat": 16, "fiber": 4},
        is_limited: false,
        stock_quantity: 80,
        merchant_id: 2,
        status: 'active',
        cookTime: 65,
        servingSize: 3,
        difficulty: 'medium',
        rating: 4.7,
        reviewCount: 124,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      // ... 可以继续添加其他6个新增食材包
    ];

    this.initialized = true;
    console.log('[MemoryDB] 数据初始化完成');
  }
}

// 创建全局实例
const memoryDB = new MemoryDB();

// 确保初始化只执行一次
let initPromise = null;
async function ensureInitialized() {
  if (!initPromise) {
    initPromise = memoryDB.initializeData();
  }
  return initPromise;
}

// 导出兼容的接口
module.exports = {
  initPool: async () => {
    await ensureInitialized();
    return memoryDB;
  },
  getConnection: async () => ({
    execute: (sql, params) => memoryDB.query(sql, params),
    release: () => {}
  }),
  query: (sql, params) => memoryDB.query(sql, params),
  transaction: async () => {
    throw new Error('事务不支持');
  },
  ensureInitialized
};

// 导出兼容的接口
module.exports = {
  initPool: async () => memoryDB,
  getConnection: async () => ({
    execute: (sql, params) => memoryDB.query(sql, params),
    release: () => {}
  }),
  query: (sql, params) => memoryDB.query(sql, params),
  transaction: async () => {
    throw new Error('事务不支持');
  }
};