from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)

OPENAI_API_KEY = "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"

@app.route("/chat", methods=["POST"])
def chat():
    data = request.json
    user_message = data.get("message")

    response = requests.post(
        "https://api.openai.com/v1/responses",
        headers={
            "Authorization": f"Bearer {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}",
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
    except:
        reply = "Error generating response"

    return jsonify({"reply": reply})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=3000, debug=True)