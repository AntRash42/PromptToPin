import admin from "../firebaseAdmin.js";

export async function firebaseAuth(req, res, next){
    const authHeader = req.headers.authorization || "";
    const match = authHeader.match(/^Bearer (.+)$/);
    if (!match) return res.status(401).json({ error: "No token provided"});
    const idToken = match[1];
    try {
        const decoded = await admin.auth().verifyIdToken(idToken);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({error: "Invalid or expired token"});
    }
}