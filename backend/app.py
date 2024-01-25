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
            return jsonify({'message': 'User exists', 'code': 'USER_EXISTS'}), 200
        else:
            # User doesn't exist, send a code to ask for more details
            return jsonify({'message': 'User not found in the database', 'code': 'DETAILS_REQUIRED'}), 200
    except Exception as e:
        print(e)
        return jsonify({'error': 'Internal Server Error'}), 500

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
            return jsonify({'message': 'User details added successfully'}), 201
        else:
            return jsonify({'error': 'User not found'}), 404
    except Exception as e:
        print(e)
        return jsonify({'error': 'Internal Server Error'}), 500

@app.route('/api/v1.0/users', methods=['GET'])
def get_all_users():
    try:
        all_users = list(users.find())
        user_list = []

        for user in all_users:
            # Convert ObjectId to str for JSON serialization
            user['_id'] = str(user['_id'])
            user_list.append(user)

        return jsonify(user_list), 200

    except Exception as e:
        print(e)
        return jsonify({'error': 'Internal Server Error'}), 500

@app.route('/api/v1.0/test', methods=['GET'])
def testConnection():
    return "200"

if __name__ == '__main__':
    app.run(debug=True)

