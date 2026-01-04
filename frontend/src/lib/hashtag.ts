/**
 * Utility functions for parsing and rendering hashtags and mentions in text
 */

/**
 * Parse text and return an array of segments with hashtags and mentions marked
 * @param text - The text to parse
 * @returns Array of segments with type and content
 */
export function parseContent(text: string): Array<{ type: 'text' | 'hashtag' | 'mention'; content: string }> {
    if (!text) return [];

    const segments: Array<{ type: 'text' | 'hashtag' | 'mention'; content: string }> = [];

    // Combined regex to match both hashtags and mentions
    // Hashtag: #word
    // Mention: @username
    const combinedRegex = /(#[a-zA-Z][a-zA-Z0-9_]*|@[a-zA-Z0-9_]+)/g;

    let lastIndex = 0;
    let match;

    while ((match = combinedRegex.exec(text)) !== null) {
        // Add text before hashtag/mention
        if (match.index > lastIndex) {
            segments.push({
                type: 'text',
                content: text.substring(lastIndex, match.index),
            });
        }

        // Determine if it's a hashtag or mention
        const matchedText = match[0];
        if (matchedText.startsWith('#')) {
            segments.push({
                type: 'hashtag',
                content: matchedText,
            });
        } else if (matchedText.startsWith('@')) {
            segments.push({
                type: 'mention',
                content: matchedText,
            });
        }

        lastIndex = match.index + matchedText.length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
        segments.push({
            type: 'text',
            content: text.substring(lastIndex),
        });
    }

    return segments;
}

/**
 * Legacy function for backward compatibility - parses only hashtags
 * @param text - The text to parse
 * @returns Array of segments with type and content
 */
export function parseHashtags(text: string): Array<{ type: 'text' | 'hashtag'; content: string }> {
    if (!text) return [];

    const segments: Array<{ type: 'text' | 'hashtag'; content: string }> = [];
    const hashtagRegex = /#([a-zA-Z][a-zA-Z0-9_]*)/g;

    let lastIndex = 0;
    let match;

    while ((match = hashtagRegex.exec(text)) !== null) {
        // Add text before hashtag
        if (match.index > lastIndex) {
            segments.push({
                type: 'text',
                content: text.substring(lastIndex, match.index),
            });
        }

        // Add hashtag
        segments.push({
            type: 'hashtag',
            content: match[0], // Full match including #
        });

        lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
        segments.push({
            type: 'text',
            content: text.substring(lastIndex),
        });
    }

    return segments;
}

/**
 * Extract hashtag name from a hashtag string (removes #)
 * @param hashtag - The hashtag string (e.g., "#openx")
 * @returns The hashtag name without # (e.g., "openx")
 */
export function getHashtagName(hashtag: string): string {
    return hashtag.replace(/^#/, '');
}

/**
 * Extract username from a mention string (removes @)
 * @param mention - The mention string (e.g., "@alice2026")
 * @returns The username without @ (e.g., "alice2026")
 */
export function getUsername(mention: string): string {
    return mention.replace(/^@/, '');
}
