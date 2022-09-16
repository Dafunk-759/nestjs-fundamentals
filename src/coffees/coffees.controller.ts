import {
  Delete,
  Post,
  Controller,
  Get,
  Param,
  Body,
  Patch,
  Query,
} from '@nestjs/common';
import { CoffeesService } from './coffees.service';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { UpdateCoffeeDto } from './dto/update-coffee.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { Public } from '../common/decorators/public.decorator';
import { ParseIntPipe } from '../common/pipes/parse-int.pipe';
import { Protocol } from '../common/decorators/protocol.decorator';
import { ApiTags, ApiForbiddenResponse } from '@nestjs/swagger';

import * as assert from 'node:assert';
import * as timer from 'node:timers/promises';

@ApiTags('coffees')
@Controller('coffees')
export class CoffeesController {
  constructor(
    private readonly coffeeService: CoffeesService, // @Inject(REQUEST) private readonly request: Request
  ) {
    // due to REQUEST is for every request init and bubble
    // to this controller, then this controller is also
    // for every request
    console.count('CoffeesController instantiated times');
  }

  @ApiForbiddenResponse({ description: 'Forbidden' })
  @Public()
  @Get()
  async findAll(
    @Protocol('https') proto: string,
    @Query() pageQuery: PaginationQueryDto,
  ) {
    // console.log('protocol', proto);
    return this.coffeeService.findAll(pageQuery);
  }

  @Public()
  @Get('timeout')
  timeout() {
    return timer.setTimeout(4000, 'timeout');
  }

  @Get(':id')
  @Public()
  findOne(@Param('id', ParseIntPipe) id: number) {
    // console.log('id:', id);
    return this.coffeeService.findOne(id);
  }

  @Post()
  @Public()
  create(@Body() createCoffeeDto: CreateCoffeeDto) {
    assert(
      createCoffeeDto instanceof CreateCoffeeDto,
      'createCoffeeDto is instanceof CreateCoffeeDto',
    );
    return this.coffeeService.create(createCoffeeDto);
  }

  @Patch(':id')
  @Public()
  update(@Param('id') id: string, @Body() updateCoffeeDto: UpdateCoffeeDto) {
    return this.coffeeService.update(id, updateCoffeeDto);
  }

  @Delete(':id')
  @Public()
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.coffeeService.remove(id);
  }
}
