// Utility to auto-categorize pantry items based on their names
export function categorizeItem(itemName: string): string {
  const name = itemName.toLowerCase();

  // Produce (Fruits & Vegetables)
  if (
    /tomato|lettuce|spinach|kale|cabbage|carrot|potato|onion|garlic|pepper|cucumber|broccoli|cauliflower|celery|mushroom|zucchini|squash|eggplant|avocado|apple|banana|orange|grape|berry|melon|peach|pear|plum|mango|pineapple|lemon|lime|cilantro|parsley|basil|mint|thyme|rosemary|sage|dill|arugula|bok choy|brussels|sprout|asparagus|artichoke|beet|radish|turnip|peas|pea|corn|green bean|bean|okra|fennel|leek|scallion|chive|ginger|turmeric/i.test(
      name
    )
  ) {
    return "produce";
  }

  // Dairy
  if (
    /milk|cheese|yogurt|butter|cream|sour cream|cottage cheese|cheddar|mozzarella|parmesan|feta|brie|goat cheese|ricotta|whey|dairy|half.and.half|heavy cream|whipped cream/i.test(
      name
    )
  ) {
    return "dairy";
  }

  // Meat & Protein
  if (
    /chicken|beef|pork|lamb|turkey|fish|salmon|tuna|shrimp|crab|lobster|egg|bacon|sausage|ham|steak|ground beef|meat|protein|tofu|tempeh|seitan|duck|veal|goat meat|venison|bison|sardine|anchovy|cod|halibut|tilapia|trout/i.test(
      name
    )
  ) {
    return "meat";
  }

  // Grains & Bakery
  if (
    /bread|rice|pasta|noodle|flour|oat|cereal|granola|quinoa|barley|wheat|bagel|tortilla|pita|cracker|baguette|roll|couscous|bulgur|millet|rye|spelt|farro|croissant|muffin|biscuit|waffle|pancake/i.test(
      name
    )
  ) {
    return "grains";
  }

  // Snacks & Sweets
  if (
    /chip|cookie|candy|chocolate|snack|popcorn|pretzel|nut|almond|cashew|peanut|walnut|trail mix|granola bar|ice cream|cake|brownie|donut|pastry|pie|tart|pudding|jello|gummy|lollipop|caramel|fudge/i.test(
      name
    )
  ) {
    return "snacks";
  }

  // Beverages
  if (
    /juice|soda|coffee|tea|water|beer|wine|liquor|energy drink|sports drink|lemonade|coke|pepsi|sprite|ginger ale|kombucha|smoothie|shake|cocoa|hot chocolate/i.test(
      name
    )
  ) {
    return "beverages";
  }

  // Condiments & Sauces
  if (
    /ketchup|mustard|mayo|mayonnaise|relish|pickle|sauce|soy sauce|hot sauce|bbq|barbecue|salsa|pesto|aioli|vinegar|oil|olive oil|dressing|ranch|vinaigrette|tahini|hummus|guacamole|salsa|chutney|jam|jelly|honey|syrup|maple syrup/i.test(
      name
    )
  ) {
    return "condiments";
  }

  // Spices & Herbs
  if (
    /spice|pepper|salt|cumin|paprika|oregano|cinnamon|nutmeg|clove|cardamom|coriander|turmeric|curry|chili powder|garlic powder|onion powder|seasoning|bay leaf|vanilla|extract/i.test(
      name
    )
  ) {
    return "spices";
  }

  // Canned & Jarred Goods
  if (
    /canned|can|jarred|preserved|soup|broth|stock|tomato sauce|paste|coconut milk|bean|chickpea|lentil|corn|pea|olive|artichoke|tuna can|salmon can/i.test(
      name
    )
  ) {
    return "canned";
  }

  // Frozen Foods
  if (
    /frozen|freeze|ice|popsicle|frozen dinner|tv dinner|frozen pizza|frozen vegetable|frozen fruit|frozen meat/i.test(
      name
    )
  ) {
    return "frozen";
  }

  // Baking Supplies
  if (
    /baking|yeast|baking powder|baking soda|sugar|brown sugar|powdered sugar|cocoa powder|chocolate chip|vanilla extract|almond extract|shortening|molasses|corn starch|gelatin/i.test(
      name
    )
  ) {
    return "baking";
  }

  // Legumes & Beans
  if (
    /bean|lentil|chickpea|garbanzo|black bean|kidney bean|pinto bean|navy bean|lima bean|split pea|edamame/i.test(
      name
    )
  ) {
    return "legumes";
  }

  // Default to other
  return "other";
}
