import { Test, TestingModule } from '@nestjs/testing';
import { CoingeckoController } from './coingecko.controller';
import { CoingeckoService } from './coingecko.service';

describe('CoingeckoController', () => {
  let controller: CoingeckoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CoingeckoController],
      providers: [CoingeckoService],
    }).compile();

    controller = module.get<CoingeckoController>(CoingeckoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
