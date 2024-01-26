from flask import Flask, request, jsonify, make_response
from pymongo import MongoClient
from bson import ObjectId
import datetime
import uuid
import jwt
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

client = MongoClient('mongodb://127.0.0.1:27017')
db = client['footyGatherDB']  
# collection = db['video_games']  
users = db['users']
venues = db['venues']
# blacklist = db['blacklist']

@app.route('/')
def hello_world():
    return 'Hello, World!'

# CHECK IF USER IS IN DB
# IF USER IS IN, CARRY ON, SEND CODE TO CARRY ON
# IF USER IS NOT, CREATE A NEW USER SEND OBJECT ID BACK AND A CODE TELLING IT TO ASK FOR MORE DETAILS
# @app.route('/api/v1.0/user', methods=['GET'])
# def authUser():
# Route to check if user is in the database
@app.route('/api/v1.0/user', methods=['POST'])
def auth_user():
    try:
        data = request.get_json()
        oauth_id = data.get('oauth_id')
        user = users.find_one({'oauth_id': oauth_id})

        if user:
            # User exists, send a code to carry on
            return make_response(jsonify({'message': 'User exists', 'code': 'USER_EXISTS'}), 200)
        else:
            # User doesn't exist, send a code to ask for more details
            return make_response(jsonify({'message': 'User not found in the database', 'code': 'DETAILS_REQUIRED'}), 200)
    except Exception as e:
        print(e)
        return make_response(jsonify({'error': 'Internal Server Error'}), 500)

# ADD USER DETAILS TO USER
# Route to add user details
@app.route('/api/v1.0/user/information', methods=['POST'])
def add_user_details():
    try:
        oauth_id = request.form.get('oauth_id')
        # Check if a user with the given oauth_id already exists
        existing_user = users.find_one({"oauth_id": oauth_id})
        if existing_user:
            return jsonify({'error': 'User with the same oauth_id already exists'}), 400

        user_name = request.form.get('user_name')
        first_name = request.form.get('first_name')
        last_name = request.form.get('last_name')
        description = request.form.get('description')
        location = request.form.get('location')
        experience = request.form.get('experience')
        sub_notifications = request.form.get('sub_notifications')
        profile_image = request.form.get('profile_image')
        games_joined = request.form.get('games_joined')
        games_attended = request.form.get('games_attended')
        balance = request.form.get('balance')
        is_admin = request.form.get('is_admin')

        new_user = {
            "_id": ObjectId(),
            "oauth_id": oauth_id,
            "user_name": user_name,
            "first_name": first_name,
            "last_name": last_name,
            "description": description,
            "location": location,
            "experience": experience,
            "sub_notifications": sub_notifications,
            "profile_image": profile_image,
            "games_joined": games_joined,
            "games_attended": games_attended,
            "balance": balance,
            "is_admin": is_admin,
            "create_at": datetime.datetime.utcnow()
        }

        result = users.insert_one(new_user)

        if result.inserted_id:
            return make_response(jsonify({'message': 'User details added successfully'}), 201)
        else:
            return make_response(jsonify({'error': 'User not found'}), 404)
    except Exception as e:
        print(e)
        return make_response(jsonify({'error': 'Internal Server Error'}), 500)

@app.route('/api/v1.0/user/details', methods=['POST'])
def get_user_details():
    try:
        data = request.get_json()
        oauth_id = data.get('oauth_id')
        user = users.find_one({"oauth_id": oauth_id})
        if user:
            user['_id'] = str(user['_id'])
            return make_response(jsonify(user), 200)
        else:
            return make_response(jsonify({'error': 'User not found'}), 404)
    except Exception as e:
        print(e)
        return make_response(jsonify({'error': 'Internal Server Error'}), 500)

@app.route('/api/v1.0/users', methods=['GET'])
def get_all_users():
    try:
        all_users = list(users.find())
        user_list = []

        for user in all_users:
            user['_id'] = str(user['_id'])
            user_list.append(user)

        return make_response(jsonify(user_list), 200)

    except Exception as e:
        print(e)
        return make_response(jsonify({'error': 'Internal Server Error'}), 500)

# Search venues by name
@app.route('/api/v1.0/venues/search', methods=['GET'])
def search_venues():
    try:
        query = request.args.get('query', '')

        regex_pattern = f'.*{query}.*'
        query_filter = {'name': {'$regex': regex_pattern, '$options': 'i'}}

        matching_venues = venues.find(query_filter)

        matching_venues_list = []
        for venue in matching_venues:
            venue['_id'] = str(venue['_id']) 
            for comment in venue.get('comments', []):
                comment['_id'] = str(comment['_id'])
            matching_venues_list.append(venue)

        return make_response(jsonify(matching_venues_list), 200)
    except Exception as e:
        print(e)
        return make_response(jsonify({'error': 'Internal Server Error'}), 500)

# Get all venues
@app.route('/api/v1.0/venues', methods=['GET'])
def get_all_venues():
    try:
        page_num, page_size = 1, 12
        if request.args.get('pn'): 
            page_num = int(request.args.get('pn'))
        if request.args.get('ps'):
            page_size = int(request.args.get('ps'))
        page_start = (page_size * (page_num - 1))

        venues_list = []

        for venue in db.venues.find().skip(page_start).limit(page_size):
            venue['_id'] = str(venue['_id'])
            for comment in venue.get('comments', []):
                comment['_id'] = str(comment['_id'])
            venues_list.append(venue)

        return make_response(jsonify(venues_list), 200)
    except Exception as e:
        print(e)
        return make_response(jsonify({'error': 'Internal Server Error'}), 500)

# Get a venue by id
@app.route('/api/v1.0/venues/<string:id>', methods=['GET'])
def get_game_by_id(id):
    try:
        venue = db.venues.find_one({'_id': ObjectId(id)})

        if venue:
            venue['_id'] = str(venue['_id'])
            return make_response(jsonify([venue]), 200)
        else:
            return make_response(jsonify({'message': 'Game not found'}), 404)
    except Exception as e:
        print(e)
        return make_response(jsonify({'error': 'Internal Server Error'}), 500)

# Get count of venues
@app.route('/api/v1.0/venues/count', methods=['GET'])
def get_count_of_venues():
    try:
        count_of_venues = db.venues.distinct("_id")

        return f"{len(count_of_venues)}"
    except Exception as e:
        print(e)
        return make_response(jsonify({'error': 'Internal Server Error'}), 500)

@app.route('/api/v1.0/test', methods=['GET'])
def testConnection():
    return "200"

if __name__ == '__main__':
    app.run(debug=True)

