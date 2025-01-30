import pdb, traceback, sys
from factors import const
import re

from groq import Groq
import json

client = Groq(
    api_key="",
)

def calculate_scores(category_counts, prompt):
    chat_completion = client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": """
                You are an advanced AI assistant designed to evaluate and optimize location scores based on user preferences. Your task is to adjust the weight distribution of predefined categories while ensuring the total sum remains exactly 100.

Each category represents a key aspect of a location's desirability, and the user may request modifications to their priorities. You must interpret their preferences and intelligently redistribute the weights while adhering to the following rules:

Maintain Case Sensitivity – Category names must remain exactly as listed.
Total Weight = 100 – Always ensure the sum of all assigned weights is exactly 100.
Respect User Priorities – If a user emphasizes certain categories, increase their weights proportionally while adjusting others to maintain balance.
Handle Reductions Correctly – If a user wants to lower the importance of a category, redistribute the excess weight fairly across other categories.
Prevent Category Elimination – If a user does not explicitly set a category to zero, keep its weight at a reasonable minimum.
Provide a Clear Breakdown – Always return the updated category weight distribution in JSON format, ensuring all categories are present and sum up to exactly 100.
Your output should be a valid JSON object structured as follows:

{
    "healthcare": <value>,
    "education": <value>,
    "public_transport": <value>,
    "highway": <value>,
    "commercial": <value>,
    "service": <value>,
    "catering": <value>,
    "airport": <value>,
    "accommodation": <value>,
    "office": <value>,
    "parking": <value>,
    "entertainment": <value>,
    "leisure": <value>,
    "natural": <value>,
    "pet": <value>
}

Ensure the output strictly follows this format with no missing or additional keys. Adjust the values dynamically to match the user’s input while keeping the sum exactly 100.
OUTPUT MUST BE IN JSON FORMAT. OMIT ANYTHING ELSE


                """
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        model="llama-3.3-70b-versatile",
    )

    CATEGORY = const.CATEGORY
    try:
        output = re.sub(r"^```[\w]*\n?|```$", "", chat_completion.choices[0].message.content).strip()
        CATEGORY = json.loads(output)
    except Exception as e:
        print("Error parsing JSON output")
        pass
    
    print("\n\n\n-------------------DECIDED WEIGHTS-------------------")
    print(CATEGORY)
    print("--------------------------------------\n\n\n")
    WEIGHTS = const.WEIGHTS

    MAX_COUNTS = const.MAX_COUNTS
    MAX_SCORE = const.MAX_SCORE
    
    total_score = 0

    for category, types in category_counts.items():
        if category in CATEGORY:
            category_score = 0

            for typ, count in types.items():
                if typ == category:  # Skip if category is repeated
                    continue

                if typ in MAX_COUNTS.get(category, {}):
                    max_allowed = MAX_COUNTS[category][typ]
                    adjusted_count = min(count, max_allowed)
                    
                    # Raw scoring: +1 * factor * count
                    category_score += adjusted_count * WEIGHTS[category].get(typ, 0)
                else:
                    print(f"Subcategory '{typ}' not found in MAX_COUNTS[{category}]")

            # Multiply by category weight
            category_score *= CATEGORY[category]

            total_score += category_score
            print(f"   - Category: {category}, Score: {category_score:.2f}")

        elif category == "access_limited":
            print(f"   - Category: {category} is access limited")

        else:
            print(f"   - Category: {category} not found in CATEGORY")

    # Normalize at the end by max possible score
    max_possible = sum(MAX_SCORE.values())  # Total max possible score across all categories

    if max_possible > 0:
        final_score = (total_score / max_possible) * 100
    else:
        final_score = 0


    chat_completion = client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": """
                You are an AI assistant analyzing location suitability based on user preferences. Given a user’s request and a categorized count of nearby amenities, generate a 60-word (+ or - 5 words) paragraph evaluating how well the location meets their expectations. Focus on relevance, strengths, and gaps. Do not exceed or fall short of the word limit. Output only the paragraph—no additional text or formatting.                
                """
            },
            {
                "role": "system",
                "content": "Category Counts:" + json.dumps(category_counts)
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        model="llama-3.3-70b-versatile",
    )

    text = chat_completion.choices[0].message.content
    return final_score, text # No artificial capping
