from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os

app = Flask(__name__)
CORS(app)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

@app.route("/chat", methods=["POST"])
def chat():
    data = request.json
    user_message = data.get("message")

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"

    response = requests.post(
        url,
        headers={
            "Content-Type": "application/json"
        },
        json={
            "contents": [
                {
                    "parts": [
                        {"text": user_message}
                    ]
                }
            ]
        }
    )

    result = response.json()

    if "error" in result:
        reply = result["error"]["message"]
    elif "candidates" in result and len(result["candidates"]) > 0:
        reply = result["candidates"][0]["content"]["parts"][0].get("text", "No text response")
    else:
        reply = "No response from Gemini"

    return jsonify({"reply": reply})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=3000)
