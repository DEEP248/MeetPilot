/**
 * Custom hook to initialize and manage Stream Video and Chat clients.
 *
 * - Creates a StreamVideoClient for video features (per-user instance).
 * - Uses StreamChat singleton for chat and performs safe reconnect handling:
 *   - if the singleton is connected to a different user, disconnect first.
 *   - if already connected to same user, skip reconnect to avoid errors.
 *
 * Returns: { videoClient, chatClient }
 */
import { useState, useEffect, useRef } from "react";
import { StreamVideoClient } from "@stream-io/video-react-sdk";
import { StreamChat } from "stream-chat";

/**
 * @param {{apiKey: string, user: Object, token: string}} params
 */
export function useStreamClients({ apiKey, user, token }) {
  const [videoClient, setVideoClient] = useState(null);
  const [chatClient, setChatClient] = useState(null);
  const clientsRef = useRef({ video: null, chat: null });

  useEffect(() => {
    if (!user || !token || !apiKey) return;

    let isMounted = true;
    let localVideoClient = null;
    let localChatClient = null;

    const initClients = async () => {
      try {
        // Initialize Video Client
        const tokenProvider = () => Promise.resolve(token);
        const myVideoClient = new StreamVideoClient({ apiKey, user, tokenProvider });
        localVideoClient = myVideoClient;

        // Chat client (singleton).
        // StreamChat exposes a shared instance via getInstance(apiKey). Multiple components can read/use it.
        // To avoid connectUser being called twice, disconnect first if it's connected to another user,
        // and only connect when it's not already connected to the current user.
        const myChatClient = StreamChat.getInstance(apiKey);

        if (myChatClient.userID && myChatClient.userID !== user.id) {
          await myChatClient.disconnectUser().catch(console.error);
        }

        if (!myChatClient.userID) {
          await myChatClient.connectUser(user, token);
        }

        localChatClient = myChatClient;

        if (isMounted) {
          setVideoClient(myVideoClient);
          setChatClient(myChatClient);
          clientsRef.current.video = myVideoClient;
          clientsRef.current.chat = myChatClient;
        }
      } catch (error) {
        console.error("Client initialization error:", error);
      }
    };

    initClients();

    return () => {
      isMounted = false;

      // Disconnect the clients created by this effect run
      if (localVideoClient) {
        localVideoClient.disconnectUser().catch(console.error);
      }
      if (localChatClient) {
        localChatClient.disconnectUser().catch(console.error);
      }

      // Clear refs if they point to these local clients
      if (clientsRef.current.video === localVideoClient) clientsRef.current.video = null;
      if (clientsRef.current.chat === localChatClient) clientsRef.current.chat = null;
    };
  }, [apiKey, user, token]);

  return { videoClient, chatClient };
}