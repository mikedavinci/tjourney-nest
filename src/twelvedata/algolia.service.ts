import { Injectable } from '@nestjs/common';
import algoliasearch, { SearchClient, SearchIndex } from 'algoliasearch';
import { TwelveDataSymbolSearch } from './entities/twelvedatum.entity';

@Injectable()
export class AlgoliaService {
  private client: SearchClient;
  private symbolSearchIndex: SearchIndex;

  constructor() {
    this.client = algoliasearch('YOUR_APP_ID', 'YOUR_API_KEY');
    this.symbolSearchIndex = this.client.initIndex('twelvedata_symbol_search');
  }

  async addSymbolToIndex(symbol: TwelveDataSymbolSearch): Promise<void> {
    await this.symbolSearchIndex.saveObject({
      objectID: symbol.id.toString(),
      symbol: symbol.symbol,
      instrumentName: symbol.instrumentName,
      exchange: symbol.exchange,
      micCode: symbol.micCode,
      exchangeTimezone: symbol.exchangeTimezone,
      instrumentType: symbol.instrumentType,
      country: symbol.country,
      currency: symbol.currency,
    });
  }

  async searchSymbols(query: string): Promise<any> {
    const { hits } = await this.symbolSearchIndex.search(query);
    return hits;
  }

  async deleteSymbolFromIndex(symbolId: string): Promise<void> {
    await this.symbolSearchIndex.deleteObject(symbolId);
  }
}
