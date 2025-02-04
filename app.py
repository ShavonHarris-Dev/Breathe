from flask import Flask, jsonify, request, send_from_directory
# from flask_sqlalchemy import SQLAlchemy
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


# Set up the database
# app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///anxiety.db'  # or use PostgreSQL for production
# db = SQLAlchemy(app)

# Define an Anxiety model
# class AnxietyLog(db.Model):
#     id = db.Column(db.Integer, primary_key=True)
#     anxiety_level = db.Column(db.Integer, nullable=False)
#     timestamp = db.Column(db.DateTime, default=db.func.current_timestamp())

# Route to log anxiety levels
# @app.route('/log-anxiety', methods=['POST'])
# def log_anxiety():
#     data = request.get_json()
#     anxiety_level = data.get('anxietyLevel')
    
#     if anxiety_level is None:
#         return jsonify({"message": "Anxiety level not provided"}), 400

#     # Log anxiety level
#     new_log = AnxietyLog(anxiety_level=anxiety_level)
#     db.session.add(new_log)
#     db.session.commit()

#     return jsonify({"message": f"Anxiety level {anxiety_level}/10 logged successfully"}), 200

# @app.route('/get-anxiety-data', methods=['GET'])
# def get_anxiety_data():
#     app.logger.info('Received request for anxiety data')
#     try:
#         logs = AnxietyLog.query.order_by(AnxietyLog.timestamp).all()
#         anxiety_data = [{"anxiety_level": log.anxiety_level, "timestamp": log.timestamp} for log in logs]
#         return jsonify(anxiety_data), 200
#     except Exception as e:
#         app.logger.error(f'Error fetching anxiety data: {str(e)}')
        #  return jsonify({"error": str(e)}), 500

@app.route('/get-anxiety-data', methods=['GET'])
def get_anxiety_data():
    # Example data. Replace with real data from your database.
    data = [
        {"anxiety_level": 5, "timestamp": "2025-02-03T17:30:00Z"},
        {"anxiety_level": 4, "timestamp": "2025-02-03T18:00:00Z"}
    ]
    return jsonify(data)





# Run the app
if __name__ == '__main__':
    app.run(debug=True)


