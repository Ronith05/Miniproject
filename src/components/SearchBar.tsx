import React, { useState } from 'react';
import { InputBase, Paper, List, ListItem, ListItemText, Box, Typography, Popper, ClickAwayListener, CircularProgress } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { CryptoData } from '../types/crypto';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_KEY = '3c6334e0-79bb-4537-9f16-03a023417236';

const CORS_PROXY = 'https://api.allorigins.win/raw?url=';
const BASE_URL = 'https://api.coingecko.com/api/v3';

// Rate limiting
const RATE_LIMIT_DELAY = 6000; // 6 seconds between requests
let lastRequestTime = 0;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const makeRequest = async (url: string, options = {}) => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
    await delay(RATE_LIMIT_DELAY - timeSinceLastRequest);
  }
  
  lastRequestTime = Date.now();
  return axios.get(`${url}`, options);
};

interface SearchBarProps {
  cryptos: CryptoData[];
}

const SearchBar: React.FC<SearchBarProps> = ({ cryptos }) => {
  const [query, setQuery] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCoin, setSelectedCoin] = useState<CryptoData | null>(null);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const filtered = query
    ? cryptos.filter(
        (coin) =>
          coin.name.toLowerCase().includes(query.toLowerCase()) ||
          coin.symbol.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setAnchorEl(e.currentTarget);
    setSelectedCoin(null);
    setCurrentPrice(null);
    setError(null);
  };

  const handleSelect = async (coin: CryptoData) => {
    setSelectedCoin(coin);
    setQuery(coin.name);
    setAnchorEl(null);
    setCurrentPrice(null);
    setError(null);
    setLoading(true);
    try {
      console.log(BASE_URL)
      const response = await makeRequest(`${BASE_URL}/simple/price`, {
        params: {
          ids: coin.id,
          vs_currencies: 'usd',
        }
      });
      const data = response.data as Record<string, { usd: number }>;
      if (data && data[coin.id] && typeof data[coin.id].usd === 'number') {
        setCurrentPrice(data[coin.id].usd);
      } else {
        setCurrentPrice(null);
      }
      navigate(`/coin/${coin.id}`);
    } catch (err: any) {
      setError('Failed to fetch current price.');
      console.error('Price fetch error:', err?.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClickAway = () => {
    setAnchorEl(null);
  };

  return (
    <Box sx={{ width: { xs: '100%', sm: 400 }, mx: 'auto', position: 'relative' }}>
      <Paper
        component="form"
        sx={{ p: '2px 8px', display: 'flex', alignItems: 'center', width: '100%' }}
        onSubmit={e => e.preventDefault()}
      >
        <SearchIcon sx={{ mr: 1 }} />
        <InputBase
          sx={{ ml: 1, flex: 1 }}
          placeholder="Search coin..."
          value={query}
          onChange={handleInputChange}
          inputProps={{ 'aria-label': 'search coin' }}
        />
      </Paper>
      <Popper open={!!anchorEl && filtered.length > 0} anchorEl={anchorEl} style={{ zIndex: 1201, width: '100%' }}>
        <ClickAwayListener onClickAway={handleClickAway}>
          <Paper sx={{ mt: 1, maxHeight: 300, overflowY: 'auto', width: '100%' }}>
            <List>
              {filtered.map((coin) => (
                <ListItem component="button" key={coin.id} onClick={() => handleSelect(coin)}>
                  <img src={coin.image} alt={coin.name} style={{ width: 24, height: 24, marginRight: 8 }} />
                  <ListItemText primary={coin.name} secondary={coin.symbol.toUpperCase()} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </ClickAwayListener>
      </Popper>
      {selectedCoin && (
        <Box sx={{ mt: 1, textAlign: 'center' }}>
          <Typography variant="subtitle1">
            {selectedCoin.name} Current Price: {' '}
            {loading ? <CircularProgress size={16} /> :
              error ? <span style={{ color: 'red' }}>{error}</span> :
              currentPrice !== null ? <b>${currentPrice.toLocaleString()}</b> : null}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default SearchBar; 