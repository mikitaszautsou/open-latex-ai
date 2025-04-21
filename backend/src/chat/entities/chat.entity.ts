import { Message } from "src/message/entities/message.entity";

export interface Chat {
    id: string
    title: string
    emoji?: string | null
    provider: string
    model: string
  }