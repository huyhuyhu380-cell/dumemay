// =====================================================================
// 🎯 AI TÀI XỈU TỔNG HỢP V12.0 - UNIFIED EDITION
// ĐOẠN 1/10: IMPORTS + CONFIG + PATTERN WEIGHTS
// =====================================================================
import fastify from "fastify";
import cors from "@fastify/cors";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import fetch from "node-fetch";

const PORT = 3000;
const FETCH_INTERVAL = 5000;
const MAX_HISTORY = 500;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- API URLs ---
const LC79_MD5_URL = "https://wtxmd52.tele68.com/v1/txmd5/sessions";
const LC79_HU_URL  = "https://wtx.tele68.com/v1/tx/lite-sessions?cp=R&cl=R&pf=web&at=62385f65eb49fcb34c72a7d6489ad91d";
const HITCLUB_MD5_URL = "https://apihitclubhihi.onrender.com/api/hitclub/md5";
const HITCLUB_HU_URL  = "https://apihitclubhihi.onrender.com/api/hitclub/hu";
const MAX789_MD5_URL = "https://taixiumd5.maksh3979madfw.com/api/md5luckydice/GetSoiCau";
const MAX789_HU_URL  = "https://taixiu.maksh3979madfw.com/api/luckydice/GetSoiCau";
const SUNWIN_URL = "https://apisunwin-cocalhahaha.onrender.com/api/sunwin";

// --- STATS ---
const STATS = {
    STREAK_BREAK_PROB: {
        1: 0.50, 2: 0.52, 3: 0.35, 4: 0.45, 5: 0.58,
        6: 0.68, 7: 0.76, 8: 0.83, 9: 0.89, 10: 0.94,
        11: 0.97, 12: 0.985, 13: 0.99, 14: 0.995, 15: 0.998
    },
    MIN_CONFIDENCE_TO_PREDICT: 0.55,
    TRANSITION_MATRIX: { TT: 0.485, TX: 0.515, XT: 0.512, XX: 0.488 }
};

// --- PATTERN WEIGHTS (7,698 phiên) ---
const PATTERN_WEIGHTS = {
    '1_1_pattern': 1.00, '2_2_pattern': 0.95, '3_3_pattern': 0.80,
    '4_4_pattern': 0.55, '5_5_pattern': 0.35, '6_6_pattern': 0.20,
    '1_2_1_pattern': 0.75, '2_1_2_pattern': 0.72, '3_2_3_pattern': 0.55,
    '2_3_2_pattern': 0.52, '4_2_4_pattern': 0.30, '1_3_1_pattern': 0.48,
    '3_1_3_pattern': 0.45, '1_4_1_pattern': 0.30, '4_1_4_pattern': 0.25,
    '2_2_1_pattern': 0.50, '1_1_2_pattern': 0.50, '1_2_2_pattern': 0.48,
    '2_1_1_pattern': 0.48, '3_3_1_pattern': 0.35, '1_1_3_pattern': 0.35,
    '2_2_2_1_1_pattern': 0.20, '1_1_2_2_2_pattern': 0.20, '3_1_1_3_1_pattern': 0.12,
    'zigzag_12212_pattern': 0.35, 'zigzag_21121_pattern': 0.35,
    'spike_13313_pattern': 0.15, 'spike_31131_pattern': 0.15,
    'spike_14414_pattern': 0.10, 'spike_41141_pattern': 0.10,
    'mirror_12221_pattern': 0.40, 'mirror_21112_pattern': 0.40,
    'mirror_23332_pattern': 0.25, 'mirror_32223_pattern': 0.25,
    'mirror_12321_pattern': 0.40, 'mirror_32123_pattern': 0.40,
    'mirror_13431_pattern': 0.12, 'mirror_43134_pattern': 0.12,
    'alternating_21212_pattern': 0.55, 'alternating_12121_pattern': 0.55,
    'alternating_31313_pattern': 0.35, 'alternating_13131_pattern': 0.38,
    'alternating_41414_pattern': 0.15, 'alternating_14141_pattern': 0.18,
    '1_2_1_2_1_2_pattern': 0.50, '2_1_2_1_2_1_pattern': 0.50,
    '2_2_1_loop_pattern': 0.48, '1_1_2_loop_pattern': 0.48,
    '3_2_2_loop_pattern': 0.20, '1_3_3_loop_pattern': 0.15,
    'repeat_123123_pattern': 0.15, 'repeat_321321_pattern': 0.15,
    'repeat_231231_pattern': 0.12, 'repeat_312312_pattern': 0.12,
    'repeat_132132_pattern': 0.10, 'repeat_213213_pattern': 0.10,
    'block_111_222_pattern': 0.25, 'block_222_111_pattern': 0.25,
    'block_112222_pattern': 0.18, 'block_221111_pattern': 0.18,
    'block_111122_pattern': 0.15, 'block_222211_pattern': 0.15,
    'perfect_alternate_121212_pattern': 0.28, 'perfect_alternate_212121_pattern': 0.28,
    'perfect_alternate_131313_pattern': 0.12, 'perfect_alternate_313131_pattern': 0.12,
    'loop_221122_pattern': 0.45, 'loop_112211_pattern': 0.45,
    'loop_221221_pattern': 0.35, 'loop_112112_pattern': 0.35,
    'fibonacci_pattern': 0.20, 'reverse_fibonacci_pattern': 0.20,
    'growth_pattern': 0.18, '2_2_2_3_loop_pattern': 0.12,
    'alternate_7_1212121_pattern': 0.10, 'alternate_7_2121212_pattern': 0.10,
    'alternate_7_1313131_pattern': 0.08, 'alternate_7_3131313_pattern': 0.08,
    'pyramid_7_pattern': 0.08, 'pyramid_7b_pattern': 0.08,
    'wave_7_pattern': 0.10, 'wave_7b_pattern': 0.10,
    '1122_loop_pattern': 0.50, '2211_loop_pattern': 0.50,
    '112_repeat_pattern': 0.40, '221_repeat_pattern': 0.40,
    'perfect_alternate_8_pattern': 0.08, 'perfect_alternate_8b_pattern': 0.08,
    'repeat_4_step_up_pattern': 0.06, 'repeat_4_step_down_pattern': 0.06,
    'symmetric_pyramid_8_pattern': 0.06,
    'block_4_4_pattern': 0.15, 'block_4_4b_pattern': 0.15,
    'perfect_alternate_9_pattern': 0.05, 'perfect_alternate_9b_pattern': 0.05,
    'pyramid_9_pattern': 0.04, 'pyramid_9b_pattern': 0.04,
    'perfect_alternate_10_pattern': 0.03, 'perfect_alternate_10b_pattern': 0.03,
    'short_run_pattern': 1.00, 'medium_run_pattern': 0.98,
    'medium_long_run_pattern': 0.95, 'long_run_pattern': 0.85,
    'very_long_run_pattern': 0.75, 'super_long_run_pattern': 0.65,
    'mega_long_run_pattern': 0.50, 'hyper_long_run_pattern': 0.40,
    'ultra_long_run_pattern': 0.35,
    'broken_2_1_3_2_pattern': 0.35, 'broken_3_1_2_3_pattern': 0.35,
    'broken_2_3_1_2_pattern': 0.30, 'broken_1_3_2_1_pattern': 0.30,
    'broken_4_1_2_4_pattern': 0.15, 'broken_1_4_2_1_pattern': 0.15,
    'broken_1_3_2_3_pattern': 0.25, 'broken_3_2_1_2_pattern': 0.25,
    'broken_2_1_4_2_pattern': 0.10, 'broken_4_2_1_4_pattern': 0.10,
    'broken_2_4_1_2_pattern': 0.10,
    'mirror_pattern_12321': 0.40, 'alternating_mirror_pattern': 0.35,
    'mirror_pattern_12221': 0.35, 'mirror_pattern_32123': 0.35,
    'mirror_21212_pattern': 0.40, 'mirror_31313_pattern': 0.28,
    'mirror_43234_pattern': 0.10, 'mirror_23432_pattern': 0.10,
    'staircase_up_pattern': 0.30, 'staircase_down_pattern': 0.30,
    'pyramid_pattern': 0.25, 'inverted_pyramid_pattern': 0.25,
    'staircase_112233_pattern': 0.20, 'staircase_332211_pattern': 0.20,
    'jump_staircase_pattern': 0.12, 'jump_staircase_b_pattern': 0.12,
    '2_2_2_1_pattern': 0.45, '2_2_1_2_pattern': 0.45,
    '2_1_2_2_pattern': 0.45, '1_2_2_2_pattern': 0.45,
    '3_3_3_1_pattern': 0.25, '1_3_3_3_pattern': 0.25,
    'short_mirror_1221': 0.40, 'short_mirror_2112': 0.40,
    'short_mirror_1331': 0.20, 'short_mirror_3113': 0.20,
    'short_mirror_1441': 0.12, 'short_mirror_4114': 0.12,
    'short_alternate_1212': 0.50, 'short_alternate_2121': 0.50,
    'short_alternate_1313': 0.25, 'short_alternate_3131': 0.25,
    'spike_1222': 0.35, 'spike_2111': 0.35, 'spike_2221': 0.35, 'spike_1112': 0.35,
    'detected_symmetry_pattern': 0.45, 'detected_alternating_pattern': 0.50,
    'detected_wave_pattern': 0.40, 'flip_streak_pattern': 0.55,
    'same_score_streak_pattern': 0.35,
    'triple_1_pattern': 0.25, 'triple_2_pattern': 0.25,
    'triple_3_pattern': 0.25, 'triple_4_pattern': 0.25,
    'random_pattern': 0.10
};

const PRIORITY_PATTERNS = [
    '1_1_pattern', '2_2_pattern', 'short_run_pattern', 'medium_run_pattern',
    'loop_221122_pattern', 'loop_112211_pattern',
    '1122_loop_pattern', '2211_loop_pattern'
];

function getPatternWeight(patternType) {
    if (!patternType) return 0.10;
    let weight = PATTERN_WEIGHTS[patternType] || 0.10;
    if (PRIORITY_PATTERNS.includes(patternType)) weight *= 1.15;
    return Math.min(1.0, weight);
}

// --- TABLES STATE ---
const TABLES = {
    lc79_md5:    { name: "LC79-MD5", apiUrl: LC79_MD5_URL, history: [], currentSessionId: null, manager: null, parseType: 'lc79_md5' },
    lc79_hu:     { name: "LC79-HŨ",  apiUrl: LC79_HU_URL,  history: [], currentSessionId: null, manager: null, parseType: 'lc79_hu' },
    hitclub_md5: { name: "HitClub-MD5", apiUrl: HITCLUB_MD5_URL, history: [], currentSessionId: null, manager: null, parseType: 'hitclub' },
    hitclub_hu:  { name: "HitClub-HŨ",  apiUrl: HITCLUB_HU_URL,  history: [], currentSessionId: null, manager: null, parseType: 'hitclub' },
    max789_md5:  { name: "Max789-MD5", apiUrl: MAX789_MD5_URL, history: [], currentSessionId: null, manager: null, parseType: 'max789' },
    max789_hu:   { name: "Max789-HŨ",  apiUrl: MAX789_HU_URL,  history: [], currentSessionId: null, manager: null, parseType: 'max789' },
    sunwin:      { name: "Sunwin-TX", apiUrl: SUNWIN_URL, history: [], currentSessionId: null, manager: null, parseType: 'sunwin' }
};

const GAME_LABELS = {
    lc79_md5: "LC79 MD5", lc79_hu: "LC79 Hũ",
    hitclub_md5: "HitClub MD5", hitclub_hu: "HitClub Hũ",
    max789_md5: "Max789 MD5", max789_hu: "Max789 Hũ",
    sunwin: "Sunwin"
};

// ==================== HẾT ĐOẠN 1/10 ====================
// =====================================================================
// ĐOẠN 2/10: UTILITIES + PARSERS
// =====================================================================
function lastN(arr, n) { return arr.slice(Math.max(0, arr.length - n)); }
function sum(nums) { return nums.reduce((a, b) => a + b, 0); }
function avg(nums) { return nums.length ? sum(nums) / nums.length : 0; }

function entropy(arr) {
    if (!arr.length) return 0;
    const freq = {};
    for (const v of arr) freq[v] = (freq[v] || 0) + 1;
    let e = 0, n = arr.length;
    for (const k in freq) { const p = freq[k] / n; e -= p * Math.log2(p); }
    return e;
}

function similarity(a, b) {
    if (a.length !== b.length) return 0;
    let m = 0;
    for (let i = 0; i < a.length; i++) if (a[i] === b[i]) m++;
    return m / a.length;
}

function checkSymmetry(arr) {
    if (arr.length < 3) return false;
    const len = arr.length;
    for (let i = 0; i < Math.floor(len / 2); i++) {
        if (arr[i] !== arr[len - 1 - i]) return false;
    }
    return true;
}

function checkAlternating(arr) {
    if (arr.length < 4) return false;
    let increasing = null;
    for (let i = 0; i < arr.length - 1; i++) {
        const diff = arr[i+1] - arr[i];
        if (diff === 0) return false;
        const isInc = diff > 0;
        if (increasing === null) increasing = isInc;
        else if (increasing === isInc) return false;
    }
    return true;
}

function checkWave(arr) {
    if (arr.length < 4) return false;
    let increasing = null;
    for (let i = 0; i < arr.length - 1; i++) {
        const diff = arr[i+1] - arr[i];
        if (Math.abs(diff) > 2) return false;
        const isInc = diff > 0;
        if (increasing === null) increasing = isInc;
        else if (increasing === isInc) return false;
    }
    return true;
}

// --- PARSER: LC79 ---
function parseLc79Md5Data(data) {
    if (!data || !Array.isArray(data.list)) return [];
    const sortedList = [...data.list].sort((a, b) => a.id - b.id);
    return sortedList.map(item => ({
        session: item.id, dice: item.dices, total: item.point,
        result: item.resultTruyenThong, tx: item.point >= 11 ? 'T' : 'X'
    }));
}

function parseLc79HuData(data) {
    if (!data || !Array.isArray(data.list)) return [];
    const sortedList = [...data.list].sort((a, b) => a.id - b.id);
    return sortedList.map(item => ({
        session: item.id, dice: item.dices, total: item.point,
        result: item.resultTruyenThong, tx: item.point >= 11 ? 'T' : 'X'
    }));
}

// --- PARSER: HitClub ---
function parseHitClubLines(data) {
    if (!data || !Array.isArray(data)) return [];
    const sortedList = [...data].sort((a, b) => a.phien - b.phien);
    return sortedList.map(item => ({
        session: item.phien, dice: item.xuc_xac, total: item.Tong,
        result: item.ket_qua, tx: item.Tong >= 11 ? 'T' : 'X'
    }));
}

// --- PARSER: Max789 ---
function parseMax789Data(data) {
    if (!data || !data.length) return [];
    return data.map(item => {
        const d1 = item.FirstDice || item.d1;
        const d2 = item.SecondDice || item.d2;
        const d3 = item.ThirdDice || item.d3;
        const total = d1 + d2 + d3;
        return {
            session: item.SessionId || parseInt(item.sid),
            dice: [d1, d2, d3], total: total,
            result: total > 10 ? "Tài" : "Xỉu",
            tx: total > 10 ? "T" : "X"
        };
    }).sort((a, b) => a.session - b.session);
}

// --- PARSER: Sunwin ---
function parseSunwinLines(data) {
    if (!Array.isArray(data)) return [];
    const arr = data.map(item => {
        const session = Number(item.phien ?? 0);
        const dice = Array.isArray(item.xuc_xac) ? item.xuc_xac : [];
        const total = Number(item.Tong ?? item.tong ?? 0);
        const result = item.ket_qua ?? (total >= 11 ? 'Tài' : 'Xỉu');
        const tx = result === 'Tài' ? 'T' : 'X';
        return { session, dice, total, result, tx };
    });
    return arr.filter(r => r.session > 0).sort((a, b) => a.session - b.session);
}

// ==================== HẾT ĐOẠN 2/10 ====================
// =====================================================================
// ĐOẠN 3/10: FEATURE EXTRACTION
// =====================================================================
function extractFeatures(history) {
    if (!history || history.length === 0) return {};
    const tx = history.map(h => h.tx);
    const totals = history.map(h => h.total);

    const freq = {};
    for (const v of tx) freq[v] = (freq[v] || 0) + 1;

    let runs = [], cur = tx[0], len = 1;
    for (let i = 1; i < tx.length; i++) {
        if (tx[i] === cur) len++;
        else { runs.push({ val: cur, len }); cur = tx[i]; len = 1; }
    }
    if (tx.length) runs.push({ val: cur, len });

    const meanTotal = avg(totals);
    const volatility = Math.sqrt(avg(totals.map(t => Math.pow(t - meanTotal, 2))));

    const mean5 = avg(totals.slice(-5));
    const mean10 = avg(totals.slice(-10));
    const mean20 = avg(totals.slice(-20));
    const mean50 = avg(totals.slice(-50));

    let tStreak = 0, xStreak = 0;
    for (let i = tx.length - 1; i >= 0; i--) { if (tx[i] === 'T') tStreak++; else break; }
    for (let i = tx.length - 1; i >= 0; i--) { if (tx[i] === 'X') xStreak++; else break; }

    let sameScoreStreak = 1;
    for (let i = totals.length - 1; i > 0; i--) {
        if (totals[i] === totals[i-1]) sameScoreStreak++; else break;
    }

    const recent50Tx = tx.slice(-50);
    let tToT = 0, tToX = 0, xToT = 0, xToX = 0;
    for (let i = 1; i < recent50Tx.length; i++) {
        if (recent50Tx[i-1] === 'T') { if (recent50Tx[i] === 'T') tToT++; else tToX++; }
        else { if (recent50Tx[i] === 'T') xToT++; else xToX++; }
    }

    const runLengths = runs.map(r => r.len);
    const last5RunLens = runLengths.slice(-5);

    const tCount20 = tx.slice(-20).filter(t => t === 'T').length;
    const xCount20 = tx.slice(-20).filter(t => t === 'X').length;
    const tCount30 = tx.slice(-30).filter(t => t === 'T').length;
    const xCount30 = tx.slice(-30).filter(t => t === 'X').length;

    let flipStreak = 0;
    for (let i = tx.length - 1; i > 0; i--) {
        if (tx[i] !== tx[i-1]) flipStreak++; else break;
    }

    return {
        tx, totals, freq, runs,
        maxRun: runs.reduce((m, r) => Math.max(m, r.len), 0),
        avgRunLength: avg(runs.map(r => r.len)),
        meanTotal, volatility, entropy: entropy(tx),
        mean5, mean10, mean20, mean50,
        tStreak, xStreak, sameScoreStreak,
        tToT, tToX, xToT, xToX,
        lastRun: runs[runs.length - 1],
        prevRun: runs[runs.length - 2],
        runLengths, last5RunLens,
        isSymmetry: checkSymmetry(last5RunLens),
        isAlternating: checkAlternating(last5RunLens),
        isWave: checkWave(last5RunLens),
        tCount20, xCount20, tCount30, xCount30,
        flipStreak
    };
}

// ==================== HẾT ĐOẠN 3/10 ====================
// =====================================================================
// ĐOẠN 4/10: PATTERN DETECTION (PART 1)
// =====================================================================
function detectPatternType(runs, features = null) {
    if (!runs || runs.length < 3) return null;
    const lastRuns = runs.slice(-15);
    const lengths = lastRuns.map(r => r.len);
    const values = lastRuns.map(r => r.val);

    // NHÓM 1: XEN KẼ
    if (lengths.length >= 5 && lengths.slice(-5).every(l => l === 1)) {
        const vals = values.slice(-6);
        if (vals.every((v, i) => i === 0 || v !== vals[i-1])) return '1_1_pattern';
    }
    if (lengths.length >= 4 && lengths.slice(-4).every(l => l === 2)) {
        const vals = values.slice(-5);
        if (vals.every((v, i) => i === 0 || v !== vals[i-1])) return '2_2_pattern';
    }
    if (lengths.length >= 3 && lengths.slice(-3).every(l => l === 3)) return '3_3_pattern';
    if (lengths.length >= 3 && lengths.slice(-3).every(l => l === 4)) return '4_4_pattern';
    if (lengths.length >= 2 && lengths.slice(-2).every(l => l === 5)) return '5_5_pattern';
    if (lengths.length >= 2 && lengths.slice(-2).every(l => l === 6)) return '6_6_pattern';

    // NHÓM 2: 5 NHỊP
    if (lengths.length >= 5) {
        const t = lengths.slice(-5);
        const j = t.join('');
        if (j === '12121') return '1_2_1_pattern';
        if (j === '21212') return '2_1_2_pattern';
        if (j === '32323') return '3_2_3_pattern';
        if (j === '23232') return '2_3_2_pattern';
        if (j === '42424') return '4_2_4_pattern';
        if (j === '13131') return '1_3_1_pattern';
        if (j === '31313') return '3_1_3_pattern';
        if (j === '14141') return '1_4_1_pattern';
        if (j === '41414') return '4_1_4_pattern';
        if (j === '22122') return '2_2_1_pattern';
        if (j === '11211') return '1_1_2_pattern';
        if (j === '12212') return '1_2_2_pattern';
        if (j === '21121') return '2_1_1_pattern';
        if (j === '33133') return '3_3_1_pattern';
        if (j === '11311') return '1_1_3_pattern';
        if (j === '12221') return 'mirror_12221_pattern';
        if (j === '21112') return 'mirror_21112_pattern';
        if (j === '12321') return 'mirror_12321_pattern';
        if (j === '32123') return 'mirror_32123_pattern';
        if (j === '13313') return 'spike_13313_pattern';
        if (j === '31131') return 'spike_31131_pattern';
    }

    // NHÓM 3: 6 NHỊP
    if (lengths.length >= 6) {
        const j = lengths.slice(-6).join('');
        if (j === '121212') return '1_2_1_2_1_2_pattern';
        if (j === '212121') return '2_1_2_1_2_1_pattern';
        if (j === '221221') return '2_2_1_loop_pattern';
        if (j === '112112') return '1_1_2_loop_pattern';
        if (j === '123123') return 'repeat_123123_pattern';
        if (j === '321321') return 'repeat_321321_pattern';
        if (j === '111222') return 'block_111_222_pattern';
        if (j === '222111') return 'block_222_111_pattern';
        if (j === '221122') return 'loop_221122_pattern';
        if (j === '112211') return 'loop_112211_pattern';
    }

    // NHÓM 4: 8 NHỊP
    if (lengths.length >= 8) {
        const j = lengths.slice(-8).join('');
        if (j === '11221122') return '1122_loop_pattern';
        if (j === '22112211') return '2211_loop_pattern';
        if (j === '11211211') return '112_repeat_pattern';
        if (j === '22122122') return '221_repeat_pattern';
    }

    // NHÓM 5: CẦU BỆT
    const lastRun = lastRuns[lastRuns.length - 1];
    if (lastRun) {
        if (lastRun.len >= 15) return 'ultra_long_run_pattern';
        if (lastRun.len >= 13) return 'hyper_long_run_pattern';
        if (lastRun.len >= 12) return 'mega_long_run_pattern';
        if (lastRun.len >= 10) return 'super_long_run_pattern';
        if (lastRun.len >= 8) return 'very_long_run_pattern';
        if (lastRun.len >= 7) return 'long_run_pattern';
        if (lastRun.len >= 5) return 'medium_long_run_pattern';
        if (lastRun.len >= 4) return 'medium_run_pattern';
        if (lastRun.len >= 3) return 'short_run_pattern';
    }

    // NHÓM 6: ĐẶC BIỆT
    if (features) {
        if (features.isSymmetry && lengths.length >= 5) return 'detected_symmetry_pattern';
        if (features.isAlternating && lengths.length >= 5) return 'detected_alternating_pattern';
        if (features.isWave && lengths.length >= 5) return 'detected_wave_pattern';
        if (features.flipStreak >= 5) return 'flip_streak_pattern';
        if (features.sameScoreStreak >= 3) return 'same_score_streak_pattern';
    }

    return 'random_pattern';
}

// ==================== HẾT ĐOẠN 4/10 ====================
// =====================================================================
// ĐOẠN 5/10: PATTERN → PREDICTION + LÝ DO
// =====================================================================
function predictNextFromPattern(patternType, runs, lastTx, history = null) {
    if (!patternType) return { pred: null, confidence: 0.5, reason: "Không có pattern" };
    const lastRun = runs[runs.length - 1];
    if (!lastRun) return { pred: null, confidence: 0.5, reason: "Không có run" };
    const flip = (v) => v === 'T' ? 'X' : 'T';
    const sbp = (len) => STATS.STREAK_BREAK_PROB[Math.min(len, 15)] || 0.999;

    const patternNames = {
        '1_1_pattern': 'cầu xen kẽ 1-1',
        '2_2_pattern': 'cầu xen kẽ 2-2',
        '3_3_pattern': 'cầu xen kẽ 3-3',
        'short_run_pattern': `cầu bệt ${lastRun.len} (ngắn)`,
        'medium_run_pattern': `cầu bệt ${lastRun.len} (trung bình)`,
        'medium_long_run_pattern': `cầu bệt ${lastRun.len} (trung bình dài)`,
        'long_run_pattern': `cầu bệt ${lastRun.len} (dài)`,
        'very_long_run_pattern': `cầu bệt ${lastRun.len} (rất dài)`,
        'super_long_run_pattern': `cầu bệt ${lastRun.len} (siêu dài)`,
        'mega_long_run_pattern': `cầu bệt ${lastRun.len} (mega)`,
        '1122_loop_pattern': 'loop 1122',
        '2211_loop_pattern': 'loop 2211',
        'loop_221122_pattern': 'loop 221122',
        'loop_112211_pattern': 'loop 112211'
    };

    const pname = patternNames[patternType] || patternType.replace(/_/g, ' ');

    switch (patternType) {
        case '1_1_pattern':
            return { pred: flip(lastTx), confidence: 0.60, reason: `${pname} → đảo chiều` };
        case '2_2_pattern':
            return { pred: lastRun.len === 2 ? flip(lastRun.val) : lastRun.val, confidence: 0.58, reason: `${pname} tại nhịp ${lastRun.len}` };
        case '3_3_pattern':
            return { pred: lastRun.len === 3 ? flip(lastRun.val) : lastRun.val, confidence: 0.60, reason: `${pname} tại nhịp ${lastRun.len}` };
        case '4_4_pattern':
            return { pred: lastRun.len === 4 ? flip(lastRun.val) : lastRun.val, confidence: 0.62, reason: `${pname} tại nhịp ${lastRun.len}` };
        case 'short_run_pattern': {
            const p = 1 - sbp(lastRun.len);
            return { pred: p > 0.5 ? lastRun.val : flip(lastRun.val), confidence: Math.max(p, 1-p), reason: `${pname}: xác suất gãy ${(sbp(lastRun.len)*100).toFixed(0)}%` };
        }
        case 'medium_run_pattern': {
            const p = 1 - sbp(lastRun.len);
            return { pred: p > 0.5 ? lastRun.val : flip(lastRun.val), confidence: Math.max(p, 1-p), reason: `${pname}: xác suất gãy ${(sbp(lastRun.len)*100).toFixed(0)}%` };
        }
        case 'medium_long_run_pattern':
            return { pred: lastRun.val, confidence: 0.55, reason: `${pname}: tiếp tục bệt (xác suất gãy ${(sbp(lastRun.len)*100).toFixed(0)}%)` };
        case 'long_run_pattern':
            return { pred: lastRun.len >= 8 ? flip(lastRun.val) : lastRun.val, confidence: lastRun.len >= 8 ? 0.8 : 0.6, reason: `${pname}: ${lastRun.len >= 8 ? 'sắp gãy' : 'tiếp tục'} (gãy ${(sbp(lastRun.len)*100).toFixed(0)}%)` };
        case 'very_long_run_pattern':
            return { pred: flip(lastRun.val), confidence: sbp(lastRun.len), reason: `${pname}: xác suất gãy ${(sbp(lastRun.len)*100).toFixed(0)}%` };
        case 'super_long_run_pattern':
            return { pred: flip(lastRun.val), confidence: sbp(lastRun.len), reason: `${pname}: xác suất gãy ${(sbp(lastRun.len)*100).toFixed(0)}%` };
        case 'mega_long_run_pattern':
            return { pred: flip(lastRun.val), confidence: 0.98, reason: `${pname}: xác suất gãy 98%` };
        case 'hyper_long_run_pattern':
            return { pred: flip(lastRun.val), confidence: 0.995, reason: `${pname}: xác suất gãy 99.5%` };
        case 'ultra_long_run_pattern':
            return { pred: flip(lastRun.val), confidence: 0.999, reason: `${pname}: xác suất gãy 99.9%` };
        case '1_2_1_pattern':
            return { pred: lastRun.len === 1 ? flip(lastRun.val) : lastRun.val, confidence: 0.62, reason: `${pname} tại nhịp ${lastRun.len}` };
        case '2_1_2_pattern':
            return { pred: lastRun.len === 2 ? flip(lastRun.val) : lastRun.val, confidence: 0.62, reason: `${pname} tại nhịp ${lastRun.len}` };
        case '3_2_3_pattern':
            return { pred: lastRun.len === 3 ? flip(lastRun.val) : lastRun.val, confidence: 0.65, reason: `${pname}` };
        case '1_3_1_pattern':
            return { pred: lastRun.len === 1 ? flip(lastRun.val) : lastRun.val, confidence: 0.60, reason: `${pname}` };
        case '1_2_1_2_1_2_pattern':
        case '2_1_2_1_2_1_pattern':
            return { pred: lastRun.len === 1 ? flip(lastRun.val) : lastRun.val, confidence: 0.65, reason: `${pname}: chu kỳ 1-2` };
        case 'loop_221122_pattern':
        case 'loop_112211_pattern':
        case '1122_loop_pattern':
        case '2211_loop_pattern':
            return { pred: lastRun.len === 2 ? flip(lastRun.val) : lastRun.val, confidence: 0.63, reason: `${pname}: chu kỳ loop` };
        case '112_repeat_pattern':
        case '221_repeat_pattern':
            return { pred: lastRun.len === 2 ? lastRun.val : flip(lastRun.val), confidence: 0.62, reason: `${pname}: repeat pattern` };
        case 'block_111_222_pattern':
        case 'block_222_111_pattern':
        case 'block_112222_pattern':
        case 'block_221111_pattern':
        case 'block_111122_pattern':
        case 'block_222211_pattern':
            return { pred: lastRun.len === 3 ? flip(lastRun.val) : lastRun.val, confidence: 0.68, reason: `${pname}: block pattern` };
        case 'mirror_12221_pattern':
        case 'mirror_21112_pattern':
        case 'mirror_12321_pattern':
        case 'mirror_32123_pattern':
            return { pred: lastRun.len === 1 ? flip(lastRun.val) : lastRun.val, confidence: 0.62, reason: `${pname}: đối xứng gương` };
        case 'alternating_21212_pattern':
        case 'alternating_12121_pattern':
            return { pred: lastRun.len === 1 ? flip(lastRun.val) : lastRun.val, confidence: 0.65, reason: `${pname}: xen kẽ` };
        case 'detected_symmetry_pattern':
            return { pred: flip(lastTx), confidence: 0.60, reason: 'Phát hiện pattern đối xứng' };
        case 'detected_alternating_pattern':
            return { pred: flip(lastTx), confidence: 0.62, reason: 'Phát hiện pattern xen kẽ' };
        case 'detected_wave_pattern':
            return { pred: flip(lastTx), confidence: 0.58, reason: 'Phát hiện pattern sóng' };
        case 'flip_streak_pattern':
            return { pred: lastTx, confidence: 0.60, reason: 'Chuỗi đảo liên tiếp' };
        case 'same_score_streak_pattern':
            return { pred: flip(lastTx), confidence: 0.58, reason: 'Điểm số lặp lại' };
        case 'repeat_123123_pattern':
        case 'repeat_321321_pattern':
            return { pred: lastRun.len === 3 ? flip(lastRun.val) : lastRun.val, confidence: 0.65, reason: `${pname}: chu kỳ 3` };
        default:
            return { pred: null, confidence: 0.5, reason: 'Không đủ dữ liệu pattern' };
    }
}

// ==================== HẾT ĐOẠN 5/10 ====================
// =====================================================================
// ĐOẠN 6/10: 8 THUẬT TOÁN
// =====================================================================
function algoA_markov(history) {
    if (history.length < 15) return null;
    const tx = history.map(h => h.tx);
    let maxOrder = history.length < 30 ? 3 : 5;
    let bestPred = null, bestScore = -1;
    for (let order = 2; order <= maxOrder; order++) {
        if (tx.length < order + 8) continue;
        const transitions = {};
        const totalT = tx.length - order;
        for (let i = 0; i < totalT; i++) {
            const key = tx.slice(i, i + order).join('');
            const next = tx[i + order];
            const w = Math.pow(0.95, totalT - i - 1);
            if (!transitions[key]) transitions[key] = { T: 0, X: 0 };
            transitions[key][next] += w;
        }
        const c = transitions[tx.slice(-order).join('')];
        if (c && (c.T + c.X) > 0.5) {
            const conf = Math.abs(c.T - c.X) / (c.T + c.X);
            const pred = c.T > c.X ? 'T' : 'X';
            const score = conf * (order / maxOrder) * Math.min(1, (c.T + c.X) / 10);
            if (score > bestScore) { bestScore = score; bestPred = pred; }
        }
    }
    return bestPred;
}

function algoB_ngram(history) {
    if (history.length < 30) return null;
    const tx = history.map(h => h.tx);
    let bestPred = null, bestConf = 0;
    for (const n of [7, 6, 5, 4, 3]) {
        if (tx.length < n * 2) continue;
        const target = tx.slice(-n).join('');
        const matches = [];
        for (let i = 0; i <= tx.length - n - 1; i++) {
            if (tx.slice(i, i + n).join('') === target) {
                matches.push({ next: tx[i + n], distance: tx.length - i });
            }
        }
        if (matches.length >= 2) {
            const w = { T: 0, X: 0 };
            let tw = 0;
            for (const m of matches) {
                const wt = 1 / (m.distance * 0.5 + 1);
                w[m.next] += wt;
                tw += wt;
            }
            if (tw > 0) {
                const conf = Math.abs(w.T - w.X) / tw;
                if (conf > bestConf) { bestConf = conf; bestPred = w.T > w.X ? 'T' : 'X'; }
            }
        }
    }
    return bestConf > 0.3 ? bestPred : null;
}

function algoG_SuperBridgePredictor(history) {
    const features = extractFeatures(history);
    const { runs } = features;
    if (runs.length < 4) return null;
    const lastRun = runs[runs.length - 1];
    if (lastRun.len >= 10) return lastRun.val === 'T' ? 'X' : 'T';
    if (lastRun.len >= 8) return lastRun.val === 'T' ? 'X' : 'T';
    if (lastRun.len >= 7) {
        const avgRun = avg(runs.map(r => r.len));
        if (lastRun.len > avgRun * 2) return lastRun.val === 'T' ? 'X' : 'T';
    }
    if (lastRun.len >= 5 && lastRun.len <= 6) {
        const avgRun = avg(runs.map(r => r.len));
        if (lastRun.len > avgRun * 1.8) return lastRun.val === 'T' ? 'X' : 'T';
    }
    return null;
}

function algoH_AdaptiveMarkov(history) {
    if (history.length < 25) return null;
    const tx = history.map(h => h.tx);
    const votes = { T: 0, X: 0 };
    for (const order of [2, 3, 4, 5]) {
        if (tx.length < order + 5) continue;
        const transitions = {};
        for (let i = 0; i <= tx.length - order - 1; i++) {
            const key = tx.slice(i, i + order).join('');
            const next = tx[i + order];
            if (!transitions[key]) transitions[key] = { T: 0, X: 0 };
            transitions[key][next]++;
        }
        const c = transitions[tx.slice(-order).join('')];
        if (c && c.T + c.X >= 2) {
            const pred = c.T > c.X ? 'T' : 'X';
            const conf = Math.abs(c.T - c.X) / (c.T + c.X);
            votes[pred] += conf * (order / 10);
        }
    }
    if (votes.T + votes.X > 0.3) return votes.T > votes.X ? 'T' : 'X';
    return null;
}

function algoI_PatternMaster(history) {
    if (history.length < 25) return null;
    const features = extractFeatures(history);
    const { runs, tx } = features;
    if (runs.length < 5) return null;
    const recentRuns = runs.slice(-8);
    const runLengths = recentRuns.map(r => r.len);
    const runValues = recentRuns.map(r => r.val);
    const runPattern = runLengths.join('');
    const lastVal = runValues[runValues.length - 1];
    let strength = { T: 0, X: 0 };
    const lib = [
        { p: '12121', pred: lastVal === 'T' ? 'X' : 'T', s: 0.72 },
        { p: '21212', pred: lastVal === 'T' ? 'T' : 'X', s: 0.72 },
        { p: '121212', pred: lastVal === 'T' ? 'X' : 'T', s: 0.78 },
        { p: '212121', pred: lastVal === 'T' ? 'T' : 'X', s: 0.78 }
    ];
    for (const l of lib) if (runPattern.includes(l.p)) strength[l.pred] += l.s;
    const total = strength.T + strength.X;
    if (total > 0) {
        const conf = Math.abs(strength.T - strength.X) / total;
        if (conf > 0.25) return strength.T > strength.X ? 'T' : 'X';
    }
    return null;
}

function algoQ_StreakProbability(history) {
    if (history.length < 15) return null;
    const features = extractFeatures(history);
    const lastRun = features.runs[features.runs.length - 1];
    if (!lastRun) return null;
    const bp = STATS.STREAK_BREAK_PROB[Math.min(lastRun.len, 15)] || 0.999;
    if (bp > 0.55) return lastRun.val === 'T' ? 'X' : 'T';
    if (bp < 0.45) return lastRun.val;
    return null;
}

function algoN_TransitionMatrix(history) {
    if (history.length < 30) return null;
    const tx = history.map(h => h.tx);
    const recent = tx.slice(-50);
    const t = { TT: 0, TX: 0, XT: 0, XX: 0 };
    for (let i = 1; i < recent.length; i++) t[recent[i-1] + recent[i]]++;
    const last = recent[recent.length - 1];
    const totalFromLast = last === 'T' ? t.TT + t.TX : t.XT + t.XX;
    if (totalFromLast < 5) return null;
    const probFlip = last === 'T' ? t.TX / totalFromLast : t.XT / totalFromLast;
    if (probFlip > 0.55) return last === 'T' ? 'X' : 'T';
    if (probFlip < 0.45) return last;
    return null;
}

function algoL_MomentumReversal(history) {
    if (history.length < 30) return null;
    const totals = history.map(h => h.total);
    const m5 = avg(totals.slice(-5));
    const m20 = avg(totals.slice(-20));
    if (m5 > 12.5) return 'X';
    if (m5 < 8.5) return 'T';
    if (m5 > m20 + 2) return 'X';
    if (m5 < m20 - 2) return 'T';
    return null;
}

const ALL_ALGS = [
    { id: 'a_markov', fn: algoA_markov, role: 'PRIMARY' },
    { id: 'b_ngram', fn: algoB_ngram, role: 'SECONDARY' },
    { id: 'g_super_bridge', fn: algoG_SuperBridgePredictor, role: 'REVERSAL' },
    { id: 'h_adaptive_markov', fn: algoH_AdaptiveMarkov, role: 'CONTEXT' },
    { id: 'i_pattern_master', fn: algoI_PatternMaster, role: 'PRIMARY' },
    { id: 'n_transition_matrix', fn: algoN_TransitionMatrix, role: 'CONTEXT' },
    { id: 'q_streak_probability', fn: algoQ_StreakProbability, role: 'REVERSAL' },
    { id: 'l_momentum_reversal', fn: algoL_MomentumReversal, role: 'REVERSAL' }
];

// ==================== HẾT ĐOẠN 6/10 ====================
// =====================================================================
// ĐOẠN 7/10: ENSEMBLE V12.0 + MANAGER
// =====================================================================
class EnsembleV12 {
    constructor() {
        this.weights = {};
        this.recentPredictions = [];
        this.recentActuals = [];
        this.winStreak = 0;
        this.loseStreak = 0;
        this.lastPrediction = null;
        for (const a of ALL_ALGS) this.weights[a.id] = 1.0;
        this.normalizeWeights();
    }

    normalizeWeights() {
        const total = Object.values(this.weights).reduce((s, w) => s + w, 0);
        if (total > 0) for (const id in this.weights) this.weights[id] /= total;
    }

    updateWeights(historyPrefix, actualTx) {
        for (const a of ALL_ALGS) {
            try {
                const pred = a.fn(historyPrefix);
                if (pred) {
                    const correct = pred === actualTx ? 1 : 0;
                    const lr = 0.03;
                    this.weights[a.id] = correct ? this.weights[a.id] * (1 + lr) : this.weights[a.id] * (1 - lr);
                    this.weights[a.id] = Math.max(0.01, Math.min(3, this.weights[a.id]));
                }
            } catch (e) {}
        }
        this.normalizeWeights();
    }

    predict(history) {
        if (history.length < 12) {
            const tC = history.filter(h => h.tx === 'T').length;
            const xC = history.filter(h => h.tx === 'X').length;
            const fallback = tC > xC ? 'X' : 'T';
            return {
                prediction: fallback === 'T' ? 'tài' : 'xỉu',
                confidence: 0.5,
                rawPrediction: fallback,
                li_do: `Chưa đủ dữ liệu (${history.length}/12 phiên), dự đoán theo đa số`
            };
        }

        const features = extractFeatures(history);
        const patternType = detectPatternType(features.runs, features);
        const lastTx = features.tx[features.tx.length - 1];
        const lastRun = features.runs[features.runs.length - 1];

        const patternResult = predictNextFromPattern(patternType, features.runs, lastTx, history);
        const patternWeight = getPatternWeight(patternType);

        const votes = { T: 0, X: 0 };
        const details = [];

        if (patternResult.pred) {
            const w = patternWeight * 3.0 * patternResult.confidence;
            votes[patternResult.pred] += w;
            details.push({ algo: 'pattern', pred: patternResult.pred, w: w.toFixed(3), role: 'PRIMARY' });
        }

        for (const a of ALL_ALGS) {
            try {
                const pred = a.fn(history);
                if (!pred) continue;
                const w = this.weights[a.id] * 1.0;
                votes[pred] += w;
                details.push({ algo: a.id, pred, w: w.toFixed(3), role: a.role });
            } catch (e) {}
        }

        const total = votes.T + votes.X;
        if (total === 0) {
            return {
                prediction: 'tài', confidence: 0.5, rawPrediction: 'T',
                li_do: 'Không có thuật toán vote, chọn mặc định'
            };
        }

        let best = votes.T > votes.X ? 'T' : 'X';
        let confidence = Math.max(votes.T, votes.X) / total;

        if (history.length >= 50) {
            const recent50 = history.slice(-50);
            const tRatio = recent50.filter(h => h.tx === 'T').length / 50;
            if (tRatio > 0.65 && best === 'T' && confidence < 0.75) {
                best = 'X';
                confidence = Math.max(confidence * 1.05, 0.60);
            } else if (tRatio < 0.35 && best === 'X' && confidence < 0.75) {
                best = 'T';
                confidence = Math.max(confidence * 1.05, 0.60);
            }
        }

        if (this.loseStreak >= 5 && this.winStreak === 0) {
            best = best === 'T' ? 'X' : 'T';
            confidence = Math.max(confidence, 0.60);
            this.loseStreak = 0;
        }

        const li_do = this.buildLiDo({
            patternType, patternResult, patternWeight,
            lastRun, lastTx, confidence, votes, best, details, history
        });

        if (confidence < 0.55) {
            return {
                prediction: 'chưa có',
                confidence,
                rawPrediction: null,
                li_do: `${li_do} | ⚠️ Độ tin cậy ${(confidence*100).toFixed(0)}% < 55% - bỏ qua`
            };
        }

        this.lastPrediction = best;
        this.recentPredictions.push(best);
        if (this.recentPredictions.length > 20) this.recentPredictions.shift();

        return {
            prediction: best === 'T' ? 'tài' : 'xỉu',
            confidence,
            rawPrediction: best,
            li_do,
            pattern: patternType,
            details
        };
    }

    buildLiDo(ctx) {
        const parts = [];
        const { patternType, patternResult, patternWeight, lastRun, lastTx, votes, best } = ctx;

        if (patternType && patternType !== 'random_pattern') {
            parts.push(`Pattern: ${patternResult.reason || patternType} (w=${patternWeight.toFixed(2)})`);
        } else {
            parts.push(`Pattern: ngẫu nhiên (không đủ tin cậy)`);
        }

        if (lastRun) {
            const sbp = STATS.STREAK_BREAK_PROB[Math.min(lastRun.len, 15)] || 0.999;
            parts.push(`Bệt ${lastRun.val === 'T' ? 'TÀI' : 'XỈU'} ${lastRun.len} phiên (xác suất gãy ${(sbp*100).toFixed(0)}%)`);
        }

        const total = votes.T + votes.X;
        if (total > 0) {
            const tP = (votes.T / total * 100).toFixed(0);
            const xP = (votes.X / total * 100).toFixed(0);
            parts.push(`Vote: TÀI ${tP}% / XỈU ${xP}%`);
        }

        parts.push(`→ Chọn ${best === 'T' ? 'TÀI' : 'XỈU'}`);

        return parts.join(' | ');
    }
}

class Manager {
    constructor() {
        this.history = [];
        this.ensemble = new EnsembleV12();
        this.currentPrediction = null;
        this.lastPredictionForSession = null;
        this.predictionLog = {};
    }

    loadInitial(lines) {
        this.history = lines;
        this.currentPrediction = this.ensemble.predict(this.history);
        if (this.history.length > 0) {
            this.lastPredictionForSession = this.history[this.history.length - 1].session + 1;
        }
    }

    pushRecord(record) {
        if (this.currentPrediction && this.lastPredictionForSession === record.session) {
            this.predictionLog[record.session] = {
                pred: this.currentPrediction.rawPrediction,
                predText: this.currentPrediction.prediction,
                conf: this.currentPrediction.confidence,
                li_do: this.currentPrediction.li_do,
                correct: this.currentPrediction.rawPrediction === record.tx,
                actual: record.tx,
                actualText: record.tx === 'T' ? 'tài' : 'xỉu'
            };
        }

        if (this.currentPrediction && this.currentPrediction.rawPrediction) {
            if (this.currentPrediction.rawPrediction === record.tx) {
                this.ensemble.winStreak++;
                this.ensemble.loseStreak = 0;
            } else {
                this.ensemble.loseStreak++;
                this.ensemble.winStreak = 0;
            }
        }

        const prefix = this.history.slice();
        if (prefix.length >= 10) this.ensemble.updateWeights(prefix, record.tx);

        this.history.push(record);
        if (this.history.length > MAX_HISTORY) this.history = this.history.slice(-MAX_HISTORY + 50);

        this.currentPrediction = this.ensemble.predict(this.history);
        this.lastPredictionForSession = record.session + 1;

        this.ensemble.recentActuals.push(record.tx);
        if (this.ensemble.recentActuals.length > 20) this.ensemble.recentActuals.shift();
    }
}

// ==================== HẾT ĐOẠN 7/10 ====================
// =====================================================================
// ĐOẠN 8/10: FETCH + FASTIFY SERVER + API
// =====================================================================
async function fetchAndProcessTable(tableKey) {
    const table = TABLES[tableKey];
    try {
        const response = await fetch(table.apiUrl);
        const data = await response.json();

        let newHistory;
        if (table.parseType === 'lc79_md5') newHistory = parseLc79Md5Data(data);
        else if (table.parseType === 'lc79_hu') newHistory = parseLc79HuData(data);
        else if (table.parseType === 'hitclub') newHistory = parseHitClubLines(data);
        else if (table.parseType === 'max789') newHistory = parseMax789Data(data);
        else if (table.parseType === 'sunwin') newHistory = parseSunwinLines(data);
        else newHistory = [];

        if (newHistory.length === 0) return;

        const lastSessionInHistory = newHistory[newHistory.length - 1];

        if (!table.currentSessionId) {
            table.manager = new Manager();
            table.manager.loadInitial(newHistory);
            table.history = newHistory;
            table.currentSessionId = lastSessionInHistory.session;
            console.log(`✅ ${table.name}: Đã tải ${newHistory.length} phiên`);
        } else if (lastSessionInHistory.session > table.currentSessionId) {
            const newRecords = newHistory.filter(r => r.session > table.currentSessionId);
            for (const record of newRecords) {
                table.manager.pushRecord(record);
                table.history.push(record);
            }
            if (table.history.length > MAX_HISTORY) table.history = table.history.slice(-MAX_HISTORY);
            table.currentSessionId = lastSessionInHistory.session;
            if (newRecords.length > 0) {
                console.log(`🆕 ${table.name}: +${newRecords.length} phiên. Cuối: ${table.currentSessionId}`);
            }
        }
    } catch (e) {
        console.error(`❌ ${table.name}:`, e.message);
    }
}

async function fetchAllTables() {
    await Promise.all(Object.keys(TABLES).map(k => fetchAndProcessTable(k)));
}

const app = fastify({ logger: false });
await app.register(cors, { origin: "*" });

function buildPredictionResponse(tableKey) {
    const table = TABLES[tableKey];
    const lastResult = table.history[table.history.length - 1] || null;
    const currentPrediction = table.manager?.currentPrediction;

    if (!lastResult || !currentPrediction) {
        return {
            id: "@cskhgiabao",
            game: GAME_LABELS[tableKey] || tableKey,
            phien_truoc: null,
            xuc_xac: null,
            ket_qua: "đang chờ...",
            phien_nay: null,
            du_doan: "chưa có",
            do_tin_cay: "0%",
            li_do: "Chưa có dữ liệu"
        };
    }

    return {
        id: "@cskhgiabao",
        game: GAME_LABELS[tableKey] || tableKey,
        phien_truoc: lastResult.session,
        xuc_xac: lastResult.dice,
        ket_qua: lastResult.result.toLowerCase(),
        phien_nay: lastResult.session + 1,
        du_doan: currentPrediction.prediction,
        do_tin_cay: `${Math.round(currentPrediction.confidence * 100)}%`,
        li_do: currentPrediction.li_do || "Không có lý do"
    };
}

function buildHistoryResponse(tableKey) {
    const table = TABLES[tableKey];
    if (!table.history.length) return [];

    const reversed = [...table.history].sort((a, b) => b.session - a.session);
    const log = table.manager?.predictionLog || {};

    return reversed.map((i) => {
        const predLog = log[i.session];
        let prediction = null, predictionConfidence = null, correct = null, li_do = null;
        if (predLog) {
            prediction = predLog.predText;
            predictionConfidence = Math.round(predLog.conf * 100);
            correct = predLog.correct;
            li_do = predLog.li_do;
        }
        return {
            session: i.session,
            dice: i.dice,
            total: i.total,
            result: i.result.toLowerCase(),
            tx_label: i.tx.toLowerCase(),
            prediction,
            prediction_confidence: predictionConfidence,
            correct,
            li_do
        };
    });
}

app.get("/api/all", async () => {
    const result = {};
    for (const key of Object.keys(TABLES)) {
        result[key] = buildPredictionResponse(key);
    }
    return result;
});

for (const key of Object.keys(TABLES)) {
    app.get(`/api/${key}`, async () => buildPredictionResponse(key));
    app.get(`/api/${key}/history`, async () => buildHistoryResponse(key));
}

app.get("/api/history/all", async () => {
    const result = {};
    for (const key of Object.keys(TABLES)) {
        result[key] = buildHistoryResponse(key).slice(0, 50);
    }
    return result;
});

app.get("/api/stats", async () => {
    const result = {};
    for (const key of Object.keys(TABLES)) {
        const table = TABLES[key];
        if (!table.manager) { result[key] = { error: "chưa load" }; continue; }
        const log = table.manager.predictionLog;
        let total = 0, correct = 0;
        for (const sess in log) {
            total++;
            if (log[sess].correct) correct++;
        }
        result[key] = {
            game: GAME_LABELS[key],
            totalPredictions: total,
            correct,
            accuracy: total > 0 ? ((correct / total) * 100).toFixed(1) + "%" : "0%",
            winStreak: table.manager.ensemble.winStreak,
            loseStreak: table.manager.ensemble.loseStreak,
            historyLength: table.history.length
        };
    }
    return result;
});

// ==================== HẾT ĐOẠN 8/10 ====================
// =====================================================================
// ĐOẠN 9/10: HTML DASHBOARD (PHẦN 1)
// =====================================================================
app.get("/", async (req, reply) => {
    reply.type("text/html; charset=utf-8").send(HTML_DASHBOARD);
});

app.get("/xem", async (req, reply) => {
    reply.type("text/html; charset=utf-8").send(HTML_DASHBOARD);
});

const HTML_DASHBOARD = `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>🎯 AI Tài Xỉu Tổng Hợp V12.0</title>
<style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
        background: linear-gradient(135deg, #0a0e1a 0%, #1a1f2e 100%);
        color: #e0e0e0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        padding: 16px;
        min-height: 100vh;
    }
    .header {
        text-align: center;
        margin-bottom: 20px;
        padding: 16px;
        background: linear-gradient(135deg, #1e3a5f 0%, #2d1b4e 100%);
        border-radius: 12px;
        border: 1px solid #ffd700;
    }
    .header h1 {
        font-size: 24px;
        color: #ffd700;
        margin-bottom: 6px;
    }
    .header p { font-size: 13px; color: #aaa; }

    .stats-bar {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
        margin-bottom: 16px;
        padding: 12px;
        background: #1a1f2e;
        border-radius: 10px;
    }
    .stat-item {
        flex: 1;
        min-width: 100px;
        text-align: center;
        padding: 8px;
        background: #252b3d;
        border-radius: 6px;
    }
    .stat-item .label { font-size: 11px; color: #888; margin-bottom: 4px; }
    .stat-item .value { font-size: 18px; font-weight: bold; color: #ffd700; }

    .game-card {
        background: linear-gradient(135deg, #1e2936 0%, #1a1f2e 100%);
        border-radius: 12px;
        margin-bottom: 14px;
        overflow: hidden;
        border: 1px solid #2a3a4a;
    }
    .game-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        background: #252b3d;
        border-bottom: 1px solid #2a3a4a;
    }
    .game-name {
        font-size: 16px;
        font-weight: bold;
        color: #4ecdc4;
    }
    .game-accuracy {
        font-size: 12px;
        padding: 4px 10px;
        border-radius: 20px;
        background: #1a3a2a;
        color: #00ff88;
    }
    .game-accuracy.low { background: #3a1a1a; color: #ff6666; }

    .prediction-box {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 10px;
        padding: 14px 16px;
        background: #1f2534;
        border-bottom: 1px solid #2a3a4a;
    }
    .pred-item { text-align: center; }
    .pred-label { font-size: 10px; color: #888; text-transform: uppercase; margin-bottom: 4px; }
    .pred-value { font-size: 16px; font-weight: bold; }
    .pred-value.tai { color: #ff6b6b; }
    .pred-value.xiu { color: #4ecdc4; }
    .pred-value.chuaco { color: #888; }

    .li-do-box {
        padding: 10px 16px;
        background: #161b28;
        font-size: 12px;
        color: #b0b8c8;
        line-height: 1.5;
        border-bottom: 1px solid #2a3a4a;
    }
    .li-do-label {
        color: #ffd700;
        font-weight: bold;
        margin-right: 6px;
    }

    .history-toggle {
        padding: 8px 16px;
        background: #1a1f2e;
        cursor: pointer;
        font-size: 12px;
        color: #4ecdc4;
        text-align: center;
        user-select: none;
    }
    .history-toggle:hover { background: #232938; }

    .history-table {
        display: none;
        max-height: 400px;
        overflow-y: auto;
    }
    .history-table.open { display: block; }

    table {
        width: 100%;
        border-collapse: collapse;
        font-size: 12px;
    }
    th {
        background: #252b3d;
        padding: 8px 6px;
        text-align: left;
        color: #ffd700;
        font-size: 11px;
        position: sticky;
        top: 0;
    }
    td {
        padding: 8px 6px;
        border-top: 1px solid #252b3d;
        vertical-align: top;
    }
    tr:hover { background: #232938; }

    .badge {
        display: inline-block;
        padding: 2px 8px;
        border-radius: 10px;
        font-size: 10px;
        font-weight: bold;
    }
    .badge.tai { background: rgba(255,107,107,0.2); color: #ff6b6b; }
    .badge.xiu { background: rgba(78,205,196,0.2); color: #4ecdc4; }
    .badge.dung { background: rgba(0,255,136,0.15); color: #00ff88; }
    .badge.sai { background: rgba(255,68,68,0.15); color: #ff4444; }
    .badge.none { background: #333; color: #888; }

    .cell-li-do {
        max-width: 300px;
        font-size: 11px;
        color: #9aa5b8;
        line-height: 1.4;
    }

    .updated {
        text-align: center;
        font-size: 11px;
        color: #666;
        margin-top: 20px;
        padding: 10px;
    }

    @media (max-width: 600px) {
        .prediction-box { grid-template-columns: 1fr 1fr; }
        .cell-li-do { max-width: 150px; font-size: 10px; }
    }
</style>
</head>
<body>

<div class="header">
    <h1>🎯 AI Tài Xỉu Tổng Hợp V12.0</h1>
    <p>7 nguồn game • Pattern Weights từ 7,698 phiên • Auto Refresh 10s</p>
</div>

<div class="stats-bar" id="statsBar">
    <div class="stat-item">
        <div class="label">TỔNG GAME</div>
        <div class="value" id="totalGames">-</div>
    </div>
    <div class="stat-item">
        <div class="label">ĐÚNG</div>
        <div class="value" style="color:#00ff88" id="totalCorrect">-</div>
    </div>
    <div class="stat-item">
        <div class="label">SAI</div>
        <div class="value" style="color:#ff4444" id="totalWrong">-</div>
    </div>
    <div class="stat-item">
        <div class="label">TỶ LỆ ĐÚNG</div>
        <div class="value" id="totalAcc">-</div>
    </div>
</div>

<div id="gamesContainer">
    <div style="text-align:center;padding:40px;color:#888;">⏳ Đang tải dữ liệu...</div>
</div>

<div class="updated" id="updated">Tự động cập nhật mỗi 10 giây</div>

// ==================== HẾT ĐOẠN 9/10 ====================
// =====================================================================
// ĐOẠN 10/10: HTML SCRIPT + START SERVER
// =====================================================================

// --- Phần SCRIPT của HTML (tiếp nối chuỗi template) ---
// LƯU Ý: Đây vẫn là phần trong `HTML_DASHBOARD`
// Nếu copy thì thêm ngay sau đoạn cuối của ĐOẠN 9:
/*

<script>
const GAME_LABELS = {
    lc79_md5: "LC79 MD5", lc79_hu: "LC79 Hũ",
    hitclub_md5: "HitClub MD5", hitclub_hu: "HitClub Hũ",
    max789_md5: "Max789 MD5", max789_hu: "Max789 Hũ",
    sunwin: "Sunwin"
};

async function loadData() {
    try {
        const [predRes, histRes, statsRes] = await Promise.all([
            fetch('/api/all').then(r => r.json()),
            fetch('/api/history/all').then(r => r.json()),
            fetch('/api/stats').then(r => r.json())
        ]);
        renderStats(statsRes);
        renderGames(predRes, histRes, statsRes);
        document.getElementById('updated').textContent =
            'Tự động cập nhật mỗi 10 giây • Cập nhật lúc: ' + new Date().toLocaleString('vi-VN');
    } catch (e) {
        console.error('Load error:', e);
    }
}

function renderStats(stats) {
    let totalPred = 0, totalCorrect = 0;
    for (const k in stats) {
        if (stats[k].totalPredictions) {
            totalPred += stats[k].totalPredictions;
            totalCorrect += stats[k].correct;
        }
    }
    document.getElementById('totalGames').textContent = Object.keys(stats).length;
    document.getElementById('totalCorrect').textContent = totalCorrect;
    document.getElementById('totalWrong').textContent = totalPred - totalCorrect;
    document.getElementById('totalAcc').textContent =
        totalPred > 0 ? ((totalCorrect / totalPred) * 100).toFixed(1) + '%' : '0%';
}

function renderGames(preds, hists, stats) {
    const container = document.getElementById('gamesContainer');
    let html = '';
    for (const key in preds) {
        const p = preds[key];
        const h = hists[key] || [];
        const s = stats[key] || {};
        const gameLabel = GAME_LABELS[key] || key;
        const acc = s.accuracy || '0%';
        const accNum = parseFloat(acc);
        const accClass = accNum < 50 ? 'low' : '';
        const predClass = p.du_doan === 'tài' ? 'tai' : (p.du_doan === 'xỉu' ? 'xiu' : 'chuaco');

        let histRows = '';
        for (const item of h.slice(0, 30)) {
            const predText = item.prediction || '—';
            const predClassH = predText === 'tài' ? 'tai' : (predText === 'xỉu' ? 'xiu' : 'none');
            let correctBadge = '<span class="badge none">—</span>';
            if (item.correct === true) correctBadge = '<span class="badge dung">✅ ĐÚNG</span>';
            else if (item.correct === false) correctBadge = '<span class="badge sai">❌ SAI</span>';
            const actualClass = item.tx_label === 't' ? 'tai' : 'xiu';
            const actualText = item.tx_label === 't' ? 'TÀI' : 'XỈU';
            histRows += '<tr>'
                + '<td>' + item.session + '</td>'
                + '<td><span class="badge ' + actualClass + '">' + actualText + '</span></td>'
                + '<td>' + item.total + '</td>'
                + '<td><span class="badge ' + predClassH + '">' + predText + '</span>'
                + (item.prediction_confidence ? ' (' + item.prediction_confidence + '%)' : '') + '</td>'
                + '<td>' + correctBadge + '</td>'
                + '<td class="cell-li-do">' + (item.li_do || '—') + '</td>'
                + '</tr>';
        }

        html += '<div class="game-card">'
            + '<div class="game-header">'
            + '<div class="game-name">🎲 ' + gameLabel + '</div>'
            + '<div class="game-accuracy ' + accClass + '">Tỷ lệ đúng: ' + acc + ' (' + (s.correct || 0) + '/' + (s.totalPredictions || 0) + ')</div>'
            + '</div>'
            + '<div class="prediction-box">'
            + '<div class="pred-item"><div class="pred-label">Phiên trước</div><div class="pred-value">' + (p.phien_truoc || '—') + '</div></div>'
            + '<div class="pred-item"><div class="pred-label">Kết quả</div><div class="pred-value">' + (p.ket_qua || '—').toUpperCase() + '</div></div>'
            + '<div class="pred-item"><div class="pred-label">Phiên ' + (p.phien_nay || '?') + '</div>'
            + '<div class="pred-value ' + predClass + '">' + (p.du_doan || '—').toUpperCase()
            + ' <span style="font-size:12px;color:#aaa;font-weight:normal;">(' + (p.do_tin_cay || '0%') + ')</span></div></div>'
            + '</div>'
            + '<div class="li-do-box"><span class="li-do-label">💡 Lý do:</span><span>' + (p.li_do || 'Không có lý do') + '</span></div>'
            + '<div class="history-toggle" onclick="toggleHistory(this)">📜 Xem lịch sử đúng/sai (' + h.length + ' phiên) ▼</div>'
            + '<div class="history-table"><table><thead><tr>'
            + '<th>Phiên</th><th>KQ</th><th>Điểm</th><th>Dự đoán</th><th>Đúng/Sai</th><th>💡 Lý do</th>'
            + '</tr></thead><tbody>'
            + (histRows || '<tr><td colspan="6" style="text-align:center;padding:20px;color:#666;">Chưa có lịch sử</td></tr>')
            + '</tbody></table></div></div>';
    }
    container.innerHTML = html;
}

function toggleHistory(el) {
    const table = el.nextElementSibling;
    table.classList.toggle('open');
    el.textContent = table.classList.contains('open')
        ? el.textContent.replace('▼', '▲')
        : el.textContent.replace('▲', '▼');
}

loadData();
setInterval(loadData, 10000);
</script>
</body>
</html>`;

// =====================================================================
// START SERVER
// =====================================================================
const start = async () => {
    try {
        await app.listen({ port: PORT, host: "0.0.0.0" });
    } catch (err) {
        console.error("Server error:", err.message);
        process.exit(1);
    }

    let publicIP = "0.0.0.0";
    try {
        const res = await fetch("https://ifconfig.me/ip");
        publicIP = (await res.text()).trim();
    } catch (e) {}

    console.log("\\n🚀 AI Tài Xỉu Tổng Hợp V12.0 - UNIFIED EDITION!");
    console.log(`   ➜ Local:   http://localhost:${PORT}/`);
    console.log(`   ➜ Network: http://${publicIP}:${PORT}/`);
    console.log("\\n📌 API endpoints:");
    console.log("   ➜ GET /                        → 🌐 Dashboard HTML");
    console.log("   ➜ GET /api/all                 → Tất cả game");
    console.log("   ➜ GET /api/stats               → Thống kê");
    console.log("   ➜ GET /api/history/all         → Lịch sử tất cả");
    console.log("   ➜ GET /api/{game}              → Dự đoán 1 game");
    console.log("   ➜ GET /api/{game}/history      → Lịch sử 1 game");
    console.log("\\n   Game keys: lc79_md5, lc79_hu, hitclub_md5, hitclub_hu, max789_md5, max789_hu, sunwin");
    console.log("\\n🎯 7 GAME ĐANG THEO DÕI:");
    for (const key in TABLES) {
        console.log(`   • ${key}: ${GAME_LABELS[key]}`);
    }

    await fetchAllTables();
    setInterval(fetchAllTables, FETCH_INTERVAL);
    console.log(`\\n🔄 Chu kỳ fetch ${FETCH_INTERVAL/1000}s cho cả 7 game.\\n`);
};

start();