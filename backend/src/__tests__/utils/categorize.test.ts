import { categorizeItem } from '../../utils/categorize';

describe('categorizeItem', () => {
    describe('Produce category', () => {
        test('should categorize fruits correctly', () => {
            expect(categorizeItem('apple')).toBe('produce');
            expect(categorizeItem('banana')).toBe('produce');
            expect(categorizeItem('orange')).toBe('produce');
        });

        test('should categorize vegetables correctly', () => {
            expect(categorizeItem('carrot')).toBe('produce');
            expect(categorizeItem('broccoli')).toBe('produce');
            expect(categorizeItem('lettuce')).toBe('produce');
        });
    });

    describe('Dairy category', () => {
        test('should categorize dairy products correctly', () => {
            expect(categorizeItem('milk')).toBe('dairy');
            expect(categorizeItem('cheese')).toBe('dairy');
            expect(categorizeItem('yogurt')).toBe('dairy');
            expect(categorizeItem('butter')).toBe('dairy');
        });
    });

    describe('Meat category', () => {
        test('should categorize meat products correctly', () => {
            expect(categorizeItem('chicken')).toBe('meat');
            expect(categorizeItem('beef')).toBe('meat');
            expect(categorizeItem('pork')).toBe('meat');
            expect(categorizeItem('fish')).toBe('meat');
        });
    });

    describe('Grains category', () => {
        test('should categorize grain products correctly', () => {
            expect(categorizeItem('bread')).toBe('grains');
            expect(categorizeItem('rice')).toBe('grains');
            expect(categorizeItem('pasta')).toBe('grains');
            expect(categorizeItem('oats')).toBe('grains');
        });
    });

    describe('Snacks category', () => {
        test('should categorize snack items correctly', () => {
            expect(categorizeItem('chips')).toBe('snacks');
            expect(categorizeItem('cookies')).toBe('snacks');
            expect(categorizeItem('crackers')).toBe('grains'); // Crackers are categorized as grains
        });
    });

    describe('Beverages category', () => {
        test('should categorize beverages correctly', () => {
            expect(categorizeItem('coffee')).toBe('beverages');
            expect(categorizeItem('tea')).toBe('beverages');
            expect(categorizeItem('juice')).toBe('beverages');
            expect(categorizeItem('soda')).toBe('beverages');
        });
    });

    describe('Other category', () => {
        test('should categorize unknown items as other', () => {
            expect(categorizeItem('random item')).toBe('other');
            expect(categorizeItem('xyz123')).toBe('other');
        });
    });

    describe('Case insensitivity', () => {
        test('should handle different cases correctly', () => {
            expect(categorizeItem('MILK')).toBe('dairy');
            expect(categorizeItem('ChEeSe')).toBe('dairy');
            expect(categorizeItem('APPLE')).toBe('produce');
        });
    });
});
