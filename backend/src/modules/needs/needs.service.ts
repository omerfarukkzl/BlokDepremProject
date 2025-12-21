import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Need } from '../../entities/need.entity';
import { CreateNeedDto } from './dto/create-need.dto';
import { UpdateNeedDto } from './dto/update-need.dto';

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  locationId?: string;
  aidItemId?: string;
  urgencyLevel?: string;
  status?: string;
  search?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface NeedsStats {
  totalNeeds: number;
  criticalNeeds: number;
  fulfilledNeeds: number;
  activeNeeds: number;
}

@Injectable()
export class NeedsService {
  constructor(
    @InjectRepository(Need)
    private readonly needRepository: Repository<Need>,
  ) { }

  async findAll(params?: PaginationParams): Promise<PaginatedResponse<Need>> {
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const skip = (page - 1) * limit;

    const queryBuilder = this.needRepository
      .createQueryBuilder('need')
      .leftJoinAndSelect('need.location', 'location')
      .leftJoinAndSelect('need.item', 'item');

    // Apply filters
    if (params?.locationId) {
      queryBuilder.andWhere('need.location_id = :locationId', {
        locationId: parseInt(params.locationId)
      });
    }

    if (params?.aidItemId) {
      queryBuilder.andWhere('need.item_id = :aidItemId', {
        aidItemId: parseInt(params.aidItemId)
      });
    }

    if (params?.urgencyLevel) {
      const priorityMap: Record<string, number> = {
        critical: 4,
        high: 3,
        medium: 2,
        low: 1,
      };
      const priorityValue = priorityMap[params.urgencyLevel];
      if (priorityValue) {
        queryBuilder.andWhere('need.priority = :priority', { priority: priorityValue });
      }
    }

    if (params?.status === 'fulfilled') {
      queryBuilder.andWhere('need.supplied_quantity >= need.needed_quantity');
    } else if (params?.status === 'active') {
      queryBuilder.andWhere('need.supplied_quantity < need.needed_quantity');
    }

    // Apply sorting
    const sortField = params?.sortBy === 'quantityNeeded' ? 'need.needed_quantity'
      : params?.sortBy === 'urgencyLevel' ? 'need.priority'
        : 'need.updated_at';
    const sortOrder = params?.sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    queryBuilder.orderBy(sortField, sortOrder);

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply pagination
    queryBuilder.skip(skip).take(limit);

    const data = await queryBuilder.getMany();

    return {
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findByLocation(locationId: number): Promise<Need[]> {
    return this.needRepository.find({
      where: { location_id: locationId },
      relations: ['location', 'item'],
    });
  }

  async findOne(id: number): Promise<Need> {
    const need = await this.needRepository.findOne({
      where: { id },
      relations: ['location', 'item'],
    });

    if (!need) {
      throw new NotFoundException(`Need with ID ${id} not found`);
    }

    return need;
  }

  async create(createNeedDto: CreateNeedDto): Promise<Need> {
    const need = this.needRepository.create(createNeedDto);
    return this.needRepository.save(need);
  }

  async update(id: number, updateNeedDto: UpdateNeedDto): Promise<Need> {
    const need = await this.findOne(id);

    // Map frontend field names to backend field names if necessary
    const updateData: Partial<Need> = {};

    if (updateNeedDto.needed_quantity !== undefined) {
      updateData.needed_quantity = updateNeedDto.needed_quantity;
    }
    if (updateNeedDto.supplied_quantity !== undefined) {
      updateData.supplied_quantity = updateNeedDto.supplied_quantity;
    }
    if (updateNeedDto.priority !== undefined) {
      const priorityMap: Record<string, number> = {
        critical: 4,
        high: 3,
        medium: 2,
        low: 1,
      };
      updateData.priority = priorityMap[updateNeedDto.priority] || parseInt(updateNeedDto.priority) || 0;
    }

    Object.assign(need, updateData);
    return this.needRepository.save(need);
  }

  async remove(id: number): Promise<void> {
    const need = await this.findOne(id);
    await this.needRepository.remove(need);
  }

  async getStats(): Promise<NeedsStats> {
    const allNeeds = await this.needRepository.find();

    const totalNeeds = allNeeds.length;
    const criticalNeeds = allNeeds.filter(n => n.priority === 4).length;
    const fulfilledNeeds = allNeeds.filter(n => n.supplied_quantity >= n.needed_quantity).length;
    const activeNeeds = allNeeds.filter(n => n.supplied_quantity < n.needed_quantity).length;

    return {
      totalNeeds,
      criticalNeeds,
      fulfilledNeeds,
      activeNeeds,
    };
  }
}
