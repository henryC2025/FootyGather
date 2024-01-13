from flask_cors import CORS
from flask import Flask
from pymongo import MongoClient

app = Flask(__name__)
CORS(app)

client = MongoClient('mongodb://127.0.0.1:27017')
db = client['footyGatherDB']  
# collection = db['video_games']  
# users = db['users']
# blacklist = db['blacklist']

@app.route('/')
def hello_world():
    return 'Hello, World!'

# @app.route('/api/v1.0/auth', methods=['POST'])
# def authUser():

if __name__ == '__main__':
    app.run(debug=True)

