import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  AppBar,
  Toolbar,
  CircularProgress,
  Box,
  CssBaseline,
} from '@mui/material';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { getTopCryptos } from './services/cryptoService';
import CryptoTable from './components/CryptoTable';
import Watchlist from './components/Watchlist';
import ThemeSwitcher from './components/ThemeSwitcher';
import SearchBar from './components/SearchBar';
import { ThemeProvider } from './context/ThemeContext';
import { CryptoData } from './types/crypto';
import CoinDetail from './pages/CoinDetail';

function App() {
  const [cryptos, setCryptos] = useState<CryptoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [watchlist, setWatchlist] = useState<string[]>(() => {
    const saved = localStorage.getItem('watchlist');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getTopCryptos();
        setCryptos(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch cryptocurrency data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, []);

  const handleWatchlistToggle = (coinId: string) => {
    setWatchlist(prev =>
      prev.includes(coinId)
        ? prev.filter(id => id !== coinId)
        : [...prev, coinId]
    );
  };

  return (
    <ThemeProvider>
      <CssBaseline />
      <Router>
        <AppBar position="static">
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #232526 0%, #414345 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 8px 1px #111',
                  border: '3px solid #222',
                  mr: 2,
                }}
              >
                <span
                  style={{
                    fontFamily: 'Monoton, Orbitron, Bebas Neue, Impact, fantasy, cursive',
                    fontWeight: 900,
                    fontSize: 32,
                    color: '#00b4d8',
                    textShadow: '0 2px 16px #0077b6, 0 0px 32px #48cae4, 1px 1px 0 #222',
                    letterSpacing: 2,
                    lineHeight: 1,
                    textTransform: 'uppercase',
                  }}
                >
                  CT
                </span>
              </Box>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1, textAlign: 'left' }}>
                Crypto Tracker
              </Typography>
            </Box>
            <Box sx={{ flexGrow: 2, display: { xs: 'none', sm: 'block' } }}>
              <SearchBar cryptos={cryptos} />
            </Box>
            <ThemeSwitcher />
          </Toolbar>
        </AppBar>
        <Routes>
          <Route
            path="/"
            element={
              <Container maxWidth="xl" sx={{ mt: 4 }}>
                {loading ? (
                  <Box display="flex" justifyContent="center" mt={4}>
                    <CircularProgress />
                  </Box>
                ) : error ? (
                  <Typography color="error" align="center">
                    {error}
                  </Typography>
                ) : (
                  <Box sx={{ display: 'flex', gap: 3 }}>
                    <Box sx={{ flex: 3 }}>
                      <CryptoTable
                        cryptos={cryptos}
                        onWatchlistToggle={handleWatchlistToggle}
                        watchlist={watchlist}
                      />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Watchlist cryptos={cryptos} />
                    </Box>
                  </Box>
                )}
              </Container>
            }
          />
          <Route path="/coin/:id" element={<CoinDetail />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
