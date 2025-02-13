from flask import Flask, jsonify, request, send_from_directory
from flask_sqlalchemy import SQLAlchemy
import openai
import os
from dotenv import load_dotenv
import boto3
from flask import send_file
import logging


# Initialize Flask app
app = Flask(__name__, static_url_path='/public', static_folder='public')
# Load environment variables from .env
load_dotenv()

# Add MIME type handling
@app.route('/public/<path:filename>')
def serve_static(filename):
    mime_types = {
        '.jsx': 'text/babel',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.html': 'text/html'
    }
    file_ext = os.path.splitext(filename)[1]
    mimetype = mime_types.get(file_ext, None)
    return send_from_directory('public', filename, mimetype=mimetype)


#set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)


# Initialize OpenAI client with API key from environment
api_key = os.getenv('OPENAI_API_KEY')
client = openai.OpenAI(api_key=api_key)





# Initialize AWS Polly client using credentials from environment variables
# polly_client = boto3.Session().client('polly', 
#     region_name=os.getenv('AWS_DEFAULT_REGION'),
#     aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
#     aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY')
# )



# Route for generating custom voice for breathing exercise
# @app.route('/breathing-voice', methods=['GET'])
# def get_breathing_voice():
#     instruction = request.args.get('instruction')  # e.g., "Inhale", "Hold", "Exhale"
    
    # Call AWS Polly to synthesize speech
    # response = polly_client.synthesize_speech(
    #     Text=instruction,
    #     OutputFormat="mp3",
    #     VoiceId="Joanna"  # You can choose other voices
    # )

    # Save the audio to a file
    # with open('breathing_instruction.mp3', 'wb') as f:
    #     f.write(response['AudioStream'].read())

    # Send the audio file to the frontend
    # return send_file('breathing_instruction.mp3', mimetype='audio/mpeg')



# Database configuration and initialization
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///anxiety.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Define the AnxietyLog model
class AnxietyLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    anxiety_level = db.Column(db.Integer, nullable=False)
    timestamp = db.Column(db.DateTime, default=db.func.current_timestamp())

# Create the database tables if they don't exist
with app.app_context():
    db.create_all()

# Serve the index.html using send_from_directory
@app.route('/')
def home():
    try:
        app.logger.info('Serving index.html')
        return send_from_directory(os.path.dirname(os.path.abspath(__file__)), 'index.html')
    except Exception as e:
        app.logger.error(f'Error serving index.html: {str(e)}')
        return jsonify({"error": str(e)}), 500

# Route for AI-powered affirmation
@app.route('/generate-affirmation', methods=['POST'])
def generate_affirmation():
    try:
        app.logger.info('Received affirmation request')
        data = request.get_json()
        anxiety_level = data.get('anxietyLevel', 5)
        
        completion = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a compassionate assistant specializing in anxiety management."},
                {"role": "user", "content": f"Generate a calming affirmation for someone with anxiety level {anxiety_level}/10."}
            ]
        )
        
        affirmation = completion.choices[0].message.content.strip()
        app.logger.info(f'Generated affirmation: {affirmation}')
        return jsonify({"affirmation": affirmation}), 200
    except Exception as e:
        app.logger.error(f'Error generating affirmation: {str(e)}')
        return jsonify({"error": str(e)}), 500

# Route to log anxiety levels
@app.route('/log-anxiety', methods=['POST'])
def log_anxiety():
    data = request.get_json()
    anxiety_level = data.get('anxietyLevel')
    
    if anxiety_level is None:
        return jsonify({"message": "Anxiety level not provided"}), 400

    try:
        new_log = AnxietyLog(anxiety_level=anxiety_level)
        db.session.add(new_log)
        db.session.commit()
        return jsonify({"message": f"Anxiety level {anxiety_level}/10 logged successfully"}), 200
    except Exception as e:
        app.logger.error(f'Error logging anxiety: {str(e)}')
        return jsonify({"error": "Internal server error"}), 500

# Route to retrieve anxiety data from the database
@app.route('/get-anxiety-data', methods=['GET'])
def get_anxiety_data():
    try:
        logs = AnxietyLog.query.order_by(AnxietyLog.timestamp).all()
        anxiety_data = [{
            "anxiety_level": log.anxiety_level,
            "timestamp": log.timestamp.isoformat()
        } for log in logs]
        return jsonify(anxiety_data), 200
    except Exception as e:
        app.logger.error(f'Error fetching anxiety data: {str(e)}')
        return jsonify({"error": str(e)}), 500

# Run the app
if __name__ == '__main__':
    app.run(debug=True)