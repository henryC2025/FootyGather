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
communities = db['communities']

# Function to insert venue data
def insert_venue(venue_data):
    result = db.venues.insert_one(venue_data)
    return result.inserted_id

def insert_community(community_data):
    result = db.communities.insert_one(community_data)
    return result.inserted_id

# Function to generate sample venue data with comments
def generate_sample_venue():
    return {
        '_id' : ObjectId(),
        'name' : 'Sample Venue',
        'address' : '123 Main Street, City A, United Kingdom',
        'description' : 'A fantastic venue for sports and events.',
        'games_played' : 15,
        'contact_info' : 'https://www.samplevenue.com',
        'image' : ['https://via.placeholder.com/800x600', '000TEST000', 'FILEPATH'],
        'likes_dislikes' : {
            'user_likes' : ['user1', 'user2'],  # Example initial likes
            'user_dislikes' : ['user3', 'user4']  # Example initial dislikes
        },
        'created_at': datetime.datetime.utcnow()
    }

def generate_sample_community():
    players = ['3242', '3244', '2423', '2342', '4322']
    comments = [
        {
            '_id' : ObjectId(),
            'text': 'Great community!',
            'time_uploaded': datetime.datetime.utcnow(),
            'user_id': 'user123'
        },
        {
            '_id' : ObjectId(),
            'text': 'Looking forward to playing with everyone!',
            'time_uploaded': datetime.datetime.utcnow(),
            'user_id': 'user456'
        }
    ]
    return {
        '_id' : ObjectId(),
        'name' : "Sample Community",
        'description' : 'We welcome everyone to play footy with us!',
        'rules' : 'No cheating!',
        'location' : 'Belfast',
        'image' : ['https://via.placeholder.com/800x600', '000TEST000', 'FILEPATH'],
        'creator_id' : "001",
        'created_at' : datetime.datetime.utcnow(),
        'current_games' : ['001', '002', '003'],
        'previous_games' : ['004, 005, 006'],
        'total_players' : len(players),
        'players' : players,
        'comments' : comments
    }

# COMMUNITIES
# - ObjectID
# - CommunityName
# - Description
# - Location (Area)
# - CreatorID
# - CreatedAt 
# - Games - array of game ids
# - FinishedGames - array of games ids
# - TotalPlayers - count of playes
# - Players - array of player ids
# - Image

# Insert 20 sample venues
# for i in range(20):
#     venue_data = generate_sample_venue()
#     insert_venue(venue_data)
# print('Sample venues inserted successfully!')

for i in range(20):
    community_data = generate_sample_community()
    insert_community(community_data)
print('Sample communities with comments inserted successfully!')

# db.venues.deleteMany({})