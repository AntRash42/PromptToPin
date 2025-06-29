import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody
} from '@mui/material';

export default function MyMapsDialog({ open, onClose, myMaps, handleDeleteMap }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>My Maps</DialogTitle>
      <DialogContent>
        <>
          {myMaps.length === 0 ? (
            <Typography>No saved maps found.</Typography>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Prompt</TableCell>
                    <TableCell>Share Link</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {myMaps.map((map, idx) => (
                    <TableRow key={map.id || idx}>
                      <TableCell>{map.name}</TableCell>
                      <TableCell>{map.prompt}</TableCell>
                      <TableCell>
                        <Button size="small" color="primary" onClick={() => navigator.clipboard.writeText(map.shareUrl)}>
                          Copy Link
                        </Button>
                        <a href={map.shareUrl} target="_blank" rel="noopener noreferrer">Open</a>
                        <Button size="small" color="error" onClick={() => handleDeleteMap(map.id)} style={{ marginLeft: 8 }}>
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
