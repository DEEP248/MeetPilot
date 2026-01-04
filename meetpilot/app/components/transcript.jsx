"use client";

import { useEffect, useState, useRef } from "react";
import { useCall } from "@stream-io/video-react-sdk";
import { useChatContext } from "stream-chat-react";

export function TranscriptPanel() {
  const { client } = useChatContext();
  const [transcripts, setTranscripts] = useState([]);
  const [captionsActive, setCaptionsActive] = useState(false); // UI indicator for closed captions activity
  const transcriptEndRef = useRef(null);
  const call = useCall();
  const handlersRef = useRef({ channel: null, handleNewMessage: null, handleClosedCaption: null }); // store handlers for cleanup

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcripts]);

  useEffect(() => {
    if (!call) {
      console.log("⚠️ Call not ready");
      return;
    }

    const callId = process.env.NEXT_PUBLIC_CALL_ID;
    const channel = client.channel("messaging", callId);

    // Watch the channel
    channel.watch();

    console.log("✅ Listening for closed captions");

    const handleClosedCaption = (event) => {
      // console.log("📝 Closed caption event:", event);

      if (event.closed_caption) {
        const newTranscript = {
          text: event.closed_caption.text,
          speaker:
            event.closed_caption.user?.name ||
            event.closed_caption.user?.id ||
            "Unknown",
          timestamp: new Date(
            event.closed_caption.start_time
          ).toLocaleTimeString(),
        };
        setTranscripts((prev) => [...prev, newTranscript]);
      }
    };

    const handleNewMessage = (event) => {
      const message = event.message;

      // Only process messages from the meeting assistant bot
      if (message?.user?.id !== "meeting-assistant-bot") {
        console.log("Skipping - not from bot");
        return;
      }

      console.log("📨 New message:", message);

      // Check if it's a note message (has custom.type and custom.note_type)
      // if (message?.custom?.type === "note") {
      //   const newTranscript = {
      //     text: message.text,
      //     speaker: message.custom.speaker || "Unknown",
      //     timestamp: new Date(message.created_at).toLocaleTimeString(),
      //     noteType: message.custom.note_type, // action_item, decision, key_point
      //   };

      //   console.log("✅ Adding transcript:", newTranscript);
      //   setTranscripts((prev) => [...prev, newTranscript]);
      // }
    };

    call.on("call.closed_caption", handleClosedCaption);

    channel.on("message.new", handleNewMessage);

    return () => {
      console.log("🧹 Cleaning up caption listeners");
      call.off("call.closed_caption", handleClosedCaption);
      channel.off("message.new", handleNewMessage);
    };
  }, [call]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-700 bg-gradient-to-r from-gray-900 to-gray-850">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-blue-500 rounded-lg shadow-inner">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Live Transcript</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {transcripts.length} {transcripts.length === 1 ? "message" : "messages"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${captionsActive ? "bg-green-400 animate-pulse" : "bg-gray-600"}`}
                aria-hidden
              />
              <span className="text-xs text-gray-400">Captions</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-green-500 font-medium">Live</span>
            </div>
          </div>
        </div>
      </div>

      {/* Transcript List */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 bg-gray-850 custom-scrollbar">
        {transcripts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="relative mb-6">
              <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                  />
                </svg>
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
            </div>
            <p className="text-gray-300 text-lg font-semibold mb-2">Listening for voices…</p>
            <p className="text-gray-500 text-sm max-w-xs">Speak to generate live AI transcripts — captions will appear here in real time.</p>
          </div>
        ) : (
          <>
            {transcripts.map((transcript, idx) => {
              const name = transcript.speaker || 'Unknown';
              const isAssistant = name.toLowerCase().includes('assistant') || name === 'meeting-assistant-bot';

              return (
                <div
                  key={idx}
                  className={`group rounded-xl p-4 shadow-lg transition-all duration-300 border transform hover:shadow-xl hover:-translate-y-0.5 ${
                    isAssistant
                      ? 'bg-gradient-to-br from-indigo-800 to-indigo-700 border-indigo-700 text-white'
                      : 'bg-gradient-to-br from-gray-700 to-gray-750 border-gray-600'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg ${isAssistant ? 'bg-gradient-to-br from-purple-600 to-indigo-500' : 'bg-gradient-to-br from-blue-500 to-blue-600'}`}>
                        {name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className={`font-semibold text-sm ${isAssistant ? 'text-white' : 'text-blue-400'}`}>{name}</span>
                        <p className="text-xs text-gray-400 font-mono mt-0.5">{transcript.timestamp}</p>
                      </div>
                    </div>

                    {isAssistant && (
                      <div className="text-xs text-indigo-200 font-medium">Assistant</div>
                    )}
                  </div>

                  <p className={`leading-relaxed text-sm pl-13 ${isAssistant ? 'text-indigo-50' : 'text-gray-100'}`}>
                    {transcript.text}
                  </p>
                </div>
              );
            })}
            <div ref={transcriptEndRef} />
          </>
        )}
      </div>
    </div>
  );
}