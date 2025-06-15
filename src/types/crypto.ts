export interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d_in_currency: number;
  total_volume: number;
  circulating_supply: number;
}

export interface CryptoState {
  cryptos: CryptoData[];
  loading: boolean;
  error: string | null;
} 