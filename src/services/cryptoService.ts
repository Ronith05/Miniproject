import axios from 'axios';
import { CryptoData } from '../types/crypto';

const BASE_URL = 'https://api.coingecko.com/api/v3';
// const API_KEY = '3c6334e0-79bb-4537-9f16-03a023417236';

export const getTopCryptos = async (): Promise<CryptoData[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/coins/markets`, {
      params: {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: 100,
        page: 1,
        sparkline: false,
        price_change_percentage: '24h,7d'
      }
      // REMOVED the headers property for free API compatibility
    });
    return response.data as CryptoData[];
  } catch (error: any) {
    console.error('Error fetching crypto data:', error?.response?.data || error.message);
    throw error;
  }
}; 