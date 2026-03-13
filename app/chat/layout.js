"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { messaging } from "@/lib/firebase";
import { getToken, onMessage } from "firebase/messaging";
import { fetcher } from "@/lib/fetcher";

export default function ChatLayout({ children }) {
  const { user } = useUser();

  useEffect(() => {
    if (!user?.id || !messaging) return;

    const setupFCM = async () => {
      try {
        // ✅ ask notification permission
        const permission = await Notification.requestPermission();

        if (permission !== "granted") {
          console.log("❌ Notification permission denied");
          return;
        }

        // ✅ get FCM token
        const token = await getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
        });
        console.log("hii");
        
        if (!token) {
          console.log("❌ No FCM token");
          return;
        }

        console.log("🔥 FCM TOKEN:", token);

        // ✅ save token in DB
        await fetcher("/api/user/save-token", {
          method: "POST",
          body: {
            userId: user.id,
            token,
          },
        }
      );
console.log("i am");

        // ✅ foreground notifications
        onMessage(messaging, (payload) => {
          console.log("📩 Foreground notification:", payload);

          // optional toast
          if (payload?.notification) {
            new Notification(payload.notification.title, {
              body: payload.notification.body,
              icon: "/logo.png",
            });
          }
        });
      } catch (err) {
        console.log("FCM setup error:", err);
      }
    };

    setupFCM();
  }, [user?.id]);

  return <>{children}</>;
}