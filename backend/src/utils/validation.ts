/**
 * Validation utilities for user input
 */

export class ValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ValidationError';
    }
}

/**
 * Validate email format
 */
export function validateEmail(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new ValidationError('Invalid email format');
    }
}

/**
 * Validate username format
 * - 3-20 characters
 * - Alphanumeric and underscores only
 * - Must start with a letter
 */
export function validateUsername(username: string): void {
    if (username.length < 3 || username.length > 20) {
        throw new ValidationError('Username must be between 3 and 20 characters');
    }

    const usernameRegex = /^[a-zA-Z][a-zA-Z0-9_]*$/;
    if (!usernameRegex.test(username)) {
        throw new ValidationError('Username must start with a letter and contain only letters, numbers, and underscores');
    }
}

/**
 * Validate password strength
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 */
export function validatePassword(password: string): void {
    if (password.length < 8) {
        throw new ValidationError('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
        throw new ValidationError('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
        throw new ValidationError('Password must contain at least one lowercase letter');
    }

    if (!/[0-9]/.test(password)) {
        throw new ValidationError('Password must contain at least one number');
    }
}

/**
 * Validate post content
 * - Maximum 280 characters (like Twitter)
 * - Minimum 1 character
 */
export function validatePostContent(content: string): void {
    if (!content || content.trim().length === 0) {
        throw new ValidationError('Post content cannot be empty');
    }

    if (content.length > 280) {
        throw new ValidationError('Post content cannot exceed 280 characters');
    }
}

/**
 * Validate comment content
 * - Maximum 280 characters
 * - Minimum 1 character
 */
export function validateCommentContent(content: string): void {
    if (!content || content.trim().length === 0) {
        throw new ValidationError('Comment content cannot be empty');
    }

    if (content.length > 280) {
        throw new ValidationError('Comment content cannot exceed 280 characters');
    }
}
