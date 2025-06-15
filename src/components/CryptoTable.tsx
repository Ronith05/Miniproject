import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  IconButton,
  Collapse,
} from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp, Star, StarBorder } from '@mui/icons-material';
import { CryptoData } from '../types/crypto';
import PriceChart from './PriceChart';

interface CryptoTableProps {
  cryptos: CryptoData[];
  onWatchlistToggle: (coinId: string) => void;
  watchlist: string[];
}

const CryptoTable: React.FC<CryptoTableProps> = ({ cryptos, onWatchlistToggle, watchlist }) => {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const formatPercentage = (num: number) => {
    return `${num.toFixed(2)}%`;
  };

  const handleRowClick = (coinId: string) => {
    setExpandedRow(expandedRow === coinId ? null : coinId);
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>#</TableCell>
            <TableCell>Name</TableCell>
            <TableCell align="right">Price</TableCell>
            <TableCell align="right">24h %</TableCell>
            <TableCell align="right">7d %</TableCell>
            <TableCell align="right">Market Cap</TableCell>
            <TableCell align="right">Volume(24h)</TableCell>
            <TableCell align="right">Circulating Supply</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {cryptos.map((crypto) => (
            <React.Fragment key={crypto.id}>
              <TableRow hover onClick={() => handleRowClick(crypto.id)}>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onWatchlistToggle(crypto.id);
                    }}
                  >
                    {watchlist.includes(crypto.id) ? <Star color="primary" /> : <StarBorder />}
                  </IconButton>
                </TableCell>
                <TableCell>{crypto.market_cap_rank}</TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <img
                      src={crypto.image}
                      alt={crypto.name}
                      style={{ width: 24, height: 24, marginRight: 8 }}
                    />
                    <Typography variant="body1">{crypto.name}</Typography>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      style={{ marginLeft: 8 }}
                    >
                      {crypto.symbol.toUpperCase()}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell align="right">{formatNumber(crypto.current_price)}</TableCell>
                <TableCell
                  align="right"
                  style={{
                    color: crypto.price_change_percentage_24h >= 0 ? 'green' : 'red',
                  }}
                >
                  {formatPercentage(crypto.price_change_percentage_24h)}
                </TableCell>
                <TableCell
                  align="right"
                  style={{
                    color: crypto.price_change_percentage_7d_in_currency >= 0 ? 'green' : 'red',
                  }}
                >
                  {formatPercentage(crypto.price_change_percentage_7d_in_currency)}
                </TableCell>
                <TableCell align="right">{formatNumber(crypto.market_cap)}</TableCell>
                <TableCell align="right">{formatNumber(crypto.total_volume)}</TableCell>
                <TableCell align="right">
                  {formatNumber(crypto.circulating_supply)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={9}>
                  <Collapse in={expandedRow === crypto.id} timeout="auto" unmountOnExit>
                    <Box margin={1}>
                      <Typography variant="h6" gutterBottom component="div">
                        Price History
                      </Typography>
                      <PriceChart coinId={crypto.id} />
                    </Box>
                  </Collapse>
                </TableCell>
              </TableRow>
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default CryptoTable; 