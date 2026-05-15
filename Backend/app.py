from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
from dotenv import load_dotenv

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

app = Flask(__name__)
CORS(app)

@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.json
        user_message = data.get("message")

        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": "openai/gpt-4.1-mini",
                "messages": [
                    {
                        "role": "user",
                        "content": user_message
                    }
                ],
                "max_tokens": 300
            }
        )

        result = response.json()

        reply = result["choices"][0]["message"]["content"]

        return jsonify({"reply": reply})
        
    except Exception as e:
        print("ERROR:", e)
        return jsonify({
            "reply": f"Error generating response: {str(e)}"
        })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=3000)