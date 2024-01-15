from flask_cors import CORS
from flask import Flask
from pymongo import MongoClient

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

# ADD USER DETAILS TO USER
# @app.route('/api/v1.0/user/<string:id>', methods=['POST'])


@app.route('/api/v1.0/test', methods=['GET'])
def testConnection():
    return "200"

if __name__ == '__main__':
    app.run(debug=True)

