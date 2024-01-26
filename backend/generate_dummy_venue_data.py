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

# Function to insert venue data
def insert_venue(venue_data):
    result = db.venues.insert_one(venue_data)
    return result.inserted_id

# Function to generate sample venue data with comments
def generate_sample_venue():
    return {
        '_id': ObjectId(),
        'name': 'Sample Venue',
        'location': 'City A, Northern Ireland',
        'address': '123 Main Street, City A, United Kingdom',
        'description': 'A fantastic venue for sports and events.',
        'games_played': 15,
        'website_link': 'https://www.samplevenue.com',
        'cover_image': 'https://via.placeholder.com/800x600',
        'other_images': ['https://via.placeholder.com/800x600', 'https://via.placeholder.com/800x600'],
        'comments': [
            {
                '_id': ObjectId(),
                'username': f'user{i}',
                'comment_text': f'Comment {i} for Sample Venue.',
                'created_at': datetime.datetime.utcnow()
            } for i in range(1, 6)
        ],
        'created_at': datetime.datetime.utcnow()
    }

# Insert 20 sample venues
for i in range(20):
    venue_data = generate_sample_venue()
    insert_venue(venue_data)

print('Sample venues with comments inserted successfully!')

# db.venues.deleteMany({})