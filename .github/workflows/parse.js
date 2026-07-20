const fs = require('fs');

const MOCK = {
  weibo: [
    '北京暴雨预警升级为红色', '特斯拉发布全新车型', '网友热议高考分数线出炉',
    '国内油价迎来新一轮调整', '某知名主播宣布停播', '全国多地发布高温预警',
    '宫寝美学变最新流行风格', '大学生创业中衣获百万融资', '星巴克开发全新树黄杏咖啡',
    '秧子契弹射突进过百亿流量',
  ],
  zhihu: [
    '如何看待 2026 年的经济形势？', '有哪些你以为是常识但其实是错误的知识？',
    '月薪 2 万在一线城市是什么体验？', '如何评价最新发布的旗舰手机？',
    '工作中被领导批评了该怎么调整心态？', '为什么越来越多的人选择远程办公？',
    '于和的斓子为什么这么受欢迎？', '人类什么时候能登上火星？',
    '第一份工作去大厂还是小公司？', '睡眠质量差怎么科学改善？',
  ],
  international: [
    '联合国气候大会达成新协议', '美联储宣布加息 25 个基点', '欧盟通过数字市场法案修正案',
    '日本央行维持超宽松货币政策', '中东局势再度引发关注', '欧洲多国遭受极端高温袭击',
    '美国就业数据低于预期', '泰国推出新一轮旅游签证豁免…', '英国政府公布数字英镑计划',
    '澳大利亚宣布升级移民政策',
  ],
  ai: [
    'GPT-5 发布，多项能力大幅提升', 'AI 芯片初创公司获 10 亿美元融资',
    '开源大模型社区突破 1000 万用户', 'AI 辅助编程工具全面普及',
    '全球 AI 监管框架进入立法阶段', '软银发布全新码农工具 AI Agent',
    '自动驾驶汽车规模化落地加速', 'AI 医疗终端推出全自动化诊断',
    '多模态大模型成为行业标配', '人工智能专业就业薪资再创新高',
  ],
  digital: [
    '苹果即将发布新款 MacBook Pro', '国产折叠屏手机销量创新高', '索尼发布新一代游戏主机',
    '高通发布全新旗舰芯片', '智能手表市场份额排名出炉', '超薄笔记本重量突破 800 克',
    'XR 头显生态应用突破百款', '华为全面回归旗舰手机市场', '无线充电速率将进入百瓦时代',
    '智能穿戴设备继续一年更新餐',
  ],
};

const result = {};

// 微博
try {
  const raw = JSON.parse(fs.readFileSync('weibo_raw.json', 'utf8'));
  const realtime = raw.data?.realtime || [];
  result.weibo = realtime.slice(0, 10).map((item, i) => ({
    rank: i + 1,
    title: item.word || item.title,
  }));
} catch {
  result.weibo = MOCK.weibo.map((t, i) => ({ rank: i + 1, title: t }));
}

// 知乎
try {
  const raw = JSON.parse(fs.readFileSync('zhihu_raw.json', 'utf8'));
  const list = raw.data || [];
  result.zhihu = list.slice(0, 10).map((item, i) => ({
    rank: i + 1,
    title: item.target?.title || item.title,
  }));
} catch {}

if (!result.zhihu || result.zhihu.length === 0) {
  result.zhihu = MOCK.zhihu.map((t, i) => ({ rank: i + 1, title: t }));
}

// 国际新闻 (RSS 手动解析)
try {
  const xml = fs.readFileSync('bbc.xml', 'utf8');
  if (xml.trim()) {
    const titles = [];
    const regex = /<title>([^<]+)<\/title>/g;
    let match;
    let skipFirst = true;
    while ((match = regex.exec(xml)) !== null) {
      if (skipFirst) { skipFirst = false; continue; }
      titles.push(match[1].trim());
      if (titles.length >= 10) break;
    }
    result.international = titles.map((t, i) => ({ rank: i + 1, title: t }));
  }
} catch {}

if (!result.international || result.international.length === 0) {
  result.international = MOCK.international.map((t, i) => ({ rank: i + 1, title: t }));
}

// AI (Hacker News)
try {
  const ids = JSON.parse(fs.readFileSync('hn_ids.json', 'utf8'));
  if (Array.isArray(ids) && ids.length > 0) {
    const top10 = ids.slice(0, 10);
    const titles = [];
    for (const id of top10) {
      try {
        const buf = require('child_process').execSync(
          `curl -s "https://hacker-news.firebaseio.com/v0/item/${id}.json"`,
          { timeout: 5000, encoding: 'utf8' }
        );
        const item = JSON.parse(buf.toString());
        if (item?.title) titles.push(item.title);
      } catch {}
    }
    result.ai = titles.map((t, i) => ({ rank: i + 1, title: t }));
  }
} catch {}

if (!result.ai) {
  result.ai = MOCK.ai.map((t, i) => ({ rank: i + 1, title: t }));
}

// 数码
try {
  const raw = JSON.parse(fs.readFileSync('digital_raw.json', 'utf8'));
  const list = raw.data || [];
  result.digital = list.slice(0, 10).map((item, i) => ({
    rank: i + 1,
    title: item.title,
  }));
} catch {
  result.digital = MOCK.digital.map((t, i) => ({ rank: i + 1, title: t }));
}

fs.writeFileSync('data/news.json', JSON.stringify(result, null, 2));
console.log('已生成 data/news.json');
