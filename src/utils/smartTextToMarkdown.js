// 智能文本转Markdown（支持树形符号、缩进、markdown等）
export function smartTextToMarkdown(text) {
    // 1. 如果本身就是markdown列表，直接返回
    if (/^\s*[-*+]\s+|^\s*\d+\.\s+/m.test(text)) {
        return text;
    }
    // 2. 树形符号或缩进转markdown
    const lines = text.split(/\r?\n/);
    let result = [];
    for (let rawLine of lines) {
        // 匹配前导空白和树形符号
        const match = rawLine.match(/^([\s│]*)([├└─]*)\s*(.*)$/);
        if (!match)
            continue;
        const [, prefix, tree, content] = match;
        if (!content.trim())
            continue;
        // 计算层级：每2个空格或每个"│"算一级，遇到"├""└"等符号再+1
        let level = 0;
        if (prefix) {
            const spaceCount = (prefix.match(/ /g) || []).length;
            const barCount = (prefix.match(/│/g) || []).length;
            level = Math.floor(spaceCount / 2) + barCount;
        }
        if (tree && tree.length > 0) {
            level += 1;
        }
        result.push(`${"  ".repeat(level)}- ${content.trim()}`);
    }
    // 如果没有树形符号，尝试用缩进推断
    if (result.length === 0) {
        for (let rawLine of lines) {
            const match = rawLine.match(/^(\s*)(.*)$/);
            if (!match)
                continue;
            const [, space, content] = match;
            if (!content.trim())
                continue;
            const level = Math.floor((space || "").length / 2);
            result.push(`${"  ".repeat(level)}- ${content.trim()}`);
        }
    }
    // 如果还不行，原样返回
    if (result.length === 0)
        return text;
    return result.join("\n");
}
