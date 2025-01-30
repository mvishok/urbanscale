from factors import const, score
from collections import defaultdict
import requests

# Get categories (key) from const.WEIGHTS
categories = ','.join(const.WEIGHTS.keys())
# Get radius from const.RADIUS
radius = const.RADIUS
def get_places(lat, long, prompt):
    url = f'https://api.geoapify.com/v2/places?categories={categories}&filter=circle:{long},{lat},{radius}&bias=proximity:{long},{lat}&apiKey=36afeb9345404476b4fac169a81f6ed5'
    response = requests.get(url)

    if response.status_code != 200:
        print(f"Error: {response.status_code}")
        print(f"Response Body: {response.text}")
        return None

    data = response.json()
    category_counts = defaultdict(lambda: defaultdict(int))

    for feature in data.get("features", []):
        feature_categories = feature["properties"].get("categories", [])
        if feature_categories:
            main_category = feature_categories[0]
            for sub_category in feature_categories:
                # Update category counts with the subcategories
                category_counts[main_category][sub_category] += 1

            # Handle access_limited by adding its counts to relevant categories
            if 'access_limited' in category_counts:
                for sub_cat, count in category_counts['access_limited'].items():
                    # Assuming you want to add access_limited counts to the main category
                    category_counts[main_category][sub_cat] += count

    # Adjusting the result to handle redundancy
    fixed_category_counts = {}
    for main, subs in category_counts.items():
        fixed_subs = {}
        for sub, count in subs.items():
            if sub.startswith(f"{main}."):
                sub_key = sub.split(".")[1]  # Take the part after the dot
                fixed_subs[sub_key] = count
            else:
                fixed_subs[sub] = count
        fixed_category_counts[main] = fixed_subs
    final_score, text = score.calculate_scores(fixed_category_counts, prompt)
    return final_score, text, fixed_category_counts