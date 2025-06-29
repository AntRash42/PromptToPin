import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

export default function SaveMapDialog({ open, onClose, mapName, setMapName, onSave }) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Save Map</DialogTitle>
      <DialogContent>
        <TextField
          label="Map Name"
          value={mapName}
          onChange={e => setMapName(e.target.value)}
          fullWidth
          autoFocus
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onSave} variant="contained">Save</Button>
      </DialogActions>
    </Dialog>
  );
}
