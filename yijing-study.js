/**
 * 周易学习模块 - 数据模型与逻辑
 * 从Python Flet程序迁移
 */

// ==================== 八卦定义 ====================
const TRIGRAMS = {
    qian: { name: "乾", symbol: "☰", binary: "111", attribute: "天", nature: "健" },
    kun: { name: "坤", symbol: "☷", binary: "000", attribute: "地", nature: "顺" },
    zhen: { name: "震", symbol: "☳", binary: "100", attribute: "雷", nature: "动" },
    gen: { name: "艮", symbol: "☶", binary: "001", attribute: "山", nature: "止" },
    kan: { name: "坎", symbol: "☵", binary: "010", attribute: "水", nature: "陷" },
    li: { name: "离", symbol: "☲", binary: "101", attribute: "火", nature: "丽" },
    xun: { name: "巽", symbol: "☴", binary: "011", attribute: "风", nature: "入" },
    dui: { name: "兑", symbol: "☱", binary: "110", attribute: "泽", nature: "悦" }
};

// 数字到八卦的映射
const NUMBER_TO_TRIGRAM = {
    1: "qian", 2: "dui", 3: "li", 4: "zhen",
    5: "xun", 6: "kan", 7: "gen", 8: "kun"
};

// 卦名到拼音key的映射
const GUA_NAME_TO_KEY = {
    "乾": "qian", "坤": "kun", "震": "zhen", "艮": "gen",
    "坎": "kan", "离": "li", "巽": "xun", "兑": "dui"
};

// ==================== 爻类 ====================
class Yao {
    constructor(position, yaoType, text, xiang) {
        this.position = position;  // 1-6，从下到上
        this.yaoType = yaoType;    // 'yang' | 'yin'
        this.text = text;          // 爻辞
        this.xiang = xiang;        // 小象传
    }

    flip() {
        const newType = this.yaoType === 'yang' ? 'yin' : 'yang';
        return new Yao(this.position, newType, this.text, this.xiang);
    }

    get isYang() {
        return this.yaoType === 'yang';
    }

    get isYin() {
        return this.yaoType === 'yin';
    }

    get symbol() {
        return this.isYang ? "—" : "- -";
    }
}

// ==================== 卦类 ====================
class Gua {
    constructor(index, name, chineseName, description, xiang, tuan, yaos, upperGua, lowerGua) {
        this.index = index;
        this.name = name;
        this.chineseName = chineseName;
        this.description = description;  // 卦辞
        this.xiang = xiang;              // 象曰（大象传）
        this.tuan = tuan;                // 彖曰
        this.yaos = yaos;                // Yao[]
        this.upperGua = upperGua;        // 上卦key
        this.lowerGua = lowerGua;        // 下卦key
    }

    get binaryCode() {
        return this.yaos.map(y => y.isYang ? "1" : "0").join("");
    }

    get shortNames() {
        const names = [this.name, this.chineseName];
        const trigramNames = { qian: "天", kun: "地", zhen: "雷", gen: "山", kan: "水", li: "火", xun: "风", dui: "泽" };
        const upper = trigramNames[this.upperGua] || "";
        const lower = trigramNames[this.lowerGua] || "";
        if (upper && lower) {
            names.push(upper + lower + this.name);
            names.push(upper + lower);
        }
        return names;
    }

    // 获取变卦
    getChangedGua(changedPositions) {
        const newYaos = this.yaos.map(yao => {
            if (changedPositions.includes(yao.position)) {
                return yao.flip();
            }
            return yao;
        });
        const binary = newYaos.map(y => y.isYang ? "1" : "0").join("");
        return binaryToGua(binary);
    }

    // 获取错卦（阴阳全反）
    getDuiGua() {
        const binary = this.yaos.map(y => y.isYang ? "0" : "1").join("");
        return binaryToGua(binary);
    }

    // 获取综卦（上下颠倒）
    getZongGua() {
        const binary = [...this.yaos].reverse().map(y => y.isYang ? "1" : "0").join("");
        return binaryToGua(binary);
    }

    // 获取反卦（上下卦互换）
    getFanGua() {
        const lowerBinary = this.yaos.slice(0, 3).map(y => y.isYang ? "1" : "0").join("");
        const upperBinary = this.yaos.slice(3).map(y => y.isYang ? "1" : "0").join("");
        return binaryToGua(upperBinary + lowerBinary);
    }

    // 获取上互卦（345爻为上卦）
    getShangHuGua() {
        const binary = this.yaos.slice(2, 5).map(y => y.isYang ? "1" : "0").join("");
        return binaryToGua(binary);
    }

    // 获取下互卦（234爻为下卦）
    getXiaHuGua() {
        const binary = this.yaos.slice(1, 4).map(y => y.isYang ? "1" : "0").join("");
        return binaryToGua(binary);
    }
}

// ==================== 64卦定义 ====================
const GUA_PATTERNS = [
    ["111111", "乾", "乾为天", "qian", "qian"],
    ["000000", "坤", "坤为地", "kun", "kun"],
    ["100010", "屯", "水雷屯", "kan", "zhen"],
    ["010001", "蒙", "山水蒙", "gen", "kan"],
    ["111010", "需", "水天需", "kan", "qian"],
    ["010111", "讼", "天水讼", "qian", "kan"],
    ["010000", "师", "地水师", "kun", "kan"],
    ["000010", "比", "水地比", "kan", "kun"],
    ["111011", "小畜", "风天小畜", "xun", "qian"],
    ["110111", "履", "天泽履", "qian", "dui"],
    ["111000", "泰", "地天泰", "kun", "qian"],
    ["000111", "否", "天地否", "qian", "kun"],
    ["101111", "同人", "天火同人", "qian", "li"],
    ["111101", "大有", "火天大有", "li", "qian"],
    ["001000", "谦", "地山谦", "kun", "gen"],
    ["000100", "豫", "雷地豫", "zhen", "kun"],
    ["100110", "随", "泽雷随", "dui", "zhen"],
    ["011001", "蛊", "山风蛊", "gen", "xun"],
    ["110000", "临", "地泽临", "kun", "dui"],
    ["000011", "观", "风地观", "xun", "kun"],
    ["100101", "噬嗑", "火雷噬嗑", "li", "zhen"],
    ["101001", "贲", "山火贲", "gen", "li"],
    ["000001", "剥", "山地剥", "gen", "kun"],
    ["100000", "复", "地雷复", "kun", "zhen"],
    ["100111", "无妄", "天雷无妄", "qian", "zhen"],
    ["111001", "大畜", "山天大畜", "gen", "qian"],
    ["100001", "颐", "山雷颐", "gen", "zhen"],
    ["011110", "大过", "泽风大过", "dui", "xun"],
    ["010010", "坎", "坎为水", "kan", "kan"],
    ["101101", "离", "离为火", "li", "li"],
    ["001110", "咸", "泽山咸", "dui", "gen"],
    ["011100", "恒", "雷风恒", "zhen", "xun"],
    ["001111", "遁", "天山遁", "qian", "gen"],
    ["111100", "大壮", "雷天大壮", "zhen", "qian"],
    ["000101", "晋", "火地晋", "li", "kun"],
    ["101000", "明夷", "地火明夷", "kun", "li"],
    ["101011", "家人", "风火家人", "xun", "li"],
    ["110101", "睽", "火泽睽", "li", "dui"],
    ["001010", "蹇", "水山蹇", "kan", "gen"],
    ["010100", "解", "雷水解", "zhen", "kan"],
    ["110001", "损", "山泽损", "gen", "dui"],
    ["100011", "益", "风雷益", "xun", "zhen"],
    ["111110", "夬", "泽天夬", "dui", "qian"],
    ["011111", "姤", "天风姤", "qian", "xun"],
    ["000110", "萃", "泽地萃", "dui", "kun"],
    ["011000", "升", "地风升", "kun", "xun"],
    ["010110", "困", "泽水困", "dui", "kan"],
    ["011010", "井", "水风井", "kan", "xun"],
    ["101110", "革", "泽火革", "dui", "li"],
    ["011101", "鼎", "火风鼎", "li", "xun"],
    ["100100", "震", "震为雷", "zhen", "zhen"],
    ["001001", "艮", "艮为山", "gen", "gen"],
    ["001011", "渐", "风山渐", "xun", "gen"],
    ["110100", "归妹", "雷泽归妹", "zhen", "dui"],
    ["101100", "丰", "雷火丰", "zhen", "li"],
    ["001101", "旅", "火山旅", "li", "gen"],
    ["011011", "巽", "巽为风", "xun", "xun"],
    ["110110", "兑", "兑为泽", "dui", "dui"],
    ["010011", "涣", "风水涣", "xun", "kan"],
    ["110010", "节", "水泽节", "kan", "dui"],
    ["110011", "中孚", "风泽中孚", "xun", "dui"],
    ["001100", "小过", "雷山小过", "zhen", "gen"],
    ["101010", "既济", "水火既济", "kan", "li"],
    ["010101", "未济", "火水未济", "li", "kan"]
];

// ==================== 全局数据 ====================
let ALL_GUAS = [];
let GUA_MAP = {};  // binary -> Gua

// ==================== 初始化函数 ====================
function initGuaData() {
    ALL_GUAS = [];
    GUA_MAP = {};

    const yaoNames = ["初爻", "二爻", "三爻", "四爻", "五爻", "上爻"];

    for (let i = 0; i < GUA_PATTERNS.length; i++) {
        const [binary, name, chineseName, upper, lower] = GUA_PATTERNS[i];
        const guaData = guaDatabase[name];

        let description, xiang, tuan, yaosData;

        if (guaData) {
            description = guaData.卦辞 || "";
            xiang = guaData.大象辞 || "";
            tuan = guaData.彖辞 || "";
            yaosData = [];
            for (let pos = 0; pos < 6; pos++) {
                const yaoName = yaoNames[pos];
                const text = guaData[`爻辞${yaoName}`] || "";
                const xiangText = guaData[`小象传${pos + 1}爻`] || "";
                yaosData.push({ text, xiang: xiangText });
            }
        } else {
            description = `${name}卦辞`;
            xiang = `${name}之象`;
            tuan = `${name}之彖`;
            yaosData = Array(6).fill(null).map((_, pos) => ({
                text: `${name}第${pos + 1}爻`,
                xiang: ""
            }));
        }

        const yaos = [];
        for (let pos = 0; pos < 6; pos++) {
            const isYang = binary[pos] === "1";
            yaos.push(new Yao(
                pos + 1,
                isYang ? "yang" : "yin",
                yaosData[pos].text,
                yaosData[pos].xiang
            ));
        }

        const gua = new Gua(
            i + 1,
            name,
            chineseName,
            description,
            xiang,
            tuan,
            yaos,
            upper,
            lower
        );

        ALL_GUAS.push(gua);
        GUA_MAP[binary] = gua;
    }
}

// ==================== 工具函数 ====================
function binaryToGua(binary) {
    if (binary.length === 3) {
        // 如果是3位（八卦），查找对应的卦名
        for (const gua of ALL_GUAS) {
            if (gua.binaryCode === binary) return gua;
        }
    }
    return GUA_MAP[binary] || ALL_GUAS[0];
}

function searchGua(query) {
    const q = query.toLowerCase().trim();
    const qWithoutGua = q.replace(/卦$/, "");
    const results = [];

    for (const gua of ALL_GUAS) {
        if (q.includes(gua.name) || q.includes(gua.chineseName)) {
            results.push(gua);
            continue;
        }

        if (qWithoutGua && qWithoutGua !== q) {
            if (qWithoutGua.includes(gua.name) || qWithoutGua.includes(gua.chineseName)) {
                results.push(gua);
                continue;
            }
        }

        for (const shortName of gua.shortNames) {
            if (shortName.includes(q) || shortName.includes(qWithoutGua)) {
                results.push(gua);
                break;
            }
        }
    }

    return results;
}

function getGuaByIndex(index) {
    if (index >= 1 && index <= 64) {
        return ALL_GUAS[index - 1];
    }
    return null;
}

function getGuaByNumbers(upperNum, lowerNum) {
    const upperTrigram = NUMBER_TO_TRIGRAM[upperNum];
    const lowerTrigram = NUMBER_TO_TRIGRAM[lowerNum];

    if (!upperTrigram || !lowerTrigram) return null;

    for (const gua of ALL_GUAS) {
        if (gua.upperGua === upperTrigram && gua.lowerGua === lowerTrigram) {
            return gua;
        }
    }
    return null;
}

// ==================== 初始化 ====================
// 等待data.js加载完成后初始化
if (typeof guaDatabase !== "undefined") {
    initGuaData();
} else {
    // 如果data.js还没加载，等待DOMContentLoaded
    document.addEventListener("DOMContentLoaded", () => {
        if (typeof guaDatabase !== "undefined") {
            initGuaData();
        }
    });
}
