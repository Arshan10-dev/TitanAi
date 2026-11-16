from flask import Flask, request, jsonify
from flask_cors import CORS
from google import genai
from google.genai import types
import os
import time
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

app = Flask(__name__)
CORS(app)

client = genai.Client(api_key=GEMINI_API_KEY)


@app.route("/chat", methods=["POST"])
def chat():
    start_time = time.time()

    try:
        data = request.json or {}
        messages = data.get("messages", [])

        if not messages:
            return jsonify({"reply": "Please enter a message."}), 400

        system_messages = [
            msg["content"]
            for msg in messages
            if msg.get("role") == "system"
        ]

        system_instruction = "\n".join(system_messages)

        contents = []

        for msg in messages:
            role = msg.get("role")
            content = msg.get("content", "")

            if not content.strip() or role == "system":
                continue

            if role == "assistant":
                role = "model"

            if role in ["user", "model"]:
                contents.append({
                    "role": role,
                    "parts": [{"text": content}]
                })

        print("REQUEST RECEIVED")
        print("Generating Gemini response...")

        response = client.models.generate_content(
            model="gemini-3.5-flash-lite",
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction or None,
                max_output_tokens=300,
                temperature=0.7
            )
        )

        reply = response.text

        if not reply:
            raise Exception("Gemini returned an empty response.")

        print("GEMINI RESPONSE RECEIVED")
        print("TIME TAKEN:", round(time.time() - start_time, 2), "seconds")

        return jsonify({"reply": reply})

    except Exception as e:
        print("GEMINI ERROR:", str(e))
        print("TIME TAKEN:", round(time.time() - start_time, 2), "seconds")

        return jsonify({
            "reply": "Titan AI is temporarily unavailable. Please try again."
        }), 500


@app.route("/")
def home():
    return "Titan AI Gemini Backend Running"


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=3000)