import os
import pickle
from flask import Flask, render_template, request, redirect, url_for

app = Flask(__name__)

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'credit_card_model.pkl')

try:
    with open(MODEL_PATH, 'rb') as file:
        model = pickle.load(file)
except Exception as e:
    print(f"Warning: Model load failed: {e}")
    model = None

@app.route('/')
def home():
    return render_template('home.html')

@app.route('/predict', methods=['GET'])
def predict_form():
    return render_template('index.html')

@app.route('/get_prediction', methods=['POST'])
def get_prediction():
    if request.method == 'POST':
        try:
            form_data = request.form
            
            # Map the web form 300-850 score to a 0-30 scale for Total_Good_Debt
            raw_score = int(form_data.get('credit_score', 300))
            scaled_credit_score = ((raw_score - 300) / (850 - 300)) * 30.0

            # Arrange features in the exact sequence expected by the model
            features = [
                float(form_data.get('income', 0)),
                int(form_data.get('age', 0)),
                float(form_data.get('debt', 0)),
                float(scaled_credit_score),
            ]
            
            if model is not None:
                prediction = model.predict([features])[0]
                print(f"--- [SERVER DEBUG] Raw Model Output Code: {prediction} ---")
            else:
                prediction = 0 
            
            # ðŸ›‘ CORRECTED MAPPING BASED ON YOUR DATASET:
            # Your terminal sheet proved 1 = Approved (25k instances), 0 = Rejected (121 instances)
            if prediction == 1:
                result_text = "Approved"
            else:
                result_text = "Rejected"
            
            return render_template('result.html', prediction_result=result_text)
            
        except Exception as e:
            return f"An error occurred during prediction: {str(e)}", 400

    return redirect(url_for('predict_form'))

if __name__ == '__main__':
    app.run(debug=True)