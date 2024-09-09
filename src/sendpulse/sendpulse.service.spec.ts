import { Test, TestingModule } from '@nestjs/testing';
import { SendpulseService } from './sendpulse.service';

describe('SendpulseService', () => {
  let service: SendpulseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SendpulseService],
    }).compile();

    service = module.get<SendpulseService>(SendpulseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
