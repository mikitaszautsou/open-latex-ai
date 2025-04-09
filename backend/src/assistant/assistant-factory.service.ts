import { Injectable } from "@nestjs/common";
import { AssistantService } from "./assistant-service.interface";
import { ClaudeService } from "./claude.service";
import { GeminiService } from "./gemini.service";

type AIProvider = 'claude' | 'gemini';

@Injectable()
export class AssistantFactoryService {

    private readonly assistantProvider: AssistantService;
    constructor(
        private readonly claudeService: ClaudeService,
        private readonly geminiService: GeminiService
    ) {
    }
    getService(provider: AIProvider = 'gemini'): AssistantService {
        switch (provider) {
            case 'gemini':
                return this.geminiService;
            case 'claude':
            default:
                return this.claudeService;
        }
    }
}