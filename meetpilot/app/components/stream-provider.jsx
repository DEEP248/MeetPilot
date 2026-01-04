"use client";

import { StreamVideo } from "@stream-io/video-react-sdk";
import { Chat } from "stream-chat-react";
import { useStreamClients } from "@/app/hooks/useStreamClients";

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;

export default function StreamProvider({ children, user, token }) {
  const { videoClient, chatClient } = useStreamClients({ apiKey, user, token });

  if (!videoClient || !chatClient) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto shadow-lg"></div>
          <p className="text-white text-xl font-semibold mt-6">Connecting to Stream…</p>
          <p className="text-sm text-gray-400 mt-2">Establishing video and chat connections</p>
        </div>
      </div>
    );
  }

  return (
    <StreamVideo client={videoClient}>
      <Chat client={chatClient}>{children}</Chat>
    </StreamVideo>
  );
}