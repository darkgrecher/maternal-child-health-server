import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import bcrypt from 'bcryptjs';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';

describe('Notifications wiring (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let accessToken = '';
  let midwifeId = '';
  const createdNotificationIds: string[] = [];

  beforeAll(async () => {
    if (!process.env.JWT_SECRET) {
      process.env.JWT_SECRET = 'test-secret';
    }

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = app.get(PrismaService);

    const email = `e2e.midwife+${Date.now()}@example.com`;
    const password = 'TestPass123!';
    const passwordHash = await bcrypt.hash(password, 10);

    const midwife = await prisma.midwife.create({
      data: {
        email,
        passwordHash,
        role: 'midwife',
        name: 'E2E Midwife',
      },
    });

    midwifeId = midwife.id;

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/midwife/login')
      .send({ email, password });

    expect(loginResponse.status).toBe(200);
    accessToken = loginResponse.body?.data?.accessToken ?? '';
    expect(accessToken).toBeTruthy();
  });

  afterAll(async () => {
    if (createdNotificationIds.length) {
      await prisma.notification.deleteMany({
        where: { id: { in: createdNotificationIds } },
      });
    }

    if (midwifeId) {
      await prisma.midwife.delete({ where: { id: midwifeId } }).catch(() => undefined);
    }

    await app.close();
  });

  it('creates notifications and lists them for web/mobile', async () => {
    const pushTitle = `E2E Push ${Date.now()}`;
    const pushMessage = 'E2E push message';
    const webTitle = `E2E Web ${Date.now()}`;
    const webMessage = 'E2E web push message';

    const pushResponse = await request(app.getHttpServer())
      .post('/notifications/push/test')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ title: pushTitle, message: pushMessage, data: { source: 'e2e' } })
      .expect(201);

    expect(pushResponse.body?.success).toBe(true);
    const pushData = pushResponse.body?.data;
    expect(pushData?.channel).toBe('in_app');
    expect(pushData?.title).toBe(pushTitle);
    expect(pushData?.message).toBe(pushMessage);
    expect(pushData?.deliveryError).toBe('No active device tokens');
    if (pushData?.id) {
      createdNotificationIds.push(pushData.id);
    }

    const webResponse = await request(app.getHttpServer())
      .post('/notifications/web-push/test')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ title: webTitle, message: webMessage, data: { source: 'e2e' } })
      .expect(201);

    expect(webResponse.body?.success).toBe(true);
    const webData = webResponse.body?.data;
    expect(webData?.channel).toBe('web_push');
    expect(webData?.title).toBe(webTitle);
    expect(webData?.message).toBe(webMessage);
    expect(webData?.deliveryError).toBe('No active web push subscriptions');
    if (webData?.id) {
      createdNotificationIds.push(webData.id);
    }

    const listResponse = await request(app.getHttpServer())
      .get('/notifications')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const list = listResponse.body?.data ?? [];
    const listIds = new Set(list.map((item: { id: string }) => item.id));

    expect(listIds.has(pushData?.id)).toBe(true);
    expect(listIds.has(webData?.id)).toBe(true);
  });
});
