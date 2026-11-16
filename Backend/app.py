from flask import Flask, request, jsonify
from flask_cors import CORS
from google import genai
from google.genai import types
import os
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

app = Flask(__name__)
CORS(app)

client = genai.Client(api_key=GEMINI_API_KEY)


@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.json
        messages = data.get("messages", [])

        # Separate system instructions
        system_messages = [
            msg["content"]
            for msg in messages
            if msg["role"] == "system"
        ]

        system_instruction = "\n".join(system_messages)

        # Convert conversation history
        contents = []

        for msg in messages:
            role = msg.get("role")
            content = msg.get("content", "")

            if role == "system":
                continue

            if role == "assistant":
                role = "model"

            if role in ["user", "model"]:
                contents.append({
                    "role": role,
                    "parts": [{"text": content}]
                })

        response = client.models.generate_content(
            model="gemini-3.7-flash",
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction or None,
                max_output_tokens=500,
                temperature=0.7
            )
        )

        reply = response.text

        return jsonify({
            "reply": reply
        })

    except Exception as e:
        print("GEMINI ERROR:", str(e))

        return jsonify({
            "reply": f"Error generating response: {str(e)}"
        }), 500


@app.route("/")
def home():
    return "Titan AI Gemini Backend Running"


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=3000)