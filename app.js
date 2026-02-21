// 数字到卦名的映射
const numberToGua = {
    "1": { name: "乾", symbol: "☰" },
    "2": { name: "兑", symbol: "☱" },
    "3": { name: "离", symbol: "☲" },
    "4": { name: "震", symbol: "☳" },
    "5": { name: "巽", symbol: "☴" },
    "6": { name: "坎", symbol: "☵" },
    "7": { name: "艮", symbol: "☶" },
    "8": { name: "坤", symbol: "☷" }
};

// 标签切换
function switchTab(tab) {
    const sections = {
        'zhouyi': document.getElementById('section-zhouyi'),
        'liuren': document.getElementById('section-liuren'),
        'yijing-study': document.getElementById('section-yijing-study')
    };
    const tabs = {
        'zhouyi': document.getElementById('tab-zhouyi'),
        'liuren': document.getElementById('tab-liuren'),
        'yijing-study': document.getElementById('tab-yijing-study')
    };

    Object.keys(sections).forEach(key => {
        if (key === tab) {
            sections[key].classList.remove('hidden');
            tabs[key].classList.add('tab-active');
            tabs[key].classList.remove('text-gray-600');
        } else {
            sections[key].classList.add('hidden');
            tabs[key].classList.remove('tab-active');
            tabs[key].classList.add('text-gray-600');
        }
    });

    if (tab === 'yijing-study' && typeof initYijingStudy === 'function') {
        initYijingStudy();
    }
}

// 查询卦象
function queryGua() {
    const upperNum = document.getElementById('upper').value;
    const lowerNum = document.getElementById('lower').value;
    const movingYao = document.getElementById('moving').value;
    
    // 验证输入
    if (!upperNum || !lowerNum || !movingYao) {
        alert('请填写完整的卦爻信息');
        return;
    }
    
    if (upperNum < 1 || upperNum > 8 || lowerNum < 1 || lowerNum > 8) {
        alert('上卦和下卦数字必须在1-8之间');
        return;
    }
    
    if (movingYao < 1 || movingYao > 6) {
        alert('动爻必须在1-6之间');
        return;
    }
    
    const upperGua = numberToGua[upperNum];
    const lowerGua = numberToGua[lowerNum];
    
    // 查找卦名
    let guaName = '';
    let guaData = null;
    
    for (const name in guaDatabase) {
        if (guaDatabase[name].上卦 === upperGua.name && guaDatabase[name].下卦 === lowerGua.name) {
            guaName = name;
            guaData = guaDatabase[name];
            break;
        }
    }
    
    if (!guaName || !guaData) {
        alert('未找到对应的卦象');
        return;
    }
    
    // 查找爻辞
    const yaoNames = ['初', '二', '三', '四', '五', '上'];
    const yaoKey = '爻辞' + yaoNames[movingYao - 1] + '爻';
    const xiangKey = '小象传' + movingYao + '爻';
    const yaoText = guaData[yaoKey] || '';
    const xiangText = guaData[xiangKey] || '';
    
    // 核心动爻信息 - 按照"卦名 爻名动：爻辞。象曰：象传"格式
    const yaoFullName = yaoNames[movingYao - 1] + '爻';
    const mainDisplayText = `${guaName}卦 ${yaoFullName}动：${yaoText} 象曰：${xiangText}`;
    
    // 显示结果
    document.getElementById('gua-name').textContent = guaName;
    document.getElementById('gua-structure').textContent = `上${upperGua.name}${upperGua.symbol} · 下${lowerGua.name}${lowerGua.symbol}`;
    
    // 核心动爻信息 - 最前面最显眼
    document.getElementById('yao-main-display').textContent = mainDisplayText;
    
    // 动爻补充信息
    document.getElementById('moving-yao-info').textContent = `${guaName}卦 · 第${movingYao}爻（${yaoFullName}）动`;
    
    // 其他卦辞信息
    document.getElementById('gua-ci').textContent = guaData.卦辞 || '';
    document.getElementById('tuan-zhuan').textContent = guaData.彖辞 || '';
    document.getElementById('da-xiang').textContent = guaData.大象辞 || '';
    
    // 生成全卦爻辞
    generateAllYao(guaData, movingYao);
    
    // 显示结果区域
    document.getElementById('result').classList.remove('hidden');
    document.getElementById('all-yao').classList.add('hidden');
    
    // 滚动到结果
    document.getElementById('result').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// 生成全卦六爻
function generateAllYao(guaData, movingYao) {
    const allYaoDiv = document.getElementById('all-yao');
    allYaoDiv.innerHTML = '';
    
    const yaoNames = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻'];
    
    for (let i = 1; i <= 6; i++) {
        const yaoKey = '爻辞' + yaoNames[i - 1];
        const xiangKey = '小象传' + i + '爻';
        const yaoText = guaData[yaoKey] || '';
        const xiangText = guaData[xiangKey] || '';
        
        const isMoving = i == movingYao;
        const bgClass = isMoving ? 'bg-red-50 border-l-4 border-gua-red' : 'bg-gray-50';
        const badge = isMoving ? '<span class="inline-block bg-gua-red text-white text-xs px-2 py-1 rounded ml-2">动爻</span>' : '';
        
        const yaoDiv = document.createElement('div');
        yaoDiv.className = `p-3 rounded-lg ${bgClass}`;
        yaoDiv.innerHTML = `
            <div class="font-semibold text-sm mb-1">第${i}爻${yaoNames[i - 1]}${badge}</div>
            <div class="text-gray-800 text-sm">${yaoText}</div>
            <div class="text-gray-600 text-xs italic mt-1">象曰：${xiangText}</div>
        `;
        allYaoDiv.appendChild(yaoDiv);
    }
}

// 切换全卦显示
function toggleAllYao() {
    const allYaoDiv = document.getElementById('all-yao');
    allYaoDiv.classList.toggle('hidden');
}

const liurenElements = [
    '大安（艮）（木）：大安事事昌，求谋在东方，失物去不远，宅舍保安康。行人身未动，病者主无妨。代表长期、缓慢、稳定。',
    '留连（巽）（木）：留连事难成，求谋日未明。官事只宜缓，去者未回程。失物南方见，急讨方称心。代表停止、反复、复杂。',
    '速喜（离）（火）：速喜喜来临，求财向南行。失物申午未，逢人路上寻。官事有福德，病者无祸侵。代表惊喜、快速、突然。',
    '赤口（乾）（金）：赤口主口舌，官非切要防。失物急去寻，行人有惊慌。鸡犬多作怪，病者出西方。代表争斗、凶恶、伤害。',
    '小吉（坎）（水）：小吉最吉昌，路上好商量。阴人来报喜，失物在坤方。行人立便至，交关甚是强。代表起步、不多、尚可。',
    '空亡（坤）（土）：空亡事不祥，阴人多乖张。求财无利益，行人有灾殃。失物寻不见，官事有刑伤。代表失去、虚伪、空想。',
    '病符（兑）（金）：病符主病态、异常、治疗。代表先有病才需要治疗，需注意身体健康。',
    '桃花（震）（土）：桃花主欲望、牵绊、异性。代表人际关系、牵绊此事，与异性缘分相关。',
    '天德（乾）（金）：天德主贵人、上司、高远。代表求人办事、靠人成事，有贵人相助。'
];

function calcLiuren() {
    const n1 = parseInt(document.getElementById('liuren-1').value) || 0;
    const n2 = parseInt(document.getElementById('liuren-2').value) || 0;
    const n3 = parseInt(document.getElementById('liuren-3').value) || 0;

    if (!n1 || !n2 || !n3) {
        alert('请输入三个数字');
        return;
    }

    const firstIndex = (n1 - 1) % 9;
    const secondIndex = (n1 + n2 - 2) % 9;
    const thirdIndex = (n1 + n2 + n3 - 3) % 9;

    const result1 = liurenElements[firstIndex];
    const result2 = liurenElements[secondIndex];
    const result3 = liurenElements[thirdIndex];

    const god1 = result1.split('（')[0];
    const god2 = result2.split('（')[0];
    const god3 = result3.split('（')[0];

    document.getElementById('liuren-god').textContent = `${god1} → ${god2} → ${god3}`;

    const desc1 = getGodDesc(god1);
    const desc2 = getGodDesc(god2);
    const desc3 = getGodDesc(god3);

    document.getElementById('liuren-desc').textContent =
        `初：${desc1} | 中：${desc2} | 末：${desc3}`;

    document.getElementById('liuren-detail').innerHTML =
        `<strong>【初段】${result1}</strong><br><br>` +
        `<strong>【中段】${result2}</strong><br><br>` +
        `<strong>【末段】${result3}</strong>`;

    document.getElementById('liuren-result').classList.remove('hidden');
}

function getGodDesc(godName) {
    const descMap = {
        '大安': '大吉',
        '留连': '平平',
        '速喜': '中吉',
        '赤口': '大凶',
        '小吉': '小吉',
        '空亡': '大凶',
        '病符': '凶',
        '桃花': '中',
        '天德': '大吉'
    };
    return descMap[godName] || '';
}

// 回车键提交
document.addEventListener('DOMContentLoaded', function() {
    const inputs = document.querySelectorAll('input[type="number"]');
    inputs.forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                if (this.id.startsWith('liuren')) {
                    calcLiuren();
                } else {
                    queryGua();
                }
            }
        });
    });
});
