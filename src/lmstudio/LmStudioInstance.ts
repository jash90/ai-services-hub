import axios from "axios";
import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources";
import { promises as fs } from "fs";

export default class LmStudioInstance {
    private lmStudio: OpenAI;

    constructor(url: string) {
        this.lmStudio = new OpenAI({
            baseURL: `http://${url}/v1`,
            apiKey: "lm-studio",
        });
    }

    async chat(prompt: string, systemPrompt: string | null = null, model: string = "speakleash/Bielik-11B-v2.3-Instruct-GGUF"): Promise<string | null> {

        try {
            const messages = [
                { role: "user", content: prompt },
            ];

            if (systemPrompt) {
                messages.unshift({ role: "developer", content: systemPrompt });
            }

            const response = await this.lmStudio.chat.completions.create({
                model: model,
                messages: messages as ChatCompletionMessageParam[],
            });

            return response.choices[0].message.content;
        } catch (error) {
            console.error('Błąd podczas tworzenia embeddingu:', error);
            throw error;
        }
    }

    async models() {
        const response = await this.lmStudio.models.list();
        return response.data;
    }

    async embedding(text: string, model: string = "speakleash/Bielik-11B-v2.3-Instruct-GGUF"): Promise<number[]> {

        try {
            const response = await this.lmStudio.embeddings.create({
                model: model,
                input: text,
            });

            return response.data[0].embedding;
        } catch (error) {
            console.error('Błąd podczas tworzenia embeddingu:', error);
            throw error;
        }
    }

    async vision(prompt: string, filePath: string, systemPrompt: string, model: string = "speakleash/Bielik-11B-v2.3-Instruct-GGUF") {
        try {

    let base64Image = "";
    try {
      const imageBuffer = await fs.readFile(filePath.replace(/'/g, ""));
      base64Image = imageBuffer.toString("base64");
    } catch (error) {
      console.error("Couldn't read the image. Make sure the path is correct and the file exists.");
    }

    const messages = [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
           {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
              },
            },
        ],
      },
    ];

    if (systemPrompt) {
      messages.unshift({ role: "system", content: [{ type: "text", text: systemPrompt }] });
    }

    const completion = await this.lmStudio.chat.completions.create({
      model: model,
      messages: messages as ChatCompletionMessageParam[],
      max_tokens: 1000,
      stream: false,
    });

    return completion.choices[0].message.content;
        } catch (err) {
            console.error("An error occurred:", err);
        }
    }
}