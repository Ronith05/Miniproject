import React, { useState, useEffect } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Box,
  Paper,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { CryptoData } from '../types/crypto';

interface WatchlistProps {
  cryptos: CryptoData[];
}

const Watchlist: React.FC<WatchlistProps> = ({ cryptos }) => {
  const [watchlist, setWatchlist] = useState<string[]>(() => {
    const saved = localStorage.getItem('watchlist');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  const addToWatchlist = (coinId: string) => {
    if (!watchlist.includes(coinId)) {
      setWatchlist([...watchlist, coinId]);
    }
  };

  const removeFromWatchlist = (coinId: string) => {
    setWatchlist(watchlist.filter(id => id !== coinId));
  };

  const watchlistItems = cryptos.filter(crypto => watchlist.includes(crypto.id));

  return (
    <Paper sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Watchlist
      </Typography>
      <List>
        {watchlistItems.map((crypto) => (
          <ListItem key={crypto.id}>
            <ListItemText
              primary={crypto.name}
              secondary={`$${crypto.current_price.toLocaleString()}`}
            />
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                aria-label="delete"
                onClick={() => removeFromWatchlist(crypto.id)}
              >
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
        {watchlistItems.length === 0 && (
          <Typography variant="body2" color="textSecondary" align="center">
            No coins in watchlist
          </Typography>
        )}
      </List>
    </Paper>
  );
};

export default Watchlist; 