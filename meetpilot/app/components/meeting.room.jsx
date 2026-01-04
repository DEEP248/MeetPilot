"use client";

import { useEffect, useState, useRef } from "react";
import {
  StreamCall,
  useStreamVideoClient,
  SpeakerLayout,
  CallControls,
  StreamTheme,
} from "@stream-io/video-react-sdk";

import { TranscriptPanel } from "@/app/components/transcript";

import "@stream-io/video-react-sdk/dist/css/styles.css";

export default function MeetingRoom({ callId, onLeave, userId }) {
  const client = useStreamVideoClient();
  const [call, setCall] = useState(null);
  const [error, setError] = useState(null);

  const joinedRef = useRef(false);
  const leavingRef = useRef(false);
  const callType = "default";

  useEffect(() => {
    if (!client) return;
    if (joinedRef.current) return;

    joinedRef.current = true;

    const init = async () => {
      try {
        const myCall = client.call(callType, callId);

        await myCall.getOrCreate({
          data: {
            created_by_id: userId,
            members: [{ user_id: userId, role: "call_member" }],
          },
        });
        await myCall.join();

        await myCall.startClosedCaptions({ language: "en" });

        myCall.on("call.session_ended", () => {
          console.log("Session ended");
          onLeave?.();
        });

        setCall(myCall);
      } catch (err) {
        setError(err.message);
      }
    };

    init();

    return () => {
      if (call && !leavingRef.current) {
        leavingRef.current = true;
        call.stopClosedCaptions().catch(() => {});
        call.leave().catch(() => {});
      }
    };
  }, [client, callId, userId]);

  const handleLeaveClick = async () => {
    if (leavingRef.current) {
      onLeave?.();
      return;
    }

    leavingRef.current = true;

    try {
      if (call) {
        await call.stopClosedCaptions().catch(() => {});
        await call.leave().catch(() => {});
      }
    } catch (err) {
      console.error("Error leaving call:", err);
    } finally {
      onLeave?.();
    }
  };

  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen text-white">
        <p>Error: {error}</p>
      </div>
    );

  if (!call)
    return (
      <div className="flex items-center justify-center min-h-screen text-white">
        <div className="text-center">
          <div className="animate-spin h-16 w-16 border-t-4 border-blue-500 mx-auto rounded-full" />
          <p className="mt-4 text-lg">Loading meeting…</p>
        </div>
      </div>
    );

  return (
    <StreamTheme>
      <StreamCall call={call}>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
          <div className="container mx-auto px-4 py-6 h-screen">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-2xl font-bold text-white">MeetPilot</div>
                <div className="text-sm text-gray-400">Smart Video Assistant</div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-xs text-gray-400">Meeting ID:</div>
                <div className="text-sm font-medium text-white">{callId}</div>
                <div className="ml-4 p-1 px-2 bg-gradient-to-br from-green-600 to-green-500 rounded-full text-xs font-semibold">Assistant: Live</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6 h-full">
              <div className="flex flex-col gap-4">
                {/* Video area split: main speaker (left) + participants strip (right) */}
                <div className="flex-1 rounded-xl bg-gray-800 border border-gray-700 overflow-hidden shadow-2xl p-2">
                  <div className="grid grid-cols-3 gap-3 h-full">
                    {/* Main speaker area */}
                    <div className="col-span-2 bg-gradient-to-br from-gray-900 to-gray-800 rounded-md overflow-hidden">
                      <div className="h-full w-full">
                        <SpeakerLayout />
                      </div>
                    </div>

                    {/* Participants strip - shows small tiles/initials for participants when available */}
                    <div className="col-span-1 bg-gray-850 rounded-md p-3 overflow-auto min-h-[120px]">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-gray-200">Participants</h4>
                        <span className="text-xs text-gray-400">Live</span>
                      </div>

                      <div className="flex flex-col gap-3">
                        {(() => {
                          const p = call?.participants || call?.state?.participants || [];
                          const list = Array.isArray(p) ? p : Object.values(p || {});

                          if (!list || list.length === 0) {
                            return (
                              <div className="text-xs text-gray-400">No participants yet</div>
                            );
                          }

                          return list.map((pt, idx) => {
                            const user = pt?.user || pt?.participant?.user || pt;
                            const name = (user?.name || user?.id || `User ${idx + 1}`).toString();
                            const initial = name.charAt(0).toUpperCase();

                            // Best-effort check for published video track (SDK shapes vary)
                            const hasVideo = Boolean(
                              pt?.videoTrack ||
                              (pt?.tracks && Array.isArray(pt.tracks) && pt.tracks.some((t) => t?.type === "video"))
                            );

                            return (
                              <div key={idx} className="flex items-center gap-3">
                                {/* Thumbnail: either show a video placeholder (if we detect a video track), an avatar image, or initials */}
                                <div className="w-14 h-10 bg-black rounded-md overflow-hidden flex items-center justify-center">
                                  {hasVideo ? (
                                    <div className="w-full h-full bg-gray-900 flex items-center justify-center text-xs text-gray-400">
                                      Live
                                    </div>
                                  ) : user?.image ? (
                                    <img src={user.image} alt={name} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center text-white font-semibold">
                                      {initial}
                                    </div>
                                  )}
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className="text-sm text-gray-200 font-medium truncate">{name}</div>
                                  <div className="text-xs text-gray-400">{pt?.role || 'Participant'}</div>
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  </div>
                </div>


              </div>

              <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden shadow-2xl">
                <TranscriptPanel />
              </div>
            </div>
          </div>
        </div>

        {/* Sticky controls: full-width on small screens, centered and non-overlapping */}
        <div className="fixed bottom-0 left-0 right-0 flex justify-center z-40 pointer-events-none">
          <div className="pointer-events-auto w-full max-w-4xl px-4 py-3 flex justify-center">
            <div className="bg-gray-800/95 backdrop-blur-md rounded-full md:px-6 md:py-3 px-3 py-2 border border-gray-700 shadow-2xl w-full sm:w-auto flex justify-center">
              <CallControls onLeave={handleLeaveClick} />
            </div>
          </div>
        </div>

      </StreamCall>
    </StreamTheme>
  );
}