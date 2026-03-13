importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

firebase.initializeApp({
   apiKey: "AIzaSyDTjzGCwEsAGSlziwbMNtYYuTetV5Bx52U",
  authDomain: "chat-app-77261.firebaseapp.com",
  projectId: "chat-app-77261",
  storageBucket: "chat-app-77261.firebasestorage.app",
  messagingSenderId: "128759658545",
  appId: "1:128759658545:web:f41730afb9f2252e57fd10"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: "/logo.png",
  });
});