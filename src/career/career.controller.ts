// careers.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseInterceptors,
  UploadedFile,
  UseFilters,
} from '@nestjs/common';
import { CareersService } from './career.service';
import { Career } from './entities/career.entity';
import { CreateCareerDto } from './dto/create-career.dto';
import { UpdateCareerDto } from './dto/update-career.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileSizeExceptionFilter } from './file-size.filter';

@Controller('careers')
export class CareersController {
  constructor(private readonly careersService: CareersService) {}

  @Post('submit')
  @UseInterceptors(
    FileInterceptor('resume', {
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
      fileFilter: (req, file, callback) => {
        if (!file) {
          callback(null, true); // Allow request without file
        } else {
          // Apply file type validation if needed
          callback(null, true);
        }
      },
    })
  )
  @UseFilters(FileSizeExceptionFilter)
  async create(
    @Body() createCareerDto: CreateCareerDto,
    @UploadedFile() resume?: Express.Multer.File
  ): Promise<{ statusCode: number; message: string }> {
    if (resume) {
      createCareerDto.resume = resume.buffer;
    }
    return this.careersService.create(createCareerDto);
  }

  @Get()
  async findAll(): Promise<Career[]> {
    return this.careersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Career> {
    return this.careersService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateCareerDto: UpdateCareerDto
  ): Promise<Career> {
    return this.careersService.update(id, updateCareerDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number): Promise<void> {
    return this.careersService.remove(id);
  }
}
