/**
 * Utility functions for parsing and rendering hashtags in text
 */

/**
 * Parse text and return an array of segments with hashtags marked
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
