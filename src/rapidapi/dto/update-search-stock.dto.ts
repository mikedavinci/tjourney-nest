import { PartialType } from '@nestjs/swagger';
import { StockSearchResponseDto } from './search-stock.dto';

export class UpdateSearchStockDto extends PartialType(StockSearchResponseDto) {}
