from flask import Flask
from routes.api import api_routes
from configs import DevelopmentConfig
from flask_cors import CORS
from dotenv import load_dotenv
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

app.config.from_object(DevelopmentConfig)

CORS(app, resources={r"/*": {"origins": "*"}})


# Register all routes
app.register_blueprint(api_routes,url_prefix="/api")

# Run the application
if __name__ == "__main__":
    app.run(debug=True)
