import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await AppModule.configApp(app).init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/coffees', () => {
    it('GET ALL', async () => {
      const limit = 5,
        offset = 2;

      const getAll = async ({ limit, offset }: any) => {
        const res = await request(app.getHttpServer())
          .get('/coffees')
          .set('Authorization', process.env.API_KEY)
          .query({ limit, offset })
          .expect(200);
        if (limit) {
          expect(res.body.length).toBeLessThanOrEqual(limit);
        }
        // console.log(res.body);
      };

      await getAll({ limit, offset });
      await getAll({ limit });
      await getAll({ offset });
    });

    it('POST and GET', async () => {
      const e = { name: 'Coffe1', brand: 'CoffeBrand1', flavors: ['sweet'] };

      let res = await request(app.getHttpServer())
        .post('/coffees')
        .send(e)
        .expect(201);

      res = await request(app.getHttpServer())
        .get('/coffees/' + res.body.id)
        .expect(200);

      expect(res.body).toMatchObject({
        ...e,
        flavors: e.flavors.map((name) => ({ name })),
      });
    });

    it('POST and DELETE and GET and Exception Filter', async () => {
      const e = { name: 'Coffe1', brand: 'CoffeBrand1', flavors: ['sweet'] };

      let res = await request(app.getHttpServer())
        .post('/coffees')
        .send(e)
        .expect(201);

      await request(app.getHttpServer())
        .delete('/coffees/' + res.body.id)
        .expect(200);

      res = await request(app.getHttpServer())
        .get('/coffees/' + res.body.id)
        .expect(404);

      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('timestamp');
    });

    it('POST Validate', async () => {
      let res = await request(app.getHttpServer())
        .post('/coffees')
        .send({ name: 12 })
        .expect(400);

      expect(res.body).toMatchObject({
        message: [
          // 'name must be a string',
          //  transformOptions: {
          //    enableImplicitConversion: true,
          //    name已经被隐式转为string了 所以没有这一条
          //  },
          'brand must be a string',
          'each value in flavors must be a string',
        ],
      });

      res = await request(app.getHttpServer())
        .post('/coffees')
        .send({
          name: 'Coffe1',
          brand: 'CoffeBrand1',
          flavors: ['sweet'],
          someProp: true,
        })
        .expect(400);
    });

    it('POST and PATCH', async () => {
      const e = { name: 'Coffee1', brand: 'CoffeeBrand1', flavors: ['sweet'] };

      let res = await request(app.getHttpServer())
        .post('/coffees')
        .send(e)
        .expect(201);
      res = await request(app.getHttpServer())
        .patch('/coffees/' + res.body.id)
        .send({ name: 'Coffee2' })
        .expect(200);

      expect(res.body.name).toBe('Coffee2');
    });

    it.skip('timeout interceptor', async () => {
      const res = await request(app.getHttpServer())
        .get('/coffees/timeout')
        .expect(408);
      console.log(res.body);
    });
  });
});
