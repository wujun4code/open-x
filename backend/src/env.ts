import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
const result = dotenv.config({
    path: path.resolve(__dirname, '../.env'),
});

if (result.error) {
    console.warn('Warning: .env file not found or failed to load');
}
