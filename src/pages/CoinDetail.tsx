import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, CircularProgress, ToggleButton, ToggleButtonGroup, Paper } from '@mui/material';
import axios from 'axios';
import { createChart } from 'lightweight-charts';
import CandleStickChart, { CandleData } from '../components/CandleStickChart';

const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';
const BASE_URL = 'https://api.coingecko.com/api/v3';
const API_KEY = process.env.REACT_APP_COINGECKO_API_KEY || ''; // Get API key from environment variable

// Rate limiting
let lastRequestTime = 0;
const RATE_LIMIT_DELAY = 6000; // 6 seconds between requests

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const makeRequest = async <T,>(url: string, config: { 
  headers?: Record<string, string>;
  params?: Record<string, string | number | undefined>;
} = {}): Promise<{ data: T }> => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
    await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY - timeSinceLastRequest));
  }
  
  lastRequestTime = Date.now();
  
  try {
    const response = await axios.get<T>(`${url}`, {
      ...config,
      headers: {
        ...config.headers,
        'Accept': 'application/json'
      }
    });

    // Check if the response is wrapped in a CORS proxy response
    const data = response.data;
    if (typeof data === 'string') {
      try {
        const parsed = JSON.parse(data);
        return { data: parsed };
      } catch (e) {
        console.error('Failed to parse response data:', data);
        throw new Error('Invalid response format');
      }
    }
    return { data };
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

const timeframes = [
  { label: '24h', value: '1' },
  { label: '7d', value: '7' },
  { label: '1m', value: '30' },
  { label: '1y', value: '365' },
];

interface PriceResponse {
  [key: string]: {
    usd: number;
  };
}

interface OHLCResponse extends Array<number[]> {}

const CoinDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [coin, setCoin] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [priceChange, setPriceChange] = useState<{
    '24h': number | null;
    '7d': number | null;
    '30d': number | null;
    '1y': number | null;
  }>({ '24h': null, '7d': null, '30d': null, '1y': null });

  useEffect(() => {
    const fetchCoin = async () => {
      setLoading(true);
      setError(null);
      try {
        const cacheKey = `coin-detail-${id}`;
        const cached = localStorage.getItem(cacheKey);
        const now = Date.now();
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (now - timestamp < 2 * 60 * 1000) { // 2 minutes cache
            setCoin(data.coin);
            setCurrentPrice(data.currentPrice);
            setPriceChange(data.priceChange || { '24h': null, '7d': null, '30d': null, '1y': null });
            setLoading(false);
            return;
          }
        }

        const headers = {
          'Accept': 'application/json',
        };

        // Fetch coin market data
        const coinRes = await makeRequest<any>(`${BASE_URL}/coins/${id}`, {
          params: {
            localization: 'false',
            tickers: 'false',
            market_data: 'true',
            community_data: 'false',
            developer_data: 'false',
            sparkline: 'false'
          },
          headers
        });

        let coinData;
        try {
          const rawCoinData = typeof coinRes.data === 'string' ? JSON.parse(coinRes.data) : coinRes.data;
          coinData = rawCoinData.contents ? JSON.parse(rawCoinData.contents) : rawCoinData;
        } catch (err) {
          console.error('Failed to parse response data:', { coinRes: coinRes.data });
          throw new Error('Invalid response data format');
        }

        const price = coinData?.market_data?.current_price?.usd ?? null;
        const priceChange = {
          '24h': coinData?.market_data?.price_change_percentage_24h_in_currency?.usd ?? null,
          '7d': coinData?.market_data?.price_change_percentage_7d_in_currency?.usd ?? null,
          '30d': coinData?.market_data?.price_change_percentage_30d_in_currency?.usd ?? null,
          '1y': coinData?.market_data?.price_change_percentage_1y_in_currency?.usd ?? null,
        };
        setCoin(coinData);
        setCurrentPrice(price);
        setPriceChange(priceChange);
        localStorage.setItem(cacheKey, JSON.stringify({
          data: { coin: coinData, currentPrice: price, priceChange },
          timestamp: now
        }));
      } catch (err: any) {
        const errorMessage = err?.response?.data?.error || err?.message || 'Failed to fetch coin details or price.';
        setError(errorMessage);
        console.error('Coin detail fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchCoin();
  }, [id]);

  if (loading) return <Box p={4} textAlign="center"><CircularProgress /></Box>;
  if (error) return (
    <Box p={4} textAlign="center">
      <Typography color="error">
        {typeof error === 'string' ? error : (error as any)?.message || String(error)}
      </Typography>
    </Box>
  );
  if (!coin || typeof coin !== 'object' || !coin.image || !coin.name || !coin.symbol) {
    return (
      <Box p={4} textAlign="center">
        <Typography color="error">Coin data is unavailable or invalid.</Typography>
      </Box>
    );
  }

  return (
    <Box p={4} textAlign="center">
      <img src={coin.image.large} alt={coin.name} style={{ width: 80, height: 80, marginBottom: 16 }} />
      <Typography variant="h3" fontWeight={700} mb={2}>{coin.name} ({coin.symbol.toUpperCase()})</Typography>
      <Typography variant="h2" color="primary" fontWeight={900} mb={3}>
        {typeof currentPrice === 'number' ? `$${currentPrice.toLocaleString()}` : 'Price not available'}
      </Typography>
      <Box display="flex" justifyContent="center" gap={4} flexWrap="wrap" mb={2}>
        <Box>
          <Typography variant="subtitle1">24h Change</Typography>
          <Typography variant="h5" color={priceChange['24h'] !== null ? (priceChange['24h'] >= 0 ? 'success.main' : 'error.main') : 'textSecondary'}>
            {priceChange['24h'] !== null ? `${priceChange['24h'].toFixed(2)}%` : 'N/A'}
          </Typography>
        </Box>
        <Box>
          <Typography variant="subtitle1">7d Change</Typography>
          <Typography variant="h5" color={priceChange['7d'] !== null ? (priceChange['7d'] >= 0 ? 'success.main' : 'error.main') : 'textSecondary'}>
            {priceChange['7d'] !== null ? `${priceChange['7d'].toFixed(2)}%` : 'N/A'}
          </Typography>
        </Box>
        <Box>
          <Typography variant="subtitle1">1m Change</Typography>
          <Typography variant="h5" color={priceChange['30d'] !== null ? (priceChange['30d'] >= 0 ? 'success.main' : 'error.main') : 'textSecondary'}>
            {priceChange['30d'] !== null ? `${priceChange['30d'].toFixed(2)}%` : 'N/A'}
          </Typography>
        </Box>
        <Box>
          <Typography variant="subtitle1">1y Change</Typography>
          <Typography variant="h5" color={priceChange['1y'] !== null ? (priceChange['1y'] >= 0 ? 'success.main' : 'error.main') : 'textSecondary'}>
            {priceChange['1y'] !== null ? `${priceChange['1y'].toFixed(2)}%` : 'N/A'}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default CoinDetail; 