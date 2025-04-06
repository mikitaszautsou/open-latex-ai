import { Injectable } from "@nestjs/common";
import { AssistantService } from "./assistant-service.interface";
import { ClaudeService } from "./claude.service";

type AIProvider = 'claude';

@Injectable()
export class AssistantFactoryService {

    private readonly assistantProvider: AssistantService;
    constructor(private readonly claudeService: ClaudeService) {
        this.assistantProvider = claudeService;
    }
    getService(provider?: AIProvider): AssistantService {
        return this.claudeService;
    }
}