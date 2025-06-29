import React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

export default function LegendTable({ legend }) {
  if (!legend || legend.length === 0) return null;
  return (
    <TableContainer component={Paper} sx={{ maxWidth: 500, mx: 'auto', mt: 2, borderRadius: 2, boxShadow: 2 }}>
      <Typography variant="h5" align="center" color="primary" fontWeight={700} sx={{ mt: 2 }}>
        Legend
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell align="center" sx={{ fontWeight: 700, color: '#1976d2', fontSize: 18 }}>Category</TableCell>
            <TableCell align="center" sx={{ fontWeight: 700, color: '#1976d2', fontSize: 18 }}>Colour</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {legend.map(([cat, colour], idx) => (
            <TableRow key={idx}>
              <TableCell align="center" sx={{ fontWeight: 600, color: '#1976d2', fontSize: 16 }}>{cat}</TableCell>
              <TableCell align="center">
                <Box component="span" sx={{ display: 'inline-block', width: 28, height: 28, background: colour, borderRadius: 2, border: '2px solid #1976d2', verticalAlign: 'middle', mr: 2 }} />
                <Typography component="span" sx={{ color: '#1976d2', fontFamily: 'monospace', fontSize: 16 }}>{colour}</Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
