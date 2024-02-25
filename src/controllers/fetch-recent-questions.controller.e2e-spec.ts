import { AppModule } from '@/app.module'
import { PrismaService } from '@/prisma/prisma.service'
import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import { hash } from 'bcryptjs'
import request from 'supertest'

describe('Fetch recent question (E2E)', () => {
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

  test('[GET] /questions', async () => {
    const user = await prisma.user.create({
      data: {
        name: 'any_name',
        email: 'any_email@test.com',
        password: await hash('4ny_p4s5w0rd', 8),
      },
    })

    const accessToken = jwt.sign({ sub: user.id })

    await prisma.question.createMany({
      data: [
        {
          title: 'question 1',
          content: 'question content',
          slug: 'question-1',
          authorId: user.id,
        },
        {
          title: 'question 2',
          content: 'question content',
          slug: 'question-2',
          authorId: user.id,
        },
        {
          title: 'question 3',
          content: 'question content',
          slug: 'question-3',
          authorId: user.id,
        },
        {
          title: 'question 4',
          content: 'question content',
          slug: 'question-4',
          authorId: user.id,
        },
        {
          title: 'question 5',
          content: 'question content',
          slug: 'question-5',
          authorId: user.id,
        },
      ],
    })

    const question = await request(app.getHttpServer())
      .get('/questions')
      .set('Authorization', `Bearer ${accessToken}`)
      .send()

    expect(question.statusCode).toBe(200)
    expect(question.body).toEqual({
      questions: [
        expect.objectContaining({ title: 'question 1' }),
        expect.objectContaining({ title: 'question 2' }),
        expect.objectContaining({ title: 'question 3' }),
        expect.objectContaining({ title: 'question 4' }),
        expect.objectContaining({ title: 'question 5' }),
      ],
    })
  })
})
