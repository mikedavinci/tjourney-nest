import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { CoinGeckoService } from './coingecko.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import {
  CoinGeckoCategoriesParams,
  CoinGeckoMarketCapChart,
  CoinGeckoNFTMarketChartByContractAddressParams,
  CoinGeckoNFTMarketChartParams,
  CoinGeckoNFTMarketDataParams,
  CoinGeckoNFTsListParams,
  CoinGeckoSimpleParams,
  CoinGeckoTopGainersLosersParams,
} from './interface.coingecko';

@ApiBearerAuth()
@ApiTags('CG Endpoints')
@UseGuards(JwtAuthGuard)
@Controller('cg')
export class CoinGeckoController {
  constructor(private readonly coinGeckoService: CoinGeckoService) {}

  // SIMPLE ENDPOINTS
  @Get('simple/price')
  @ApiOperation({
    summary:
      'Get the current price of any cryptocurrency in any other supported currencies that you need.',
    description: `Note: to check if a price is stale, please flag include_last_updated_at=true to get the latest updated time. You may also flag include_24hr_change=true to check if it returns 'null' value.

    Cache / Update Frequency: every 60 seconds (every 30 seconds for Pro API)`,
  })
  @ApiQuery({
    name: 'precision',
    type: String,
    required: false,
    description:
      'Full or any value between 0 - 18 to specify decimal place for currency price value',
  })
  @ApiQuery({
    name: 'include_last_updated_at',
    type: Boolean,
    required: false,
    description:
      'true/false to include last_updated_at of price, default: false',
  })
  @ApiQuery({
    name: 'include_24hr_change',
    type: Boolean,
    required: false,
    description: 'true/false to include 24hr change, default: false',
  })
  @ApiQuery({
    name: 'include_24hr_vol',
    type: Boolean,
    required: false,
    description: 'true/false to include 24hr_vol, default: false',
  })
  @ApiQuery({
    name: 'include_market_cap',
    type: Boolean,
    required: false,
    description: 'true/false to include market cap, default: false',
  })
  @ApiQuery({
    name: 'vs_currencies',
    type: String,
    required: true,
    description:
      'vs_currency of coins, comma-separated if querying more than 1 vs_currency',
  })
  @ApiQuery({
    name: 'ids',
    type: String,
    required: true,
    description: 'id of coins, comma-separated if querying more than 1 coin',
  })
  async getSimplePrice(@Query() params: CoinGeckoSimpleParams): Promise<void> {
    return this.coinGeckoService.getSimplePrice(params);
  }

  // COINS ENDPOINTS
  @Get('coins/list')
  @ApiOperation({
    summary:
      'List  all supported coins id, name and symbol (no pagination required)',
    description: `All the coins that show up on this /coins/list endpoint are Active coins. If a coin is inactive or deactivated, it will be removed from /coins/list.
    
    Cache / Update Frequency: every 5 minutes`,
  })
  async getCoinList() {
    return this.coinGeckoService.getCoinList();
  }

  @Get('coins/markets')
  @ApiOperation({
    summary:
      'List all supported coins price, market cap, volume, and market related data',
    description: `List all supported coins price, market cap, volume, and market related data | Cache / Update Frequency: every 10 minutes
    `,
  })
  @ApiQuery({
    name: 'vs_currency',
    type: String,
    required: true,
    description: 'Valid values: usd, jpy, krw, eur, mxn, etc',
  })

  // CONTRACT

  // ASSET PLATFORMS

  // CATEGORIES
  @Get('coins/categories/list')
  @ApiOperation({
    summary: 'List all categories',
    description: `List all categories | Cache / Update Frequency: every 5 minutes
    `,
  })
  async getCategoriesList() {
    return this.coinGeckoService.getCategoriesList();
  }

  @Get('coins/categories')
  @ApiOperation({
    summary: 'List all categories with market data',
    description: `List all categories with market data | Cache / Update Frequency: every 5 minutes
    `,
  })
  @ApiQuery({
    name: 'order',
    type: String,
    required: false,
    description:
      'Valid values: market_cap_desc (default), market_cap_asc, name_desc, name_asc, market_cap_change_24h_desc and market_cap_change_24h_asc',
  })
  async getCategoriesWithMarketData(
    @Query() params: CoinGeckoCategoriesParams,
  ) {
    return this.coinGeckoService.getCategoriesWithMarketData(params);
  }

  // EXCHANGES

  // DERIVATES

  // NFTS
  @Get('nfts/list')
  @ApiOperation({
    summary: 'List all supported NFT ids, paginated by 100 items per page',
    description: `Use this to obtain all the NFT ids in order to make API calls, paginated to 100 items.

    | Update Frequency: every 5 minutes
    `,
  })
  @ApiQuery({
    name: 'page',
    type: Number,
    required: false,
    description: 'Valid values: 1 … 10 | Default value: 1',
  })
  @ApiQuery({
    name: 'per_page',
    type: Number,
    required: false,
    description: 'Valid values: 1 … 250 | Default value: 100',
  })
  @ApiQuery({
    name: 'asset_platform_id',
    type: String,
    required: false,
    description: 'The id of the platform issuing tokens',
  })
  @ApiQuery({
    name: 'order',
    type: String,
    required: false,
    description:
      'Valid values: h24_volume_native_asc, h24_volume_native_desc, floor_price_native_asc, floor_price_native_desc, market_cap_native_asc, market_cap_native_desc, market_cap_usd_asc, market_cap_usd_desc',
  })
  async getNFTsList(@Query() params: CoinGeckoNFTsListParams) {
    return this.coinGeckoService.getNFTsList(params);
  }

  @Get('nfts/:id')
  @ApiOperation({
    summary:
      'Get current data (name, price_floor, volume_24h ...) for an NFT collection',
    description: `Get current data (name, price_floor, volume_24h ...) for an NFT collection. native_currency (string) is only a representative of the currency.

    | Cache / Update Frequency: every 60 seconds
    `,
  })
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
    description: 'The id of the NFT',
  })
  async getNFTData(@Param('id') id: string) {
    return this.coinGeckoService.getNFTData(id);
  }

  // EXCHANGE_RATES

  // SEARCH
  @Get('search')
  @ApiOperation({
    summary: 'Search for coins, exchanges, markets, and other crypto data',
    description: `Search for coins, exchanges, markets, and other crypto data, ordered by market cap. | Update Frequency: every 15 minute
    `,
  })
  @ApiQuery({
    name: 'query',
    type: String,
    required: true,
    description: 'The search query',
  })
  async search(@Query('query') query: string) {
    return this.coinGeckoService.search({ query });
  }

  // TRENDING
  @Get('search/trending')
  @ApiOperation({
    summary: 'Get Trending Coins, top 7 in the last 24 hours.',
    description: `Top-7 trending coins on CoinGecko as searched by users in the last 24 hours (Ordered by most popular first).
  Top-5 trending NFTs on CoinGecko based on the highest trading volume in the last 24 hours.
  
  Update Frequency: every 10 minute`,
  })
  async getTrending() {
    return this.coinGeckoService.getTrending();
  }

  // GLOBAL
  @Get('global')
  @ApiOperation({
    summary: 'Get cryptocurrency global data',
    description: `Get cryptocurrency global data | Update Frequency: every 10 minutes
    `,
  })
  async getGlobal() {
    return this.coinGeckoService.getGlobal();
  }

  @Get('global/decentralized_finance_defi')
  @ApiOperation({
    summary: 'Get cryptocurrency global decentralized finance(defi) data',
    description: `Get Top 100 cryptocurrency global decentralized finance(defi) data | Update Frequency: every 60 minutes
    `,
  })
  async getGlobalDeFi() {
    return this.coinGeckoService.getGlobalDeFi();
  }

  // COMPANIES

  // PRO ENDPOINTS
  @Get('coins/list/new')
  @ApiOperation({
    summary: 'PRO 🔥 - Get the latest 200 added coins',
    description:
      '🔥 Get the latest 200 coins (id & activated time) that recently listed',
  })
  async getNewlyAddedCoins() {
    return this.coinGeckoService.getNewlyAddedCoins();
  }

  @Get('coins/top_gainers_losers')
  @ApiOperation({
    summary: 'PRO 🔥 - Get the top 30 gainers and losers',
    description: `🔥 Get the top 30 coins with largest price gain and loss by a specific time duration. Update Frequency: 5 minutes
      
      Note: only coins with at least $50,000 24hour trading volume will be included`,
  })
  @ApiQuery({
    name: 'top_coins',
    type: String,
    required: false,
    description:
      'Valid values: 300, 500, 1000, all (default: 1000) | Filter result by MarketCap ranking (top 300 to 1000), or all coins (including coins that do not have MarketCap ranking)',
  })
  @ApiQuery({
    name: 'duration',
    type: String,
    required: false,
    description: 'Valid values: 1h, 24h, 7d, 14d, 30d, 60d, 1y (default: 24h)',
  })
  @ApiQuery({
    name: 'vs_currency',
    type: String,
    required: true,
    description: 'Valid values: usd, jpy, krw, eur, mxn, etc',
  })
  async getTopGainersLosers(@Query() params: CoinGeckoTopGainersLosersParams) {
    return this.coinGeckoService.getTopGainersLosers(params);
  }

  @Get('global/market_cap_chart')
  @ApiOperation({
    summary: 'PRO 🔥 - Get historical global market cap and volume data',
    description: `🔥 Get historical global market cap and volume data, by number of days away from now. | Update Frequency: 60 minutes
    
    Data Granularity (auto): 1 day from now = hourly data, 2 days & above from now = daily data (00:00 UTC)`,
  })
  @ApiQuery({
    name: 'vs_currency',
    type: String,
    required: false,
    description: 'Valid values: usd, jpy, krw, eur, mxn, etc',
  })
  @ApiQuery({
    name: 'days',
    type: String,
    required: true,
    description: 'Valid values: any integer e.g. 1, 14, 30 , … or max',
  })
  async getGlobalMarketCapChart(@Query() params: CoinGeckoMarketCapChart) {
    return this.coinGeckoService.getGlobalMarketCapChart(params);
  }

  @Get('nfts/markets')
  @ApiOperation({
    summary: 'PRO 🔥 - NFT related data ',
    description: `🔥 Get the list of all supported NFT floor price, market cap, volume and market related data.
      
      Tips:
- Other nfts endpoints are also available on our Free API documentation page.
- By default, this endpoint will return 100 results per page and only 1 page.
- To get the number 251-500 NFTs ranked by 24hr volume as seen on CoinGecko NFT page , you may include these parameters: per_page=250, page=2 and order=h24_volume_usd_desc
- Update Frequency: 5 minutes
      `,
  })
  @ApiQuery({
    name: 'page',
    type: Number,
    required: false,
    description:
      'Valid values: any integer e.g. 1, 2, 10, … | Default value: 1',
  })
  @ApiQuery({
    name: 'per_page',
    type: Number,
    required: false,
    description:
      'Default value: 100 Max value is 250 | You can only get up to 250 results per page.',
  })
  @ApiQuery({
    name: 'order',
    type: String,
    required: false,
    description: `Valid values: h24_volume_native_asc, h24_volume_native_desc, h24_volume_usd_asc, h24_volume_usd_desc, market_cap_usd_asc, market_cap_usd_desc, Default: market_cap_usd_desc`,
  })
  @ApiQuery({
    name: 'asset_platform_id',
    type: String,
    required: false,
    description: `Valid values: ethereum, avalanche, polygon-pos, arbitrum-one, optimistic-ethereum, klay-token`,
  })
  async getNFTMarketData(@Query() params: CoinGeckoNFTMarketDataParams) {
    return this.coinGeckoService.getNFTMarketData(params);
  }

  @Get('nfts/:id/market_chart')
  @ApiOperation({
    summary: 'PRO 🔥 - Get historical market data of a NFT collection',
    description: `🔥 Get historical market data of a NFT collection, including floor price, market cap, and 24h volume, by number of days away from now. | Update Frequency: 5 minutes
    
    Data Granularity (auto):
- 1 to 14 days from now = 10 minute data
- 15 days & above from now = daily data (00:00 UTC)
`,
  })
  @ApiQuery({
    name: 'days',
    type: String,
    required: true,
    description: 'Valid values: any integer e.g. 1, 14, 30, 90, … or max',
  })
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
    description: 'Valid values: cryptopunks, bored-ape-yacht-club, ...',
  })
  async getNFTMarketChart(
    @Param('id') id: string,
    @Query() query: CoinGeckoNFTMarketChartParams,
  ) {
    return this.coinGeckoService.getNFTMarketChart(id, query);
  }

  @Get('nfts/:asset_platform_id/contract/:contract_address/market_chart')
  @ApiOperation({
    summary: 'PRO 🔥 - Get historical market data of a NFT collection',
    description: `🔥 Get historical market data of a NFT collection using contract address, including floor price, market cap, and 24h volume, by number of days away from now. | Update Frequency: 5 minutes
    
    - 1 to 14 days from now = 10 minute data
    - 15 days & above from now = daily data (00:00 UTC)
    `,
  })
  @ApiQuery({
    name: 'days',
    type: String,
    required: true,
    description: 'Valid values: any integer e.g. 1, 14, 30, 90, … or max',
  })
  @ApiParam({
    name: 'asset_platform_id',
    type: String,
    required: true,
    description:
      'Valid values: ethereum, avalanche, polygon-pos, arbitrum-one, optimistic-ethereum, klay-token',
  })
  @ApiParam({
    name: 'contract_address',
    type: String,
    required: true,
    description:
      'Valid values: 0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d, ...',
  })
  async getNFTMarketChartByContractAddress(
    @Param('asset_platform_id') asset_platform_id: string,
    @Param('contract_address') contract_address: string,
    @Query() query: CoinGeckoNFTMarketChartByContractAddressParams,
  ) {
    return this.coinGeckoService.getNFTMarketChartByContractAddress(
      asset_platform_id,
      contract_address,
      query,
    );
  }

  @Get('nfts/:id/tickers')
  @ApiOperation({
    summary:
      'PRO 🔥 - Get the latest floor price and 24h volume of a NFT collection',
    description: `🔥 Get the latest floor price and 24h volume of a NFT collection, on each NFT marketplace, e.g. OpenSea and Looksrare. | Update Frequency: 30 seconds`,
  })
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
    description: 'Valid values: cryptopunks, bored-ape-yacht-club, ...',
  })
  async getNFTTickers(@Param('id') id: string) {
    return this.coinGeckoService.getNFTTickers(id);
  }

  @Get('exchanges/:id/volume_chart/range')
  @ApiOperation({
    summary: 'PRO 🔥 - Get exchange volume in BTC',
    description: `🔥 Get historical volume data (in BTC) of an exchange, by specifying a date range (up to 31 days per call) | Update Frequency: 5 minute
    
    Tip: You may convert human readable date to UNIX timestamp using tools like https://www.epochconverter.com/
    `,
  })
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
    description: 'Valid values: binance, uniswap_v3, bitstamp, ...',
  })
  @ApiQuery({
    name: 'from',
    type: Number,
    required: true,
    description: 'Valid values: UNIX timestamp e.g. 1672531200',
  })
  @ApiQuery({
    name: 'to',
    type: Number,
    required: true,
    description: 'Valid values: UNIX timestamp e.g. 1675123200',
  })
  async getExchangeVolumeInBTC(
    @Param('id') id: string,
    @Query('from') from: number,
    @Query('to') to: number,
  ) {
    return this.coinGeckoService.getExchangeVolumeInBTC(id, from, to);
  }
}
