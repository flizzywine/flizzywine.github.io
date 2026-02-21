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
    const zhouyiSection = document.getElementById('section-zhouyi');
    const liurenSection = document.getElementById('section-liuren');
    const zhouyiTab = document.getElementById('tab-zhouyi');
    const liurenTab = document.getElementById('tab-liuren');
    
    if (tab === 'zhouyi') {
        zhouyiSection.classList.remove('hidden');
        liurenSection.classList.add('hidden');
        zhouyiTab.classList.add('tab-active');
        zhouyiTab.classList.remove('text-gray-600');
        liurenTab.classList.remove('tab-active');
        liurenTab.classList.add('text-gray-600');
    } else {
        zhouyiSection.classList.add('hidden');
        liurenSection.classList.remove('hidden');
        liurenTab.classList.add('tab-active');
        liurenTab.classList.remove('text-gray-600');
        zhouyiTab.classList.remove('tab-active');
        zhouyiTab.classList.add('text-gray-600');
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
    const yaoKey = '爻辞' + ['初', '二', '三', '四', '五', '上'][movingYao - 1] + '爻';
    const xiangKey = '小象传' + movingYao + '爻';
    const yaoText = guaData[yaoKey] || '';
    const xiangText = guaData[xiangKey] || '';
    
    // 显示结果
    document.getElementById('gua-name').textContent = guaName;
    document.getElementById('gua-structure').textContent = `上${upperGua.name}${upperGua.symbol} · 下${lowerGua.name}${lowerGua.symbol}`;
    document.getElementById('moving-yao-info').textContent = `${guaName}卦 · 第${movingYao}爻动`;
    document.getElementById('gua-ci').textContent = guaData.卦辞 || '';
    document.getElementById('tuan-zhuan').textContent = guaData.彖辞 || '';
    document.getElementById('da-xiang').textContent = guaData.大象辞 || '';
    document.getElementById('yao-text').textContent = yaoText;
    document.getElementById('xiang-text').textContent = `象曰：${xiangText}`;
    
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

// 小六壬计算
const liurenGods = ['大安', '留连', '速喜', '赤口', '小吉', '空亡'];
const liurenDetails = {
    '大安': {
        desc: '大吉',
        detail: '大安事事昌，求谋在东方，失物去不远，宅舍保安康。行人身未动，病者主无妨。'
    },
    '留连': {
        desc: '平平',
        detail: '留连事难成，求谋日未明。官事只宜缓，去者未回程。失物南方见，急讨方称心。'
    },
    '速喜': {
        desc: '中吉',
        detail: '速喜喜来临，求财向南行。失物申午未，逢人路上寻。官事有福德，病者无祸侵。'
    },
    '赤口': {
        desc: '大凶',
        detail: '赤口主口舌，官非切要防。失物急去寻，行人有惊慌。鸡犬多作怪，病者出西方。'
    },
    '小吉': {
        desc: '小吉',
        detail: '小吉最吉昌，路上好商量。阴人来报喜，失物在坤方。行人立便至，交关甚是强。'
    },
    '空亡': {
        desc: '大凶',
        detail: '空亡事不祥，阴人多乖张。求财无利益，行人有灾殃。失物寻不见，官事有刑伤。'
    }
};

function calcLiuren() {
    const n1 = parseInt(document.getElementById('liuren-1').value) || 0;
    const n2 = parseInt(document.getElementById('liuren-2').value) || 0;
    const n3 = parseInt(document.getElementById('liuren-3').value) || 0;
    
    if (!n1 || !n2 || !n3) {
        alert('请输入三个数字');
        return;
    }
    
    // 小六壬算法：(n1 + n2 + n3 - 2) % 6
    const index = ((n1 + n2 + n3 - 2) % 6 + 6) % 6;
    const result = liurenGods[index];
    const detail = liurenDetails[result];
    
    // 显示结果
    document.getElementById('liuren-god').textContent = result;
    document.getElementById('liuren-desc').textContent = detail.desc;
    document.getElementById('liuren-detail').textContent = detail.detail;
    
    document.getElementById('liuren-result').classList.remove('hidden');
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
