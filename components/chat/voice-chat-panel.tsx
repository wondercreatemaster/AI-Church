"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Loader2, 
  AlertCircle,
  CheckCircle,
  Phone,
  PhoneOff
} from "lucide-react";
import { toast } from "sonner";
import { generateVoiceSystemPrompt } from "@/lib/prompts/voice-prompts";
import { 
  WEBRTC_CONFIG, 
  AUDIO_CONSTRAINTS, 
  DATA_CHANNEL_NAME, 
  getRealtimeSessionConfig,
  REALTIME_EVENTS 
} from "@/lib/openai/realtime-config";
import type { 
  TranscriptMessage, 
  VoiceChatState, 
  RealtimeEvent,
  VoiceSessionTokenResponse,
  VoiceSearchResponse,
  ResponseFunctionCallArgumentsDoneEvent,
  InputAudioTranscriptionCompletedEvent,
  ResponseAudioTranscriptDoneEvent,
  ResponseAudioTranscriptDeltaEvent
} from "@/types/voice";
import { ConversationStage } from "@/lib/db/models/conversation";

interface VoiceChatPanelProps {
  conversationId: string | null;
  userBelief?: string;
  stage: ConversationStage;
  onTranscriptMessage?: (message: { role: "user" | "assistant"; content: string }) => void;
}

export function VoiceChatPanel({
  conversationId,
  userBelief,
  stage,
  onTranscriptMessage,
}: VoiceChatPanelProps) {
  // State
  const [state, setState] = useState<VoiceChatState>({
    isConnected: false,
    isConnecting: false,
    isListening: false,
    isSpeaking: false,
    isSearching: false,
    isMuted: false,
    error: null,
  });
  const [messages, setMessages] = useState<TranscriptMessage[]>([]);

  // Refs
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const searchAudioRef = useRef<HTMLAudioElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentAssistantMessageRef = useRef<string>("");
  const currentAssistantIdRef = useRef<string>("");
  const audioContextRef = useRef<AudioContext | null>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  // Cleanup function
  const cleanup = useCallback(() => {
    console.log("Cleaning up voice chat...");

    // Stop all audio tracks
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => track.stop());
      audioStreamRef.current = null;
    }

    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Close data channel
    if (dataChannelRef.current) {
      dataChannelRef.current.close();
      dataChannelRef.current = null;
    }

    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    // Pause search audio
    if (searchAudioRef.current) {
      searchAudioRef.current.pause();
    }

    setState({
      isConnected: false,
      isConnecting: false,
      isListening: false,
      isSpeaking: false,
      isSearching: false,
      isMuted: false,
      error: null,
    });
  }, []);

  // Send data channel message
  const sendDataChannelMessage = useCallback((message: any) => {
    if (dataChannelRef.current && dataChannelRef.current.readyState === "open") {
      const messageStr = JSON.stringify(message);
      console.log("Sending:", message.type);
      dataChannelRef.current.send(messageStr);
    } else {
      console.warn("Data channel not open, cannot send:", message.type);
    }
  }, []);

  // Handle function call for document search
  const handleFunctionCall = useCallback(async (event: ResponseFunctionCallArgumentsDoneEvent) => {
    console.log("Function call:", event.name);
    
    if (event.name === "search_orthodox_documents") {
      try {
        const args = JSON.parse(event.arguments);
        console.log("Searching for:", args.query);

        // Update state to show searching
        setState(prev => ({ ...prev, isSearching: true }));

        // Play search audio if available
        if (searchAudioRef.current) {
          searchAudioRef.current.currentTime = 0;
          searchAudioRef.current.play().catch(e => console.warn("Search audio play failed:", e));
        }

        // Add system message
        setMessages(prev => [...prev, {
          id: `search-${Date.now()}-${Math.random()}`,
          role: "system",
          content: `Searching Orthodox documents for: "${args.query}"`,
          timestamp: new Date(),
        }]);

        // Call search API
        const response = await fetch("/api/voice/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: args.query,
            conversationId,
            userBelief,
          }),
        });

        const data: VoiceSearchResponse = await response.json();

        // Stop search audio
        if (searchAudioRef.current) {
          searchAudioRef.current.pause();
        }

        setState(prev => ({ ...prev, isSearching: false }));

        if (data.success) {
          console.log(`Found ${data.documentsFound} documents`);

          // Send function call output back to OpenAI
          sendDataChannelMessage({
            type: REALTIME_EVENTS.CONVERSATION_ITEM_CREATE,
            item: {
              type: "function_call_output",
              call_id: event.call_id,
              output: JSON.stringify({
                result: data.result,
                sources: data.sources,
                documentsFound: data.documentsFound,
              }),
            },
          });

          // Trigger response generation
          sendDataChannelMessage({
            type: REALTIME_EVENTS.RESPONSE_CREATE,
          });
        } else {
          console.error("Search failed:", data.error);
          toast.error("Document search failed");
        }
      } catch (error) {
        console.error("Function call error:", error);
        setState(prev => ({ ...prev, isSearching: false }));
        if (searchAudioRef.current) {
          searchAudioRef.current.pause();
        }
        toast.error("Failed to search documents");
      }
    }
  }, [conversationId, userBelief, sendDataChannelMessage]);

  // Handle incoming data channel messages
  const handleDataChannelMessage = useCallback((event: MessageEvent) => {
    try {
      const message: RealtimeEvent = JSON.parse(event.data);
      
      switch (message.type) {
        case REALTIME_EVENTS.INPUT_AUDIO_BUFFER_SPEECH_STARTED:
          console.log("User started speaking");
          setState(prev => ({ ...prev, isListening: true }));
          break;

        case REALTIME_EVENTS.INPUT_AUDIO_BUFFER_SPEECH_STOPPED:
          console.log("User stopped speaking");
          setState(prev => ({ ...prev, isListening: false }));
          break;

        case REALTIME_EVENTS.INPUT_AUDIO_TRANSCRIPTION_COMPLETED:
          {
            const transcriptEvent = message as InputAudioTranscriptionCompletedEvent;
            console.log("User transcript:", transcriptEvent.transcript);
            const userMessage: TranscriptMessage = {
              id: transcriptEvent.item_id,
              role: "user",
              content: transcriptEvent.transcript,
              timestamp: new Date(),
            };
            setMessages(prev => [...prev, userMessage]);
            onTranscriptMessage?.({ role: "user", content: transcriptEvent.transcript });
          }
          break;

        case REALTIME_EVENTS.RESPONSE_AUDIO_STARTED:
          console.log("AI started speaking");
          setState(prev => ({ ...prev, isSpeaking: true }));
          // Stop search audio if playing
          if (searchAudioRef.current) {
            searchAudioRef.current.pause();
          }
          currentAssistantMessageRef.current = "";
          currentAssistantIdRef.current = `assistant-${Date.now()}-${Math.random()}`;
          
          // Initialize audio context for playback if not already done
          if (!audioContextRef.current) {
            audioContextRef.current = new AudioContext({ sampleRate: 24000 });
          }
          break;

        case REALTIME_EVENTS.RESPONSE_AUDIO_DELTA:
          {
            const audioEvent = message as any;
            if (audioEvent.delta && audioContextRef.current) {
              // Decode base64 audio and play it
              try {
                const audioData = atob(audioEvent.delta);
                const audioArray = new Int16Array(audioData.length / 2);
                
                for (let i = 0; i < audioArray.length; i++) {
                  const byte1 = audioData.charCodeAt(i * 2);
                  const byte2 = audioData.charCodeAt(i * 2 + 1);
                  audioArray[i] = (byte2 << 8) | byte1;
                }
                
                // Convert to float32 for Web Audio API
                const float32Array = new Float32Array(audioArray.length);
                for (let i = 0; i < audioArray.length; i++) {
                  float32Array[i] = audioArray[i] / 32768.0;
                }
                
                // Create audio buffer and play
                const audioBuffer = audioContextRef.current.createBuffer(1, float32Array.length, 24000);
                audioBuffer.getChannelData(0).set(float32Array);
                
                const source = audioContextRef.current.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(audioContextRef.current.destination);
                source.start();
              } catch (error) {
                console.warn("Error playing audio chunk:", error);
              }
            }
          }
          break;

        case REALTIME_EVENTS.RESPONSE_AUDIO_DONE:
          console.log("AI finished speaking");
          setState(prev => ({ ...prev, isSpeaking: false }));
          break;

        case REALTIME_EVENTS.RESPONSE_AUDIO_TRANSCRIPT_DELTA:
          {
            const deltaEvent = message as ResponseAudioTranscriptDeltaEvent;
            if (deltaEvent.delta) {
              currentAssistantMessageRef.current += deltaEvent.delta;
            }
          }
          break;

        case REALTIME_EVENTS.RESPONSE_AUDIO_TRANSCRIPT_DONE:
          {
            const transcriptEvent = message as ResponseAudioTranscriptDoneEvent;
            console.log("AI transcript:", transcriptEvent.transcript);
            const assistantMessage: TranscriptMessage = {
              id: currentAssistantIdRef.current,
              role: "assistant",
              content: transcriptEvent.transcript,
              timestamp: new Date(),
            };
            setMessages(prev => [...prev, assistantMessage]);
            onTranscriptMessage?.({ role: "assistant", content: transcriptEvent.transcript });
            currentAssistantMessageRef.current = "";
          }
          break;

        case REALTIME_EVENTS.RESPONSE_FUNCTION_CALL_ARGUMENTS_DONE:
          handleFunctionCall(message as ResponseFunctionCallArgumentsDoneEvent);
          break;

        case REALTIME_EVENTS.ERROR:
          console.error("OpenAI error:", message.error);
          setState(prev => ({ ...prev, error: message.error.message }));
          toast.error(`Voice chat error: ${message.error.message}`);
          break;

        default:
          // Log other events for debugging (skip noisy audio delta events)
          console.log("Event:", message.type);
      }
    } catch (error) {
      console.error("Error handling data channel message:", error);
    }
  }, [handleFunctionCall, onTranscriptMessage]);

  // Initialize WebRTC connection
  const connect = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isConnecting: true, error: null }));
      console.log("Starting voice chat connection...");

      // Get ephemeral token
      const tokenResponse = await fetch("/api/voice/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (!tokenResponse.ok) {
        throw new Error("Failed to get session token");
      }

      const tokenData: VoiceSessionTokenResponse = await tokenResponse.json();
      console.log("Got ephemeral token");

      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia(AUDIO_CONSTRAINTS);
      audioStreamRef.current = stream;
      console.log("Got microphone access");

      // Create peer connection
      const pc = new RTCPeerConnection(WEBRTC_CONFIG);
      peerConnectionRef.current = pc;

      // Add audio track from microphone
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      // Handle incoming audio track from OpenAI (for audio output)
      pc.addEventListener("track", (event) => {
        console.log("Received audio track from OpenAI");
        const remoteStream = event.streams[0];
        
        // Create audio element to play the remote stream
        const audioElement = new Audio();
        audioElement.srcObject = remoteStream;
        audioElement.autoplay = true;
        
        audioElement.play().catch(e => {
          console.error("Error playing remote audio:", e);
        });
      });

      // Create data channel
      const dc = pc.createDataChannel(DATA_CHANNEL_NAME);
      dataChannelRef.current = dc;

      dc.addEventListener("open", () => {
        console.log("Data channel opened");
        setState(prev => ({ ...prev, isConnected: true, isConnecting: false }));
        toast.success("Voice chat connected!");

        // Configure session
        const instructions = generateVoiceSystemPrompt(stage, userBelief);
        const sessionConfig = getRealtimeSessionConfig(instructions);
        
        sendDataChannelMessage({
          type: REALTIME_EVENTS.SESSION_UPDATE,
          session: sessionConfig,
        });
      });

      dc.addEventListener("message", handleDataChannelMessage);

      dc.addEventListener("close", () => {
        console.log("Data channel closed");
        setState(prev => ({ ...prev, isConnected: false }));
      });

      dc.addEventListener("error", (error) => {
        console.error("Data channel error:", error);
        setState(prev => ({ ...prev, error: "Data channel error" }));
      });

      // Handle ICE candidates
      pc.addEventListener("icecandidate", (event) => {
        if (event.candidate) {
          console.log("ICE candidate:", event.candidate.candidate);
        }
      });

      // Create and send offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      console.log("Created offer, exchanging SDP with OpenAI...");

      // Exchange SDP with OpenAI Real-Time API
      const sdpResponse = await fetch(`https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${tokenData.token}`,
          "Content-Type": "application/sdp",
        },
        body: offer.sdp,
      });

      if (!sdpResponse.ok) {
        throw new Error(`SDP exchange failed: ${sdpResponse.status}`);
      }

      const answerSdp = await sdpResponse.text();
      console.log("Got SDP answer from OpenAI");

      // Set remote description with OpenAI's answer
      await pc.setRemoteDescription({
        type: "answer",
        sdp: answerSdp,
      });

      console.log("WebRTC connection established, waiting for data channel...");

    } catch (error: any) {
      console.error("Connection error:", error);
      setState(prev => ({ 
        ...prev, 
        isConnecting: false, 
        error: error.message || "Failed to connect" 
      }));
      toast.error(`Failed to connect: ${error.message}`);
      cleanup();
    }
  }, [stage, userBelief, handleDataChannelMessage, sendDataChannelMessage, cleanup]);

  // Disconnect
  const disconnect = useCallback(() => {
    console.log("Disconnecting voice chat...");
    cleanup();
    toast.info("Voice chat disconnected");
  }, [cleanup]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (audioStreamRef.current) {
      const audioTracks = audioStreamRef.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = state.isMuted;
      });
      setState(prev => ({ ...prev, isMuted: !prev.isMuted }));
      toast.info(state.isMuted ? "Microphone unmuted" : "Microphone muted");
    }
  }, [state.isMuted]);

  return (
    <div className="flex-1 flex flex-col max-h-screen overflow-hidden bg-gradient-to-b from-[#FAF8F3] to-white">
      {/* Header */}
      <div className="p-4 border-b bg-white/80 backdrop-blur-sm">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-byzantine-100 to-byzantine-200 rounded-xl flex items-center justify-center">
              <Volume2 className="w-6 h-6 text-byzantine-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-orthodox-600">Voice Conversation</h2>
              <p className="text-sm text-gray-500">
                {state.isConnected ? "Connected" : state.isConnecting ? "Connecting..." : "Disconnected"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {state.isConnected && (
              <Button
                variant="outline"
                size="sm"
                onClick={toggleMute}
                className={state.isMuted ? "bg-red-50 border-red-200" : ""}
              >
                {state.isMuted ? <MicOff className="w-4 h-4 mr-2" /> : <Mic className="w-4 h-4 mr-2" />}
                {state.isMuted ? "Unmute" : "Mute"}
              </Button>
            )}

            {!state.isConnected && !state.isConnecting && (
              <Button onClick={connect} className="bg-byzantine-500 hover:bg-byzantine-600">
                <Phone className="w-4 h-4 mr-2" />
                Start Voice Chat
              </Button>
            )}

            {state.isConnecting && (
              <Button disabled className="bg-gray-400">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Connecting...
              </Button>
            )}

            {state.isConnected && (
              <Button onClick={disconnect} variant="destructive" size="sm">
                <PhoneOff className="w-4 h-4 mr-2" />
                End Call
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Status Indicators */}
      {state.isConnected && (
        <div className="px-4 py-3 bg-white/50 border-b">
          <div className="flex items-center justify-center gap-4 max-w-4xl mx-auto">
            <Badge 
              variant={state.isListening ? "default" : "outline"}
              className={state.isListening ? "bg-green-500 animate-pulse" : ""}
            >
              <Mic className="w-3 h-3 mr-1" />
              {state.isListening ? "Listening..." : "Ready"}
            </Badge>

            <Badge 
              variant={state.isSpeaking ? "default" : "outline"}
              className={state.isSpeaking ? "bg-blue-500 animate-pulse" : ""}
            >
              <Volume2 className="w-3 h-3 mr-1" />
              {state.isSpeaking ? "Speaking..." : "Silent"}
            </Badge>

            {state.isSearching && (
              <Badge className="bg-yellow-500 animate-pulse">
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                Searching documents...
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Error Display */}
      {state.error && (
        <div className="px-4 py-3 bg-red-50 border-b border-red-200">
          <div className="flex items-center justify-center gap-2 text-red-700 max-w-4xl mx-auto">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{state.error}</span>
          </div>
        </div>
      )}

      {/* Transcript Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 && !state.isConnected && (
            <Card className="p-8 text-center">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-byzantine-100 to-byzantine-200 rounded-full flex items-center justify-center mb-4">
                <Mic className="w-10 h-10 text-byzantine-600" />
              </div>
              <h3 className="text-xl font-semibold text-orthodox-600 mb-2">
                Voice Conversation with Orthodox Guide
              </h3>
              <p className="text-gray-600 mb-4">
                Have a natural, spoken conversation about Orthodox Christianity. Your voice will be transcribed, and I'll search Church Fathers and Orthodox documents when needed.
              </p>
              <Button onClick={connect} className="bg-byzantine-500 hover:bg-byzantine-600">
                <Phone className="w-4 h-4 mr-2" />
                Start Voice Chat
              </Button>
            </Card>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <Card
                className={`max-w-[80%] p-4 ${
                  message.role === "user"
                    ? "bg-byzantine-500 text-white"
                    : message.role === "system"
                    ? "bg-yellow-50 border-yellow-200"
                    : "bg-white"
                }`}
              >
                <div className="flex items-start gap-2">
                  {message.role === "user" && <Mic className="w-4 h-4 mt-1 flex-shrink-0" />}
                  {message.role === "assistant" && <Volume2 className="w-4 h-4 mt-1 flex-shrink-0" />}
                  {message.role === "system" && <Loader2 className="w-4 h-4 mt-1 flex-shrink-0 animate-spin" />}
                  
                  <div className="flex-1">
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    {message.sources && message.sources.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <p className="text-xs text-gray-500 mb-1">Sources:</p>
                        {message.sources.map((source, idx) => (
                          <Badge key={idx} variant="outline" className="mr-1 mb-1 text-xs">
                            {source}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <p className="text-xs mt-1 opacity-70">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Hidden audio element for search sound */}
      <audio
        ref={searchAudioRef}
        src="/audio/search-placeholder.pcm"
        preload="auto"
        loop
      />
    </div>
  );
}

