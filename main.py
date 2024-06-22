from fastapi import FastAPI
from pydantic import BaseModel
import openai

app = FastAPI()

# Replace with your actual OpenAI API key
openai.api_key = ''

class ChatHistory(BaseModel):
    history: list

@app.post("/generate-reply/")
async def generate_reply(chat: ChatHistory):
    messages = chat.history
    prompt = generate_prompt(messages)
    
    try:
        response = openai.Completion.create(
            model="gpt-3.5-turbo-instruct",  # Adjust the model based on your needs
            prompt=prompt,
            max_tokens=150
        )
        return {"reply": response.choices[0].text.strip()}
    except Exception as e:
        return {"error": str(e)}

def generate_prompt(messages):
    chat_log = "\n".join([f"User: {m['user']}\nManager: {m['manager']}" for m in messages])
    prompt = f"{chat_log}\nManager:"
    return prompt

