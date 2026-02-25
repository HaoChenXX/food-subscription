"""
生成丰富的县域特色食材包数据
适合三创赛展示 - 梓里炊烟平台
"""

import json

# 县域特色食材包数据
food_packages = [
    {
        "id": 4,
        "name": "秦岭山珍野菌宴",
        "description": "精选秦岭深处野生菌菇，搭配农家土鸡，汤鲜味美，营养丰富，是滋补养生的上乘之选",
        "level": "advanced",
        "price": 168,
        "original_price": 208,
        "image": "https://images.unsplash.com/photo-1574484284002-952d92456975?w=800&auto=format&fit=crop",
        "tags": ["山珍", "野生菌", "滋补", "高端"],
        "ingredients": [
            {"id": "13", "name": "野生牛肝菌", "category": "菌菇", "quantity": 200, "unit": "g", "origin": "陕西秦岭"},
            {"id": "14", "name": "农家土鸡", "category": "肉类", "quantity": 1, "unit": "只(约1.5kg)", "origin": "陕西商洛"},
            {"id": "15", "name": "竹荪", "category": "菌菇", "quantity": 50, "unit": "g", "origin": "陕西安康"},
            {"id": "16", "name": "枸杞", "category": "干货", "quantity": 30, "unit": "g", "origin": "宁夏中宁"},
            {"id": "17", "name": "红枣", "category": "干货", "quantity": 100, "unit": "g", "origin": "陕西延安"}
        ],
        "recipes": [
            {
                "id": "4",
                "name": "野生菌土鸡汤",
                "description": "秦岭深处的美味，汤鲜味醇，滋补养生",
                "steps": [
                    {"order": 1, "description": "土鸡洗净切块，冷水下锅焯水去血沫", "duration": 10},
                    {"order": 2, "description": "野生菌提前温水泡发30分钟", "duration": 30},
                    {"order": 3, "description": "砂锅加水，放入鸡块、姜片大火煮开", "duration": 15},
                    {"order": 4, "description": "转小火炖煮40分钟后加入菌菇", "duration": 40},
                    {"order": 5, "description": "继续炖煮30分钟，加入枸杞红枣", "duration": 30},
                    {"order": 6, "description": "调味出锅，撒上葱花即可", "duration": 5}
                ],
                "tips": ["菌菇要充分泡发，泡发水可入汤", "土鸡炖煮时间要够，肉质更软烂"]
            }
        ],
        "seasonings": [
            {"id": "10", "name": "姜片", "quantity": "20g", "included": True},
            {"id": "11", "name": "盐", "quantity": "适量", "included": True},
            {"id": "12", "name": "料酒", "quantity": "30ml", "included": True},
            {"id": "13", "name": "葱花", "quantity": "适量", "included": True}
        ],
        "nutrition_info": {"calories": 520, "protein": 45, "carbs": 25, "fat": 28, "fiber": 8},
        "is_limited": True,
        "stock_quantity": 30,
        "merchant_id": 2,
        "status": "active"
    },
    {
        "id": 5,
        "name": "洞庭湖鲜鱼宴",
        "description": "精选洞庭湖新鲜活鱼，搭配当地特色莲藕，鲜嫩爽口，是湖区人家的传统美味",
        "level": "intermediate",
        "price": 118,
        "original_price": 148,
        "image": "https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=800&auto=format&fit=crop",
        "tags": ["湖鲜", "水产", "鲜美", "地方特色"],
        "ingredients": [
            {"id": "18", "name": "鲜活草鱼", "category": "水产", "quantity": 1, "unit": "条(约1kg)", "origin": "湖南洞庭湖"},
            {"id": "19", "name": "洪湖莲藕", "category": "蔬菜", "quantity": 500, "unit": "g", "origin": "湖北洪湖"},
            {"id": "20", "name": "嫩豆腐", "category": "豆制品", "quantity": 300, "unit": "g", "origin": "本地"},
            {"id": "21", "name": "香菜", "category": "蔬菜", "quantity": 50, "unit": "g", "origin": "本地"}
        ],
        "recipes": [
            {
                "id": "5",
                "name": "洞庭湖鱼头豆腐汤",
                "description": "汤色奶白，鱼头鲜嫩，豆腐滑嫩",
                "steps": [
                    {"order": 1, "description": "鱼头洗净，用盐和料酒腌制15分钟", "duration": 15},
                    {"order": 2, "description": "莲藕去皮切片，豆腐切块备用", "duration": 10},
                    {"order": 3, "description": "热锅凉油，将鱼头两面煎至金黄", "duration": 8},
                    {"order": 4, "description": "加入开水，大火煮15分钟至汤色奶白", "duration": 15},
                    {"order": 5, "description": "加入莲藕片煮10分钟", "duration": 10},
                    {"order": 6, "description": "最后加入豆腐，调味撒香菜出锅", "duration": 5}
                ],
                "tips": ["一定要用大火煮，汤才会奶白", "鱼头要煎透，去腥增香"]
            }
        ],
        "seasonings": [
            {"id": "14", "name": "盐", "quantity": "适量", "included": True},
            {"id": "15", "name": "料酒", "quantity": "30ml", "included": True},
            {"id": "16", "name": "白胡椒粉", "quantity": "适量", "included": True},
            {"id": "17", "name": "姜片", "quantity": "15g", "included": True}
        ],
        "nutrition_info": {"calories": 380, "protein": 38, "carbs": 18, "fat": 16, "fiber": 4},
        "is_limited": False,
        "stock_quantity": 80,
        "merchant_id": 2,
        "status": "active"
    },
    {
        "id": 6,
        "name": "川西农家土菜组合",
        "description": "正宗川西农家风味，郫县豆瓣、农家腊肉，让你品尝地道的巴蜀味道",
        "level": "basic",
        "price": 98,
        "original_price": 128,
        "image": "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800&auto=format&fit=crop",
        "tags": ["川菜", "农家", "腊肉", "地方特色"],
        "ingredients": [
            {"id": "22", "name": "川味腊肉", "category": "肉类", "quantity": 300, "unit": "g", "origin": "四川成都"},
            {"id": "23", "name": "青蒜苗", "category": "蔬菜", "quantity": 200, "unit": "g", "origin": "本地"},
            {"id": "24", "name": "土豆", "category": "蔬菜", "quantity": 400, "unit": "g", "origin": "四川凉山"},
            {"id": "25", "name": "二荆条辣椒", "category": "蔬菜", "quantity": 100, "unit": "g", "origin": "四川"}
        ],
        "recipes": [
            {
                "id": "6",
                "name": "蒜苗炒腊肉",
                "description": "川味经典，腊味浓郁，香辣下饭",
                "steps": [
                    {"order": 1, "description": "腊肉洗净，冷水下锅煮20分钟", "duration": 20},
                    {"order": 2, "description": "腊肉切薄片，蒜苗切段", "duration": 5},
                    {"order": 3, "description": "热锅少油，放入腊肉煸出油脂", "duration": 5},
                    {"order": 4, "description": "加入辣椒段炒香", "duration": 2},
                    {"order": 5, "description": "最后加入蒜苗，大火快炒1分钟出锅", "duration": 1}
                ],
                "tips": ["腊肉本身有咸味，要少放盐", "蒜苗要大火快炒，保持脆嫩"]
            }
        ],
        "seasonings": [
            {"id": "18", "name": "郫县豆瓣酱", "quantity": "30g", "included": True},
            {"id": "19", "name": "生抽", "quantity": "15ml", "included": True},
            {"id": "20", "name": "食用油", "quantity": "30ml", "included": True}
        ],
        "nutrition_info": {"calories": 580, "protein": 22, "carbs": 35, "fat": 38, "fiber": 6},
        "is_limited": False,
        "stock_quantity": 100,
        "merchant_id": 2,
        "status": "active"
    },
    {
        "id": 7,
        "name": "长白山人参炖鸡套装",
        "description": "精选长白山野山参搭配散养土鸡，补气养血，是大补元气的不二之选",
        "level": "advanced",
        "price": 288,
        "original_price": 368,
        "image": "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&auto=format&fit=crop",
        "tags": ["滋补", "人参", "高端", "养生"],
        "ingredients": [
            {"id": "26", "name": "长白山野山参", "category": "药材", "quantity": 1, "unit": "支(约10g)", "origin": "吉林长白山"},
            {"id": "27", "name": "散养土鸡", "category": "肉类", "quantity": 1, "unit": "只(约1.2kg)", "origin": "吉林延边"},
            {"id": "28", "name": "淮山", "category": "药材", "quantity": 200, "unit": "g", "origin": "河南"},
            {"id": "29", "name": "干贝", "category": "水产", "quantity": 50, "unit": "g", "origin": "辽宁"},
            {"id": "30", "name": "虫草花", "category": "菌菇", "quantity": 30, "unit": "g", "origin": "吉林"}
        ],
        "recipes": [
            {
                "id": "7",
                "name": "人参炖鸡汤",
                "description": "大补元气，滋补强身，适合体虚者食用",
                "steps": [
                    {"order": 1, "description": "土鸡洗净，去内脏，保留整只", "duration": 10},
                    {"order": 2, "description": "人参、淮山、干贝提前泡发", "duration": 30},
                    {"order": 3, "description": "将整鸡放入砂锅，加水没过", "duration": 5},
                    {"order": 4, "description": "加入所有药材，大火烧开", "duration": 10},
                    {"order": 5, "description": "转小火慢炖2小时", "duration": 120},
                    {"order": 6, "description": "出锅前加盐调味", "duration": 2}
                ],
                "tips": ["人参不宜久煮，可后放", "感冒发热时不宜食用"]
            }
        ],
        "seasonings": [
            {"id": "21", "name": "姜片", "quantity": "20g", "included": True},
            {"id": "22", "name": "盐", "quantity": "适量", "included": True},
            {"id": "23", "name": "料酒", "quantity": "20ml", "included": True}
        ],
        "nutrition_info": {"calories": 620, "protein": 52, "carbs": 28, "fat": 32, "fiber": 5},
        "is_limited": True,
        "stock_quantity": 20,
        "merchant_id": 2,
        "status": "active"
    },
    {
        "id": 8,
        "name": "云贵高原野菜宴",
        "description": "精选云南高原野生野菜，天然无污染，清香爽口，是追求健康人士的首选",
        "level": "intermediate",
        "price": 78,
        "original_price": 98,
        "image": "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop",
        "tags": ["野菜", "有机", "低脂", "健康"],
        "ingredients": [
            {"id": "31", "name": "苦菜", "category": "野菜", "quantity": 200, "unit": "g", "origin": "云南昆明"},
            {"id": "32", "name": "蕨菜", "category": "野菜", "quantity": 200, "unit": "g", "origin": "云南大理"},
            {"id": "33", "name": "折耳根", "category": "野菜", "quantity": 150, "unit": "g", "origin": "贵州"},
            {"id": "34", "name": "火腿", "category": "肉类", "quantity": 100, "unit": "g", "origin": "云南宣威"}
        ],
        "recipes": [
            {
                "id": "8",
                "name": "凉拌野生野菜",
                "description": "清爽开胃，保留野菜原香",
                "steps": [
                    {"order": 1, "description": "各种野菜洗净，焯水30秒", "duration": 5},
                    {"order": 2, "description": "捞出过凉水，沥干水分", "duration": 5},
                    {"order": 3, "description": "火腿切丝，小火煸香", "duration": 5},
                    {"order": 4, "description": "野菜加调料拌匀，撒上火腿丝", "duration": 3}
                ],
                "tips": ["焯水时间不宜过长，保持脆嫩", "折耳根有特殊香味，可单独调味"]
            }
        ],
        "seasonings": [
            {"id": "24", "name": "蒜泥", "quantity": "20g", "included": True},
            {"id": "25", "name": "生抽", "quantity": "20ml", "included": True},
            {"id": "26", "name": "香醋", "quantity": "15ml", "included": True},
            {"id": "27", "name": "花椒油", "quantity": "10ml", "included": True},
            {"id": "28", "name": "辣椒油", "quantity": "适量", "included": True}
        ],
        "nutrition_info": {"calories": 220, "protein": 12, "carbs": 15, "fat": 12, "fiber": 8},
        "is_limited": False,
        "stock_quantity": 60,
        "merchant_id": 2,
        "status": "active"
    },
    {
        "id": 9,
        "name": "海南热带风情套餐",
        "description": "来自海南的新鲜椰子、文昌鸡，热带风情满满，让你在家也能感受海岛风味",
        "level": "intermediate",
        "price": 138,
        "original_price": 178,
        "image": "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=800&auto=format&fit=crop",
        "tags": ["海南", "热带", "椰子", "清新"],
        "ingredients": [
            {"id": "35", "name": "文昌鸡", "category": "肉类", "quantity": 1, "unit": "只(约1kg)", "origin": "海南文昌"},
            {"id": "36", "name": "新鲜椰子", "category": "水果", "quantity": 2, "unit": "个", "origin": "海南"},
            {"id": "37", "name": "珍珠马蹄", "category": "蔬菜", "quantity": 200, "unit": "g", "origin": "海南"},
            {"id": "38", "name": "红枣", "category": "干货", "quantity": 50, "unit": "g", "origin": "新疆"}
        ],
        "recipes": [
            {
                "id": "9",
                "name": "椰子鸡火锅",
                "description": "清甜鲜美，椰香四溢，海南经典",
                "steps": [
                    {"order": 1, "description": "文昌鸡洗净切块，椰子取椰汁和椰肉", "duration": 15},
                    {"order": 2, "description": "马蹄去皮洗净", "duration": 10},
                    {"order": 3, "description": "将椰汁倒入锅中，加入椰肉、红枣", "duration": 5},
                    {"order": 4, "description": "大火煮开，放入鸡肉", "duration": 10},
                    {"order": 5, "description": "撇去浮沫，小火煮20分钟", "duration": 20},
                    {"order": 6, "description": "加入马蹄，再煮5分钟即可", "duration": 5}
                ],
                "tips": ["椰汁本身就是汤底，不用加水", "鸡肉要选嫩鸡，煮的时间不宜过长"]
            }
        ],
        "seasonings": [
            {"id": "29", "name": "沙姜", "quantity": "20g", "included": True},
            {"id": "30", "name": "小青柠", "quantity": "4个", "included": True},
            {"id": "31", "name": "生抽", "quantity": "30ml", "included": True},
            {"id": "32", "name": "小米辣", "quantity": "适量", "included": True}
        ],
        "nutrition_info": {"calories": 480, "protein": 38, "carbs": 25, "fat": 26, "fiber": 4},
        "is_limited": False,
        "stock_quantity": 50,
        "merchant_id": 2,
        "status": "active"
    },
    {
        "id": 10,
        "name": "东北黑土地丰收宴",
        "description": "来自东北黑土地的馈赠，优质大米、新鲜玉米，让你品尝大地的味道",
        "level": "basic",
        "price": 68,
        "original_price": 88,
        "image": "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=800&auto=format&fit=crop",
        "tags": ["东北", "有机", "杂粮", "家常"],
        "ingredients": [
            {"id": "39", "name": "五常大米", "category": "主食", "quantity": 1, "unit": "kg", "origin": "黑龙江五常"},
            {"id": "40", "name": "甜玉米", "category": "蔬菜", "quantity": 4, "unit": "根", "origin": "吉林"},
            {"id": "41", "name": "紫薯", "category": "蔬菜", "quantity": 500, "unit": "g", "origin": "辽宁"},
            {"id": "42", "name": "红豆", "category": "干货", "quantity": 200, "unit": "g", "origin": "黑龙江"}
        ],
        "recipes": [
            {
                "id": "10",
                "name": "五谷丰登",
                "description": "蒸玉米紫薯，煮红豆饭，健康主食组合",
                "steps": [
                    {"order": 1, "description": "红豆提前浸泡4小时", "duration": 240},
                    {"order": 2, "description": "大米和红豆混合，按正常煮饭程序", "duration": 30},
                    {"order": 3, "description": "玉米、紫薯洗净", "duration": 5},
                    {"order": 4, "description": "蒸锅上汽后放入玉米紫薯，蒸20分钟", "duration": 20}
                ],
                "tips": ["红豆要充分泡发，否则煮不烂", "紫薯蒸的时候不要去皮，保持营养"]
            }
        ],
        "seasonings": [
            {"id": "33", "name": "白糖", "quantity": "适量", "included": True}
        ],
        "nutrition_info": {"calories": 380, "protein": 12, "carbs": 78, "fat": 3, "fiber": 10},
        "is_limited": False,
        "stock_quantity": 100,
        "merchant_id": 2,
        "status": "active"
    },
    {
        "id": 11,
        "name": "江南水乡河鲜宴",
        "description": "精选江南水域新鲜河虾、螺蛳，鲜美可口，是江南人家的传统美味",
        "level": "intermediate",
        "price": 108,
        "original_price": 138,
        "image": "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=800&auto=format&fit=crop",
        "tags": ["河鲜", "江南", "时令", "鲜美"],
        "ingredients": [
            {"id": "43", "name": "活河虾", "category": "水产", "quantity": 500, "unit": "g", "origin": "江苏太湖"},
            {"id": "44", "name": "螺蛳", "category": "水产", "quantity": 500, "unit": "g", "origin": "浙江"},
            {"id": "45", "name": "茭白", "category": "蔬菜", "quantity": 300, "unit": "g", "origin": "江苏"},
            {"id": "46", "name": "小葱", "category": "蔬菜", "quantity": 50, "unit": "g", "origin": "本地"}
        ],
        "recipes": [
            {
                "id": "11",
                "name": "油爆河虾",
                "description": "外壳酥脆，虾肉鲜嫩，江南名菜",
                "steps": [
                    {"order": 1, "description": "河虾洗净沥干，剪去虾须", "duration": 10},
                    {"order": 2, "description": "热油至180度，倒入河虾", "duration": 2},
                    {"order": 3, "description": "快速翻炒至虾变红", "duration": 2},
                    {"order": 4, "description": "加入调料，大火收汁", "duration": 3},
                    {"order": 5, "description": "撒葱花出锅", "duration": 1}
                ],
                "tips": ["油温要高，快速爆炒", "不要炒太久，保持虾肉鲜嫩"]
            }
        ],
        "seasonings": [
            {"id": "34", "name": "生抽", "quantity": "20ml", "included": True},
            {"id": "35", "name": "料酒", "quantity": "15ml", "included": True},
            {"id": "36", "name": "白糖", "quantity": "15g", "included": True},
            {"id": "37", "name": "食用油", "quantity": "50ml", "included": True}
        ],
        "nutrition_info": {"calories": 320, "protein": 35, "carbs": 12, "fat": 14, "fiber": 2},
        "is_limited": True,
        "stock_quantity": 40,
        "merchant_id": 2,
        "status": "active"
    },
    {
        "id": 12,
        "name": "福建沿海海鲜盛宴",
        "description": "精选福建沿海新鲜海鲜，鲍鱼、海参、扇贝，一场海鲜的豪华盛宴",
        "level": "advanced",
        "price": 358,
        "original_price": 458,
        "image": "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&auto=format&fit=crop",
        "tags": ["海鲜", "豪华", "宴请", "高端"],
        "ingredients": [
            {"id": "47", "name": "鲜鲍鱼", "category": "海鲜", "quantity": 6, "unit": "只", "origin": "福建宁德"},
            {"id": "48", "name": "海参", "category": "海鲜", "quantity": 200, "unit": "g", "origin": "福建霞浦"},
            {"id": "49", "name": "扇贝", "category": "海鲜", "quantity": 8, "unit": "只", "origin": "福建莆田"},
            {"id": "50", "name": "花菇", "category": "菌菇", "quantity": 100, "unit": "g", "origin": "福建古田"}
        ],
        "recipes": [
            {
                "id": "12",
                "name": "佛跳墙",
                "description": "闽菜经典，汇聚多种珍贵食材",
                "steps": [
                    {"order": 1, "description": "鲍鱼、海参提前泡发处理", "duration": 120},
                    {"order": 2, "description": "花菇泡发，扇贝洗净", "duration": 30},
                    {"order": 3, "description": "所有食材入砂锅，加高汤", "duration": 10},
                    {"order": 4, "description": "小火慢炖3小时", "duration": 180},
                    {"order": 5, "description": "调味出锅", "duration": 5}
                ],
                "tips": ["泡发要充分，食材要新鲜", "用高汤炖煮更鲜美"]
            }
        ],
        "seasonings": [
            {"id": "38", "name": "高汤", "quantity": "1L", "included": True},
            {"id": "39", "name": "绍兴酒", "quantity": "50ml", "included": True},
            {"id": "40", "name": "蚝油", "quantity": "30ml", "included": True},
            {"id": "41", "name": "盐", "quantity": "适量", "included": True}
        ],
        "nutrition_info": {"calories": 450, "protein": 48, "carbs": 18, "fat": 20, "fiber": 3},
        "is_limited": True,
        "stock_quantity": 15,
        "merchant_id": 2,
        "status": "active"
    }
]

# 生成SQL语句
print("-- 新增食材包数据")
for pkg in food_packages:
    sql = f'''({pkg['id']}, '{pkg['name']}', '{pkg['description']}', '{pkg['level']}', {pkg['price']}, {pkg['original_price']}, '{pkg['image']}',
        '{json.dumps(pkg['tags'], ensure_ascii=False)}',
        '{json.dumps(pkg['ingredients'], ensure_ascii=False)}',
        '{json.dumps(pkg['recipes'], ensure_ascii=False)}',
        '{json.dumps(pkg['seasonings'], ensure_ascii=False)}',
        '{json.dumps(pkg['nutrition_info'])}',
        {str(pkg['is_limited']).lower()}, {pkg['stock_quantity']}, {pkg['merchant_id']}, '{pkg['status']}')'''
    print(sql + ",")

print(f"\n共生成 {len(food_packages)} 个食材包")
