import React, { useState } from "react";
import { useAuth } from "./AuthContext";
import { getAuth, updateProfile } from "firebase/auth";
import { Avatar, Button, TextField, Typography, Box, Paper, IconButton } from "@mui/material";
import PhotoCamera from '@mui/icons-material/PhotoCamera';

export default function ProfilePage() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [photoURL, setPhotoURL] = useState(user?.photoURL || "");
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  if (!user) return <Typography>Please log in to view your profile.</Typography>;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setPhotoURL(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      let newPhotoURL = photoURL;
      // TODO: Upload pfp to firebase storage
      await updateProfile(getAuth().currentUser, {
        displayName,
        photoURL: newPhotoURL
      });
      setMessage("Profile updated!");
    } catch (err) {
      setMessage("Error updating profile: " + err.message);
    }
    setSaving(false);
  };

  return (
    <Box sx={{ maxWidth: 400, mx: "auto", mt: 6 }}>
      <Paper sx={{ p: 4, borderRadius: 3 }} elevation={6}>
        <Typography variant="h4" align="center" gutterBottom>Profile</Typography>
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 2 }}>
          <Avatar src={photoURL} sx={{ width: 96, height: 96, mb: 1 }} />
          <label htmlFor="profile-pic-upload">
            <input
              accept="image/*"
              id="profile-pic-upload"
              type="file"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            <IconButton color="primary" component="span">
              <PhotoCamera />
            </IconButton>
          </label>
        </Box>
        <TextField
          label="Username"
          value={displayName}
          onChange={e => setDisplayName(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        />
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Changes"}
        </Button>
        {message && <Typography color={message.startsWith("Error") ? "error" : "primary"} sx={{ mt: 2 }}>{message}</Typography>}
      </Paper>
    </Box>
  );
}
