import { Test, TestingModule } from '@nestjs/testing';
import { OneinchService } from './oneinch.service';

describe('OneinchService', () => {
  let service: OneinchService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OneinchService],
    }).compile();

    service = module.get<OneinchService>(OneinchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
