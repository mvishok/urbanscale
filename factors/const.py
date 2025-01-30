def calculate_max_scores(weights, category, max_counts):
    max_scores = {}
    
    for cat, subcategories in max_counts.items():
        if cat in category:  # Ensure the category exists in CATEGORY
            total_score = 0
            for sub, max_count in subcategories.items():
                if sub in weights.get(cat, {}):  # Ensure subcategory exists in WEIGHTS
                    total_score += weights[cat][sub] * max_count
            max_scores[cat] = total_score * category[cat]  # Multiply by category weight
    
    return max_scores

RADIUS = 5000

WEIGHTS = {
    "accommodation": {
        "hotel": 0.2,
        "motel": 0.1,
        "guest_house": 0.1
    },
    "airport": {
        "private": 0.1,
        "international": 0.3,
        "military": 0.1,
        "airfield": 0.1
    },
    "commercial": {
        "shopping_mall": 0.4,
        "clothing": 0.2,
        "supermarket": 0.3,
        "food_and_drink": 0.2,
        "department_store": 0.1,
        "vehicle": 0.05,
        "books": 0.05
    },
    "catering": {
        "restaurant": 0.5,
        "cafe": 0.3,
        "fast_food": 0.2
    },
    "education": {
        "school": 0.5,
        "university": 0.3,
        "library": 0.2,
        "college": 0.1
    },
    "entertainment": {
        "park": 0.3,
        "theatre": 0.2,
        "museum": 0.2,
        "cinema": 0.2,
        "art_gallery": 0.1,
        "zoo": 0.1,
        "playground": 0.1
    },
    "healthcare": {
        "hospital": 0.5,
        "pharmacy": 0.4,
        "dentist": 0.3
    },
    "highway": {
        "residential": 0.3,
        "motorway": 0.2,
        "trunk": 0.2,
        "primary": 0.2,
        "path": 0.1,
        "public": 0.5,
        "busway": 0.5,
    },
    "leisure": {
        "picnic": 0.2,
        "spa": 0.1,
        "park": 0.3,
        "garden": 0.2,
        "nature_reserve": 0.2
    },
    "natural": {
        "water": 0.3,
        "forest": 0.2,
        "mountain": 0.1,
        "sand": 0.1,
        "protected_area": 0.1
    },
    "office": {
        "company": 0.2,
        "government": 0.2,
        "insurance": 0.1,
        "it": 0.1,
        "lawyer": 0.05
    },
    "parking": {
        "cars": 0.4,
        "bicycle": 0.3,
        "motorcycle": 0.2
    },
    "pet":{
        "shop": 0.3,
        "veterinary": 0.3,
        "service": 0.1,
        "dog_park": 0.1
    },
    "service": {
        "financial": 0.3,
        "cleaning": 0.2,
        "post": 0.2,
        "vehicle": 0.2,
        "police": 0.1
    },
    "public_transport": {
        "train": 0.4,
        "bus": 0.4,
        "subway": 0.2,
        "tram": 0.1,
        "ferry": 0
    },
}

CATEGORY = {
    'healthcare': 18.0, 
    'education': 16.0, 
    'public_transport': 12.0, 
    'highway': 9.0, 
    'commercial': 8.0, 
    'service': 7.0, 
    'catering': 6.0, 
    'airport': 5.0, 
    'accommodation': 3.0, 
    'office': 3.0, 
    'parking': 3.0, 
    'entertainment': 3.0, 
    'leisure': 3.0, 
    'natural': 3.0, 
    'pet': 1.0  
}

MAX_COUNTS = {
    "education": {"school": 3, "university": 1, "library": 2, "college": 2},
    "healthcare": {"hospital": 2, "pharmacy": 3, "dentist": 3},
    "public_transport": {"train": 2, "bus": 3, "subway": 2, "tram": 2, "ferry": 1},
    "highway": {"residential": 5, "motorway": 3, "trunk": 3, "primary": 3, "path": 3, "public":1, "busway": 1},
    "commercial": {"shopping_mall": 2, "clothing": 3, "supermarket": 3, "food_and_drink": 3, "department_store": 2, "vehicle": 2, "books": 2},
    "service": {"financial": 3, "cleaning": 2, "post": 2, "vehicle": 3, "police": 1},
    "catering": {"restaurant": 5, "cafe": 3, "fast_food": 3},
    "airport": {"private": 1, "international": 1, "military": 1, "airfield": 1},
    "accommodation": {"hotel": 3, "motel": 2, "guest_house": 2},
    "office": {"company": 3, "government": 2, "insurance": 2, "it": 3, "lawyer": 2},
    "parking": {"cars": 3, "bicycle": 2, "motorcycle": 2},
    "entertainment": {"park": 3, "theatre": 2, "museum": 2, "cinema": 2, "art_gallery": 2, "zoo": 1, "playground": 2},
    "leisure": {"picnic": 2, "spa": 2, "park": 3, "garden": 2, "nature_reserve": 2},
    "natural": {"water": 3, "forest": 3, "mountain": 2, "sand": 2, "protected_area": 2},
    "pet": {"shop": 2, "veterinary": 2, "service": 2, "dog_park": 2}
}

# Calculate max scores
MAX_SCORE = calculate_max_scores(WEIGHTS, CATEGORY, MAX_COUNTS)