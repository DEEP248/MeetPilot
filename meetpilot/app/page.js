"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [username, setUsername] = useState("");

  const handleJoin = () => {
    const name = username.trim() === "" ? "anonymous" : username.trim();
    const meetingId = process.env.NEXT_PUBLIC_CALL_ID;

    router.push(`/meeting/${meetingId}?name=${encodeURIComponent(name)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0F1A] via-[#0E1324] to-[#0B0F1A] text-white flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Brand */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight">
            Meet<span className="text-blue-500">Pilot</span>
          </h1>
          <p className="mt-2 text-gray-400 text-sm">
            Smart AI-powered video meetings
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-lg font-semibold mb-2">Join a meeting</h2>
          <p className="text-sm text-gray-400 mb-6">
            Enter your name to continue to the video call
          </p>

          <input
            className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            placeholder="Your name (optional)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <button
            onClick={handleJoin}
            className="mt-6 w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 font-medium transition shadow-lg shadow-blue-600/30"
          >
            Join Meeting
          </button>
        </div>

        {/* Footer hint */}
        <p className="mt-6 text-center text-xs text-gray-500">
          Powered by MeetPilot AI • Secure video streaming
          <br /> • Made by Deep Darji
        </p>
      </div>
    </div>
  );
}
