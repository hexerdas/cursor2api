/**
 * models.ts - 已知模型列表 + 最相似模型匹配
 */

export const KNOWN_MODEL_IDS: string[] = [
    'gpt-5.4',
    'gpt-5.4-fast',
    'gpt-5.4-long',
    'gpt-5.3-codex',
    'gpt-5.2-codex',
    'gpt-5.1-codex',
    'gpt-5.1-codex-mini',
    'google/gemini-3.1-pro',
    'google/gemini-3-pro-image-preview',
    'google/gemini-3-flash',
    'claude-opus-4-6',
    'claude-opus-4-6-thinking',
    'claude-opus-4-6-long',
    'claude-sonnet-4-6',
    'claude-sonnet-4-6-thinking',
    'claude-sonnet-4-6-long',
    'claude-sonnet-4-5-20250929',
    'claude-sonnet-4-20250514',
    'claude-3-5-sonnet-20241022',
];

/**
 * 计算两个字符串之间的 token 重叠相似度
 * 按 '-' 分割为 token，统计匹配 token 数量
 */
function tokenSimilarity(a: string, b: string): number {
    const ta = new Set(a.toLowerCase().split('-'));
    const tb = b.toLowerCase().split('-');
    let matches = 0;
    for (const t of tb) {
        if (ta.has(t)) matches++;
    }
    // 归一化：匹配数 / 较长者的 token 数，偏向更短的精确匹配
    const maxLen = Math.max(a.split('-').length, b.split('-').length);
    return matches / maxLen;
}

/**
 * 从已知模型列表中选出与 requestedModel 最相似的模型。
 * 若 requestedModel 已在列表中，直接返回；否则返回相似度最高的。
 * extraModels 用于将 config.cursorModel 等动态值也纳入候选。
 */
export function pickBestModel(requestedModel: string, extraModels: string[] = []): string {
    const allModels = [...new Set([...KNOWN_MODEL_IDS, ...extraModels])];

    // 精确匹配
    if (allModels.includes(requestedModel)) {
        return requestedModel;
    }

    // 相似度匹配
    let bestModel = allModels[0];
    let bestScore = -1;
    for (const m of allModels) {
        const score = tokenSimilarity(requestedModel, m);
        if (score > bestScore) {
            bestScore = score;
            bestModel = m;
        }
    }

    console.log(`[Models] 请求模型 "${requestedModel}" 不在已知列表中，使用最相似模型: "${bestModel}" (score=${bestScore.toFixed(2)})`);
    return bestModel;
}
