from flask import Flask, request, jsonify, make_response
from pymongo import ASCENDING, DESCENDING, MongoClient
from bson import ObjectId
import datetime
from flask_cors import CORS
import requests
from datetime import datetime
from mailjet_rest import Client

app = Flask(__name__)
CORS(app)

client = MongoClient('mongodb://127.0.0.1:27017')
db = client['footyGatherDB']  
users = db['users']
venues = db['venues']
communities = db['communities']
games = db['games']

mailjet_api_key = '660c432b82fa76c322afa593f12309fa'
mailjet_api_secret = '04d1599040f7540a1f71f6e18cafa1dd'
mailjet = Client(auth=(mailjet_api_key, mailjet_api_secret), version='v3.1')

@app.route('/')
def hello_world():
    return 'Hello, World!'

def parse_game_datetime(date_str, time_str):
    datetime_str = f"{date_str} {time_str}"
    return datetime.strptime(datetime_str, "%Y-%m-%d %H:%M")

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
        balance = data.get('balance')
        is_admin = data.get('is_admin')
        email = data.get('email')

        new_user = {
            "_id": ObjectId(),
            "email" : email,
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
            "balance": balance,
            "is_admin": is_admin,
            "create_at": datetime.utcnow()
        }

        result = users.insert_one(new_user)

        if result.inserted_id:
            return make_response(jsonify({'message': 'User details added successfully'}), 201)
        else:
            return make_response(jsonify({'error': 'User not found'}), 404)
    except Exception as e:
        print(e)
        return make_response(jsonify({'error': 'Internal Server Error'}), 500)

# Delete a user
@app.route('/api/v1.0/user/delete/<string:id>', methods=['DELETE'])
def delete_user(id):
    try:
        user = users.find_one({"oauth_id": id})
        if user:
            users.delete_one({"oauth_id": id})
            
            communities.update_many(
                {},
                { "$pull": { "players": { "oauth_id": id } } }
            )

            communities.update_many(
                {},
                {"$pull": {"current_games.$[].player_list": id}}
            )

            return make_response(jsonify({'message': 'User deleted successfully'}), 200)
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

# UPDATE USER DETAILS
@app.route('/api/v1.0/user/information', methods=['PUT'])
def update_user_details():
    try:
        data = request.get_json()

        oauth_id = data.get('oauth_id')
        existing_user = users.find_one({"oauth_id": oauth_id})
        if not existing_user:
            return jsonify({'error': 'User not found'}), 404

        games_joined = existing_user.get('games_joined')
        balance = existing_user.get('balance')
        is_admin = existing_user.get('is_admin')

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
            "balance": balance,
            "is_admin": is_admin,
            "updated_at": datetime.utcnow()
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

# Get communities
@app.route('/api/v1.0/communities', methods=['GET'])
def get_communities():
    try:
        page_num, page_size = 1, 12
        if request.args.get('pn'): 
            page_num = int(request.args.get('pn'))
        if request.args.get('ps'):
            page_size = int(request.args.get('ps'))
        page_start = (page_size * (page_num - 1))

        communities_list = []

        for community in communities.find().skip(page_start).limit(page_size):
            community['_id'] = str(community['_id'])
            for comment in community['comments']:
                comment['_id'] = str(comment['_id'])
            for game in community.get('current_games', []):
                if isinstance(game, dict) and 'game_id' in game:
                    game['game_id'] = str(game['game_id'])
            for game in community.get('previous_games', []):
                if isinstance(game, dict) and 'game_id' in game:
                    game['game_id'] = str(game['game_id'])
            communities_list.append(community)

        return make_response(jsonify(communities_list), 200)
    except Exception as e:
        print(e)
        return make_response(jsonify({'error': 'Internal Server Error'}), 500)

# Get all communities
@app.route('/api/v1.0/all_communities', methods=['GET'])
def get_all_communities():
    try:
        communities_list = []
        for community in communities.find():
            community['_id'] = str(community['_id'])
            for comment in community.get('comments', []):
                comment['_id'] = str(comment['_id'])
            for game in community.get('current_games', []):
                if isinstance(game, dict) and 'game_id' in game:
                    game['game_id'] = str(game['game_id'])
            for game in community.get('previous_games', []):
                if isinstance(game, dict) and 'game_id' in game:
                    game['game_id'] = str(game['game_id'])
            communities_list.append(community)
        return make_response(jsonify(communities_list), 200)
    except Exception as e:
        print(e)
        return make_response(jsonify({'error': 'Internal Server Error'}), 500)


# Search community
@app.route('/api/v1.0/communities/search', methods=['GET'])
def search_communities():
    try:
        query = request.args.get('query', '')

        regex_pattern = f'.*{query}.*'
        query_filter = {'name': {'$regex': regex_pattern, '$options': 'i'}}

        matching_communities = communities.find(query_filter)

        matching_communities_list = []
        for community in matching_communities:
            community['_id'] = str(community['_id']) 
            for comment in community.get('comments', []):
                comment['_id'] = str(comment['_id'])
            for game in community.get('current_games', []):
                    if isinstance(game, dict) and 'game_id' in game:
                        game['game_id'] = str(game['game_id'])
            for game in community.get('previous_games', []):
                    if isinstance(game, dict) and 'game_id' in game:
                        game['game_id'] = str(game['game_id'])
            matching_communities_list.append(community)

        return make_response(jsonify(matching_communities_list), 200)
    except Exception as e:
        print(e)
        return make_response(jsonify({'error': 'Internal Server Error'}), 500)

# Create new community
@app.route('/api/v1.0/communities/information', methods=['POST'])
def add_community_details():
    try:
        data = request.get_json()

        community_name = data.get('community_name')
        community_location = data.get('community_location')
        community_description = data.get('community_description')
        community_image = data.get('community_image')
        community_creator_oauth_id = data.get('community_creator_oauth_id')
        community_creator_email = data.get('community_creator_email')
        community_creator_nickname = data.get('community_creator_nickname')

        community_rules = data.get('community_rules')

        new_community = {
            "_id": ObjectId(),
            "name": community_name,
            "location": community_location,
            "description": community_description,
            "rules" : community_rules,
            "image": community_image,
            "creator_oauth_id" : community_creator_oauth_id,
            "creator_email" : community_creator_email,
            "creator_nickname" : community_creator_nickname,
            "comments": [],
            "players": [],
            "current_games" : [],
            "previous_games" : [],
            "created_at": datetime.utcnow()
        }

        result = communities.insert_one(new_community)

        if result.inserted_id:
            return make_response(jsonify({'message': 'Community details added successfully'}), 200)
        else:
            return make_response(jsonify({'error': 'Failed to add community details'}), 500)

    except Exception as e:
        return make_response(jsonify({'error': f'An error occurred: {str(e)}'}), 500)


# Update community details
@app.route('/api/v1.0/communities/information/<community_id>', methods=['PUT'])
def update_community_details(community_id):
    try:
        data = request.get_json()

        community_name = data.get('community_name')
        community_location = data.get('community_location')
        community_description = data.get('community_description')
        community_rules = data.get('community_rules')
        community_image = data.get('community_image')

        update_query = {
            "$set": {
                "name": community_name,
                "location": community_location,
                "description": community_description,
                "image": community_image,
                "rules": community_rules
            }
        }

        result = communities.update_one({"_id": ObjectId(community_id)}, update_query)

        if result.modified_count > 0:
            return make_response(jsonify({'message': 'Community details updated successfully'}), 200)
        else:
            return make_response(jsonify({'error': 'Failed to update community details'}), 404)

    except Exception as e:
        return make_response(jsonify({'error': f'An error occurred: {str(e)}'}), 500)

# Get a community by id
@app.route('/api/v1.0/communities/<string:id>', methods=['GET'])
def get_community_by_id(id):
    try:
        community = communities.find_one({'_id': ObjectId(id)})

        if community:
            community['_id'] = str(community['_id'])
            for comment in community['comments']:
                comment['_id'] = str(comment['_id'])
            for game in community.get('current_games', []):
                if isinstance(game, dict) and 'game_id' in game:
                    game['game_id'] = str(game['game_id'])
            for game in community.get('previous_games', []):
                if isinstance(game, dict) and 'game_id' in game:
                    game['game_id'] = str(game['game_id'])
            return make_response(jsonify([community]), 200)
        else:
            return make_response(jsonify({'message': 'Community not found'}), 404)
    except Exception as e:
        print(e)
        return make_response(jsonify({'error': 'Internal Server Error'}), 500)

# Delete community (admin only)
@app.route('/api/v1.0/communities/<string:id>', methods=['DELETE'])
def delete_community(id):
    community = communities.find_one({'_id': ObjectId(id)})

    if community:
        communities.delete_one({'_id': ObjectId(id)})
        return make_response(jsonify({"message": "Community deleted successfully"}), 200)
    else:
        return make_response(jsonify({"error": "Community not found"}), 404)

@app.route('/api/v1.0/communities/<community_id>/join', methods=['POST'])
def join_community(community_id):
    try:
        data = request.get_json()

        player_info = {
            "oauth_id": data.get('user_oauth_id'),
            "user_id": data.get("user_id"),
            "nickname": data.get("user_nickname"),
            "email": data.get("user_email")
        }

        community = communities.find_one({'_id': ObjectId(community_id)})

        if community:
            if not any(player['oauth_id'] == player_info['oauth_id'] for player in community['players']):
                communities.update_one(
                    {'_id': ObjectId(community_id)},
                    {'$push': {'players': player_info}}
                )
                return make_response(jsonify({'message': 'User joined the community successfully'}), 200)
            else:
                return make_response(jsonify({'message': 'User is already a member of the community'}), 200)
        else:
            return make_response(jsonify({'error': 'Community not found'}), 404)

    except Exception as e:
        return make_response(jsonify({'error': f'An error occurred: {str(e)}'}), 500)


# Add a route to leave a community
@app.route('/api/v1.0/communities/<community_id>/leave', methods=['POST'])
def leave_community(community_id):
    try:
        data = request.get_json()

        user_oauth_id = data.get('user_oauth_id')

        community = communities.find_one({'_id': ObjectId(community_id)})

        if community:
            if any(player['oauth_id'] == user_oauth_id for player in community['players']):
                communities.update_one(
                    {'_id': ObjectId(community_id)},
                    {'$pull': {'players': {'oauth_id': user_oauth_id}}}
                )
                return make_response(jsonify({'message': 'User left the community successfully'}), 200)
            else:
                return make_response(jsonify({'message': 'User is not a member of the community'}), 404)
        else:
            return make_response(jsonify({'error': 'Community not found'}), 404)

    except Exception as e:
        return make_response(jsonify({'error': f'An error occurred: {str(e)}'}), 500)

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
            "likes_dislikes": {
                "user_likes": [],
                "user_dislikes": []
            },
            "created_at": datetime.utcnow()
        }

        result = venues.insert_one(new_venue)

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
def get_venues():
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

@app.route('/api/v1.0/venues', methods=['GET'])
def get_all_venues():
    try:
        venues_list = db.venues.find()
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

@app.route('/api/v1.0/distance', methods=['GET'])
def get_distance():
    origin = request.args.get('origin')
    destination = request.args.get('destination')
    api_key = 'AIzaSyAYYaztrROgb-QD7ibhLJorPJILazXCNAo'

    url = f'https://maps.googleapis.com/maps/api/distancematrix/json?origins={origin}&destinations={destination}&units=imperial&key={api_key}'
    response = requests.get(url)
    return make_response(jsonify(response.json()), 200)

@app.route('/api/v1.0/communities/save_distance', methods=['POST'])
def save_community_distance():
    try:
        data = request.get_json()
        community_id = data.get('community_id')
        distance_from_user = data.get('distance_from_user')

        community = communities.find_one({'_id': ObjectId(community_id)})
        if not community:
            return make_response(jsonify({'error': 'Community not found'}), 404)

        communities.update_one(
            {'_id': ObjectId(community_id)},
            {'$set': {'distance_from_user': distance_from_user}}
        )

        return make_response(jsonify({'message': 'Distance saved successfully'}), 200)
    except Exception as e:
        return make_response(jsonify({'error': str(e)}), 500)

@app.route('/api/v1.0/communities/distance_unavailable', methods=['POST'])
def reset_community_distance():
    try:
        data = request.get_json()
        community_id = data.get('community_id')
        
        communities.update_one(
            {'_id': ObjectId(community_id)},
            {'$set': {'distance_from_user': 0}}
        )

        return make_response(jsonify({'message': 'Distance saved successfully'}), 200)
    except Exception as e:
        return make_response(jsonify({'error': str(e)}), 500)

# Sort communtities by distance
@app.route('/api/v1.0/communities/sort', methods=['GET'])
def sort_communities_by_distance():
    try:
        sort_option = request.args.get('sort_option', default='closest')
        communities_list = []

        if sort_option == 'closest':
            for community in communities.find().sort('distance_from_user', 1):
                community['_id'] = str(community['_id'])
                for comment in community['comments']:
                    comment['_id'] = str(comment['_id'])
                for game in community.get('current_games', []):
                    if isinstance(game, dict) and 'game_id' in game:
                        game['game_id'] = str(game['game_id'])
                for game in community.get('previous_games', []):
                    if isinstance(game, dict) and 'game_id' in game:
                        game['game_id'] = str(game['game_id'])
                communities_list.append(community)
        elif sort_option == 'furthest':
            for community in communities.find().sort('distance_from_user', -1):
                community['_id'] = str(community['_id'])
                for comment in community['comments']:
                    comment['_id'] = str(comment['_id'])
                for game in community.get('current_games', []):
                    if isinstance(game, dict) and 'game_id' in game:
                        game['game_id'] = str(game['game_id'])
                for game in community.get('previous_games', []):
                    if isinstance(game, dict) and 'game_id' in game:
                        game['game_id'] = str(game['game_id'])
                communities_list.append(community)
        else:
            return make_response(jsonify({'error': 'Invalid sort option'}), 400)

        return make_response(jsonify(communities_list), 200)
    except Exception as e:
        return make_response(jsonify({'error': str(e)}), 500)

# Get count of communities
@app.route('/api/v1.0/communities/count', methods=['GET'])
def get_count_of_communities():
    try:
        count_of_communities = db.communities.distinct("_id")

        return f"{len(count_of_communities)}"
    except Exception as e:
        print(e)
        return make_response(jsonify({'error': 'Internal Server Error'}), 500)

# Add community comment
@app.route('/api/v1.0/communities/<string:community_id>/add_comment', methods=['POST'])
def add_community_comment(community_id):
    try:
        data = request.get_json()

        comment_oauth_id = data.get('comment_oauth_id')
        comment_description = data.get('comment_description')
        comment_user = data.get('comment_user')

        new_comment = {
            "_id": ObjectId(),
            "description": comment_description,
            "user": comment_user,
            "comment_oauth_id": comment_oauth_id,
            "created_at": datetime.utcnow(),
            "timestamp" : datetime.utcnow().timestamp()
        }

        result = communities.update_one(
        {'_id': ObjectId(community_id)},
        {'$push': {'comments': new_comment}}
        )

        if result.modified_count > 0:
            print('Comment added successfully')
        else:
            print('Failed to add comment')

        if result.modified_count > 0:
            return make_response(jsonify({'message': 'Comment added successfully'}), 200)
        else:
            return make_response(jsonify({'error': 'Failed to add comment'}), 404)

    except Exception as e:
        return make_response(jsonify({'error': f'An error occurred: {str(e)}'}), 500)

# Delete community comment
@app.route('/api/v1.0/communities/<string:community_id>/delete_comment/<string:comment_id>', methods=['DELETE'])
def delete_community_comment(community_id, comment_id):
    try:
        community = communities.find_one({'_id': ObjectId(community_id)})

        if community:
            comment_exists = any(str(comment['_id']) == comment_id for comment in community['comments'])
            if comment_exists:
                updated_comments = [comment for comment in community['comments'] if str(comment['_id']) != comment_id]

                result = communities.update_one(
                    {'_id': ObjectId(community_id)},
                    {'$set': {'comments': updated_comments}}
                )

                if result.modified_count > 0:
                    return make_response(jsonify({'message': 'Comment deleted successfully'}), 200)
                else:
                    return make_response(jsonify({'error': 'Failed to delete comment'}), 500)
            else:
                return make_response(jsonify({'error': 'Comment not found'}), 404)
        else:
            return make_response(jsonify({'error': 'Community not found'}), 404)

    except Exception as e:
        return make_response(jsonify({'error': 'An error occurred while deleting a comment. Please try again later.'}), 500)

# Get all comments for a community
@app.route('/api/v1.0/communities/<string:community_id>/comments', methods=['GET'])
def get_community_comments(community_id):
    try:
        community = communities.find_one({'_id': ObjectId(community_id)})
        comments_list = []
        if community:
            comments = community.get('comments', [])
            for comment in comments:
                comment['_id'] = str(comment['_id'])
                comments_list.append(comment)
            return make_response(jsonify(comments_list), 200)
        else:
            return make_response(jsonify({'error': 'Community not found'}), 404)

    except Exception as e:
        return make_response(jsonify({'error': 'An error occurred while fetching comments. Please try again later.'}), 500)

# Sort communtity comments
@app.route('/api/v1.0/communities/<string:community_id>/comments/sort', methods=['GET'])
def sort_community_comments(community_id):
    try:
        sort_option = request.args.get('sort_option', default='newest')
        community = communities.find_one({"_id": ObjectId(community_id)})

        if community and 'comments' in community:
            community['_id'] = str(community['_id'])
            for comment in community['comments']:
                comment['_id'] = str(comment['_id'])

            if sort_option == 'newest':
                sorted_comments = sorted(community['comments'], key=lambda x: x['timestamp'], reverse=True)
            else:
                sorted_comments = sorted(community['comments'], key=lambda x: x['timestamp'])

            return make_response(jsonify(sorted_comments), 200)
        else:
            return make_response(jsonify({'error': 'Community not found or has no comments'}), 404)

    except Exception as e:
        return make_response(jsonify({'error': str(e)}), 500)

# Player details
@app.route('/api/v1.0/player-details/<string:id>', methods=['GET'])
def get_profile_details(id):
    try:
        oid = ObjectId(id)
        user = users.find_one({"_id": oid})
        if user:
            user['_id'] = str(user['_id'])
            return make_response(jsonify(user), 200)
        else:
            return make_response(jsonify({'error': 'User not found'}), 404)
    except Exception as e:
        print(e)
        return make_response(jsonify({'error': 'Internal Server Error'}), 500)

# Add new game
@app.route('/api/v1.0/communities/<string:community_id>/games/add_game', methods=['POST'])
def add_new_game(community_id):
    try:
        data = request.get_json()
        created_at = datetime.utcnow()
        timestamp = datetime.utcnow().timestamp()

        new_game = {
            "name": data.get('game_name'),
            "description": data.get('game_description'),
            "venue_id": ObjectId(data.get('game_venue_id')),
            "venue_name": data.get('game_venue_name'),
            "length": data.get('game_length'),
            "size": data.get('game_size'),
            "payment_type": data.get('game_payment_type'),
            "price": data.get('game_price'),
            "date": data.get('game_date'),
            "time": data.get('game_time'),
            "community": {
                "community_id": ObjectId(community_id),
                "community_name": data.get('community_name')
            },
            "creator": {
                "oauth_id": data.get('creator_oauth_id'),
                "user_id": data.get('creator_user_id'),
                "username": data.get('creator_user_name'),
                "email": data.get('creator_email')
            },
            "comments": [],
            "player_list": [{
                "oauth_id": data.get('creator_oauth_id'),
                "user_id": data.get('creator_user_id'),
                "username": data.get('creator_user_name'),
                "email": data.get('creator_email')
            }],
            "status": "current",
            "created_at": created_at,
            "created_at_timestamp": timestamp
        }
        game_insert_result = games.insert_one(new_game)

        users.update_one(
            {"_id": ObjectId(data.get('creator_user_id'))},
            {"$inc": {"games_joined": 1}}
        )

        community_update_result = communities.update_one(
            {"_id": ObjectId(community_id)},
            {"$push": {"current_games": {"game_id": game_insert_result.inserted_id, "game_name": data.get('game_name')}}}
        )

        if community_update_result.modified_count > 0:
            return make_response(jsonify({'message': 'Game added to community successfully'}), 200)
        else:
            return make_response(jsonify({'error': 'Failed to add game to community'}), 500)

    except Exception as e:
        return make_response(jsonify({'error': f'An error occurred: {str(e)}'}), 500)

# Get community games paginated
@app.route('/api/v1.0/communities/<community_id>/games', methods=['GET'])
def get_community_games(community_id):
    try:
        page_num, page_size = 1, 12
        if request.args.get('pn'):
            page_num = int(request.args.get('pn'))
        if request.args.get('ps'):
            page_size = int(request.args.get('ps'))
        page_start = (page_size * (page_num - 1))

        community_games = games.find({"community.community_id": ObjectId(community_id)}).skip(page_start).limit(page_size)

        games_list = []
        for game in community_games:
            game['_id'] = str(game['_id'])
            if 'venue_id' in game:
                game['venue_id'] = str(game['venue_id'])
            if 'community' in game and 'community_id' in game['community']:
                game['community']['community_id'] = str(game['community']['community_id'])
            if 'comments' in game:
                for comment in game['comments']:
                    comment['_id'] = str(comment['_id'])
            games_list.append(game)

        return make_response(jsonify(games_list), 200)

    except Exception as e:
        print(f"Error: {e}")
        return make_response(jsonify({'error': 'Internal Server Error'}), 500)


#  Get all games
@app.route('/api/v1.0/games/all_games', methods=['GET'])
def get_all_games():
    try:
        all_games = games.find()
        games_list = []
        for game in all_games:
            game['_id'] = str(game['_id'])
            game['venue_id'] = str(game['venue_id'])
            if 'community' in game:
                game['community']['community_id'] = str(game['community']['community_id'])
            if 'comments' in game:
                for comment in game['comments']:
                    comment['_id'] = str(comment['_id'])
            games_list.append(game)

        return make_response(jsonify(games_list), 200)

    except Exception as e:
        print(e)
        return make_response(jsonify({'error': 'Internal Server Error'}), 500)
    
# Get all games with pagination
@app.route('/api/v1.0/games/all_current_games/sort', methods=['GET'])
def get_all_current_games_sorted():
    sort_option = request.args.get('sort_option', 'closest')
    page_num = int(request.args.get('pn', 1))
    page_size = int(request.args.get('ps', 12))
    
    try:
        sort_order = ASCENDING if sort_option == 'closest' else DESCENDING

        games_cursor = games.find({"status": "current"}).sort("date", sort_order).skip((page_num - 1) * page_size).limit(page_size)
        games_list = list(games_cursor)

        for game in games_list:
            game['_id'] = str(game['_id'])
            if 'venue_id' in game:
                game['venue_id'] = str(game['venue_id'])
            if 'community' in game and 'community_id' in game['community']:
                game['community']['community_id'] = str(game['community']['community_id'])
            if 'comments' in game:
                for comment in game['comments']:
                    comment['_id'] = str(comment['_id'])

        return make_response(jsonify(games_list), 200)
    except Exception as e:
        return make_response(jsonify({'error': f'An error occurred: {str(e)}'}), 500)

# Get count of all current games
@app.route('/api/v1.0/games/all_current_games/count', methods=['GET'])
def count_current_games():
    try:
        count_of_current_games = games.count_documents({"status": "current"})

        return jsonify({'count_of_all_current_games': count_of_current_games})
    except Exception as e:
        print(f"Error counting current games: {e}")
        return make_response(jsonify({'error': 'Internal Server Error'}), 500)

# Search all current games by name
@app.route('/api/v1.0/games/all_current_games/search', methods=['GET'])
def search_all_current_games():
    try:
        game_name = request.args.get('query', '')

        regex_pattern = f'.*{game_name}.*'
        query_filter = {
            'name': {'$regex': regex_pattern, '$options': 'i'},
            'status': 'current'
        }

        matching_games = games.find(query_filter).sort('name', ASCENDING)
        games_list = []
        for game in matching_games:
            game['_id'] = str(game['_id'])
            if 'venue_id' in game:
                game['venue_id'] = str(game['venue_id'])
            if 'community' in game and 'community_id' in game['community']:
                game['community']['community_id'] = str(game['community']['community_id'])
            games_list.append(game)

        return make_response(jsonify(games_list), 200)

    except Exception as e:
        print(f"Error searching current games by name: {e}")
        return make_response(jsonify({'error': 'Internal Server Error'}), 500)

# Get count of games for community
@app.route('/api/v1.0/communities/<community_id>/games/count', methods=['GET'])
def get_count_of_games_in_community(community_id):
    try:
        count_of_games = games.count_documents({"community_id": ObjectId(community_id)})

        return make_response(jsonify({'count': count_of_games}), 200)

    except Exception as e:
        print(f"Error: {e}")
        return make_response(jsonify({'error': 'Internal Server Error'}), 500)

# Get all games for a community
@app.route('/api/v1.0/communities/<community_id>/games', methods=['GET'])
def get_games_for_community(community_id):
    try:
        community_games = games.find({"community.community_id": ObjectId(community_id)})

        games_list = []
        for game in community_games:
            game['_id'] = str(game['_id'])
            if 'venue_id' in game:
                game['venue_id'] = str(game['venue_id'])
            if 'community' in game and 'community_id' in game['community']:
                game['community']['community_id'] = str(game['community']['community_id'])
            if 'comments' in game:
                for comment in game['comments']:
                    comment['_id'] = str(comment['_id'])
            games_list.append(game)

        return make_response(jsonify(games_list), 200)
    
    except Exception as e:
        print(f"Error: {e}")
        return make_response(jsonify({'error': 'Internal Server Error'}), 500)

# Get game by id
@app.route('/api/v1.0/games/<game_id>', methods=['GET'])
def get_game_by_id(game_id):
    try:
        game = games.find_one({"_id": ObjectId(game_id)})

        if game:
            game['_id'] = str(game['_id'])
            game['venue_id'] = str(game['venue_id'])
            if 'community' in game and 'community_id' in game['community']:
                game['community']['community_id'] = str(game['community']['community_id'])
            if 'comments' in game:
                for comment in game['comments']:
                    comment['_id'] = str(comment['_id'])
            return make_response(jsonify([game]), 200)
        else:
            return make_response(jsonify({'message': 'Game not found'}), 404)
    
    except Exception as e:
        print(f"Error: {e}")
        return make_response(jsonify({'error': 'Internal Server Error'}), 500)

# Delete game by id
@app.route('/api/v1.0/games/<game_id>', methods=['DELETE'])
def delete_game_by_id(game_id):
    try:
        game_oid = ObjectId(game_id)
        
        game = games.find_one({"_id": game_oid})
        if game:
            result = games.delete_one({"_id": game_oid})

            if result.deleted_count > 0:
                communities.update_many(
                    {},
                    {"$pull": {
                        "current_games": {"game_id": game_oid},
                        "previous_games": {"game_id": game_oid}
                    }}
                )

                for player in game.get('player_list', []):
                    users.update_one(
                        {"_id": ObjectId(player['user_id'])},
                        {"$inc": {"games_joined": -1}}
                    )

                return make_response(jsonify({'message': 'Game deleted successfully'}), 200)
            else:
                return make_response(jsonify({'message': 'Game not found'}), 404)
        else:
            return make_response(jsonify({'message': 'Game not found'}), 404)

    except Exception as e:
        print(f"Error: {e}")
        return make_response(jsonify({'error': 'Internal Server Error'}), 500)

# Get current games
@app.route('/api/v1.0/communities/<community_id>/current_games', methods=['GET'])
def get_current_games_for_community(community_id):
    try:
        page_num, page_size = 1, 5
        if request.args.get('pn'):
            page_num = int(request.args.get('pn'))
        if request.args.get('ps'):
            page_size = int(request.args.get('ps'))

        community = communities.find_one({"_id": ObjectId(community_id)}, {"_id": 0, "current_games": 1})
        if not community:
            return make_response(jsonify({'message': 'Community not found'}), 404)

        game_ids = [game['game_id'] if isinstance(game, dict) and 'game_id' in game else game for game in community['current_games']]

        skip = (page_num - 1) * page_size
        games_cursor = games.find({"_id": {"$in": game_ids}}).skip(skip).limit(page_size)
        games_list = list(games_cursor)

        for game in games_list:
            game['_id'] = str(game['_id'])
            if 'venue_id' in game:
                game['venue_id'] = str(game['venue_id'])
            if 'community' in game and 'community_id' in game['community']:
                game['community']['community_id'] = str(game['community']['community_id'])
            if 'comments' in game:
                for comment in game['comments']:
                    comment['_id'] = str(comment['_id'])

        return make_response(jsonify(games_list), 200)

    except Exception as e:
        print(e)
        return make_response(jsonify({'error': 'Internal Server Error'}), 500)


# Get previous games
@app.route('/api/v1.0/communities/<community_id>/previous_games', methods=['GET'])
def get_previous_games_for_community(community_id):
    try:
        page_num, page_size = 1, 5
        if request.args.get('pn'):
            page_num = int(request.args.get('pn'))
        if request.args.get('ps'):
            page_size = int(request.args.get('ps'))

        community = communities.find_one({"_id": ObjectId(community_id)}, {"_id": 0, "previous_games": 1})
        if not community:
            return make_response(jsonify({'message': 'Community not found'}), 404)

        game_ids = [game['game_id'] if isinstance(game, dict) and 'game_id' in game else game for game in community['previous_games']]

        skip = (page_num - 1) * page_size
        games_cursor = games.find({"_id": {"$in": game_ids}}).skip(skip).limit(page_size)
        games_list = list(games_cursor)

        for game in games_list:
            game['_id'] = str(game['_id'])
            if 'venue_id' in game:
                game['venue_id'] = str(game['venue_id'])
            if 'community' in game and 'community_id' in game['community']:
                game['community']['community_id'] = str(game['community']['community_id'])
            if 'comments' in game:
                for comment in game['comments']:
                    comment['_id'] = str(comment['_id'])

        return make_response(jsonify(games_list), 200)

    except Exception as e:
        print(e)
        return make_response(jsonify({'error': 'Internal Server Error'}), 500)

# Sort Current Games
@app.route('/api/v1.0/communities/<community_id>/current_games/sort', methods=['GET'])
def sort_current_games_by_date_with_pagination(community_id):
    sort_option = request.args.get('sort_option', 'closest_date')
    page_num = int(request.args.get('pn', 1))
    page_size = int(request.args.get('ps', 5))
    try:
        community = communities.find_one({"_id": ObjectId(community_id)})
        if not community or 'current_games' not in community:
            return make_response(jsonify({'error': 'Community not found'}), 404)

        game_ids = [game_ref['game_id'] for game_ref in community['current_games']]

        sort_order = DESCENDING if sort_option == 'furthest_date' else ASCENDING
        
        games_cursor = games.find({"_id": {"$in": game_ids}}).sort("date", sort_order).skip((page_num - 1) * page_size).limit(page_size)
        games_list = list(games_cursor)

        for game in games_list:
            game['_id'] = str(game['_id'])
            if 'venue_id' in game:
                game['venue_id'] = str(game['venue_id'])
            if 'community' in game and 'community_id' in game['community']:
                game['community']['community_id'] = str(game['community']['community_id'])
            if 'comments' in game:
                for comment in game['comments']:
                    comment['_id'] = str(comment['_id'])

        return make_response(jsonify(games_list), 200)
    except Exception as e:
        return make_response(jsonify({'error': str(e)}), 500)

# Sort previous games
@app.route('/api/v1.0/communities/<community_id>/previous_games/sort', methods=['GET'])
def sort_previous_games_by_date_with_pagination(community_id):
    sort_option = request.args.get('sort_option', 'closest_date')
    page_num = int(request.args.get('pn', 1))
    page_size = int(request.args.get('ps', 5))
    try:
        community = communities.find_one({"_id": ObjectId(community_id)})
        if not community or 'previous_games' not in community:
            return make_response(jsonify({'error': 'Community not found'}), 404)

        game_ids = [game_ref['game_id'] for game_ref in community['previous_games']]

        sort_order = DESCENDING if sort_option == 'furthest_date' else ASCENDING
        
        games_cursor = games.find({"_id": {"$in": game_ids}}).sort("date", sort_order).skip((page_num - 1) * page_size).limit(page_size)
        games_list = list(games_cursor)

        for game in games_list:
            game['_id'] = str(game['_id'])
            if 'venue_id' in game:
                game['venue_id'] = str(game['venue_id'])
            if 'community' in game and 'community_id' in game['community']:
                game['community']['community_id'] = str(game['community']['community_id'])
            if 'comments' in game:
                for comment in game['comments']:
                    comment['_id'] = str(comment['_id'])

        return make_response(jsonify(games_list), 200)
    except Exception as e:
        return make_response(jsonify({'error': str(e)}), 500)

# Get count of community current games
@app.route('/api/v1.0/communities/<community_id>/current_games/count', methods=['GET'])
def get_current_games_count(community_id):
    try:
        community = communities.find_one({"_id": ObjectId(community_id)}, {"current_games": 1})
        if not community:
            return make_response(jsonify({'message': 'Community not found'}), 404)

        count_of_current_games = len(community['current_games'])

        return make_response(jsonify({'count_of_current_games': count_of_current_games}), 200)

    except Exception as e:
        print(f"Error: {e}")
        return make_response(jsonify({'error': 'Internal Server Error'}), 500)

# Get count of community previous games
@app.route('/api/v1.0/communities/<community_id>/previous_games/count', methods=['GET'])
def get_previous_games_count(community_id):
    try:
        community = communities.find_one({"_id": ObjectId(community_id)}, {"previous_games": 1})
        if not community:
            return make_response(jsonify({'message': 'Community not found'}), 404)

        count_of_previous_games = len(community['previous_games'])

        return make_response(jsonify({'count_of_previous_games': count_of_previous_games}), 200)

    except Exception as e:
        print(f"Error: {e}")
        return make_response(jsonify({'error': 'Internal Server Error'}), 500)

# Move expired games to previous games
@app.route('/api/v1.0/communities/<community_id>/move_game_to_previous/<game_id>', methods=['POST'])
def move_game_to_previous(community_id, game_id):
    try:
        community_id = ObjectId(community_id)
        game_id = ObjectId(game_id)

        community = communities.find_one({"_id": community_id, "current_games.game_id": game_id})
        if not community:
            return make_response(jsonify({'message': 'Community or game not found'}), 404)

        game_to_move = next((game for game in community['current_games'] if game['game_id'] == game_id), None)
        if not game_to_move:
            return make_response(jsonify({'message': 'Game not found in current games list'}), 404)

        result = communities.update_one(
            {"_id": community_id},
            {
                "$pull": {"current_games": {"game_id": game_id}},
                "$push": {"previous_games": game_to_move}
            }
        )

        if result.modified_count == 0:
            return make_response(jsonify({'message': 'No changes made, update failed'}), 500)

        return make_response(jsonify({'message': 'Game moved to previous games list successfully'}), 200)

    except Exception as e:
        print(f"Error: {e}")
        return make_response(jsonify({'error': 'Internal Server Error'}), 500)

# Join a game
@app.route('/api/v1.0/games/<string:game_id>/join', methods=['POST'])
def join_game(game_id):
    try:
        data = request.get_json()
        user_oauth_id = data.get('user_oauth_id')
        
        game = games.find_one({"_id": ObjectId(game_id)})
        if not game:
            return make_response(jsonify({'error': 'Game not found'}), 404)

        community_id = game['community']['community_id']
        is_member = communities.find_one({"_id": community_id, "players.oauth_id": user_oauth_id})
        if not is_member:
            return make_response(jsonify({'error': 'User is not a member of the community'}), 403)

        try:
            max_size = int(game.get('size', float('inf')))
        except ValueError:
            return make_response(jsonify({'error': 'Invalid game size configuration'}), 500)

        if len(game.get('player_list', [])) >= max_size:
            return make_response(jsonify({'error': 'The game is already full'}), 422)

        if any(player['oauth_id'] == user_oauth_id for player in game.get('player_list', [])):
            return make_response(jsonify({'error': 'User is already part of the game'}), 409)

        player_details = {
            "oauth_id": user_oauth_id,
            "user_id": data.get('user_id'),
            "username": data.get('user_name'),
            "email": data.get('email'),
            "first_name" : data.get('first_name'),
            "last_name" : data.get('last_name')
        }
        games.update_one({"_id": ObjectId(game_id)}, {"$push": {"player_list": player_details}})
        
        users.update_one({"oauth_id": user_oauth_id}, {"$inc": {"games_joined": 1}})

        return make_response(jsonify({'message': 'User added to the game successfully'}), 200)

    except Exception as e:
        print(f"Error while joining game: {e}")
        return make_response(jsonify({'error': f'An error occurred: {str(e)}'}), 500)

# Leave a game
@app.route('/api/v1.0/games/<string:game_id>/leave', methods=['POST'])
def leave_game(game_id):
    try:
        data = request.get_json()
        user_oauth_id = data.get('user_oauth_id')
        
        game_update_result = games.update_one(
            {"_id": ObjectId(game_id)},
            {"$pull": {"player_list": {"oauth_id": user_oauth_id}}}
        )
        
        if game_update_result.modified_count > 0:
            users.update_one(
                {"oauth_id": user_oauth_id, "games_joined": {"$gt": 0}},
                {"$inc": {"games_joined": -1}}
            )
            return make_response(jsonify({'message': 'User removed from the game successfully'}), 200)
        else:
            return make_response(jsonify({'error': 'Failed to remove user from the game or user was not part of the game'}), 404)
    
    except Exception as e:
        print(f"Error while leaving game: {e}")
        return make_response(jsonify({'error': f'An error occurred: {str(e)}'}), 500)

# Get game player list
@app.route('/api/v1.0/games/<string:game_id>/players', methods=['GET'])
def get_player_list(game_id):
    try:
        game = games.find_one({"_id": ObjectId(game_id)})
        
        if game:
            return jsonify(game.get('player_list', [])), 200
        else:
            return make_response(jsonify({'error': 'Game not found'}), 404)

    except Exception as e:
        return make_response(jsonify({'error': f'An error occurred: {str(e)}'}), 500)

# Get game player count
@app.route('/api/v1.0/games/<string:game_id>/players/count', methods=['GET'])
def get_player_count(game_id):
    try:
        game = games.find_one({"_id": ObjectId(game_id)})

        if game:
            player_count = len(game.get('player_list', []))
            return jsonify({'player_count': player_count}), 200
        else:
            return make_response(jsonify({'error': 'Game not found'}), 404)

    except Exception as e:
        return make_response(jsonify({'error': f'An error occurred: {str(e)}'}), 500)

# Update game details
@app.route('/api/v1.0/games/<string:game_id>', methods=['PUT'])
def update_game_details(game_id):
    try:
        data = request.get_json()

        update_data = {
            "$set": {
                "name": data.get('game_name'),
                "description": data.get('game_description'),
                "venue_id": ObjectId(data.get('game_venue_id')),
                "venue_name": data.get('game_venue_name'),
                "length": data.get('game_length'),
                "payment_type": data.get('game_payment_type'),
                "size": data.get('game_size'),
                "price": data.get('game_price'),
                "date": data.get('game_date'),
                "time": data.get('game_time'),
            }
        }
        update_result = games.update_one({"_id": ObjectId(game_id)}, update_data)

        if update_result.modified_count > 0:
            game_details = {
                "game_id": ObjectId(game_id),
                "game_name": data.get('game_name'),
                "created_at": datetime.utcnow().isoformat(),
                "date": data.get('game_date'),
                "time": data.get('game_time')
            }
            
            communities.update_one(
                {"current_games.game_id": ObjectId(game_id)},
                {"$set": {"current_games.$": game_details}}
            )
            
            communities.update_one(
                {"previous_games.game_id": ObjectId(game_id)},
                {"$set": {"previous_games.$": game_details}}
            )

            return make_response(jsonify({"message": "Game updated successfully"}), 200)
        else:
            return make_response(jsonify({"error": "No game found with the provided ID or no new data to update"}), 404)

    except Exception as e:
        print(f"Error during update: {e}")
        return make_response(jsonify({'error': f'An error occurred: {e}'}), 500)

# Add game comment
@app.route('/api/v1.0/games/<string:game_id>/add_comment', methods=['POST'])
def add_game_comment(game_id):
    try:
        data = request.get_json()

        new_comment = {
            "_id": ObjectId(),
            "description": data.get('comment_description'),
            "user": data.get('comment_user'),
            "comment_oauth_id": data.get('comment_oauth_id'),
            "created_at": datetime.utcnow(),
            "timestamp": datetime.utcnow().timestamp()
        }

        result = games.update_one(
            {'_id': ObjectId(game_id)},
            {'$push': {'comments': new_comment}}
        )

        if result.modified_count > 0:
            return make_response(jsonify({'message': 'Comment added successfully'}), 200)
        else:
            return make_response(jsonify({'error': 'Failed to add comment'}), 404)

    except Exception as e:
        return make_response(jsonify({'error': f'An error occurred: {str(e)}'}), 500)

# Delete game comment
@app.route('/api/v1.0/games/<string:game_id>/delete_comment/<string:comment_id>', methods=['DELETE'])
def delete_game_comment(game_id, comment_id):
    try:
        game = games.find_one({'_id': ObjectId(game_id)})

        if game:
            comment_exists = any(str(comment['_id']) == comment_id for comment in game.get('comments', []))
            if comment_exists:
                result = games.update_one(
                    {'_id': ObjectId(game_id)},
                    {'$pull': {'comments': {'_id': ObjectId(comment_id)}}}
                )

                if result.modified_count > 0:
                    return make_response(jsonify({'message': 'Comment deleted successfully'}), 200)
                else:
                    return make_response(jsonify({'error': 'Failed to delete comment'}), 500)
            else:
                return make_response(jsonify({'error': 'Comment not found'}), 404)
        else:
            return make_response(jsonify({'error': 'Game not found'}), 404)

    except Exception as e:
        return make_response(jsonify({'error': 'An error occurred while deleting a comment. Please try again later.'}), 500)

# Get all game comments
@app.route('/api/v1.0/games/<string:game_id>/comments', methods=['GET'])
def get_game_comments(game_id):
    try:
        game = games.find_one({'_id': ObjectId(game_id)})
        if game:
            comments_list = game.get('comments', [])
            for comment in comments_list:
                comment['_id'] = str(comment['_id'])
            return make_response(jsonify(comments_list), 200)
        else:
            return make_response(jsonify({'error': 'Game not found'}), 404)

    except Exception as e:
        return make_response(jsonify({'error': 'An error occurred while fetching comments. Please try again later.'}), 500)

# Sort community comment
@app.route('/api/v1.0/games/<string:game_id>/comments/sort', methods=['GET'])
def sort_game_comments(game_id):
    try:
        sort_option = request.args.get('sort_option', default='newest')
        game = games.find_one({"_id": ObjectId(game_id)})

        if game and 'comments' in game:
            game['_id'] = str(game['_id'])
            for comment in game['comments']:
                comment['_id'] = str(comment['_id'])
            if sort_option == 'newest':
                sorted_comments = sorted(game['comments'], key=lambda x: x['timestamp'], reverse=True)
            else:
                sorted_comments = sorted(game['comments'], key=lambda x: x['timestamp'])
            return make_response(jsonify(sorted_comments), 200)
        else:
            return make_response(jsonify({'error': 'Game not found or has no comments'}), 404)

    except Exception as e:
        return make_response(jsonify({'error': str(e)}), 500)

# Update a game status
@app.route('/api/v1.0/games/<string:game_id>/update_status', methods=['POST'])
def update_game_status(game_id):
    try:
        data = request.get_json()
        new_status = data.get('status')

        if new_status not in ['current', 'previous']:
            return make_response(jsonify({'error': 'Invalid status value'}), 400)

        result = games.update_one(
            {"_id": ObjectId(game_id)},
            {"$set": {"status": new_status}}
        )

        if result.modified_count == 0:
            return make_response(jsonify({'error': 'Game not found or status is the same'}), 404)

        return make_response(jsonify({'message': 'Game status updated successfully'}), 200)
    except Exception as e:
        return make_response(jsonify({'error': str(e)}), 500)

# Remove player from game
@app.route('/api/v1.0/games/<string:game_id>/remove_player', methods=['POST'])
def remove_player_from_game(game_id):
    try:
        data = request.get_json()
        player_user_id = data.get('user_id')
        
        update_result = games.update_one(
            {"_id": ObjectId(game_id)},
            {"$pull": {"player_list": {"user_id": player_user_id}}}
        )

        if update_result.modified_count > 0:
            users.update_one(
                {"user_id": player_user_id, "games_joined": {"$gt": 0}},
                {"$inc": {"games_joined": -1}}
            )
            return make_response(jsonify({"message": "Player removed from game successfully"}), 200)
        else:
            return make_response(jsonify({"error": "Failed to remove player from the game"}), 404)
    
    except Exception as e:
        print(f"Error while removing player from game: {str(e)}")
        return make_response(jsonify({'error': f'An error occurred: {str(e)}'}), 500)

# Get players current games
@app.route('/api/v1.0/players/<player_user_id>/current_games', methods=['GET'])
def get_current_games_for_player(player_user_id):
    try:
        current_games = games.find({"player_list.user_id": player_user_id, "status": "current"})

        games_list = []
        for game in current_games:
            game['_id'] = str(game['_id'])
            if 'venue_id' in game:
                game['venue_id'] = str(game['venue_id'])
            if 'community' in game and 'community_id' in game['community']:
                game['community']['community_id'] = str(game['community']['community_id'])
            if 'comments' in game:
                for comment in game['comments']:
                    comment['_id'] = str(comment['_id'])
            games_list.append(game)

        return make_response(jsonify(games_list), 200)
    except Exception as e:
        print(f"Error retrieving current games for player {player_user_id}: {e}")
        return make_response(jsonify({'error': 'Internal Server Error'}), 500)

# Get players previous games
@app.route('/api/v1.0/players/<player_user_id>/previous_games', methods=['GET'])
def get_previous_games_for_player(player_user_id):
    try:
        previous_games = games.find({"player_list.user_id": player_user_id, "status": "previous"})

        games_list = []
        for game in previous_games:
            game['_id'] = str(game['_id'])
            if 'venue_id' in game:
                game['venue_id'] = str(game['venue_id'])
            if 'community' in game and 'community_id' in game['community']:
                game['community']['community_id'] = str(game['community']['community_id'])
            if 'comments' in game:
                for comment in game['comments']:
                    comment['_id'] = str(comment['_id'])
            games_list.append(game)

        return make_response(jsonify(games_list), 200)
    except Exception as e:
        print(f"Error retrieving previous games for player {player_user_id}: {e}")
        return make_response(jsonify({'error': 'Internal Server Error'}), 500)

# Get players current games with pagination and sorting
@app.route('/api/v1.0/players/<player_user_id>/current_games/sort', methods=['GET'])
def sort_and_paginate_player_current_games(player_user_id):
    try:
        page_num = int(request.args.get('pn', 1))
        page_size = int(request.args.get('ps', 5))
        sort_option = request.args.get('sort_option', 'closest_date')

        sort_direction = 1 if sort_option == 'closest_date' else -1
        skip_amount = (page_num - 1) * page_size

        current_games_cursor = games.find({
            "player_list.user_id": player_user_id,
            "status": "current"
        }).sort("date", sort_direction).skip(skip_amount).limit(page_size)

        games_list = list(current_games_cursor)

        for game in games_list:
            game['_id'] = str(game['_id'])
            if 'venue_id' in game:
                game['venue_id'] = str(game['venue_id'])
            if 'community' in game and 'community_id' in game['community']:
                game['community']['community_id'] = str(game['community']['community_id'])
            if 'comments' in game:
                for comment in game['comments']:
                    comment['_id'] = str(comment['_id'])

        return make_response(jsonify(games_list), 200)
    except Exception as e:
        print(f"Error retrieving and sorting current games for player {player_user_id}: {e}")
        return make_response(jsonify({'error': str(e)}), 500)

# Get players previous games with pagination and sorting
@app.route('/api/v1.0/players/<player_user_id>/previous_games/sort', methods=['GET'])
def sort_and_paginate_player_previous_games(player_user_id):
    try:
        page_num = int(request.args.get('pn', 1))
        page_size = int(request.args.get('ps', 5))
        sort_option = request.args.get('sort_option', 'closest_date')

        sort_direction = 1 if sort_option == 'closest_date' else -1
        skip_amount = (page_num - 1) * page_size

        print(f"Sorting {sort_option} with direction {sort_direction}")
        previous_games_cursor = games.find({
            "player_list.user_id": player_user_id,
            "status": "previous"
        }).sort("date", sort_direction).skip(skip_amount).limit(page_size)

        games_list = list(previous_games_cursor)
        if not games_list:
            print("No games found with the given criteria.")

        for game in games_list:
            game['_id'] = str(game['_id'])
            if 'venue_id' in game:
                game['venue_id'] = str(game['venue_id'])
            if 'community' in game and 'community_id' in game['community']:
                game['community']['community_id'] = str(game['community']['community_id'])
            if 'comments' in game:
                for comment in game['comments']:
                    comment['_id'] = str(comment['_id'])

        return make_response(jsonify(games_list), 200)
    except Exception as e:
        print(f"Error retrieving and sorting previous games for player {player_user_id}: {e}")
        return make_response(jsonify({'error': 'Internal Server Error'}), 500)

# Get current game count for player
@app.route('/api/v1.0/players/<user_id>/current_games/count', methods=['GET'])
def get_user_current_games_count(user_id):
    try:
        count = db.games.count_documents({"player_list.user_id": user_id, "status": "current"})
        
        response = {
            "user_id": user_id,
            "current_games_count": count
        }
        return make_response(jsonify(response), 200)
    except Exception as e:
        return make_response(jsonify({"error": str(e)}), 500)

# Get previous game count for player
@app.route('/api/v1.0/players/<user_id>/previous_games/count', methods=['GET'])
def get_user_previous_games_count(user_id):
    try:
        count = db.games.count_documents({"player_list.user_id": user_id, "status": "previous"})
        
        response = {
            "user_id": user_id,
            "previous_games_count": count
        }
        return make_response(jsonify(response), 200)
    except Exception as e:
        return make_response(jsonify({"error": str(e)}), 500)

# Get player communities
@app.route('/api/v1.0/players/<user_id>/communities', methods=['GET'])
def get_communities_by_user(user_id):
    try:
        communities_cursor = communities.find({"players.user_id": user_id})
        user_communities = []

        for community in communities_cursor:
            community["_id"] = str(community["_id"])
            for comment in community['comments']:
                comment['_id'] = str(comment['_id'])
            for game in community.get('current_games', []):
                if isinstance(game, dict) and 'game_id' in game:
                    game['game_id'] = str(game['game_id'])
            for game in community.get('previous_games', []):
                if isinstance(game, dict) and 'game_id' in game:
                    game['game_id'] = str(game['game_id'])
            user_communities.append(community)

        if user_communities:
            return make_response(jsonify(user_communities), 200)
        else:
            return make_response(jsonify({"message": "No communities found for this user"}), 404)

    except Exception as e:
        return make_response(jsonify({"error": f"An error occurred: {str(e)}"}), 500)

# Get all players
@app.route('/api/v1.0/players', methods=['GET'])
def get_players():
    try:
        page_num = int(request.args.get('pn', 1))
        page_size = int(request.args.get('ps', 12))
        skip_amount = (page_num - 1) * page_size

        users_list = []
        for user in users.find().skip(skip_amount).limit(page_size):
            user['_id'] = str(user['_id'])
            if 'profile_image' in user and isinstance(user['profile_image'], list):
                user['profile_image'] = [str(img) for img in user['profile_image']]

            if 'comments' in user:
                for comment in user['comments']:
                    comment['_id'] = str(comment['_id'])

            users_list.append(user)

        return make_response(jsonify(users_list), 200)
    except Exception as e:
        print(f"Error retrieving users: {e}")
        return make_response(jsonify({'error': 'Internal Server Error'}), 500)

# Get count of players
@app.route('/api/v1.0/players/count', methods=['GET'])
def get_count_of_players():
    try:
        count_of_players = db.users.count_documents({})

        return jsonify({'count_of_players': count_of_players})
    except Exception as e:
        print(f"Error counting players: {e}")
        return make_response(jsonify({'error': 'Internal Server Error'}), 500)

# Search players
@app.route('/api/v1.0/players/search', methods=['GET'])
def search_players():
    try:
        query = request.args.get('query', '')
        
        regex_pattern = f'.*{query}.*'
        query_filter = {
            '$or': [
                {'first_name': {'$regex': regex_pattern, '$options': 'i'}},
                {'last_name': {'$regex': regex_pattern, '$options': 'i'}}
            ]
        }

        matching_users = db.users.find(query_filter)

        matching_users_list = []
        for user in matching_users:
            user['_id'] = str(user['_id'])
            if 'profile_image' in user and isinstance(user['profile_image'], list):
                user['profile_image'] = [str(img) for img in user['profile_image']]
            matching_users_list.append(user)

        return make_response(jsonify(matching_users_list), 200)
    except Exception as e:
        print(f"Error searching users: {e}")
        return make_response(jsonify({'error': 'Internal Server Error'}), 500)

# Send Email
@app.route('/api/v1.0/send_email_to_players', methods=['POST'])
def send_email_to_game_players():
    data = request.get_json()
    recipients = data['recipients']
    game_time = data['game_time']
    game_date = data['game_date']
    game_url = data['game_url']
    subject = data['subject']
    message = data['message']

    html_content = f"""
    <html>
    <head>
        <style>
            body {{
                font-family: 'Arial', sans-serif;
                background-color: #272727;
                color: #ffffff;
                margin: 0;
                padding: 0;
            }}
            .email-container {{
                padding: 20px;
                background-color: #272727;
            }}
            .email-content {{
                background-color: #ffffff;
                padding: 20px;
                border-radius: 8px;
                color: #272727;
            }}
            .email-header {{
                color: #2c972c;
            }}
            .email-button {{
                padding: 10px 20px;
                color: #ffffff;
                background-color: #2c972c;
                text-decoration: none;
                border-radius: 5px;
                display: inline-block;
            }}
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="email-content">
                <h1 class="email-header">{subject}</h1>
                <p>{message}</p>
                <p><strong>Date:</strong> {game_date}</p>
                <p><strong>Time:</strong> {game_time}</p>
                <a href="{game_url}" class="email-button">Go to Game Page</a>
            </div>
        </div>
    </body>
    </html>
    """

    email_data = {
        'Messages': [
            {
                "From": {
                    "Email": "henry2025@msn.com",
                    "Name": "Footy Gather"
                },
                "To": recipients,
                "Subject": subject,
                "TextPart": message,
                "HTMLPart": html_content
            }
        ]
    }

    try:
        result = mailjet.send.create(data=email_data)
        return jsonify(result.json()), 200
    except Exception as e:
        print(e)
        return jsonify({'error': str(e)}), 500

# Get eligible players from game
@app.route('/api/v1.0/games/<game_id>/eligible_players', methods=['GET'])
def get_eligible_game_players(game_id):
    try:
        game = db.games.find_one({"_id": ObjectId(game_id)})
        if not game:
            return jsonify({'error': 'Game not found'}), 404

        player_ids = [player['user_id'] for player in game.get('player_list', [])]

        users = db.users.find({
            '_id': {'$in': [ObjectId(id) for id in player_ids]},
            'sub_notifications': True
        }, {'email': 1, 'first_name': 1, 'last_name': 1})

        player_details = [
            {'email': user['email'], 'name': f"{user['first_name']} {user['last_name']}"}
            for user in users
        ]

        return jsonify(player_details), 200
    except Exception as e:
        print("Error:", str(e))
        return jsonify({'error': str(e)}), 500

@app.route('/api/v1.0/communities/<community_id>/eligible_players', methods=['GET'])
def get_eligible_community_players(community_id):
    try:
        community = db.communities.find_one({"_id": ObjectId(community_id)})
        if not community:
            return jsonify({'error': 'Community not found'}), 404
        
        player_ids = [player['user_id'] for player in community.get('players', [])]
        
        players = db.users.find({
            '_id': {'$in': [ObjectId(id) for id in player_ids]},
            'sub_notifications': True
        })

        player_list = [
            {'email': player['email'], 'name': f"{player.get('first_name', '')} {player.get('last_name', '')}"}
            for player in players
        ]

        return jsonify(player_list), 200
    except Exception as e:
        print(e)
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)