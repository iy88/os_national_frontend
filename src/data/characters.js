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
            story: '李白，字太白，号青莲居士，唐代伟大的浪漫主义诗人。他剑术高超，喜好酒剑人生，留下了无数传颂千古的诗篇。在王者荣耀中，李白以其飘逸的剑客形象著称，一句"十步杀一人，千里不留行"道尽了他的侠客本色。',
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
            story: '武则天，中国历史上唯一的女皇帝。她以非凡的政治智慧和铁腕手段，开创了武周盛世。在王者荣耀中，武则天以其掌控全局的女帝风范著称，是中路法师的代表性人物。',
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
            story: '诸葛亮，字孔明，号卧龙，三国时期蜀汉的丞相。他上知天文，下知地理，谋略无双，是中华民族智慧的象征。在王者荣耀中，诸葛亮以其高机动性和爆发伤害著称。',
            photos: [
                createPlaceholderSvg('诸葛亮', '#f0b344'),
                createPlaceholderSvg('诸葛亮-2', '#d4962e'),
                createPlaceholderSvg('诸葛亮-3', '#409eff')
            ]
        },
        {
            id: 'diaochan',
            name: '貂蝉',
            avatar: createPlaceholderSvg('貂蝉', '#f0b344'),
            desc: '绝代佳人，舞姿倾城',
            story: '貂蝉，中国古代四大美女之一，以绝世舞姿倾倒众生。在王者荣耀中，貂蝉是法师中极具操作性的英雄，以其灵活的位移和真实伤害著称。',
            photos: [
                createPlaceholderSvg('貂蝉', '#f0b344'),
                createPlaceholderSvg('貂蝉-2', '#e63946'),
                createPlaceholderSvg('貂蝉-3', '#d4962e')
            ]
        },
        {
            id: 'sunwukong',
            name: '孙悟空',
            avatar: createPlaceholderSvg('孙悟空', '#f0b344'),
            desc: '齐天大圣，金箍棒下无敌',
            story: '孙悟空，又名齐天大圣，拥有七十二变和筋斗云。在王者荣耀中，孙悟空以其高爆发和灵活的切入能力著称，是打野位置的热门英雄。',
            photos: [
                createPlaceholderSvg('孙悟空', '#f0b344'),
                createPlaceholderSvg('孙悟空-2', '#e63946'),
                createPlaceholderSvg('孙悟空-3', '#d4962e')
            ]
        },
        {
            id: 'hanxin',
            name: '韩信',
            avatar: createPlaceholderSvg('韩信', '#f0b344'),
            desc: '国士无双，兵仙传奇',
            story: '韩信，西汉开国功臣，中国军事思想的代表人物。在王者荣耀中，韩信以其超高的机动性和多段位移著称，是打野位置的标志性英雄。',
            photos: [
                createPlaceholderSvg('韩信', '#f0b344'),
                createPlaceholderSvg('韩信-2', '#e63946'),
                createPlaceholderSvg('韩信-3', '#d4962e')
            ]
        },
        {
            id: 'nako',
            name: '娜可露露',
            avatar: createPlaceholderSvg('娜可露露', '#f0b344'),
            desc: '玛哈咕噜，鹰之守护',
            story: '娜可露露是一位来自SNK系列的格斗游戏角色，在王者荣耀中她是一位高爆发的刺客型英雄，以快速的连招和强大的输出能力著称。',
            photos: [
                createPlaceholderSvg('娜可露露', '#f0b344'),
                createPlaceholderSvg('娜可露露-2', '#e63946'),
                createPlaceholderSvg('娜可露露-3', '#d4962e')
            ]
        },
        {
            id: 'mai',
            name: '不知火舞',
            avatar: createPlaceholderSvg('不知火舞', '#f0b344'),
            desc: '忍术大师，扇中藏锋',
            story: '不知火舞来自SNK系列，是一位兼具美貌与实力的忍者。在王者荣耀中，她是一位灵活的中单法师，以其多段位移和控制能力著称。',
            photos: [
                createPlaceholderSvg('不知火舞', '#f0b344'),
                createPlaceholderSvg('不知火舞-2', '#e63946'),
                createPlaceholderSvg('不知火舞-3', '#d4962e')
            ]
        },
        {
            id: 'houyi',
            name: '后羿',
            avatar: createPlaceholderSvg('后羿', '#f0b344'),
            desc: '日落神箭，百发百中',
            story: '后羿，中国古代神话中的射日英雄。在王者荣耀中，后羿是一位极具威胁的射手，以其超远射程和持续输出能力著称。',
            photos: [
                createPlaceholderSvg('后羿', '#f0b344'),
                createPlaceholderSvg('后羿-2', '#e63946'),
                createPlaceholderSvg('后羿-3', '#d4962e')
            ]
        },
        {
            id: 'luna',
            name: '露娜',
            avatar: createPlaceholderSvg('露娜', '#f0b344'),
            desc: '月光之女，剑刃如霜',
            story: '露娜是一位以月之力为来源的战士，拥有强大的突进和持续作战能力。在王者荣耀中，露娜以其月下无限连的华丽操作著称。',
            photos: [
                createPlaceholderSvg('露娜', '#f0b344'),
                createPlaceholderSvg('露娜-2', '#e63946'),
                createPlaceholderSvg('露娜-3', '#d4962e')
            ]
        },
        {
            id: 'kaisa',
            name: '凯',
            avatar: createPlaceholderSvg('凯', '#f0b344'),
            desc: '破晓之刃，一刀流',
            story: '凯是长城守卫军的一员，被称为"凯皇"。在王者荣耀中，凯以其高爆发和单挑能力著称，大招开启后的伤害极为恐怖。',
            photos: [
                createPlaceholderSvg('凯', '#f0b344'),
                createPlaceholderSvg('凯-2', '#e63946'),
                createPlaceholderSvg('凯-3', '#d4962e')
            ]
        },
        {
            id: 'goujian',
            name: '狗噬',
            avatar: createPlaceholderSvg('狗噬', '#f0b344'),
            desc: '狂野猎手，暗影追踪',
            story: '狗噬是一位来自王者荣耀的刺客型英雄，以其高机动性和爆发伤害著称，是后排脆皮的噩梦。',
            photos: [
                createPlaceholderSvg('狗噬', '#f0b344'),
                createPlaceholderSvg('狗噬-2', '#e63946'),
                createPlaceholderSvg('狗噬-3', '#d4962e')
            ]
        }
    ],
    player: [
        {
            id: 'fly',
            name: 'Fly',
            avatar: createPlaceholderSvg('Fly', '#e63946'),
            desc: '六冠王边路，KPL传奇',
            story: '彭云飞（Fly），重庆狼队边路选手，KPL六冠王。他以花木兰、关羽等战边英雄闻名，操作细腻，意识超群，是公认的KPL历史第一人。',
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
            story: '陈正正（Cat），武汉eStarPro中单选手，KPL三冠王。他是公认的传奇中单，以不知火舞、上官婉儿等法师闻名。Cat不仅个人操作顶级，更是队伍的灵魂指挥。',
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
            story: '徐必成（一诺)，成都AG超玩会发育路选手。他以公孙离、孙尚香等射手英雄著称，是KPL顶级发育路选手。',
            photos: [
                createPlaceholderSvg('一诺', '#e63946'),
                createPlaceholderSvg('一诺-2', '#e63946'),
                createPlaceholderSvg('一诺-3', '#d4962e')
            ]
        },
        {
            id: 'faker',
            name: 'Faker',
            avatar: createPlaceholderSvg('Faker', '#e63946'),
            desc: '大魔王，LOL传奇中单',
            story: '李相赫（Faker），T1战队中单选手，英雄联盟历史上最伟大的选手之一。三次全球总决赛冠军，无数个人荣誉，是电竞界的标志性人物。',
            photos: [
                createPlaceholderSvg('Faker', '#e63946'),
                createPlaceholderSvg('Faker-2', '#e63946'),
                createPlaceholderSvg('Faker-3', '#d4962e')
            ]
        },
        {
            id: 'theshy',
            name: 'Theshy',
            avatar: createPlaceholderSvg('Theshy', '#e63946'),
            desc: '天使降临，上单操作怪',
            story: '姜承禄（Theshy），WBG上单选手，以其极具观赏性的操作风格著称。他是英雄联盟最具观赏性的上单选手之一，天使降临是他的标志性表现。',
            photos: [
                createPlaceholderSvg('Theshy', '#e63946'),
                createPlaceholderSvg('Theshy-2', '#e63946'),
                createPlaceholderSvg('Theshy-3', '#d4962e')
            ]
        },
        {
            id: 'uzi',
            name: 'Uzi',
            avatar: createPlaceholderSvg('Uzi', '#e63946'),
            desc: '永远的神，ADC标杆',
            story: '简自豪（Uzi），前RNG战队ADC选手，被誉为"永远的神"。他的薇恩是世界级的，无数名场面让他成为ADC位置的代名词。',
            photos: [
                createPlaceholderSvg('Uzi', '#e63946'),
                createPlaceholderSvg('Uzi-2', '#e63946'),
                createPlaceholderSvg('Uzi-3', '#d4962e')
            ]
        },
        {
            id: 'mlxg',
            name: 'Mlxg',
            avatar: createPlaceholderSvg('Mlxg', '#e63946'),
            desc: '绝食打野，全明星野王',
            story: '刘世宇（Mlxg），RNG打野选手，以其极具侵略性的打野风格著称。他敢打敢拼的操作风格为他赢得了"绝食打野"的外号。',
            photos: [
                createPlaceholderSvg('Mlxg', '#e63946'),
                createPlaceholderSvg('Mlxg-2', '#e63946'),
                createPlaceholderSvg('Mlxg-3', '#d4962e')
            ]
        },
        {
            id: 'clearlove',
            name: 'Clearlove',
            avatar: createPlaceholderSvg('Clearlove', '#e63946'),
            desc: '养猪狂人，野区掌门',
            story: '明凯（Clearlove），EDG打野选手，英雄联盟职业联赛的传奇人物。他的养猪战术曾统治整个野区，是LPL最成功的打野选手之一。',
            photos: [
                createPlaceholderSvg('Clearlove', '#e63946'),
                createPlaceholderSvg('Clearlove-2', '#e63946'),
                createPlaceholderSvg('Clearlove-3', '#d4962e')
            ]
        },
        {
            id: 'jackeylove',
            name: 'JackeyLove',
            avatar: createPlaceholderSvg('JackeyLove', '#e63946'),
            desc: '水子哥，冠军ADC',
            story: '喻文波（JackeyLove），TES战队ADC选手，S8全球总决赛冠军。他的德莱文出神入化，是当今最具攻击性的ADC选手之一。',
            photos: [
                createPlaceholderSvg('JackeyLove', '#e63946'),
                createPlaceholderSvg('JackeyLove-2', '#e63946'),
                createPlaceholderSvg('JackeyLove-3', '#d4962e')
            ]
        },
        {
            id: 'rookie',
            name: 'Rookie',
            avatar: createPlaceholderSvg('Rookie', '#e63946'),
            desc: '宋义进，冠军中单',
            story: '宋义进（Rookie），TES中单选手，S8全球总决赛冠军。他是LPL最具统治力的中单之一，以其稳定的发挥和强大的对线能力著称。',
            photos: [
                createPlaceholderSvg('Rookie', '#e63946'),
                createPlaceholderSvg('Rookie-2', '#e63946'),
                createPlaceholderSvg('Rookie-3', '#d4962e')
            ]
        },
        {
            id: 'doinb',
            name: 'Doinb',
            avatar: createPlaceholderSvg('Doinb', '#e63946'),
            desc: '硬币哥，冠军中单',
            story: '金泰相（Doinb），FPX中单选手，S9全球总决赛冠军。他以其独特的英雄池和极具观赏性的打法著称，是电竞圈的超级明星。',
            photos: [
                createPlaceholderSvg('Doinb', '#e63946'),
                createPlaceholderSvg('Doinb-2', '#e63946'),
                createPlaceholderSvg('Doinb-3', '#d4962e')
            ]
        },
        {
            id: 'xiaohu',
            name: '小虎',
            avatar: createPlaceholderSvg('小虎', '#e63946'),
            desc: '虎掌门，冠军中单',
            story: '李元浩（Xiaohu），RNG中单选手，曾获英雄联盟全球总决赛冠军。他从中单位置转到上单依然表现出色，是LPL的标志性选手。',
            photos: [
                createPlaceholderSvg('小虎', '#e63946'),
                createPlaceholderSvg('小虎-2', '#e63946'),
                createPlaceholderSvg('小虎-3', '#d4962e')
            ]
        }
    ],
    celebrity: [
        {
            id: 'daniu',
            name: '大仙',
            avatar: createPlaceholderSvg('大仙', '#2a9d8f'),
            desc: '人气主播，欢乐解说',
            story: '大仙（前XYG战队创始人），知名王者荣耀主播。他以幽默风趣的直播风格著称，是王者荣耀板块最受欢迎的主播之一。',
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
            story: 'Gemini，知名王者荣耀教练，曾担任多支KPL战队教练，以战术研究深入著称。他对游戏理解深刻，培养了众多优秀选手。',
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
            story: '九日，知名王者荣耀技术主播，以貂蝉等国服英雄闻名。他的操作细腻，意识超前，是玩家心中的技术标杆。',
            photos: [
                createPlaceholderSvg('九日', '#2a9d8f'),
                createPlaceholderSvg('九日-2', '#2a9d8f'),
                createPlaceholderSvg('九日-3', '#409eff')
            ]
        },
        {
            id: 'pdd',
            name: 'PDD',
            avatar: createPlaceholderSvg('PDD', '#2a9d8f'),
            desc: '骚猪主播，电竞教父',
            story: 'PDD，前英雄联盟职业选手，现为知名主播和战队老板。他创立了YM战队，培养了多位世界冠军，是电竞圈的教父级人物。',
            photos: [
                createPlaceholderSvg('PDD', '#2a9d8f'),
                createPlaceholderSvg('PDD-2', '#2a9d8f'),
                createPlaceholderSvg('PDD-3', '#409eff')
            ]
        },
        {
            id: 'simon',
            name: '大司马',
            avatar: createPlaceholderSvg('大司马', '#2a9d8f'),
            desc: '金牌厨师，长者风范',
            story: '大司马，知名英雄联盟主播，以其独特的教学风格和"金牌厨师"梗著称。他的直播既有娱乐性又有技术含量。',
            photos: [
                createPlaceholderSvg('大司马', '#2a9d8f'),
                createPlaceholderSvg('大司马-2', '#2a9d8f'),
                createPlaceholderSvg('大司马-3', '#409eff')
            ]
        },
        {
            id: 'xiaoZ',
            name: '小智',
            avatar: createPlaceholderSvg('小智', '#2a9d8f'),
            desc: '经典解说，情怀主播',
            story: '小智，早期英雄联盟最具影响力的解说之一。他的视频风趣幽默，是一代玩家的青春记忆。',
            photos: [
                createPlaceholderSvg('小智', '#2a9d8f'),
                createPlaceholderSvg('小智-2', '#2a9d8f'),
                createPlaceholderSvg('小智-3', '#409eff')
            ]
        },
        {
            id: 'miss',
            name: 'Miss',
            avatar: createPlaceholderSvg('Miss', '#2a9d8f'),
            desc: 'Miss大小姐，人气解说',
            story: 'Miss，前职业选手转型解说，是电竞圈最具人气的女性解说之一。她的《Miss排位日记》是很多玩家的必看节目。',
            photos: [
                createPlaceholderSvg('Miss', '#2a9d8f'),
                createPlaceholderSvg('Miss-2', '#2a9d8f'),
                createPlaceholderSvg('Miss-3', '#409eff')
            ]
        },
        {
            id: 'ruofeng',
            name: '若风',
            avatar: createPlaceholderSvg('若风', '#2a9d8f'),
            desc: '宇宙人，中路主播',
            story: '若风，前英雄联盟职业选手，现为知名主播。他以德莱文等英雄著称，是早期电竞圈的标志性人物。',
            photos: [
                createPlaceholderSvg('若风', '#2a9d8f'),
                createPlaceholderSvg('若风-2', '#2a9d8f'),
                createPlaceholderSvg('若风-3', '#409eff')
            ]
        },
        {
            id: 'whx',
            name: '王稳健',
            avatar: createPlaceholderSvg('王稳健', '#2a9d8f'),
            desc: '技术主播，操作怪',
            story: '王稳健，知名技术主播，以其细腻的操作和深入浅出的教学著称，深受玩家喜爱。',
            photos: [
                createPlaceholderSvg('王稳健', '#2a9d8f'),
                createPlaceholderSvg('王稳健-2', '#2a9d8f'),
                createPlaceholderSvg('王稳健-3', '#409eff')
            ]
        },
        {
            id: 'z',
            name: '寒夜',
            avatar: createPlaceholderSvg('寒夜', '#2a9d8f'),
            desc: '战术大师，解说新星',
            story: '寒夜，知名王者荣耀解说，以其专业的战术分析和独特的解说风格著称。',
            photos: [
                createPlaceholderSvg('寒夜', '#2a9d8f'),
                createPlaceholderSvg('寒夜-2', '#2a9d8f'),
                createPlaceholderSvg('寒夜-3', '#409eff')
            ]
        },
        {
            id: 'lx',
            name: '赖神',
            avatar: createPlaceholderSvg('赖神', '#2a9d8f'),
            desc: '赖神出品，必属精品',
            story: '赖神，知名王者荣耀主播，以其独特的直播风格和高超的技术深受玩家喜爱。',
            photos: [
                createPlaceholderSvg('赖神', '#2a9d8f'),
                createPlaceholderSvg('赖神-2', '#2a9d8f'),
                createPlaceholderSvg('赖神-3', '#409eff')
            ]
        },
        {
            id: 'jy',
            name: '解说JY',
            avatar: createPlaceholderSvg('解说JY', '#2a9d8f'),
            desc: '战术大师，人气解说',
            story: 'JY，知名解说，以其专业的战术分析和对游戏的深刻理解著称，是电竞解说的标杆人物。',
            photos: [
                createPlaceholderSvg('解说JY', '#2a9d8f'),
                createPlaceholderSvg('解说JY-2', '#2a9d8f'),
                createPlaceholderSvg('解说JY-3', '#409eff')
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


export const getCharacterWelcome = (charId) => {
    const msgMap = {
        libai: '十步杀一人，千里不留行！召唤师有何见教？',
        wuzetian: '普天之下，莫非王土！你有什么问题？',
        zhuge: '运筹帷幄，决胜千里！请讲。',
        diaochan: '起舞弄清影，何似在人间～',
        sunwukong: '俺老孙来也！有何贵干？',
        hanxin: '国士无双，十大功勋！',
        nako: '娜可露露，前来报到！',
        mai: '火舞扇风，忍道永存！',
        houyi: '弯弓射日，百步穿杨！',
        luna: '月光下的剑刃，最为锋利！',
        kaisa: '高原血统，誓约之刃！',
        goujian: '暗影猎手，随时出击！',
        fly: '想聊聊边路打法？我可以给你一些建议～',
        cat: '中路节奏很重要，你想知道什么？',
        yinuo: '发育路的细节，我都可以告诉你！',
        faker: '大魔王在此，你有什么想问的？',
        theshy: '天使降临，你想知道上单的奥秘吗？',
        uzi: '永远的神，你的ADC有什么问题？',
        mlxg: '绝食打野，敢打敢拼！',
        clearlove: '养猪战术，深入浅出！',
        jackeylove: '水子哥来了，想学什么？',
        rookie: '义进在此，有问必答！',
        doinb: '硬币哥为您服务～',
        xiaohu: '虎掌门来也！',
        daniu: '哈哈，又来一个想上分的小伙伴？',
        gemini: '战术分析我最在行，尽管问！',
        jiuge: '貂蝉的连招技巧，要不要学学？',
        pdd: '骚猪在此，有话快说！',
        simon: '金牌厨师，为你服务～',
        xiaoZ: '经典解说，情怀满满！',
        miss: 'Miss大小姐，有什么想问的？',
        ruofeng: '宇宙人出动！',
        whx: '稳健操作，你值得拥有！',
        z: '寒夜带你看世界～',
        lx: '赖神出品，必属精品！',
        jy: '战术大师，为你分析！'
    }
    return msgMap[charId] || '你好！很高兴认识你～'
}


// 模拟流式输出的长回复
export const mockStreamReply = `这个问题问得非常好！让我来为你详细解答一下。

首先，我们需要理解这个问题的核心要点。在我看来，主要有以下几个方面需要注意：

🏆 第一点：基础认知
任何技术的提升都离不开扎实的基础。就像的职业选手一样，他们每天都会进行大量的基础训练，比如补刀、走位、视野控制等。这些看似简单的操作，实际上是构成高手的基石。

💡 第二点：实战应用
理论固然重要，但更需要与实战相结合。我建议你可以这样做：
1. 每天安排2-3小时专注练习
2. 观看高水平比赛，学习他们的思路
3. 记录自己的对局，分析失误原因
4. 找到适合自己的打法风格

🔥 第三点：心态管理
这也是最容易被忽视的一点。很多玩家技术已经很不错了，但在关键时刻却总是失误，这就是心态问题。我建议：
- 保持平常心，不要太在意一时的胜负
- 遇到连败时及时休息，调整状态
- 和朋友一起开黑，保持轻松愉快的氛围

📈 第四点：持续进步
记住，进步是一个循序渐进的过程。不要期望一夜之间就能突飞猛进，而是要脚踏实地，每天进步一点点。长期坚持下来，你会发现自己已经超越了很多当初比你强的人。

希望这些建议对你有帮助！如果还有其他问题，随时问我～`
