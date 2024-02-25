import { AppModule } from '@/infra/app.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import { hash } from 'bcryptjs'
import request from 'supertest'

describe('Create question (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let jwt: JwtService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()

    prisma = moduleRef.get(PrismaService)
    jwt = moduleRef.get(JwtService)

    await app.init()
  })

  test('[POST] /questions', async () => {
    const user = await prisma.user.create({
      data: {
        name: 'any_name',
        email: 'any_email@test.com',
        password: await hash('4ny_p4s5w0rd', 8),
      },
    })

    const accessToken = jwt.sign({ sub: user.id })

    const question = await request(app.getHttpServer())
      .post('/questions')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'new_question',
        content: 'question content',
      })

    expect(question.statusCode).toBe(201)

    const questionOnDatabase = await prisma.question.findFirst({
      where: { title: 'new_question' },
    })
    expect(questionOnDatabase).toBeTruthy()
  })
})
