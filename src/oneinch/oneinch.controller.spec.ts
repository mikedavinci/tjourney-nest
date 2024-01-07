import { Test, TestingModule } from '@nestjs/testing';
import { OneinchController } from './oneinch.controller';
import { OneinchService } from './oneinch.service';

describe('OneinchController', () => {
  let controller: OneinchController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OneinchController],
      providers: [OneinchService],
    }).compile();

    controller = module.get<OneinchController>(OneinchController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
