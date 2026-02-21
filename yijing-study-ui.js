/**
 * 周易学习模块 - UI逻辑与交互
 * 从Python Flet程序迁移
 */

// ==================== 全局状态 ====================
let currentGua = null;           // 当前本卦
let changingYaos = [];           // 变爻位置列表 [1,2,3,4,5,6] - 点击切换阴阳
let movingYao = null;            // 动爻位置（1-6）- 数字定位指定，仅标记不改变卦象
let highlightedYaos = [];        // 高亮爻位置列表
let displayGua = null;           // 当前显示的卦（考虑变爻）

// ==================== 初始化 ====================
function initYijingStudy() {
    currentGua = ALL_GUAS[0];
    changingYaos = [];
    movingYao = null;
    highlightedYaos = [];
    displayGua = currentGua;
    
    renderAll();
}

// ==================== 渲染主函数 ====================
function renderAll() {
    // 计算显示卦（考虑变爻）
    if (changingYaos.length > 0) {
        displayGua = currentGua.getChangedGua(changingYaos);
    } else {
        displayGua = currentGua;
    }
    
    renderHexagram();
    renderRelations();
    renderGuaInfo();
}

// ==================== 渲染卦象 ====================
function renderHexagram() {
    const container = document.getElementById('study-hexagram-view');
    if (!container) return;
    
    const trigramNames = { qian: "天", kun: "地", zhen: "雷", gen: "山", kan: "水", li: "火", xun: "风", dui: "泽" };
    const upper = trigramNames[displayGua.upperGua] || "";
    const lower = trigramNames[displayGua.lowerGua] || "";
    
    // 创建卦象HTML
    let html = `
        <div class="text-center mb-6">
            <h3 class="text-2xl font-calligraphy text-gua-red mb-2">${displayGua.name}</h3>
            <p class="text-gray-600">${upper}${lower}${displayGua.name}</p>
            <p class="text-sm text-gray-500 mt-2">点击爻线切换阴阳</p>
        </div>
        
        <div class="bg-amber-50 p-4 rounded-lg mb-6">
            <p class="text-gray-800 text-sm leading-relaxed">${displayGua.description}</p>
        </div>
    `;
    
    // 六爻显示（从上往下）
    const positionLabels = ["上爻", "五爻", "四爻", "三爻", "二爻", "初爻"];
    const originalYaos = {};
    currentGua.yaos.forEach(y => originalYaos[y.position] = y);
    
    html += '<div class="space-y-3">';
    
    for (let i = 0; i < 6; i++) {
        const position = 6 - i;
        const displayYao = displayGua.yaos[position - 1];
        const originalYao = originalYaos[position];
        const isChanging = changingYaos.includes(position);
        const isMoving = position === movingYao;
        const isHighlighted = highlightedYaos.includes(position);

        const yaoColorClass = isHighlighted ? 'bg-red-600' : (isChanging || isMoving ? 'bg-red-500' : 'bg-gray-800');
        const yaoHeightClass = isHighlighted ? 'h-2' : 'h-1.5';
        const labelColorClass = isHighlighted || isMoving ? 'text-red-600 font-bold' : 'text-gray-500';
        const textColorClass = isHighlighted || isMoving ? 'text-red-700 font-bold text-base' : 'text-gray-700 text-sm';

        let yaoLineHtml;
        if (displayYao.isYang) {
            yaoLineHtml = `<div class="${yaoColorClass} ${yaoHeightClass} w-32 rounded-full cursor-pointer hover:opacity-80 transition-all" onclick="onYaoClick(${position})"></div>`;
        } else {
            yaoLineHtml = `
                <div class="flex items-center justify-center cursor-pointer" style="width: 128px; gap: 12px;" onclick="onYaoClick(${position})">
                    <div class="${yaoColorClass} ${yaoHeightClass} rounded-full" style="width: 52px;"></div>
                    <div class="${yaoColorClass} ${yaoHeightClass} rounded-full" style="width: 52px;"></div>
                </div>
            `;
        }

        const badgeHtml = isChanging || isMoving ? '<span class="ml-2 text-xs text-red-600 font-bold">变</span>' : '';
        const starHtml = isHighlighted ? '<span class="ml-1 text-red-600">★</span>' : '';
        const xiangColorClass = isMoving ? 'text-red-600' : 'text-gray-500';

        html += `
            <div class="flex items-center gap-4 py-2 border-b border-amber-100 last:border-0">
                <div class="w-12 text-right ${labelColorClass} text-sm">${positionLabels[i]}</div>
                <div class="flex-shrink-0">${yaoLineHtml}</div>
                <div class="flex-1 min-w-0">
                    <div class="flex items-center">
                        <span class="${textColorClass}">${displayYao.text}</span>
                        ${badgeHtml}${starHtml}
                    </div>
                    ${displayYao.xiang ? `<div class="text-xs ${xiangColorClass} italic mt-1">象曰：${displayYao.xiang}</div>` : ''}
                </div>
            </div>
        `;
    }
    
    html += '</div>';
    container.innerHTML = html;
}

function renderRelations() {
    const container = document.getElementById('study-relations-view');
    if (!container) return;

    const trigramNames = { qian: "天", kun: "地", zhen: "雷", gen: "山", kan: "水", li: "火", xun: "风", dui: "泽" };

    const relations = [
        { name: "错卦", gua: currentGua.getDuiGua(), desc: "阴阳全反" },
        { name: "综卦", gua: currentGua.getZongGua(), desc: "上下颠倒" },
        { name: "反卦", gua: currentGua.getFanGua(), desc: "上下卦互换" },
        { name: "上互卦", gua: currentGua.getShangHuGua(), desc: "345爻", isTrigram: true },
        { name: "下互卦", gua: currentGua.getXiaHuGua(), desc: "234爻", isTrigram: true }
    ];

    let html = '<div class="space-y-3">';

    for (const rel of relations) {
        let displayText;
        let clickHandler;

        if (rel.isTrigram || rel.gua.isTrigram) {
            const trigramName = trigramNames[rel.gua.upperGua] || "";
            displayText = `${rel.gua.name} (${trigramName})`;
            clickHandler = '';
        } else {
            const upper = trigramNames[rel.gua.upperGua] || "";
            const lower = trigramNames[rel.gua.lowerGua] || "";
            displayText = `${rel.gua.name} (${upper}${lower}${rel.gua.name})`;
            clickHandler = `onclick="selectGua(${rel.gua.index})"`;
        }

        html += `
            <div class="bg-white p-4 rounded-lg shadow-sm border border-amber-100 cursor-pointer hover:shadow-md transition-all" ${clickHandler}>
                <div class="flex justify-between items-center">
                    <div>
                        <div class="font-bold text-gua-red">${rel.name}</div>
                        <div class="text-sm text-gray-700">${displayText}</div>
                    </div>
                    <div class="text-xs text-gray-400">${rel.desc}</div>
                </div>
            </div>
        `;
    }

    html += '</div>';
    container.innerHTML = html;
}

// ==================== 渲染卦辞详解 ====================
function renderGuaInfo() {
    const tuanContainer = document.getElementById('study-tuan');
    const xiangContainer = document.getElementById('study-xiang');
    
    if (tuanContainer) {
        tuanContainer.textContent = displayGua.tuan || "暂无彖辞";
    }
    if (xiangContainer) {
        xiangContainer.textContent = displayGua.xiang || "暂无象曰";
    }
}

// ==================== 事件处理 ====================
function onYaoClick(position) {
    // 切换变爻状态
    const index = changingYaos.indexOf(position);
    if (index > -1) {
        changingYaos.splice(index, 1);
    } else {
        changingYaos.push(position);
        changingYaos.sort((a, b) => a - b);
    }
    
    renderAll();
}

function selectGua(index) {
    const gua = getGuaByIndex(index);
    if (gua) {
        currentGua = gua;
        changingYaos = [];
        // 保持高亮状态
        renderAll();
    }
}

// ==================== 搜索功能 ====================
function searchGuaHandler() {
    const input = document.getElementById('study-search-input');
    const resultsDiv = document.getElementById('study-search-results');
    
    if (!input || !resultsDiv) return;
    
    const query = input.value.trim();
    if (!query) {
        resultsDiv.innerHTML = '';
        resultsDiv.classList.add('hidden');
        return;
    }
    
    const results = searchGua(query);
    
    if (results.length === 0) {
        resultsDiv.innerHTML = '<div class="p-3 text-red-600 text-sm">未找到匹配的卦象</div>';
        resultsDiv.classList.remove('hidden');
        return;
    }
    
    let html = '';
    for (const gua of results.slice(0, 5)) {
        const trigramNames = { qian: "天", kun: "地", zhen: "雷", gen: "山", kan: "水", li: "火", xun: "风", dui: "泽" };
        const upper = trigramNames[gua.upperGua] || "";
        const lower = trigramNames[gua.lowerGua] || "";
        
        html += `
            <div class="p-3 hover:bg-amber-50 cursor-pointer border-b border-amber-100 last:border-0" onclick="selectGua(${gua.index}); document.getElementById('study-search-results').classList.add('hidden');">
                <div class="font-semibold text-gua-red">${gua.name} (${upper}${lower}${gua.name})</div>
                <div class="text-xs text-gray-500">${gua.chineseName}</div>
            </div>
        `;
    }
    
    resultsDiv.innerHTML = html;
    resultsDiv.classList.remove('hidden');
}

// ==================== 数字定位 ====================
function numberSearchHandler() {
    const upperInput = document.getElementById('study-upper');
    const lowerInput = document.getElementById('study-lower');
    const movingInput = document.getElementById('study-moving');
    
    if (!upperInput || !lowerInput) return;
    
    const upper = parseInt(upperInput.value) || 0;
    const lower = parseInt(lowerInput.value) || 0;
    const moving = parseInt(movingInput?.value) || 0;
    
    if (upper < 1 || upper > 8 || lower < 1 || lower > 8) {
        alert('上卦和下卦数字必须在1-8之间');
        return;
    }
    
    const gua = getGuaByNumbers(upper, lower);
    if (!gua) {
        alert('未找到对应的卦象');
        return;
    }
    
    currentGua = gua;
    changingYaos = [];
    movingYao = null;

    if (moving >= 1 && moving <= 6) {
        movingYao = moving;
    }

    renderAll();
}

// ==================== 高亮处理 ====================
function onHighlightChange(position, checked) {
    const index = highlightedYaos.indexOf(position);
    
    if (checked && index === -1) {
        highlightedYaos.push(position);
        highlightedYaos.sort((a, b) => a - b);
    } else if (!checked && index > -1) {
        highlightedYaos.splice(index, 1);
    }
    
    renderHexagram();
}

function resetAll() {
    changingYaos = [];
    movingYao = null;
    highlightedYaos = [];
    renderAll();
}

// ==================== 切换Tab ====================
function switchToYijingStudyTab() {
    // 切换到周易学习tab
    const studyTab = document.getElementById('tab-yijing-study');
    if (studyTab) {
        // 移除其他tab的active状态
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('tab-active');
            btn.classList.add('text-gray-600');
        });
        
        // 添加当前tab的active状态
        studyTab.classList.add('tab-active');
        studyTab.classList.remove('text-gray-600');
        
        // 隐藏其他section
        document.getElementById('section-zhouyi').classList.add('hidden');
        document.getElementById('section-liuren').classList.add('hidden');
        
        // 显示周易学习section
        const studySection = document.getElementById('section-yijing-study');
        if (studySection) {
            studySection.classList.remove('hidden');
        }
        
        // 初始化
        if (!currentGua) {
            initYijingStudy();
        }
    }
}

// ==================== 事件监听 ====================
document.addEventListener('DOMContentLoaded', function() {
    // 搜索框回车事件
    const searchInput = document.getElementById('study-search-input');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchGuaHandler();
            }
        });
    }
    
    // 数字定位回车事件
    const numberInputs = ['study-upper', 'study-lower', 'study-moving'];
    numberInputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    numberSearchHandler();
                }
            });
        }
    });
});
