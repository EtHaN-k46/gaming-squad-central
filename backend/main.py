from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
import openai
import shutil
import os
from transformers import pipeline

# Configure your OpenAI API key
openai.api_key = os.environ.get("OPENAI_API_KEY")

app = FastAPI()

# Initialize the summarization pipeline
summarizer = pipeline("summarization")

@app.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    if not file:
        return JSONResponse(content={"error": "No file uploaded"}, status_code=400)

    # Save the uploaded file temporarily
    file_path = f"temp_{file.filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        # Transcribe the audio using OpenAI Whisper
        with open(file_path, "rb") as audio_file:
            transcript = openai.Audio.transcribe("whisper-1", audio_file)

        # Summarize the transcript
        summary = summarizer(transcript["text"], max_length=150, min_length=30, do_sample=False)

        return JSONResponse(content={"transcript": transcript["text"], "summary": summary[0]["summary_text"]})
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)
    finally:
        # Clean up the temporary file
        if os.path.exists(file_path):
            os.remove(file_path)

@app.post("/summarize")
async def summarize_text(text: str):
    if not text:
        return JSONResponse(content={"error": "No text provided"}, status_code=400)

    try:
        # Summarize the text
        summary = summarizer(text, max_length=150, min_length=30, do_sample=False)

        return JSONResponse(content={"summary": summary[0]["summary_text"]})
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
