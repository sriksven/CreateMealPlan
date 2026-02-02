// Utility to auto-categorize pantry items based on their names
export function categorizeItem(itemName: string): string {
  const name = itemName.toLowerCase();

  // Produce
  if (
    /tomato|lettuce|spinach|kale|cabbage|carrot|potato|onion|garlic|pepper|cucumber|broccoli|cauliflower|celery|mushroom|zucchini|squash|eggplant|avocado|apple|banana|orange|grape|berry|melon|peach|pear|plum|mango|pineapple|lemon|lime/i.test(
      name
    )
  ) {
    return "produce";
  }

  // Dairy
  if (
    /milk|cheese|yogurt|butter|cream|sour cream|cottage cheese|cheddar|mozzarella|parmesan|feta|brie|whey|dairy/i.test(
      name
    )
  ) {
    return "dairy";
  }

  // Meat & Protein
  if (
    /chicken|beef|pork|lamb|turkey|fish|salmon|tuna|shrimp|crab|lobster|egg|bacon|sausage|ham|steak|ground beef|meat|protein/i.test(
      name
    )
  ) {
    return "meat";
  }

  // Grains & Bakery
  if (
    /bread|rice|pasta|noodle|flour|oat|cereal|granola|quinoa|barley|wheat|bagel|tortilla|pita|cracker|baguette|roll/i.test(
      name
    )
  ) {
    return "grains";
  }

  // Snacks & Sweets
  if (
    /chip|cookie|candy|chocolate|snack|popcorn|pretzel|nut|almond|cashew|peanut|walnut|trail mix|granola bar|ice cream|cake|brownie/i.test(
      name
    )
  ) {
    return "snacks";
  }

  // Beverages
  if (
    /juice|soda|coffee|tea|water|beer|wine|liquor|energy drink|sports drink|milk|lemonade|coke|pepsi/i.test(
      name
    )
  ) {
    return "beverages";
  }

  // Default to other
  return "other";
}
