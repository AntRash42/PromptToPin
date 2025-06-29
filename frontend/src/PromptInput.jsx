import React from 'react';
import { Box, TextField, Button } from '@mui/material';

export default function PromptInput({ prompt, setPrompt, onSubmit }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(prompt);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
      <TextField
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        placeholder="Type your world query here..."
        multiline
        minRows={3}
        maxRows={6}
        fullWidth
        variant="outlined"
        sx={{ mb: 2, bgcolor: '#f0f7fa', borderRadius: 2 }}
        InputProps={{ style: { fontSize: 18 } }}
      />
      <Button
        type="submit"
        variant="contained"
        size="large"
        sx={{ px: 6, py: 1.5, fontWeight: 700, fontSize: 18, borderRadius: 2, background: 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)', color: '#fff', boxShadow: 3, '&:hover': { background: 'linear-gradient(90deg, #38f9d7 0%, #43e97b 100%)' } }}
      >
          🌐 Generate Map
      </Button>
    </Box>
  );
}