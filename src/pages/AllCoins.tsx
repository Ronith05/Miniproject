import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Paper } from '@mui/material';
import axios from 'axios';

const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';
const BASE_URL = 'https://api.coingecko.com/api/v3';

const AllCoins: React.FC = () => {
  const [coins, setCoins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCoins = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(
          `${CORS_PROXY}${BASE_URL}/coins/markets`,
          {
            params: {
              vs_currency: 'usd',
              order: 'market_cap_desc',
              per_page: 100,
              page: 1,
              sparkline: false,
              price_change_percentage: '24h,7d,30d,1y'
            }
          }
        );
        setCoins(response.data as any[]);
      } catch (err: any) {
        setError(err?.message || 'Failed to fetch coins data.');
      } finally {
        setLoading(false);
      }
    };
    fetchCoins();
  }, []);

  if (loading) return <Box p={4} textAlign="center"><CircularProgress /></Box>;
  if (error) return <Box p={4} textAlign="center"><Typography color="error">{error}</Typography></Box>;

  return (
    <Box p={4}>
      {coins.map(coin => (
        <Paper key={coin.id} sx={{ p: 2, mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
          <img src={coin.image} alt={coin.name} style={{ width: 48, height: 48 }} />
          <Box flex={1}>
            <Typography variant="h5">{coin.name} ({coin.symbol.toUpperCase()})</Typography>
            <Typography variant="h6" color="primary" fontWeight={700}>
              ${coin.current_price.toLocaleString()}
            </Typography>
            <Box display="flex" gap={3} mt={1}>
              <Typography color={coin.price_change_percentage_24h_in_currency >= 0 ? 'success.main' : 'error.main'}>
                24h: {coin.price_change_percentage_24h_in_currency?.toFixed(2) ?? 'N/A'}%
              </Typography>
              <Typography color={coin.price_change_percentage_7d_in_currency >= 0 ? 'success.main' : 'error.main'}>
                7d: {coin.price_change_percentage_7d_in_currency?.toFixed(2) ?? 'N/A'}%
              </Typography>
              <Typography color={coin.price_change_percentage_30d_in_currency >= 0 ? 'success.main' : 'error.main'}>
                1m: {coin.price_change_percentage_30d_in_currency?.toFixed(2) ?? 'N/A'}%
              </Typography>
              <Typography color={coin.price_change_percentage_1y_in_currency >= 0 ? 'success.main' : 'error.main'}>
                1y: {coin.price_change_percentage_1y_in_currency?.toFixed(2) ?? 'N/A'}%
              </Typography>
            </Box>
          </Box>
        </Paper>
      ))}
    </Box>
  );
};

export default AllCoins; 