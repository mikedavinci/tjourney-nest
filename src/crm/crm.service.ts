import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateContactDto } from './dto/create-contact.dto';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';
import { Contact } from './entities/contact-status.entity';
import { Deal } from './entities/deal.entity';

@Injectable()
export class CrmService {
  constructor(
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
    @InjectRepository(Deal)
    private readonly dealRepository: Repository<Deal>
  ) {}

  // Contact methods
  async createContact(createContactDto: CreateContactDto): Promise<Contact> {
    const contact = this.contactRepository.create(createContactDto);
    return this.contactRepository.save(contact);
  }

  async getAllContacts(): Promise<Contact[]> {
    return this.contactRepository.find();
  }

  async getContactById(id: string): Promise<Contact> {
    const contact = await this.contactRepository.findOne({ where: { id } });
    if (!contact) {
      throw new NotFoundException('Contact not found');
    }
    return contact;
  }

  // async updateContact(
  //   id: string,
  //   updateContactDto: UpdateContactDto
  // ): Promise<Contact> {
  //   const contact = await this.getContactById(id);
  //   Object.assign(contact, updateContactDto);
  //   return this.contactRepository.save(contact);
  // }

  async deleteContact(id: string): Promise<void> {
    const result = await this.contactRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Contact not found');
    }
  }

  // Deal methods
  async createDeal(createDealDto: CreateDealDto): Promise<Deal> {
    const deal = this.dealRepository.create(createDealDto);
    return this.dealRepository.save(deal);
  }

  async getAllDeals(): Promise<Deal[]> {
    return this.dealRepository.find();
  }

  async getDealById(id: string): Promise<Deal> {
    const deal = await this.dealRepository.findOne({ where: { id } });
    if (!deal) {
      throw new NotFoundException('Deal not found');
    }
    return deal;
  }

  async updateDeal(id: string, updateDealDto: UpdateDealDto): Promise<Deal> {
    const deal = await this.getDealById(id);
    Object.assign(deal, updateDealDto);
    return this.dealRepository.save(deal);
  }

  async deleteDeal(id: string): Promise<void> {
    const result = await this.dealRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Deal not found');
    }
  }
}
