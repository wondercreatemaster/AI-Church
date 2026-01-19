/**
 * OpenAI Real-Time API Configuration
 * Settings for WebRTC voice chat with function calling
 */

// Real-time API configuration
export const REALTIME_CONFIG = {
  // Model for real-time voice
  model: "gpt-4o-realtime-preview-2024-12-17",
  
  // Voice selection
  voice: "ash", // Options: alloy, echo, shimmer
  
  // Audio format settings
  audio: {
    inputFormat: "pcm16",
    outputFormat: "pcm16",
    sampleRate: 24000, // 24kHz for optimal quality
    channels: 1, // Mono
  },
  
  // Voice Activity Detection (VAD) settings
  turnDetection: {
    type: "server_vad" as const,
    threshold: 0.7, // Higher = less sensitive (0.0 to 1.0)
    prefix_padding_ms: 500, // Audio before speech starts
    silence_duration_ms: 1200, // Silence duration to end turn
    create_response: true, // Auto-generate responses
  },
  
  // Modalities
  modalities: ["text", "audio"] as const,
  
  // Input audio transcription
  inputAudioTranscription: {
    model: "whisper-1",
  },
} as const;

/**
 * Function definition for searching Orthodox documents
 * This will be called by OpenAI when user asks questions requiring sources
 */
export const SEARCH_ORTHODOX_DOCUMENTS_FUNCTION = {
  type: "function" as const,
  name: "search_orthodox_documents",
  description: "Search the Orthodox Christian document database for information from Church Fathers, Ecumenical Councils, liturgical texts, and theological sources. Use this when the user asks about specific Orthodox teachings, historical documents, Church Father writings, or theological concepts that would benefit from authoritative sources.",
  parameters: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "The theological or historical query to search for in Orthodox documents. Be specific and include key terms (e.g., 'St. John Chrysostom on icons', 'Church Fathers on the Trinity', 'Ecumenical Councils on the Filioque'). The query should capture what the user is asking about from an Orthodox perspective.",
      },
    },
    required: ["query"],
  },
};

/**
 * Get session configuration for OpenAI Real-Time API
 */
export function getRealtimeSessionConfig(instructions: string) {
  return {
    modalities: REALTIME_CONFIG.modalities,
    instructions,
    voice: REALTIME_CONFIG.voice,
    input_audio_format: REALTIME_CONFIG.audio.inputFormat,
    output_audio_format: REALTIME_CONFIG.audio.outputFormat,
    input_audio_transcription: REALTIME_CONFIG.inputAudioTranscription,
    turn_detection: {
      type: REALTIME_CONFIG.turnDetection.type,
      threshold: REALTIME_CONFIG.turnDetection.threshold,
      prefix_padding_ms: REALTIME_CONFIG.turnDetection.prefix_padding_ms,
      silence_duration_ms: REALTIME_CONFIG.turnDetection.silence_duration_ms,
      create_response: REALTIME_CONFIG.turnDetection.create_response,
    },
    tools: [SEARCH_ORTHODOX_DOCUMENTS_FUNCTION],
    tool_choice: "auto" as const,
    temperature: 0.8, // Slightly higher for more natural conversation
    max_response_output_tokens: 1000, // Keep responses concise for voice
  };
}

/**
 * WebRTC configuration for connecting to OpenAI
 */
export const WEBRTC_CONFIG = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302",
    },
  ],
};

/**
 * Audio constraints for microphone input
 */
export const AUDIO_CONSTRAINTS = {
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    sampleRate: REALTIME_CONFIG.audio.sampleRate,
    channelCount: REALTIME_CONFIG.audio.channels,
  },
  video: false,
};

/**
 * Data channel name for OpenAI events
 */
export const DATA_CHANNEL_NAME = "oai-events";

/**
 * OpenAI Real-Time event types
 */
export const REALTIME_EVENTS = {
  // Session events
  SESSION_UPDATE: "session.update",
  SESSION_UPDATED: "session.updated",
  
  // Input audio events
  INPUT_AUDIO_BUFFER_APPEND: "input_audio_buffer.append",
  INPUT_AUDIO_BUFFER_COMMIT: "input_audio_buffer.commit",
  INPUT_AUDIO_BUFFER_CLEAR: "input_audio_buffer.clear",
  INPUT_AUDIO_BUFFER_SPEECH_STARTED: "input_audio_buffer.speech_started",
  INPUT_AUDIO_BUFFER_SPEECH_STOPPED: "input_audio_buffer.speech_stopped",
  
  // Transcription events
  INPUT_AUDIO_TRANSCRIPTION_COMPLETED: "conversation.item.input_audio_transcription.completed",
  INPUT_AUDIO_TRANSCRIPTION_FAILED: "conversation.item.input_audio_transcription.failed",
  
  // Response events
  RESPONSE_CREATE: "response.create",
  RESPONSE_CANCEL: "response.cancel",
  RESPONSE_DONE: "response.done",
  RESPONSE_AUDIO_STARTED: "response.audio.started",
  RESPONSE_AUDIO_DELTA: "response.audio.delta",
  RESPONSE_AUDIO_DONE: "response.audio.done",
  RESPONSE_AUDIO_TRANSCRIPT_DELTA: "response.audio_transcript.delta",
  RESPONSE_AUDIO_TRANSCRIPT_DONE: "response.audio_transcript.done",
  RESPONSE_OUTPUT_ITEM_ADDED: "response.output_item.added",
  RESPONSE_CONTENT_PART_ADDED: "response.content_part.added",
  RESPONSE_CONTENT_PART_DONE: "response.content_part.done",
  OUTPUT_AUDIO_BUFFER_STARTED: "output_audio_buffer.started",
  OUTPUT_AUDIO_BUFFER_STOPPED: "output_audio_buffer.stopped",
  RATE_LIMITS_UPDATED: "rate_limits.updated",
  
  // Function calling events
  RESPONSE_FUNCTION_CALL_ARGUMENTS_DELTA: "response.function_call_arguments.delta",
  RESPONSE_FUNCTION_CALL_ARGUMENTS_DONE: "response.function_call_arguments.done",
  
  // Conversation events
  CONVERSATION_ITEM_CREATE: "conversation.item.create",
  CONVERSATION_ITEM_CREATED: "conversation.item.created",
  
  // Error events
  ERROR: "error",
} as const;

export type RealtimeEvent = typeof REALTIME_EVENTS[keyof typeof REALTIME_EVENTS];

