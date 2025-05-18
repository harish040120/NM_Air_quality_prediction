import torch
import pandas as pd
from sklearn.preprocessing import StandardScaler, LabelEncoder
from datetime import datetime
import pickle
import os

# Define your model class
class MyModel(torch.nn.Module):
    def __init__(self):
        super(MyModel, self).__init__()
        self.linear = torch.nn.Linear(9, 1)  # Adjust architecture as needed
    
    def forward(self, x):
        return self.linear(x)

class ModelService:
    def __init__(self, model_path=None):
        self.model = None
        self.scaler = StandardScaler()
        self.label_encoders = {}
        
        if model_path:
            try:
                self.load_model(model_path)
                # Try to load scaler and encoders if available
                self.load_scaler_and_encoders()
            except Exception as e:
                print(f"Error loading model: {e}")
        
    def load_model(self, model_path):
        try:
            # Add MyModel to safe globals
            torch.serialization.add_safe_globals([MyModel])
            
            # Check if file exists
            if not os.path.exists(model_path):
                raise FileNotFoundError(f"Model file not found at {model_path}")
            
            # Load the model
            self.model = torch.load(model_path, map_location=torch.device('cpu'), weights_only=False)
            self.model.eval()  # Set to evaluation mode
            return self.model
        except Exception as e:
            print(f"Error in load_model: {e}")
            raise
    
    def load_scaler_and_encoders(self):
        """Load the scaler and label encoders used during training"""
        try:
            scaler_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "scaler.pkl")
            encoders_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "label_encoders.pkl")
            
            if os.path.exists(scaler_path):
                with open(scaler_path, 'rb') as f:
                    self.scaler = pickle.load(f)
            else:
                print(f"Warning: Scaler file not found at {scaler_path}")
                
            if os.path.exists(encoders_path):
                with open(encoders_path, 'rb') as f:
                    self.label_encoders = pickle.load(f)
            else:
                print(f"Warning: Label encoders file not found at {encoders_path}")
                # Initialize empty label encoders for common fields
                categorical_cols = ['location_id', 'location_name', 'parameter', 'unit']
                for col in categorical_cols:
                    self.label_encoders[col] = LabelEncoder()
                    
        except Exception as e:
            print(f"Warning: Could not load scaler/encoders: {e}")
    
    def preprocess_input(self, data):
        """Preprocess input data for the model"""
        try:
            # Extract features from input dictionary
            location_id = data.get('location_id', 'unknown')
            location_name = data.get('location_name', 'unknown')
            parameter = data.get('parameter', 'unknown')
            unit = data.get('unit', 'unknown')
            
            # Handle datetime in multiple possible formats
            datetime_utc_str = data.get('datetimeUTC', None) or data.get('datetime_utc', None)
            datetime_local_str = data.get('datetime_local', datetime_utc_str)
            
            # Try to parse datetime from common formats
            try:
                # Try ISO format (from frontend)
                datetime_utc = datetime.fromisoformat(datetime_utc_str.replace('Z', '+00:00'))
                datetime_local = datetime.fromisoformat(datetime_local_str.replace('Z', '+00:00'))
            except (ValueError, AttributeError):
                try:
                    # Try standard format
                    datetime_utc = datetime.strptime(datetime_utc_str, '%d-%m-%Y %H:%M')
                    datetime_local = datetime.strptime(datetime_local_str, '%d-%m-%Y %H:%M')
                except (ValueError, AttributeError):
                    # Fallback to current time
                    print("Warning: Could not parse datetime, using current time")
                    datetime_utc = datetime.utcnow()
                    datetime_local = datetime.now()
            
            # Parse numeric values
            try:
                latitude = float(data.get('latitude', 0))
                longitude = float(data.get('longitude', 0))
            except (ValueError, TypeError):
                print("Warning: Invalid latitude/longitude values, using 0")
                latitude = 0
                longitude = 0

            # Create a DataFrame with the single input
            input_data = {
                'location_id': [location_id],
                'location_name': [location_name],
                'parameter': [parameter],
                'unit': [unit],
                'datetimeUtc': [datetime_utc],
                'datetimeLocal': [datetime_local],
                'latitude': [latitude],
                'longitude': [longitude]
            }
            df = pd.DataFrame(input_data)

            # Feature Engineering: Create time features
            df['hour'] = df['datetimeUtc'].dt.hour
            df['day_of_week'] = df['datetimeUtc'].dt.dayofweek
            df['day_of_month'] = df['datetimeUtc'].dt.day
            df['month'] = df['datetimeUtc'].dt.month
            df['year'] = df['datetimeUtc'].dt.year
            df['is_weekend'] = df['day_of_week'].isin([5, 6]).astype(int)

            # Encode categorical features
            categorical_cols = ['location_id', 'location_name', 'parameter', 'unit']
            for col in categorical_cols:
                if col in df.columns:
                    # Check if we have an encoder for this column
                    if col in self.label_encoders:
                        try:
                            # Try to transform using existing encoder
                            df[col] = self.label_encoders[col].transform(df[col])
                        except ValueError:
                            # Handle unseen labels
                            print(f"Warning: Unseen label in '{col}': {df[col].iloc[0]}")
                            # Fit_transform would change the encoding of existing labels, which we don't want
                            # Instead, assign a default value for unknown labels
                            df[col] = -1  # Use a sentinel value for unknown categories
                    else:
                        # Create a new encoder if needed
                        self.label_encoders[col] = LabelEncoder()
                        df[col] = self.label_encoders[col].fit_transform(df[col])

            # Drop datetime columns which aren't used by the model
            df = df.drop(columns=['datetimeUtc', 'datetimeLocal'])
            
            # Scale the features
            try:
                df_scaled = self.scaler.transform(df)
            except (ValueError, AttributeError) as e:
                print(f"Warning: Error during scaling: {e}")
                # If scaling fails, just use the original data
                # This isn't ideal, but allows the model to run with approximate values
                df_scaled = df.values

            # Convert to tensor
            tensor_input = torch.tensor(df_scaled, dtype=torch.float32)
            return tensor_input
            
        except Exception as e:
            print(f"Error in preprocessing: {e}")
            # Return a tensor of zeros as fallback
            return torch.zeros((1, 9), dtype=torch.float32)
    
    def predict(self, data):
        """Make prediction using the loaded model"""
        try:
            if self.model is None:
                raise ValueError("Model not loaded")
                
            # Preprocess the input data
            processed_input = self.preprocess_input(data)
            
            # Use the model to make predictions
            with torch.no_grad():  # Disable gradient calculation for inference
                prediction = self.model(processed_input)
                
            # Convert to NumPy and reshape to a more usable format
            prediction_np = prediction.numpy()
            
            # Return the prediction as a dictionary with additional context
            result = {
                'value': float(prediction_np[0][0]), # Convert single value to Python float
                'unit': data.get('unit', 'unknown'),
                'parameter': data.get('parameter', 'unknown'),
                'timestamp': datetime.now().isoformat(),
                'location': data.get('location_name', 'unknown'),
                'coordinates': {
                    'latitude': data.get('latitude', 0),
                    'longitude': data.get('longitude', 0)
                }
            }
            return result
            
        except Exception as e:
            print(f"Error in prediction: {e}")
            # Return an error indicator
            raise