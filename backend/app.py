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
users = db['users']
venues = db['venues']

@app.route('/')
def hello_world():
    return 'Hello, World!'

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
        data = request.get_json()

        oauth_id = data.get('oauth_id')
        # Check if a user with the given oauth_id already exists
        existing_user = users.find_one({"oauth_id": oauth_id})
        if existing_user:
            return jsonify({'error': 'User with the same oauth_id already exists'}), 400

        user_name = data.get('user_name')
        first_name = data.get('first_name')
        last_name = data.get('last_name')
        description = data.get('description')
        location = data.get('location')
        experience = data.get('experience')
        sub_notifications = data.get('sub_notifications')
        profile_image = data.get('profile_image')
        games_joined = data.get('games_joined')
        games_attended = data.get('games_attended')
        balance = data.get('balance')
        is_admin = data.get('is_admin')

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

@app.route('/api/v1.0/user/delete/<string:id>', methods=['DELETE'])
def delete_user(id):
    try:
        user = users.find_one({"oauth_id": id})
        if user:
            users.delete_one({"oauth_id": id})
            return make_response(jsonify({'message': 'User deleted successfully'}), 200)
        else:
            return make_response(jsonify({'error': 'User not found'}), 404)
    except Exception as e:
        print(e)
        return make_response(jsonify({'error': 'Internal Server Error'}), 500)

# Delete venue
# @app.route('/api/v1.0/venues/<string:id>', methods=['DELETE'])
# def delete_venue(id):
#     venue = venues.find_one({'_id': ObjectId(id)})

#     if venue:
#         venues.delete_one({'_id': ObjectId(id)})
#         return make_response(jsonify({"message": "Venue deleted successfully"}), 200)
#     else:
#         return make_response(jsonify({"error": "Venue not found"}), 404)

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

# UPDATE USER DETAILS
@app.route('/api/v1.0/user/information', methods=['PUT'])
def update_user_details():
    try:
        data = request.get_json()

        oauth_id = data.get('oauth_id')
        # Check if a user with the given oauth_id already exists
        existing_user = users.find_one({"oauth_id": oauth_id})
        if not existing_user:
            return jsonify({'error': 'User not found'}), 404

        # These fields won't be updated
        games_joined = existing_user.get('games_joined')
        games_attended = existing_user.get('games_attended')
        balance = existing_user.get('balance')
        is_admin = existing_user.get('is_admin')

        # Update user details
        existing_user.update({
            "user_name": data.get('user_name', existing_user.get('user_name')),
            "first_name": data.get('first_name', existing_user.get('first_name')),
            "last_name": data.get('last_name', existing_user.get('last_name')),
            "description": data.get('description', existing_user.get('description')),
            "location": data.get('location', existing_user.get('location')),
            "experience": data.get('experience', existing_user.get('experience')),
            "sub_notifications": data.get('sub_notifications', existing_user.get('sub_notifications')),
            "profile_image": data.get('profile_image', existing_user.get('profile_image')),
            "games_joined": games_joined,
            "games_attended": games_attended,
            "balance": balance,
            "is_admin": is_admin,
            "updated_at": datetime.datetime.utcnow()
        })

        result = users.update_one({"oauth_id": oauth_id}, {"$set": existing_user})

        if result.modified_count:
            return make_response(jsonify({'message': 'User details updated successfully'}), 200)
        else:
            return make_response(jsonify({'message': 'No changes detected in user details'}), 200)
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

# Add new venue
@app.route('/api/v1.0/venues/information', methods=['POST'])
def add_venue_details():
    try:
        data = request.get_json()

        venue_name = data.get('venue_name')
        venue_address = data.get('venue_address')
        venue_description = data.get('venue_description')
        venue_image = data.get('venue_image')
        venue_contact = data.get('venue_contact')

        new_venue = {
            "_id": ObjectId(),
            "name": venue_name,
            "address": venue_address,
            "description": venue_description,
            "image": venue_image,
            "contact_info": venue_contact,
            "games_played": 0,
            "likes_dislikes": {
                "user_likes": [],
                "user_dislikes": []
            },
            "created_at": datetime.datetime.utcnow()
        }

        # Insert data into MongoDB
        result = venues.insert_one(new_venue)

        # Handle result and return response
        if result.inserted_id:
            return make_response(jsonify({'message': 'Venue details added successfully'}), 200)
        else:
            return make_response(jsonify({'error': 'Failed to add venue details'}), 500)

    except Exception as e:
        return make_response(jsonify({'error': f'An error occurred: {str(e)}'}), 500)

# Update venue details
@app.route('/api/v1.0/venues/information/<venue_id>', methods=['PUT'])
def update_venue_details(venue_id):
    try:
        data = request.get_json()

        venue_name = data.get('venue_name')
        venue_address = data.get('venue_address')
        venue_description = data.get('venue_description')
        venue_image = data.get('venue_image')
        venue_contact = data.get('venue_contact')

        update_query = {
            "$set": {
                "name": venue_name,
                "address": venue_address,
                "description": venue_description,
                "image": venue_image,
                "contact_info": venue_contact
            }
        }

        result = venues.update_one({"_id": ObjectId(venue_id)}, update_query)

        if result.modified_count > 0:
            return make_response(jsonify({'message': 'Venue details updated successfully'}), 200)
        else:
            return make_response(jsonify({'error': 'Failed to update venue details'}), 404)

    except Exception as e:
        return make_response(jsonify({'error': f'An error occurred: {str(e)}'}), 500)


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
            venues_list.append(venue)

        return make_response(jsonify(venues_list), 200)
    except Exception as e:
        print(e)
        return make_response(jsonify({'error': 'Internal Server Error'}), 500)

# Get a venue by id
@app.route('/api/v1.0/venues/<string:id>', methods=['GET'])
def get_venue_by_id(id):
    try:
        venue = venues.find_one({'_id': ObjectId(id)})

        if venue:
            venue['_id'] = str(venue['_id'])
            return make_response(jsonify([venue]), 200)
        else:
            return make_response(jsonify({'message': 'Venue not found'}), 404)
    except Exception as e:
        print(e)
        return make_response(jsonify({'error': 'Internal Server Error'}), 500)



# Delete venue
@app.route('/api/v1.0/venues/<string:id>', methods=['DELETE'])
def delete_venue(id):
    venue = venues.find_one({'_id': ObjectId(id)})

    if venue:
        venues.delete_one({'_id': ObjectId(id)})
        return make_response(jsonify({"message": "Venue deleted successfully"}), 200)
    else:
        return make_response(jsonify({"error": "Venue not found"}), 404)

# Get count of venues
@app.route('/api/v1.0/venues/count', methods=['GET'])
def get_count_of_venues():
    try:
        count_of_venues = db.venues.distinct("_id")

        return f"{len(count_of_venues)}"
    except Exception as e:
        print(e)
        return make_response(jsonify({'error': 'Internal Server Error'}), 500)

# Add like to a venue
@app.route('/api/v1.0/venues/<string:venue_id>/likes_dislikes/likes', methods=['POST'])
def add_like(venue_id):

    venue = venues.find_one({'_id' : ObjectId(venue_id)})

    if venue:
        oauth_id = str.lower(request.form.get('oauth_id'))

        if oauth_id:
            if oauth_id in venue['likes_dislikes']['user_likes']:
                venue['likes_dislikes']['user_likes'].remove(oauth_id)
                action = 'user removed from venue likes'
            elif oauth_id in venue['likes_dislikes']['user_dislikes']:
                venue['likes_dislikes']['user_dislikes'].remove(oauth_id)
                venue['likes_dislikes']['user_likes'].append(oauth_id)
                action = 'user ID removed from dislikes and added to venue likes'
            else:
                venue['likes_dislikes']['user_likes'].append(oauth_id)
                action = 'user ID added to venue likes'

            venues.update_one({"_id": ObjectId(venue_id)}, {"$set": {"likes_dislikes": venue['likes_dislikes']}})
            return make_response(jsonify({'message': f'User {action} for the venue', \
                                          'link' : f'http://localhost/api/v1.0/venues/{str(venue)}'}), 200)
        else:
            return make_response(jsonify({'error_message' : 'user not found'}), 404)

    return make_response(jsonify({'error_message' : 'game not found'}), 404)

# Add a dislike to a venue
@app.route('/api/v1.0/venues/<string:venue_id>/likes_dislikes/dislikes', methods=['POST'])
def add_dislike(venue_id):

    venue = venues.find_one({'_id': ObjectId(venue_id)})

    if venue:
        oauth_id = str.lower(request.form.get('oauth_id'))

        if oauth_id:
            if oauth_id in venue['likes_dislikes']['user_dislikes']:
                venue['likes_dislikes']['user_dislikes'].remove(oauth_id)
                action = 'user removed from venue dislikes'
            elif oauth_id in venue['likes_dislikes']['user_likes']:
                venue['likes_dislikes']['user_likes'].remove(oauth_id)
                venue['likes_dislikes']['user_dislikes'].append(oauth_id)
                action = 'user ID removed from likes and added to venue dislike'
            else:
                venue['likes_dislikes']['user_dislikes'].append(oauth_id)
                action = 'user ID added to venue dislike'

            venues.update_one({"_id": ObjectId(venue_id)}, {"$set": {"likes_dislikes": venue['likes_dislikes']}})
            return make_response(jsonify({'message': f'{action} for the game', \
                                          'link' : f'http://localhost/api/v1.0/venues/{str(venue)}'}), 200)
        else:
            return make_response(jsonify({'error_message' : 'user not found'}), 404)

    return make_response(jsonify({'error_message' : 'game not found'}), 404)

# Get venue likes_dislikes
@app.route('/api/v1.0/venues/<string:venue_id>/likes_dislikes', methods=['GET'])
def get_venue_likes_dislikes(venue_id):
    venue = venues.find_one({'_id' : ObjectId(venue_id)})

    like_users = []
    dislike_users = []

    if venue:
        likes_dislikes = venue.get('likes_dislikes', {})

        for oauth_id in likes_dislikes.get('user_likes', []):
            like_users.append(str(oauth_id))

        for oauth_id in likes_dislikes.get('user_dislikes', []):
            dislike_users.append(str(oauth_id))

        likes_dislikes = {'liked_users': like_users, 'disliked_users': dislike_users}

        return make_response(jsonify({'likes_dislikes' : likes_dislikes}))

    return make_response(jsonify({'error_message' : 'venue not found'}), 404)

# Get venues liked and disliked from a user 
@app.route('/api/v1.0/users/<string:user_id>/likes_dislikes', methods=['GET'])
def get_likes_dislikes_for_user(user_id):
    venues_liked = []
    venues_disliked = []

    venues_liked_cursor = venues.find({"likes_dislikes.user_likes": user_id})
    for venue_liked in venues_liked_cursor:
        venues_liked.append(str(venue_liked['_id']))

    venues_disliked_cursor = venues.find({"likes_dislikes.user_dislikes": user_id})
    for venue_disliked in venues_disliked_cursor:
        venues_disliked.append(str(venue_disliked['_id']))

    likes_dislikes = {'venues_user_likes': venues_liked, 'venues_user_dislikes': venues_disliked}

    return make_response(jsonify([likes_dislikes]), 200)

# Remove a like
@app.route('/api/v1.0/venues/<string:venue_id>/likes_dislikes/likes', methods=['DELETE'])
def remove_like(venue_id):

    venue = venues.find_one({'_id': ObjectId(venue_id)})

    if venue:
        oauth_id = str.lower(request.args.get('oauth_id'))

        if oauth_id in venue['likes_dislikes']['user_likes']:
            venue['likes_dislikes']['user_likes'].remove(oauth_id)
            venues.update_one({'_id': ObjectId(venue_id)}, {'$set': {'likes_dislikes': venue['likes_dislikes']}})
            return make_response(jsonify({'message': 'User removed from the likes list'}), 200)
        else:
            return make_response(jsonify({'error_message': 'User not found in the like list'}), 404)
    else:
        return make_response(jsonify({'error_message': 'Venue not found'}), 404)

# Remove a dislike
@app.route('/api/v1.0/venues/<string:venue_id>/likes_dislikes/dislikes', methods=['DELETE'])
def remove_dislike(venue_id):

    venue = venues.find_one({'_id': ObjectId(venue_id)})

    if venue:
        user_id = str.lower(request.args.get('user_id'))

        if user_id in venue['likes_dislikes']['user_dislikes']:
            venue['likes_dislikes']['user_dislikes'].remove(user_id)
            venues.update_one({'_id': ObjectId(venue_id)}, {'$set': {'likes_dislikes': venue['likes_dislikes']}})
            return make_response(jsonify({'message': 'User removed from the dislike list'}), 200)
        else:
            return make_response(jsonify({'error_message': 'User not found in the dislike list'}), 404)
    else:
        return make_response(jsonify({'error_message': 'Venue not found'}), 404)


@app.route('/api/v1.0/test', methods=['GET'])
def testConnection():
    return "200"

if __name__ == '__main__':
    app.run(debug=True)

