import { configDotenv } from "dotenv";
import express from "express";
import cors from "cors";
import getFullCoords from "./utils/getCoords.js";
import { firebaseAuth } from "./middleware/firebaseAuth.js";
import admin from "./firebaseAdmin.js";

configDotenv();

const app = express();
app.use(cors());
app.use(express.json());

// firestore db write test
admin.firestore().collection("test").add({ hello: "world", ts: Date.now() });

app.post("/api/maps", firebaseAuth, async(req, res) => {
  const userId = req.user.uid;
  const db = admin.firestore();
  if (req.body.save) {
    // Save a new map to Firestore
    const { name, prompt, markerInfo } = req.body;
    if (!name || !prompt || !markerInfo) {
      return res.status(400).json({ error: "Missing map data" });
    }
    try {
      console.log("Saving map for user:", userId, { name, prompt, markerInfo });
      await db.collection("users").doc(userId).collection("maps").add({
        name,
        prompt,
        markerInfo: markerInfo.map(m => ({
          rank: m[0],
          name: m[1],
          description: m[2],
          tag: m[3],
          color: m[4],
          coords: m[5],
        })),
        shareUrl: req.body.shareUrl || '',
        savedAt: new Date().toISOString(),
      });
      return res.json({ success: true });
    } catch (err) {
      console.error("Firestore save error:", err);
      return res.status(500).json({ error: err.message || "Firestore error" });
    }
  } else {
    // Return all saved maps for this user from Firestore
    try {
      const snap = await db.collection("users").doc(userId).collection("maps").orderBy("savedAt", "desc").get();
      const maps = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return res.json({ maps });
    } catch (err) {
      return res.status(500).json({ error: err.message || "Firestore error" });
    }
  }
})

app.post("/api/generate", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }
    console.log("Received prompt:", prompt);
    const dataResponse = await (await import("./utils/getData.js")).default(prompt);
    console.log("GPT raw response:", dataResponse.raw);
    console.log("GPT parsed JSON:", dataResponse.json);
    const response = await getFullCoords(prompt);
    console.log("Response from getFullCoords:", response);
    res.json({ output: response.raw, json: response });
  } catch (err) {
    res.status(500).json({ error: err.message || "OpenAI error" });
  }
});

app.post("/api/coords", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }
    console.log("Received prompt for coords:", prompt);
    const coordsObj = await (await import("./utils/getCoords.js")).default(prompt);
    console.log("Coords object:", coordsObj);
    if (!coordsObj || coordsObj.error) {
      return res.status(500).json({ error: coordsObj?.error || "No places data returned from prompt." });
    }
    res.json(coordsObj);
  } catch (err) {
    res.status(500).json({ error: err.message || "Coords error" });
  }
});

// DELETE /api/maps/:mapId - delete a user's saved map
app.delete("/api/maps/:mapId", firebaseAuth, async (req, res) => {
  const userId = req.user.uid;
  const mapId = req.params.mapId;
  const db = admin.firestore();
  try {
    await db.collection("users").doc(userId).collection("maps").doc(mapId).delete();
    return res.json({ success: true });
  } catch (err) {
    console.error("Firestore delete error:", err);
    return res.status(500).json({ error: err.message || "Firestore error" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
