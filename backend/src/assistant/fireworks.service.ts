import { Injectable } from "@nestjs/common";
import { FireworksAI } from "@fireworksai/sdk";
import { Readable } from "stream";
import { BaseAssistantService, Message } from "./assistant-service.interface";

@Injectable()
export class FireworksAIService extends BaseAssistantService {

    private fireworksAI: FireworksAI;

    constructor() {
        super();
        this.fireworksAI = new FireworksAI({
            apiKey: process.env.FIREWORKS_API_KEY,
        });
    }

    async generateResponseStream(messages: Message[], model?: string): Promise<AsyncIterable<string>> {
        const completion = await this.fireworksAI.chat.completions.create({
            messages: messages.map(m => ({ role: m.role === 'ASSISTANT' ? 'assistant' : 'user', content: m.content })),
            // messages: [{ role: 'user', content: 'in react how can i use destructor in useEffect but my effect is async'}],
            model: "accounts/fireworks/models/deepseek-v3-0324",
            stream: true,
            maxTokens: 1000000

        });
        // in react how can i use destructor in useEffect but my effect is async
        return {
            [Symbol.asyncIterator]: async function* () {
                for await (const chunk of completion) {
                    const content = chunk.data.choices[0]?.delta?.content || '';
                    yield content;
                }
            }
        };
    }

}