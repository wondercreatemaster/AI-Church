/**
 * Type definitions for OpenAI Real-Time Voice Chat
 */

// WebRTC Connection States
export type ConnectionState = 
  | "disconnected"
  | "connecting"
  | "connected"
  | "failed"
  | "closed";

// Voice Chat States
export type VoiceChatState = {
  isConnected: boolean;
  isConnecting: boolean;
  isListening: boolean; // User is speaking
  isSpeaking: boolean; // AI is speaking
  isSearching: boolean; // Searching documents
  isMuted: boolean;
  error: string | null;
};

// Transcript Message
export interface TranscriptMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  sources?: string[];
}

// OpenAI Real-Time Session Configuration
export interface RealtimeSessionConfig {
  modalities: readonly ["text", "audio"];
  instructions: string;
  voice: string;
  input_audio_format: string;
  output_audio_format: string;
  input_audio_transcription?: {
    model: string;
  };
  turn_detection?: {
    type: "server_vad";
    threshold: number;
    prefix_padding_ms: number;
    silence_duration_ms: number;
    create_response: boolean;
  };
  tools?: Array<{
    type: "function";
    name: string;
    description: string;
    parameters: {
      type: string;
      properties: Record<string, any>;
      required: string[];
    };
  }>;
  tool_choice?: "auto" | "none" | "required";
  temperature?: number;
  max_response_output_tokens?: number;
}

// OpenAI Real-Time Event Base
export interface RealtimeEventBase {
  type: string;
  event_id?: string;
}

// Session Events
export interface SessionUpdateEvent extends RealtimeEventBase {
  type: "session.update";
  session: Partial<RealtimeSessionConfig>;
}

export interface SessionUpdatedEvent extends RealtimeEventBase {
  type: "session.updated";
  session: RealtimeSessionConfig;
}

// Input Audio Events
export interface InputAudioBufferAppendEvent extends RealtimeEventBase {
  type: "input_audio_buffer.append";
  audio: string; // Base64 encoded audio
}

export interface InputAudioBufferCommitEvent extends RealtimeEventBase {
  type: "input_audio_buffer.commit";
}

export interface InputAudioBufferClearEvent extends RealtimeEventBase {
  type: "input_audio_buffer.clear";
}

export interface InputAudioBufferSpeechStartedEvent extends RealtimeEventBase {
  type: "input_audio_buffer.speech_started";
  audio_start_ms: number;
  item_id: string;
}

export interface InputAudioBufferSpeechStoppedEvent extends RealtimeEventBase {
  type: "input_audio_buffer.speech_stopped";
  audio_end_ms: number;
  item_id: string;
}

// Transcription Events
export interface InputAudioTranscriptionCompletedEvent extends RealtimeEventBase {
  type: "conversation.item.input_audio_transcription.completed";
  item_id: string;
  content_index: number;
  transcript: string;
}

export interface InputAudioTranscriptionFailedEvent extends RealtimeEventBase {
  type: "conversation.item.input_audio_transcription.failed";
  item_id: string;
  content_index: number;
  error: {
    type: string;
    code: string;
    message: string;
  };
}

// Response Events
export interface ResponseCreateEvent extends RealtimeEventBase {
  type: "response.create";
  response?: {
    modalities?: string[];
    instructions?: string;
    voice?: string;
    output_audio_format?: string;
    tools?: any[];
    tool_choice?: string;
    temperature?: number;
    max_output_tokens?: number;
  };
}

export interface ResponseCancelEvent extends RealtimeEventBase {
  type: "response.cancel";
}

export interface ResponseDoneEvent extends RealtimeEventBase {
  type: "response.done";
  response: {
    id: string;
    status: string;
    status_details?: any;
    output: any[];
    usage?: {
      total_tokens: number;
      input_tokens: number;
      output_tokens: number;
    };
  };
}

export interface ResponseAudioStartedEvent extends RealtimeEventBase {
  type: "response.audio.started";
  response_id: string;
  item_id: string;
  output_index: number;
  content_index: number;
}

export interface ResponseAudioDeltaEvent extends RealtimeEventBase {
  type: "response.audio.delta";
  response_id: string;
  item_id: string;
  output_index: number;
  content_index: number;
  delta: string; // Base64 encoded audio chunk
}

export interface ResponseAudioDoneEvent extends RealtimeEventBase {
  type: "response.audio.done";
  response_id: string;
  item_id: string;
  output_index: number;
  content_index: number;
}

export interface ResponseAudioTranscriptDeltaEvent extends RealtimeEventBase {
  type: "response.audio_transcript.delta";
  response_id: string;
  item_id: string;
  output_index: number;
  content_index: number;
  delta: string;
}

export interface ResponseAudioTranscriptDoneEvent extends RealtimeEventBase {
  type: "response.audio_transcript.done";
  response_id: string;
  item_id: string;
  output_index: number;
  content_index: number;
  transcript: string;
}

// Function Calling Events
export interface ResponseFunctionCallArgumentsDeltaEvent extends RealtimeEventBase {
  type: "response.function_call_arguments.delta";
  response_id: string;
  item_id: string;
  output_index: number;
  call_id: string;
  delta: string;
}

export interface ResponseFunctionCallArgumentsDoneEvent extends RealtimeEventBase {
  type: "response.function_call_arguments.done";
  response_id: string;
  item_id: string;
  output_index: number;
  call_id: string;
  name: string;
  arguments: string; // JSON string
}

// Conversation Item Events
export interface ConversationItemCreateEvent extends RealtimeEventBase {
  type: "conversation.item.create";
  item: {
    type: "function_call_output";
    call_id: string;
    output: string;
  };
}

export interface ConversationItemCreatedEvent extends RealtimeEventBase {
  type: "conversation.item.created";
  item: any;
}

// Error Event
export interface ErrorEvent extends RealtimeEventBase {
  type: "error";
  error: {
    type: string;
    code: string;
    message: string;
    param?: string;
    event_id?: string;
  };
}

// Union of all event types
export type RealtimeEvent =
  | SessionUpdateEvent
  | SessionUpdatedEvent
  | InputAudioBufferAppendEvent
  | InputAudioBufferCommitEvent
  | InputAudioBufferClearEvent
  | InputAudioBufferSpeechStartedEvent
  | InputAudioBufferSpeechStoppedEvent
  | InputAudioTranscriptionCompletedEvent
  | InputAudioTranscriptionFailedEvent
  | ResponseCreateEvent
  | ResponseCancelEvent
  | ResponseDoneEvent
  | ResponseAudioStartedEvent
  | ResponseAudioDeltaEvent
  | ResponseAudioDoneEvent
  | ResponseAudioTranscriptDeltaEvent
  | ResponseAudioTranscriptDoneEvent
  | ResponseFunctionCallArgumentsDeltaEvent
  | ResponseFunctionCallArgumentsDoneEvent
  | ConversationItemCreateEvent
  | ConversationItemCreatedEvent
  | ErrorEvent;

// Voice Session Token Response
export interface VoiceSessionTokenResponse {
  token: string;
  expiresAt?: string;
}

// Voice Search Response
export interface VoiceSearchResponse {
  success: boolean;
  result: string;
  sources: string[];
  documentsFound: number;
  error?: string;
}

