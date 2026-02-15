// Weight estimation utility for pantry items
// Estimates weight in grams when only count is provided

interface WeightEstimate {
    estimatedWeight: number; // in grams
    unit: string;
    isEstimated: boolean;
}

// Average weights for common grocery items (in grams)
const ITEM_WEIGHTS: Record<string, number> = {
    // Produce - Fruits
    'apple': 180,
    'banana': 120,
    'orange': 140,
    'grape': 5,
    'grapes': 500, // per bunch
    'lemon': 60,
    'lime': 50,
    'pear': 180,
    'peach': 150,
    'plum': 70,
    'strawberry': 15,
    'strawberries': 500, // per container
    'watermelon': 5000,
    'melon': 2000,
    'mango': 300,
    'pineapple': 1000,
    'kiwi': 75,

    // Produce - Vegetables
    'tomato': 150,
    'potato': 200,
    'onion': 150,
    'carrot': 60,
    'cucumber': 300,
    'bell pepper': 150,
    'pepper': 150,
    'zucchini': 200,
    'eggplant': 450,
    'broccoli': 500,
    'cauliflower': 800,
    'lettuce': 500,
    'cabbage': 1000,
    'celery': 500,
    'garlic': 5, // per clove
    'ginger': 100,
    'mushroom': 20,
    'mushrooms': 250, // per package
    'corn': 200,
    'avocado': 200,
    'spinach': 300, // per bunch

    // Dairy & Eggs
    'egg': 50,
    'eggs': 600, // per dozen
    'milk': 1000, // per liter
    'cheese': 250, // per block
    'butter': 250, // per stick
    'yogurt': 150, // per cup

    // Meat & Protein
    'chicken breast': 200,
    'chicken': 1500, // whole chicken
    'beef': 250,
    'pork': 250,
    'fish': 200,
    'salmon': 200,
    'tuna': 150,
    'shrimp': 100,
    'tofu': 400, // per block

    // Grains & Bread
    'bread': 500, // per loaf
    'rice': 1000, // per bag
    'pasta': 500, // per package
    'flour': 1000, // per bag
    'bagel': 100,
    'tortilla': 50,

    // Canned & Packaged
    'can': 400, // average can
    'jar': 500, // average jar
    'bottle': 500, // average bottle
    'bag': 500, // average bag
    'box': 400, // average box
    'package': 400, // average package

    // Snacks
    'chips': 200, // per bag
    'crackers': 200, // per box
    'cookie': 30,
    'cookies': 300, // per package

    // Beverages
    'soda': 355, // per can
    'juice': 1000, // per carton
    'water': 500, // per bottle
    'beer': 355, // per can
    'wine': 750, // per bottle

    // Default fallback
    'default': 100
};

/**
 * Finds the closest matching item in the weight database
 * Uses fuzzy matching to handle variations in naming
 */
function findClosestMatch(itemName: string): string | null {
    const normalized = itemName.toLowerCase().trim();

    // Exact match
    if (ITEM_WEIGHTS[normalized]) {
        return normalized;
    }

    // Partial match - check if item name contains any known item
    for (const key of Object.keys(ITEM_WEIGHTS)) {
        if (normalized.includes(key) || key.includes(normalized)) {
            return key;
        }
    }

    // Check for common variations
    const variations: Record<string, string> = {
        'tomatoes': 'tomato',
        'potatoes': 'potato',
        'onions': 'onion',
        'carrots': 'carrot',
        'apples': 'apple',
        'bananas': 'banana',
        'oranges': 'orange',
        'peppers': 'pepper',
        'cucumbers': 'cucumber',
    };

    if (variations[normalized]) {
        return variations[normalized];
    }

    return null;
}

/**
 * Estimates weight for an item based on count
 * @param itemName - Name of the item
 * @param count - Number of items
 * @param preferredUnit - User's preferred measurement system ('metric' or 'imperial')
 * @returns Weight estimate with unit
 */
export function estimateWeight(
    itemName: string,
    count: number,
    preferredUnit: 'metric' | 'imperial' = 'metric'
): WeightEstimate {
    const match = findClosestMatch(itemName);
    const weightPerItem = match ? ITEM_WEIGHTS[match] : ITEM_WEIGHTS['default'];

    const totalGrams = weightPerItem * count;

    // Convert to appropriate unit based on preference
    if (preferredUnit === 'metric') {
        if (totalGrams >= 1000) {
            return {
                estimatedWeight: totalGrams / 1000,
                unit: 'kg',
                isEstimated: true
            };
        } else {
            return {
                estimatedWeight: totalGrams,
                unit: 'g',
                isEstimated: true
            };
        }
    } else {
        // Imperial - convert to pounds
        const pounds = totalGrams / 453.592;
        if (pounds >= 1) {
            return {
                estimatedWeight: Math.round(pounds * 100) / 100,
                unit: 'lb',
                isEstimated: true
            };
        } else {
            // Use ounces for small amounts
            const ounces = totalGrams / 28.3495;
            return {
                estimatedWeight: Math.round(ounces * 100) / 100,
                unit: 'oz',
                isEstimated: true
            };
        }
    }
}

/**
 * Formats an estimated weight for display
 * Adds ~ prefix to indicate estimation
 */
export function formatEstimatedWeight(estimate: WeightEstimate): string {
    const rounded = Math.round(estimate.estimatedWeight * 100) / 100;
    return estimate.isEstimated
        ? `~${rounded} ${estimate.unit}`
        : `${rounded} ${estimate.unit}`;
}

/**
 * Checks if an item name is likely to have a weight in the database
 */
export function hasWeightEstimate(itemName: string): boolean {
    return findClosestMatch(itemName) !== null;
}
