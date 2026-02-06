import { normalizeItemName } from '../../utils/normalizeItemName';

// Mock the Groq API (updated from Gemini)
jest.mock('../../config/groq', () => ({
    chat: {
        completions: {
            create: jest.fn().mockResolvedValue({
                choices: [{
                    message: {
                        content: 'Apple'
                    }
                }]
            })
        }
    }
}));

describe('normalizeItemName', () => {
    test('should normalize basic item names', async () => {
        const result = await normalizeItemName('apples');
        expect(result).toBe('Apple');
    });

    test('should handle empty strings', async () => {
        const result = await normalizeItemName('');
        expect(result).toBeTruthy(); // Mock returns 'apple' for all inputs
    });

    test('should handle single character inputs', async () => {
        const result = await normalizeItemName('a');
        expect(result).toBeTruthy();
    });

    test('should handle very long item names', async () => {
        const longName = 'a'.repeat(100);
        const result = await normalizeItemName(longName);
        expect(result).toBeTruthy();
    });

    test('should handle special characters', async () => {
        const result = await normalizeItemName('apple & banana');
        expect(result).toBeTruthy();
    });

    test('should handle numbers in item names', async () => {
        const result = await normalizeItemName('2% milk');
        expect(result).toBeTruthy();
    });
});
