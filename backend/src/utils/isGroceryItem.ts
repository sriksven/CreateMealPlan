// Utility to determine if an item is likely a grocery item or not
export function isGroceryItem(itemName: string): boolean {
    const name = itemName.toLowerCase();

    // Common non-grocery items - these should be flagged for removal
    const nonGroceryPatterns = [
        // Electronics & Appliances
        /tv|television|monitor|screen|laptop|computer|tablet|ipad|phone|iphone|android|samsung galaxy|headphone|earphone|earbud|bluetooth|speaker|camera|charger|cable|usb|hdmi|battery|remote control|keyboard|mouse|printer|router|modem/i,

        // Home & Garden (non-food)
        /furniture|chair|table|dining|desk|bed|mattress|pillow|blanket|sheet|towel|curtain|rug|carpet|lamp|light bulb|paint|brush|tool|hammer|screwdriver|drill|saw|nail|screw|tape|glue/i,

        // Clothing & Accessories
        /shirt|pant|jeans|dress|skirt|jacket|coat|shoe|boot|sneaker|sandal|sock|underwear|bra|tie|belt|hat|cap|gloves|scarf|purse|wallet|bag|backpack|suitcase/i,

        // Personal Care (non-food)
        /shampoo|conditioner|soap|body wash|lotion|cream|makeup|cosmetic|perfume|cologne|deodorant|toothbrush|toothpaste|mouthwash|razor|shaving/i,

        // Household Items
        /detergent|bleach|cleaner|disinfectant|sponge|mop|broom|vacuum|trash bag|paper towel|tissue|toilet paper|napkin|plate|cup|utensil|dish|cookware|pan|pot/i,

        // Office Supplies
        /pen|pencil|paper|notebook|binder|stapler|scissors|tape|marker|highlighter|envelope|stamp|calculator/i,

        // Toys & Games
        /toy|doll|action figure|puzzle|board game|video game|playstation|xbox|nintendo|lego|blocks/i,

        // Automotive
        /car|auto|vehicle|tire|oil|windshield|wiper|air freshener|car wash/i,

        // Other
        /magazine|newspaper|book|cd|dvd|blu-ray|movie|music|gift card|lottery|cigarette|tobacco|vape/i
    ];

    // Check if item matches any non-grocery pattern
    for (const pattern of nonGroceryPatterns) {
        if (pattern.test(name)) {
            return false; // Not a grocery item
        }
    }

    // Common grocery patterns - if it matches these, definitely grocery
    const groceryPatterns = [
        /food|grocery|produce|fruit|vegetable|meat|dairy|bread|milk|cheese|egg|chicken|beef|pork|fish|rice|pasta|cereal|snack|drink|juice|soda|water|coffee|tea|sugar|salt|spice|sauce|oil|butter|yogurt|cream/i,
    ];

    // If it matches grocery patterns, definitely is grocery
    for (const pattern of groceryPatterns) {
        if (pattern.test(name)) {
            return true;
        }
    }

    // Default: assume it's grocery if it doesn't match non-grocery patterns
    // This is a safe default since most receipt items are groceries
    return true;
}

// Calculate confidence level for the classification
export function getClassificationConfidence(itemName: string): number {
    const name = itemName.toLowerCase();

    // High confidence non-grocery keywords
    const highConfidenceNonGrocery = /tv|laptop|phone|furniture|clothing|electronics/i;
    if (highConfidenceNonGrocery.test(name)) {
        return 0.95; // 95% confident it's NOT grocery
    }

    // High confidence grocery keywords
    const highConfidenceGrocery = /milk|bread|egg|chicken|vegetable|fruit/i;
    if (highConfidenceGrocery.test(name)) {
        return 0.95; // 95% confident it IS grocery
    }

    // Medium confidence
    return 0.7;
}
