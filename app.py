import colorama
from colorama import Fore, Style
from flask import Flask, request, render_template
from flasgger import Swagger
from factors import req

colorama.init(autoreset=True)

app = Flask(__name__)
app.config['url_sort_key'] = None
app.config['SWAGGER'] = {
    'title': 'LocaRank API',
    'uiversion': 3,
    'hide_top_bar': True,
    'specs_route': '/',
    'static_url_path': '/static',
    'static_folder': 'static',
}

swagger = Swagger(app)

@app.route('/score')
def score():
    """
    Endpoint to get place data for a given latitude and longitude
    ---
    summary: Get place data for a location
    description: This endpoint retrieves place data for a given location based on the latitude and longitude provided.
    consumes:
      - application/json
    parameters:
      - name: latitude
        in: query
        type: number
        required: true
        description: The latitude of the location.
      - name: longitude
        in: query
        type: number
        required: true
        description: The longitude of the location.
    responses:
      200:
        description: The place data.
      400:
        description: Error message.
    """

    if 'latitude' not in request.args or 'longitude' not in request.args:
        return 'Error: Please provide both latitude and longitude.', 400

    latitude = float(request.args.get('latitude'))
    longitude = float(request.args.get('longitude'))
    prompt = request.args.get('prompt')

    score, text, stats = req.get_places(latitude, longitude, prompt)
    return {
      "score": round(score, 2),
      "text": text,
      "stats": stats
    } if text else ('Error fetching place data.', 500)

@app.route('/v')
def version():
    return render_template('index.html')

import json

@app.route('/result')
def result():
    score = request.args.get('score')
    text = request.args.get('text')
    stats = request.args.get('stats')

    # URL decode the stats (JSON.stringify) and then load it into a dictionary
    stats = json.loads(stats)  # Safely parse the JSON

    return render_template('result.html', score=score, text=text, counts=stats)

context = ("certificate.pem", "key.pem")

if __name__ == '__main__':
    app.run('0.0.0.0', port=80, debug=False, ssl_context=("cert.pem", "key.pem"))
