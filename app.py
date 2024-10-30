from flask import Flask, jsonify, request, render_template
from flask_sqlalchemy import SQLAlchemy
from openai import OpenAI
import os
from dotenv import load_dotenv

# Initialize Flask app
app = Flask(__name__)
# Load environment variables from .env
load_dotenv()


# Initialize OpenAI client with API key from environment
api_key = os.getenv('OPENAI_API_KEY')
client = OpenAI(api_key=api_key)


# Serve the index.html using render_template
@app.route('/')
def home():
    return render_template('index.html')


# Route for AI-powered affirmation
@app.route('/generate-affirmation', methods=['POST'])
def generate_affirmation():
    data = request.get_json()
    anxiety_level = data.get('anxietyLevel', 5)  # Default to 5 if not provided
    
    # Prompt for OpenAI
    prompt = f"Generate a calming affirmation for someone with anxiety level {anxiety_level}/10."
    
    # Call to OpenAI API
    try:
        completion = client.chat.completions.create(
            model="gpt-3.5-turbo",  # or gpt-4o-mini if valid
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": prompt}
            ]
        )
        
        # Access the content properly via .message.content in the new client
        affirmation = completion.choices[0].message.content.strip()
        return jsonify({"affirmation": affirmation}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Set up the database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///anxiety.db'  # or use PostgreSQL for production
db = SQLAlchemy(app)

# Define an Anxiety model
class AnxietyLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    anxiety_level = db.Column(db.Integer, nullable=False)
    timestamp = db.Column(db.DateTime, default=db.func.current_timestamp())

# Route to log anxiety levels
@app.route('/log-anxiety', methods=['POST'])
def log_anxiety():
    data = request.get_json()
    anxiety_level = data.get('anxietyLevel')
    
    if anxiety_level is None:
        return jsonify({"message": "Anxiety level not provided"}), 400

    # Log anxiety level
    new_log = AnxietyLog(anxiety_level=anxiety_level)
    db.session.add(new_log)
    db.session.commit()

    return jsonify({"message": f"Anxiety level {anxiety_level}/10 logged successfully"}), 200

@app.route('/get-anxiety-data', methods=['GET'])
def get_anxiety_data():
    logs = AnxietyLog.query.order_by(AnxietyLog.timestamp).all()
    anxiety_data = [{"anxiety_level": log.anxiety_level, "timestamp": log.timestamp} for log in logs]
    return jsonify(anxiety_data), 200



# Run the app
if __name__ == '__main__':
    app.run(debug=True)


