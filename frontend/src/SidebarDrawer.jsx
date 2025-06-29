import React from 'react';
import IconButton from '@mui/material/IconButton';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import MenuIcon from '@mui/icons-material/Menu';
import MapIcon from '@mui/icons-material/Map';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

export default function SidebarDrawer({ user, drawerOpen, setDrawerOpen, setShowMyMaps, fetchMyMaps, navigate }) {
  if (!user) return null;
  return (
    <>
      <IconButton onClick={() => setDrawerOpen(true)} sx={{ position: 'absolute', top: 24, left: 32, zIndex: 20 }}>
        <MenuIcon fontSize="large" />
      </IconButton>
      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 240 }} role="presentation" onClick={() => setDrawerOpen(false)}>
          <List>
            <ListItem button={true} key="My Maps" onClick={async () => { setShowMyMaps(true); await fetchMyMaps(); }}>
              <ListItemIcon><MapIcon /></ListItemIcon>
              <ListItemText primary="My Maps" />
            </ListItem>
            <ListItem button={true} key="Profile" onClick={() => navigate('/profile')}>
              <ListItemIcon><AccountCircleIcon /></ListItemIcon>
              <ListItemText primary="Profile" />
            </ListItem>
          </List>
          <Divider />
        </Box>
      </Drawer>
    </>
  );
}