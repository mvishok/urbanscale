import pdb, traceback, sys
from factors import const

def calculate_scores(category_counts):
    WEIGHTS = const.WEIGHTS
    CATEGORY = const.CATEGORY
    MAX_COUNTS = const.MAX_COUNTS
    MAX_SCORE = const.MAX_SCORE
    
    total_score = 0
    
    for category, types in category_counts.items():
        if category in CATEGORY:
            score_weight = CATEGORY[category]
            category_score = 0

            for typ, count in types.items():
                if typ == category:  # Skip if category is repeated
                    continue

                if typ in MAX_COUNTS.get(category, {}):
                    max_allowed = MAX_COUNTS[category][typ]
                    adjusted_count = min(count, max_allowed)  # Use a temporary variable instead of modifying `types`
                    category_score += adjusted_count * WEIGHTS[category].get(typ, 0)
                else:
                    print(f"Subcategory '{typ}' not found in MAX_COUNTS[{category}]")

            max_score = MAX_SCORE.get(category, 1)  # Avoid division by zero
            if max_score > 0:
                category_score = (category_score / max_score) * score_weight
            else:
                category_score = 0  # If max_score is zero, set category score to zero

            total_score += category_score
            print(f"Category: {category}, Score: {category_score:.2f}")

        elif category == "access_limited":
            print(f"Category: {category} is access limited")

        else:
            print(f"Category: {category} not found in CATEGORY")

    return total_score * 100
