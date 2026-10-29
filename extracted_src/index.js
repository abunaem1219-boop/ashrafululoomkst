const admin = require("firebase-admin");
const axios = require("axios");

// ফায়ারবেস এডমিন এসডিকে ইনিশিয়ালাইজেশন
// নিচে ৩ নম্বর ধাপে 'serviceAccountKey.json' ফাইলটি পাওয়ার নিয়ম দেওয়া হয়েছে
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://ashraful-uloom-madrasa-default-rtdb.firebaseio.com" // আপনার রিয়েলটাইম ডাটাবেজ লিংক
});

const db = admin.database();
const ref = db.ref("pending_notifications");

console.log("Notification Listener is running and watching Firebase RTDB...");

// ডাটাবেজে নতুন ডেটা রাইট করা হলেই এই ইভেন্টটি সচল হবে
ref.on("child_added", async (snapshot) => {
  const data = snapshot.val();
  const pushId = snapshot.key;

  // যদি অলরেডি ফেইলড হয়ে থাকে তবে পুনরায় ট্রাই করবে না
  if (!data || data.status === "failed") return;

  const appId = "7628254a-848b-4ea9-ae48-b490c49fd65a";
  const restApiKey = "os_v2_app_oyucksuernhktlsiwsimjh6wlj7htehgrvmecdmwthrltuysgdet5wjku4mchy65lb7yft72xzlghpikvseeexiq6v3v7mfakajr6ai";

  const payload = {
    app_id: appId,
    included_segments: ["All"],
    headings: { "en": data.title, "bn": data.title },
    contents: { "en": data.message, "bn": data.message },
    url: data.url || ""
  };

  if (data.big_picture) {
    payload.big_picture = data.big_picture;
    payload.chrome_web_image = data.big_picture;
    payload.ios_attachments = { "id1": data.big_picture };
  }

  try {
    console.log(`Sending notification to OneSignal for pushId: ${pushId}`);
    
    // ব্যাকএন্ড থেকে সরাসরি API কল (কোনো CORS এরর আসবে না)
    const response = await axios.post("https://api.onesignal.com/notifications", payload, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Authorization": `Key ${restApiKey}`
      }
    });
    console.log("OneSignal Success Response:", response.data);

    // সফল হলে ডাটাবেজ খালি রাখার জন্য পেন্ডিং ডেটাটি ডিলিট করে দিন
    await snapshot.ref.remove();
    console.log(`Successfully sent and cleaned up DB entry for pushId: ${pushId}`);
  } catch (error) {
    console.error("OneSignal Error:", error.response ? error.response.data : error.message);
    // সার্ভার এরর হলে ডাটাবেজে স্ট্যাটাস ফেইল করে দেবে যাতে ইনফিনিট লুপ না হয়
    await snapshot.ref.update({ status: "failed", error: error.message });
  }
});