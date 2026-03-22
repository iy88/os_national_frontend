// 角色数据 - 从原始项目迁移并扩展
// 使用内联SVG占位图，确保在国内可访问

const createPlaceholderSvg = (name, color) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${color};stop-opacity:0.3" />
        <stop offset="100%" style="stop-color:#1a2b5f;stop-opacity:0.8" />
      </linearGradient>
    </defs>
    <rect width="400" height="300" fill="url(#grad)"/>
    <circle cx="200" cy="100" r="50" fill="${color}" opacity="0.6"/>
    <text x="200" y="200" text-anchor="middle" fill="#fff" font-size="24" font-weight="bold">${name}</text>
    <text x="200" y="240" text-anchor="middle" fill="rgba(255,255,255,0.6)" font-size="14">电竞人物</text>
  </svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

export const characterData = {
  hero: [
    {
      id: 'libai',
      name: '李白',
      avatar: createPlaceholderSvg('李白', '#f0b344'),
      desc: '诗仙剑客，豪放不羁',
      story: '李白，字太白，号青莲居士，唐代伟大的浪漫主义诗人。他剑术高超，喜好酒剑人生，留下了无数传颂千古的诗篇。在王者荣耀中，李白以其飘逸的剑客形象著称，一句"十步杀一人，千里不留行"道尽了他的侠客本色。他曾在长安城酒肆中以诗会友，剑光如雪，诗才横溢，被后人称为"诗仙"。',
      photos: [
        createPlaceholderSvg('李白', '#f0b344'),
        createPlaceholderSvg('李白-2', '#f0b344'),
        createPlaceholderSvg('李白-3', '#e63946')
      ]
    },
    {
      id: 'wuzetian',
      name: '武则天',
      avatar: createPlaceholderSvg('武则天', '#f0b344'),
      desc: '大唐女帝，掌控全局',
      story: '武则天，中国历史上唯一的女皇帝。她以非凡的政治智慧和铁腕手段，开创了武周盛世。在王者荣耀中，武则天以其掌控全局的女帝风范著称，是中路法师的代表性人物。她知人善任，恩威并施，在游戏中的台词"奉我为主"尽显帝王霸气。',
      photos: [
        createPlaceholderSvg('武则天', '#f0b344'),
        createPlaceholderSvg('武则天-2', '#d4962e'),
        createPlaceholderSvg('武则天-3', '#e63946')
      ]
    },
    {
      id: 'zhuge',
      name: '诸葛亮',
      avatar: createPlaceholderSvg('诸葛亮', '#f0b344'),
      desc: '智谋军师，算无遗策',
      story: '诸葛亮，字孔明，号卧龙，三国时期蜀汉的丞相。他上知天文，下知地理，谋略无双，是中华民族智慧的象征。在王者荣耀中，诸葛亮以其高机动性和爆发伤害著称，是中单位置的常青树。他的羽毛扇轻摇之间，便是敌军灰飞烟灭之际。',
      photos: [
        createPlaceholderSvg('诸葛亮', '#f0b344'),
        createPlaceholderSvg('诸葛亮-2', '#d4962e'),
        createPlaceholderSvg('诸葛亮-3', '#409eff')
      ]
    }
  ],
  player: [
    {
      id: 'fly',
      name: 'Fly',
      avatar: createPlaceholderSvg('Fly', '#e63946'),
      desc: '六冠王边路，KPL传奇',
      story: '彭云飞（Fly），重庆狼队边路选手，KPL六冠王。他以花木兰、关羽等战边英雄闻名，操作细腻，意识超群，是公认的KPL历史第一人。Fly的职业生涯充满了传奇色彩，从早期的默默无闻到如今的传奇地位，他用实力证明了自己。',
      photos: [
        createPlaceholderSvg('Fly', '#e63946'),
        createPlaceholderSvg('Fly-2', '#e63946'),
        createPlaceholderSvg('Fly-3', '#d4962e')
      ]
    },
    {
      id: 'cat',
      name: 'Cat',
      avatar: createPlaceholderSvg('Cat', '#e63946'),
      desc: '传奇中单，指挥大师',
      story: '陈正正（Cat），武汉eStarPro中单选手，KPL三冠王。他是公认的传奇中单，以不知火舞、上官婉儿等法师闻名。Cat不仅个人操作顶级，更是队伍的灵魂指挥，曾带领多支队伍走向巅峰，是KPL历史上最伟大的选手之一。',
      photos: [
        createPlaceholderSvg('Cat', '#e63946'),
        createPlaceholderSvg('Cat-2', '#e63946'),
        createPlaceholderSvg('Cat-3', '#d4962e')
      ]
    },
    {
      id: 'yinuo',
      name: '一诺',
      avatar: createPlaceholderSvg('一诺', '#e63946'),
      desc: '顶级发育路，极限操作',
      story: '徐必成（一诺)，成都AG超玩会发育路选手。他以公孙离、孙尚香等射手英雄著称，是KPL顶级发育路选手。一诺以其极限操作闻名，多次在关键时刻奉献名场面，是AG超玩会的核心成员。',
      photos: [
        createPlaceholderSvg('一诺', '#e63946'),
        createPlaceholderSvg('一诺-2', '#e63946'),
        createPlaceholderSvg('一诺-3', '#d4962e')
      ]
    }
  ],
  celebrity: [
    {
      id: 'daniu',
      name: '大仙',
      avatar: createPlaceholderSvg('大仙', '#2a9d8f'),
      desc: '人气主播，欢乐解说',
      story: '大仙（前XYG战队创始人），知名王者荣耀主播。他以幽默风趣的直播风格著称，是王者荣耀板块最受欢迎的主播之一。大仙的解说深入浅出，既有专业性又有娱乐性，深受玩家喜爱。',
      photos: [
        createPlaceholderSvg('大仙', '#2a9d8f'),
        createPlaceholderSvg('大仙-2', '#2a9d8f'),
        createPlaceholderSvg('大仙-3', '#409eff')
      ]
    },
    {
      id: 'gemini',
      name: 'Gemini',
      avatar: createPlaceholderSvg('Gemini', '#2a9d8f'),
      desc: '冠军教练，战术大师',
      story: 'Gemini，知名王者荣耀教练，曾担任多支KPL战队教练，以战术研究深入著称。他对游戏理解深刻，培养了众多优秀选手，是KPL公认的冠军教练之一。',
      photos: [
        createPlaceholderSvg('Gemini', '#2a9d8f'),
        createPlaceholderSvg('Gemini-2', '#2a9d8f'),
        createPlaceholderSvg('Gemini-3', '#409eff')
      ]
    },
    {
      id: 'jiuge',
      name: '九日',
      avatar: createPlaceholderSvg('九日', '#2a9d8f'),
      desc: '国服貂蝉，技术主播',
      story: '九日，知名王者荣耀技术主播，以貂蝉等国服英雄闻名。他的操作细腻，意识超前，是玩家心中的技术标杆。九日的直播教学内容丰富，深受玩家喜爱。',
      photos: [
        createPlaceholderSvg('九日', '#2a9d8f'),
        createPlaceholderSvg('九日-2', '#2a9d8f'),
        createPlaceholderSvg('九日-3', '#409eff')
      ]
    }
  ]
}

export const categoryInfo = {
  hero: {
    name: '游戏英雄',
    icon: '🗡️',
    color: '#f0b344'
  },
  player: {
    name: '电竞选手',
    icon: '🏆',
    color: '#e63946'
  },
  celebrity: {
    name: '电竞达人',
    icon: '🎮',
    color: '#2a9d8f'
  }
}

export const getWelcomeMsg = (category) => {
  const msgMap = {
    hero: '欢迎召唤师！本将在此，有何指教？',
    player: '你好！很高兴能和你交流电竞心得～',
    celebrity: '哈喽！想聊点什么电竞趣事？'
  }
  return msgMap[category] || '你好！'
}

export const getCharacterWelcome = (charId) => {
  const msgMap = {
    libai: '十步杀一人，千里不留行！召唤师有何见教？',
    wuzetian: '普天之下，莫非王土！你有什么问题？',
    zhuge: '运筹帷幄，决胜千里！请讲。',
    fly: '想聊聊边路打法？我可以给你一些建议～',
    cat: '中路节奏很重要，你想知道什么？',
    yinuo: '发育路的细节，我都可以告诉你！',
    daniu: '哈哈，又来一个想上分的小伙伴？',
    gemini: '战术分析我最在行，尽管问！',
    jiuge: '貂蝉的连招技巧，要不要学学？'
  }
  return msgMap[charId] || '你好！很高兴认识你～'
}

export const getReplyContent = () => {
  const replies = [
    '你的问题很有深度，让我好好思考一下～',
    '这个点确实很关键，我来详细解答一下...',
    '哈哈，这个问题问得好！其实答案很简单～',
    '根据我的经验，我建议你可以这样做...',
    '这个话题很有趣，我们可以深入聊聊～'
  ]
  return replies[Math.floor(Math.random() * replies.length)]
}
