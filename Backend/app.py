from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
from dotenv import load_dotenv
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

app = Flask(__name__)
CORS(app)

@app.route("/chat", methods=["POST"])
def chat():
    data = request.json
    user_message = data.get("message")

    response = requests.post(
        "https://api.openai.com/v1/responses",
        headers={
            "Authorization": f"Bearer {OPENAI_API_KEY}",
            "Content-Type": "application/json",
        },
        json={
            "model": "gpt-4.1-mini",
            "input": user_message
        }
    )

    result = response.json()

    try:
        reply = result["output"][0]["content"][0]["text"]
        return jsonify({"reply": reply})

    except Exception as e:
        print("ERROR:", e)
        print(result)

        return jsonify({
            "reply": f"Error generating response: {str(e)}"
        })