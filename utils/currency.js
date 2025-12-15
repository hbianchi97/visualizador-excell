export function parseBRL(val) {
    if (val === undefined || val === null || val === '') return 0;

    if (typeof val === 'number') return val;

    if (typeof val === 'string') {
        // Remove currency symbol and whitespace
        let clean = val.replace('R$', '').trim();

        // Handle "1.234,56" format (Brazilian standard)
        // If it has both dots and commas, it's likely BRL formatted
        if (clean.includes('.') && clean.includes(',')) {
            // Remove dots (thousands)
            clean = clean.replace(/\./g, '');
            // Replace comma with dot
            clean = clean.replace(',', '.');
        }
        // Handle "1,23" (simple decimal with comma)
        else if (clean.includes(',')) {
            clean = clean.replace(',', '.');
        }
        // Handle "1.234" (ambiguous, but usually BRL thousands if followed by 3 digits in full string, 
        // but dangerous. Let's assume if it looks like integer, treat as such? 
        // Actually, if it's "1.200", simple parseFloat works as 1.2. 
        // But in BR "1.200" is 1200. 
        // Let's rely on the assumption that this is money.
        // If there are exactly 3 digits after the LAST dot, and NO comma, assume it's thousands?
        // Risky. Let's stick to the ./, swap logic for mixed cases.
        // If just dots: "10.000". clean = 10000. 

        // Simple heuristic: If multiple dots, remove all.
        // If one dot and looks like thousands "1.000", remove it.
        // If one dot and looks like decimal "1.5", keep it?
        // Best approach for BRL inputs: Remove all dots, swap comma to dot.
        else {
            // Case: "10.000" -> remove dot -> 10000
            // Case: "10.50" (English?) -> remove dot -> 1050 (Wrong!)
            // But user says "Standard used in Brazil". So inputs are likely BRL.
            // In BRL, dot is valid ONLY as thousands separator.
            clean = clean.replace(/\./g, '');
        }

        const num = parseFloat(clean);
        return isNaN(num) ? 0 : num;
    }

    return 0;
}
