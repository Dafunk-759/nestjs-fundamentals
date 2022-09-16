import { Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { UpdateCoffeeDto } from './dto/update-coffee.dto';
import { Coffee } from './entities/coffe.entity';
import { Flavor } from './entities/flavor.entity';
import { Event } from '../events/entities/event.entity';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { ConfigType } from '@nestjs/config';
import coffeesConfig from './config/coffees.config';

@Injectable({
  scope: Scope.DEFAULT, // for every app
  // scope: Scope.TRANSIENT, // for every use
  // scope: Scope.REQUEST, // for every request
})
export class CoffeesService {
  constructor(
    @InjectRepository(Coffee)
    private readonly coffeeRepository: Repository<Coffee>,
    @InjectRepository(Flavor)
    private readonly flavorRepository: Repository<Flavor>,
    private readonly dataSource: DataSource,
    @Inject(coffeesConfig.KEY)
    private readonly coffeesConfiguration: ConfigType<typeof coffeesConfig>,
  ) {
    console.log(coffeesConfiguration.foo);
  }

  private coffeeNotFound(coffee: any, id: any) {
    if (!coffee) {
      throw new NotFoundException(`Coffee #${id} not found`);
    }
  }

  private async preloadFlavorByName(name: string) {
    const existingFlavor = await this.flavorRepository.findOne({
      where: { name },
    });

    if (existingFlavor) return existingFlavor;
    return this.flavorRepository.create({ name });
  }

  findAll({ limit, offset }: PaginationQueryDto) {
    return this.coffeeRepository.find({
      relations: ['flavors'],
      skip: offset,
      take: limit,
    });
  }

  async findOne(id: number) {
    const coffee = await this.coffeeRepository.findOne({
      where: { id },
      relations: ['flavors'],
    });
    this.coffeeNotFound(coffee, id);
    return coffee;
  }

  async create(createCoffeDto: CreateCoffeeDto) {
    const flavors = await Promise.all(
      createCoffeDto.flavors.map((flavorName) =>
        this.preloadFlavorByName(flavorName),
      ),
    );

    const coffee = this.coffeeRepository.create({
      ...createCoffeDto,
      flavors,
    });
    return this.coffeeRepository.save(coffee);
  }

  async update(id: string, updateCoffeDto: UpdateCoffeeDto) {
    let flavors: Flavor[] = [];
    if (updateCoffeDto.flavors) {
      flavors = await Promise.all(
        updateCoffeDto.flavors.map((flavorName) =>
          this.preloadFlavorByName(flavorName),
        ),
      );
    }

    const coffee = await this.coffeeRepository.preload({
      id: +id,
      ...updateCoffeDto,
      flavors,
    });
    this.coffeeNotFound(coffee, id);
    return this.coffeeRepository.save(coffee);
  }

  async remove(id: number) {
    const coffee = await this.findOne(id);
    return this.coffeeRepository.remove(coffee);
  }

  async recommendCoffee(coffee: Coffee) {
    const qr = this.dataSource.createQueryRunner();

    await qr.connect();
    await qr.startTransaction();

    try {
      coffee.recommendations++;

      const recommendEvent = new Event();
      recommendEvent.name = 'recommend_coffee';
      recommendEvent.type = 'coffee';
      recommendEvent.payload = { coffeeId: coffee.id };

      await qr.manager.save(coffee);
      await qr.manager.save(recommendEvent);

      await qr.commitTransaction();
    } catch (err) {
      await qr.rollbackTransaction();
    } finally {
      await qr.release();
    }
  }
}
