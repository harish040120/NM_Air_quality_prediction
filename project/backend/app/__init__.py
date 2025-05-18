from flask import Flask
from .model_service import ModelService  # Import the class

# Create instance of ModelService for access across the application
model_service_instance = None

def create_app():
    app = Flask(__name__)
    
    # Load configuration
    app.config['MODEL_PATH'] = "H:/Naan Mudalvan/project/backend/model/model.pt" 
    
    # Initialize model service
    global model_service_instance
    try:
        model_service_instance = ModelService(app.config['MODEL_PATH'])
    except Exception as e:
        print(f"Error initializing model service: {e}")
        model_service_instance = ModelService()  # Initialize with no model
    
    # Register blueprints
    from .routes import routes as routes_blueprint
    app.register_blueprint(routes_blueprint)
    
    return app