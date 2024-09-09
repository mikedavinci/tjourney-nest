import { Test, TestingModule } from '@nestjs/testing';
import { SendpulseController } from './sendpulse.controller';
import { SendpulseService } from './sendpulse.service';

describe('SendpulseController', () => {
  let controller: SendpulseController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SendpulseController],
      providers: [SendpulseService],
    }).compile();

    controller = module.get<SendpulseController>(SendpulseController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
