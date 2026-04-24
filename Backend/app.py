from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

app = Flask(__name__)
CORS(app)

# 🔹 root route (for browser test)
@app.route("/")
def home():
    return "Titan AI Backend is running 🚀"

@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()  # safer than request.json

    if not data or "message" not in data:
        return jsonify({"reply": "No message provided"}), 400

    user_message = data["message"]

    response = requests.post(
        "https://api.openai.com/v1/responses",
        headers={
            "Authorization": f"Bearer {OPENAI_API_KEY}",  # ✅ FIXED
            "Content-Type": "application/json",
        },
        json={
            "model": "gpt-4.1-mini",
            "input": user_message
        }
    )

    result = response.json()

    if "error" in result:
        reply = result["error"]["message"]
    else:
        reply = result.get("output_text", "No response from AI")

    return jsonify({"reply": reply})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 3000))  # ✅ Render fix
    app.run(host="0.0.0.0", port=port)
