/**
 * Hashtag utility functions for extracting and processing hashtags from post content
 */

/**
 * Extract hashtags from text content
 * @param text - The text content to extract hashtags from
 * @returns Array of unique hashtag names (without # symbol, lowercase)
 */
export function extractHashtags(text: string): string[] {
    if (!text || typeof text !== 'string') {
        return [];
    }

    // Regex to match hashtags: # followed by alphanumeric characters and underscores
    // Must start with a letter, can contain numbers and underscores
    const hashtagRegex = /#([a-zA-Z][a-zA-Z0-9_]*)/g;
    const matches = text.matchAll(hashtagRegex);

    const hashtags = new Set<string>();

    for (const match of matches) {
        const hashtag = match[1].toLowerCase(); // Normalize to lowercase

        // Validate hashtag length (max 50 characters)
        if (hashtag.length > 0 && hashtag.length <= 50) {
            hashtags.add(hashtag);
        }
    }

    return Array.from(hashtags);
}

/**
 * Validate if a string is a valid hashtag name
 * @param hashtag - The hashtag name to validate (without # symbol)
 * @returns True if valid, false otherwise
 */
export function isValidHashtag(hashtag: string): boolean {
    if (!hashtag || typeof hashtag !== 'string') {
        return false;
    }

    // Must start with a letter, contain only alphanumeric and underscores, 1-50 chars
    const validHashtagRegex = /^[a-zA-Z][a-zA-Z0-9_]{0,49}$/;
    return validHashtagRegex.test(hashtag);
}

/**
 * Normalize hashtag name (lowercase, trim)
 * @param hashtag - The hashtag name to normalize
 * @returns Normalized hashtag name
 */
export function normalizeHashtag(hashtag: string): string {
    if (!hashtag || typeof hashtag !== 'string') {
        return '';
    }

    return hashtag.toLowerCase().trim();
}
