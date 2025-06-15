import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Box, Typography, CircularProgress } from '@mui/material';
import axios from 'axios';

interface PriceChartProps {
  coinId: string;
}

interface ChartData {
  prices: [number, number][];
}

const PriceChart: React.FC<PriceChartProps> = ({ coinId }) => {
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await axios.get<ChartData>(
          `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart`,
          {
            params: {
              vs_currency: 'usd',
              days: '7',
              interval: 'daily',
            },
          }
        );
        setChartData(response.data);
      } catch (error) {
        console.error('Error fetching chart data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [coinId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (!chartData) {
    return <Typography>No data available</Typography>;
  }

  const formattedData = chartData.prices.map(([timestamp, price]) => ({
    date: new Date(timestamp).toLocaleDateString(),
    price,
  }));

  return (
    <Box height={300} width="100%">
      <ResponsiveContainer>
        <LineChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis domain={['auto', 'auto']} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#8884d8"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default PriceChart; 