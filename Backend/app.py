from flask import Flask, request, jsonify
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

@app.route("/")
def home():
    return "Titan AI Backend Running 🚀"

@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    reply = f"You said: {msg}. I'm Titan AI 🤖"
    return jsonify({"reply": reply})

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
