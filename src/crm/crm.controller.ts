// crm.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  NotFoundException,
} from '@nestjs/common';
import { CrmService } from './crm.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactUsDto } from 'src/contact_us/dto/update-contact_us.dto';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';

@Controller('crm')
export class CrmController {
  constructor(private readonly crmService: CrmService) {}

  // Contact endpoints
  @Post('contacts')
  async createContact(@Body() createContactDto: CreateContactDto) {
    const contact = await this.crmService.createContact(createContactDto);
    return {
      statusCode: 201,
      message: 'Contact created successfully',
      data: contact,
    };
  }

  @Get('contacts')
  async getAllContacts() {
    const contacts = await this.crmService.getAllContacts();
    return {
      statusCode: 200,
      message: 'Contacts retrieved successfully',
      data: contacts,
    };
  }

  @Get('contacts/:id')
  async getContactById(@Param('id') id: string) {
    const contact = await this.crmService.getContactById(id);
    if (!contact) {
      throw new NotFoundException('Contact not found');
    }
    return {
      statusCode: 200,
      message: 'Contact retrieved successfully',
      data: contact,
    };
  }

  // @Put('contacts/:id')
  // async updateContact(
  //   @Param('id') id: string,
  //   @Body() updateContactDto: UpdateContactUsDto
  // ) {
  //   const contact = await this.crmService.updateContact(id, updateContactDto);
  //   if (!contact) {
  //     throw new NotFoundException('Contact not found');
  //   }
  //   return {
  //     statusCode: 200,
  //     message: 'Contact updated successfully',
  //     data: contact,
  //   };
  // }

  @Delete('contacts/:id')
  async deleteContact(@Param('id') id: string) {
    await this.crmService.deleteContact(id);
    return {
      statusCode: 200,
      message: 'Contact deleted successfully',
    };
  }

  // Deal endpoints
  @Post('deals')
  async createDeal(@Body() createDealDto: CreateDealDto) {
    const deal = await this.crmService.createDeal(createDealDto);
    return {
      statusCode: 201,
      message: 'Deal created successfully',
      data: deal,
    };
  }

  @Get('deals')
  async getAllDeals() {
    const deals = await this.crmService.getAllDeals();
    return {
      statusCode: 200,
      message: 'Deals retrieved successfully',
      data: deals,
    };
  }

  @Get('deals/:id')
  async getDealById(@Param('id') id: string) {
    const deal = await this.crmService.getDealById(id);
    if (!deal) {
      throw new NotFoundException('Deal not found');
    }
    return {
      statusCode: 200,
      message: 'Deal retrieved successfully',
      data: deal,
    };
  }

  @Put('deals/:id')
  async updateDeal(
    @Param('id') id: string,
    @Body() updateDealDto: UpdateDealDto
  ) {
    const deal = await this.crmService.updateDeal(id, updateDealDto);
    if (!deal) {
      throw new NotFoundException('Deal not found');
    }
    return {
      statusCode: 200,
      message: 'Deal updated successfully',
      data: deal,
    };
  }

  @Delete('deals/:id')
  async deleteDeal(@Param('id') id: string) {
    await this.crmService.deleteDeal(id);
    return {
      statusCode: 200,
      message: 'Deal deleted successfully',
    };
  }
}
