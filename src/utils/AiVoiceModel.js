const fs = require("fs");
const path = require("path");
const _output = path.resolve("../../public/output.mp3");

const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


// If we are using the OpenAI voice model
async function generateSpeech(text,res,req) {
    try {
          console.log("Speech synthesis initializing."+text);
  
          const mp3 = await openai.audio.speech.create({
                model: "tts-1",
                voice: "nova",
                input: text,
            });
      if (fs.existsSync(_output)) {
          fs.unlinkSync(_output);
      }
    
      const buffer = Buffer.from(await mp3.arrayBuffer());
      await fs.promises.writeFile(_output, buffer);
      console.log("Speech synthesis complete.");
      return true;
      
          
      } catch (error) {
          console.log("Speech synthesis failed.");
          console.error(error);
      }
  }

  module.exports = generateSpeech;