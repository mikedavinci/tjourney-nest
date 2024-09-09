// careers.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Career } from './entities/career.entity';
import { CreateCareerDto } from './dto/create-career.dto';
import { UpdateCareerDto } from './dto/update-career.dto';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class CareersService {
  constructor(
    @InjectRepository(Career)
    private readonly careerRepository: Repository<Career>,
    private mailService: MailService
  ) {}

  async create(
    createCareerDto: CreateCareerDto
  ): Promise<{ statusCode: number; message: string }> {
    try {
      const resume = createCareerDto.resume;

      if (resume && resume.length > 5 * 1024 * 1024) {
        return {
          statusCode: 400,
          message: 'File size too large. Please upload a file less than 5MB',
        };
      }

      const career = this.careerRepository.create(createCareerDto);
      await this.careerRepository.save(career);
      await this.mailService.sendCareerSubmissionEmail();

      return {
        statusCode: 201,
        message:
          'Your resume has been submitted successfully! We will review it and get back to you soon.',
      };
    } catch (error) {
      return {
        statusCode: 500,
        message:
          'Internal Server Error. Please try again later or contact support@pilotwizard.ai.',
      };
    }
  }

  async findAll(): Promise<Career[]> {
    return this.careerRepository.find();
  }

  async findOne(id: number): Promise<Career> {
    const career = await this.careerRepository.findOne({ where: { id } });
    if (!career) {
      throw new NotFoundException(`Career with ID ${id} not found`);
    }
    return career;
  }

  async update(id: number, updateCareerDto: UpdateCareerDto): Promise<Career> {
    const career = await this.findOne(id);
    Object.assign(career, updateCareerDto);
    return this.careerRepository.save(career);
  }

  async remove(id: number): Promise<void> {
    const career = await this.findOne(id);
    await this.careerRepository.remove(career);
  }
}
