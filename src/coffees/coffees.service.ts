import { Injectable } from '@nestjs/common';
import { Coffee } from './entities/coffe.entity';

@Injectable()
export class CoffeesService {
  private coffees: Coffee[] = [
    {
      id: 1,
      name: 'Shipwreck Roast',
      brand: 'Buddy Brew',
      flavors: ['chocolate', 'vanilla'],
    },
  ];

  findAll() {
    return this.coffees;
  }

  findOne(id: string) {
    return this.coffees.find((c) => c.id === +id);
  }

  create(createCoffeDto: any) {
    this.coffees.push(createCoffeDto);
    return createCoffeDto;
  }

  update(id: string, updateCoffeDto: any) {
    const coffee = this.findOne(id);
    if (coffee) {
    }
  }

  remove(id: string) {
    const i = this.coffees.findIndex((item) => item.id === +id);
    if (i >= 0) {
      this.coffees.splice(i, 1);
    }
  }
}
