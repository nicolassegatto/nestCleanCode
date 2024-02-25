import { AppModule } from '@/app.module'
import { PrismaService } from '@/prisma/prisma.service'
import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { hash } from 'bcryptjs'
import request from 'supertest'

describe('Authenticate (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()

    prisma = moduleRef.get(PrismaService)

    await app.init()
  })

  test('[POST] /sessions', async () => {
    await prisma.user.create({
      data: {
        name: 'any_name',
        email: 'any_email@test.com',
        password: await hash('4ny_p4s5w0rd', 8),
      },
    })

    const response = await request(app.getHttpServer()).post('/sessions').send({
      email: 'any_email@test.com',
      password: '4ny_p4s5w0rd',
    })
    expect(response.statusCode).toBe(201)

    expect(response.body).toEqual({
      access_token: expect.any(String),
    })
  })
})
