import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await AppModule.configApp(app).init();
  });

  describe('/coffees', () => {
    it('GET ALL', async () => {
      const res = await request(app.getHttpServer())
        .get('/coffees')
        .query({ limit: 20, offset: 10 })
        .expect(200);

      console.log(res.text, res.body);
    });

    it('GET 1', async () => {
      const res = await request(app.getHttpServer())
        .get('/coffees/1')
        .expect(200);

      expect(res.body).toMatchObject({ id: 1 });

      console.log(res.text, res.body, res.status);
    });

    it('GET NOT FOUND', async () => {
      const res = await request(app.getHttpServer())
        .get('/coffees/8964')
        .expect(404);

      expect(res.body).toMatchObject({ message: /not found/ });
      console.log(res.text, res.body);
    });

    it('DELETE', async () => {
      await request(app.getHttpServer()).delete('/coffees/1').expect(200);

      const res = await request(app.getHttpServer())
        .get('/coffees')
        .expect(200);

      console.log(res.text, res.body);
    });

    it('POST Validate', async () => {
      let res = await request(app.getHttpServer())
        .post('/coffees')
        .send({ name: 12 })
        .expect(400);

      expect(res.body).toMatchObject({
        message: [
          'name must be a string',
          'brand must be a string',
          'each value in flavors must be a string',
        ],
      });
      console.log(res.text, res.body);

      res = await request(app.getHttpServer())
        .post('/coffees')
        .send({ name: 'Coffe1', brand: 'CoffeBrand1', flavors: ['sweet'] })
        .expect(201);

      // const body1 = res.body;

      res = await request(app.getHttpServer())
        .post('/coffees')
        .send({
          name: 'Coffe1',
          brand: 'CoffeBrand1',
          flavors: ['sweet'],
          someProp: true,
        })
        .expect(400);

      console.log(res.body);
      // expect(res.body).toEqual(body1);
    });

    it('PATCH Validate', async () => {
      let res = await request(app.getHttpServer())
        .patch('/coffees/10')
        .send({ name: 1 })
        .expect(400);

      expect(res.body).toMatchObject({
        message: ['name must be a string'],
      });
      console.log(res.text, res.body);

      res = await request(app.getHttpServer())
        .patch('/coffees/10')
        .send({ name: 'Blue Sky' })
        .expect(200);
    });
  });
});
