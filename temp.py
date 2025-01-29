import requests

def get_places(api_key, lat, long, category, radius=1000, limit=20):
    url = f'https://api.geoapify.com/v2/places?categories={category}&filter=circle:{long},{lat},{radius}&bias=proximity:{long},{lat}&limit={limit}&apiKey={api_key}'
    print(url)
    exit()
    response = requests.get(url)
    if response.status_code == 200:
        return response.json()['features']
    else:
        print(f"Error: {response.status_code}")
        print(f"Response Body: {response.text}")
        return None
        

# Usage example
api_key = '36afeb9345404476b4fac169a81f6ed5'
schools = get_places(api_key, 12.823449, 80.04416, 'education.school,activity', radius=1000)

print(schools)
