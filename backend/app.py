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
        # oauth_id = request.form.get('oauth_id')
        # Check if the user already exists in MongoDB using OAuthID
        user = users.find_one({'oauth_id': oauth_id})

        if user:
            # User exists, send a code to carry on
            return jsonify({'message': 'User exists', 'code': 'USER_EXISTS'}), 200
        else:
            # User doesn't exist, send a code to ask for more details
            return jsonify({'message': 'User not found in the database', 'code': 'ASK_FOR_DETAILS'}), 200
    except Exception as e:
        print(e)
        return jsonify({'error': 'Internal Server Error'}), 500

# ADD USER DETAILS TO USER
# Route to add user details
@app.route('/api/v1.0/user/information', methods=['POST'])
def add_user_details():
    try:
        # Get additional details from the request payload
        oauth_id = request.form.get('oauth_id')

        new_user = {
            "_id": ObjectId(),
            "oauth_id": oauth_id
        }

        # Add the user to the MongoDB collection
        result = users.insert_one(new_user)

        if result.modified_count > 0:
            return jsonify({'message': 'User details added successfully'}), 200
        else:
            return jsonify({'error': 'User not found'}), 404
    except Exception as e:
        print(e)
        return jsonify({'error': 'Internal Server Error'}), 500

@app.route('/api/v1.0/test', methods=['GET'])
def testConnection():
    return "200"

if __name__ == '__main__':
    app.run(debug=True)

