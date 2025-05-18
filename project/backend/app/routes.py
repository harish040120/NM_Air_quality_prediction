from flask import Blueprint, request, jsonify
from app import model_service_instance  # Import the instance, not the module

routes = Blueprint('routes', __name__)

@routes.route('/api/predict', methods=['POST'])
def predict_endpoint():
    data = request.json
    
    # Validate input
    required_fields = ['location_id', 'parameter', 'unit', 'latitude', 'longitude', 'datetimeUTC']
    if not data or not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing or invalid required parameters'}), 400
    
    # Check if model_service is properly initialized
    if not model_service_instance or not hasattr(model_service_instance, 'model') or model_service_instance.model is None:
        return jsonify({'error': 'Model not loaded correctly'}), 500
    
    # Make prediction
    try:
        prediction_result = model_service_instance.predict(data) 
        return jsonify({'success': True, 'prediction': prediction_result.tolist()}), 200
    except Exception as e:
        print(f"Error during prediction: {e}") 
        return jsonify({'error': str(e)}), 500
    
@routes.route('/', methods=['GET'])
def index():
    return jsonify({
        'status': 'online',
        'app_name': 'Air Quality Prediction API',
        'endpoints': {
            '/api/predict': 'POST - Make predictions with the model',
        },
        'documentation': 'Send a POST request to /api/predict with JSON data containing location_id, parameter, unit, latitude, longitude, and datetimeUTC'
    })

@routes.route('/health', methods=['GET'])
def health_check():
    if model_service_instance and hasattr(model_service_instance, 'model') and model_service_instance.model:
        return jsonify({'status': 'healthy', 'model_loaded': True})
    else:
        return jsonify({'status': 'unhealthy', 'model_loaded': False}), 503