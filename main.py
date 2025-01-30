import colorama
from colorama import Fore, Style
from factors import const, education, finance, health, entertainment, safety
import numpy as np

colorama.init(autoreset=True)

CATEGORY_AMENITIES = {
    'Education': ['school', 'university', 'library'],
    'Healthcare': ['hospital', 'pharmacy', 'dentist'],
    'Finance': ['bank', 'atm'],
    'Entertainment': ['park', 'theatre', 'museum', 'cinema', 'art_gallery', 'zoo', 'playground', 'sports_centre', 'swimming_pool']
}

def calculate_marks(raw_score, max_marks):
    """Calculate marks for a given amenity based on the city's performance."""
    return min(raw_score / max_marks, 1.0) * max_marks

def calculate_category_marks(raw_score, weights):
    """
    Calculate the total marks for a category.
    
    Parameters:
    - raw_score: Single raw score for the category.
    - weights: Dictionary of weights for each amenity.
    
    Returns:
    - Total marks for the category.
    """
    # Here raw_score is considered as a single float for the whole category
    # You might need to distribute it based on weights if detailed breakdown is required
    # For simplicity, assume the score is directly used
    total_marks = raw_score  # Apply adjustments if necessary
    
    return total_marks

def calculate_final_city_score(category_scores):
    """
    Calculate the final score for a city by summing category scores.
    
    Parameters:
    - category_scores: Dictionary of scores for each category.
    
    Returns:
    - The final city score.
    """
    final_score = sum(category_scores.values())
    return np.clip(final_score, 0, 100)

def safety_adjustment(final_score, crime_rate, median_crime_rate):
    """
    Adjust the final score based on the city's crime rate.
    
    Parameters:
    - final_score: The unadjusted final score for the city.
    - crime_rate: The crime rate of the city.
    - median_crime_rate: The median crime rate for all cities.
    
    Returns:
    - The adjusted final score.
    """
    if crime_rate > median_crime_rate:
        penalty_factor = 1 - ((crime_rate - median_crime_rate) / (crime_rate + 1e-6))
        adjusted_score = final_score * penalty_factor
    else:
        boost_factor = 1 + ((median_crime_rate - crime_rate) / (median_crime_rate + 1e-6))
        adjusted_score = final_score * boost_factor
    
    return np.clip(adjusted_score, 0, 100)

def main():
    print(Fore.BLUE + Style.BRIGHT + "LOCARANK Beta" + Style.RESET_ALL)

    latitude = float(input(Fore.GREEN + "Enter latitude: " + Style.RESET_ALL))
    longitude = float(input(Fore.GREEN + "Enter longitude: " + Style.RESET_ALL))

    print(Fore.BLUE + "\nCalculating scores..." + Style.RESET_ALL)

    # Fetch raw scores for each category
    education_score = education.get_education(latitude, longitude, Fore, Style)
    healthcare_score = health.get_health(latitude, longitude, Fore, Style)
    finance_score = finance.get_finance(latitude, longitude, Fore, Style)
    entertainment_score = entertainment.get_entertainment(latitude, longitude, Fore, Style)

    # Calculate the marks for each category
    category_scores = {
        'Education': calculate_category_marks(education_score, const.WEIGHTS),
        'Healthcare': calculate_category_marks(healthcare_score, const.WEIGHTS),
        'Finance': calculate_category_marks(finance_score, const.WEIGHTS),
        'Entertainment': calculate_category_marks(entertainment_score, const.WEIGHTS)
    }

    # Calculate the unadjusted final city score
    final_city_score = calculate_final_city_score(category_scores)

    # Fetch crime data and adjust the final score
    crime_data = safety.fetch_crime_data_from_file('crimerate.csv')
    median_crime_rate = safety.calculate_median_crime_rate(crime_data)
    nearest_city = safety.find_nearest_city(latitude, longitude, safety.city_coordinates)
    crime_rate = safety.get_crime_rate_for_city(nearest_city, crime_data) if nearest_city else None

    if crime_rate is not None:
        final_city_score_adjusted = safety_adjustment(final_city_score, crime_rate, median_crime_rate)
        print(Fore.BLUE + f"\nFinal Adjusted City Score: {final_city_score_adjusted:.2f}" + Style.RESET_ALL)
    else:
        print(Fore.RED + "Crime data unavailable. Using unadjusted score." + Style.RESET_ALL)
        print(Fore.BLUE + f"\nFinal City Score: {final_city_score:.2f}" + Style.RESET_ALL)

if __name__ == "__main__":
    main()