import { PrismaClient, Role, Grade, DocType, ChallengeStatus, Field, TargetType, NotificationAction } from '@prisma/client';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const COUNT = 20;

function randomItem(array) {
  return array[faker.number.int({ min: 0, max: array.length - 1 })];
}

async function main() {
  await prisma.notification.deleteMany();
  await prisma.like.deleteMany();
  await prisma.review.deleteMany();
  await prisma.translation.deleteMany();
  await prisma.participation.deleteMany();
  await prisma.challenge.deleteMany();
  await prisma.user.deleteMany();

  const password = await bcrypt.hash('Password123!', 10);

  const users = [];
  for (let i = 0; i < COUNT; i++) {
    const user = await prisma.user.create({
      data: {
        email: faker.internet.email().toLowerCase(),
        password,
        nickname: faker.internet.username() + i,
        role: i === 0 ? Role.ADMIN : Role.MEMBER,
        grade: faker.helpers.arrayElement([Grade.NORMAL, Grade.EXPERT]),
      },
    });
    users.push(user);
  }

  const challenges = [];
  for (let i = 0; i < COUNT; i++) {
    const status = faker.helpers.arrayElement([
      ChallengeStatus.WAITING,
      ChallengeStatus.APPROVED,
      ChallengeStatus.REJECTED,
    ]);
    const creator = randomItem(users);
    const approver = randomItem(users);

    const challenge = await prisma.challenge.create({
      data: {
        title: faker.lorem.sentence(5),
        link: faker.internet.url(),
        content: faker.lorem.paragraphs(2),
        field: randomItem(Object.values(Field)),
        docType: randomItem(Object.values(DocType)),
        deadline: faker.date.future(),
        headcount: faker.number.int({ min: 1, max: 10 }),
        status,
        creatorId: creator.id,
        approverId: status === ChallengeStatus.APPROVED ? approver.id : null,
        approvedAt: status === ChallengeStatus.APPROVED ? faker.date.recent() : null,
        rejectReason: status === ChallengeStatus.REJECTED ? faker.lorem.sentence() : null,
      },
    });
    challenges.push(challenge);
  }

  const participations = [];
  for (let i = 0; i < COUNT; i++) {
    const participation = await prisma.participation.create({
      data: {
        participatorId: randomItem(users).id,
        challengeId: randomItem(challenges).id,
      },
    });
    participations.push(participation);
  }

  const translations = [];
  for (let i = 0; i < COUNT; i++) {
    const translation = await prisma.translation.create({
      data: {
        content: faker.lorem.paragraphs(3),
        participationId: participations[i].id,
      },
    });
    translations.push(translation);
  }

  const reviews = [];
  for (let i = 0; i < COUNT; i++) {
    const review = await prisma.review.create({
      data: {
        content: faker.lorem.sentences(2),
        reviewerId: randomItem(users).id,
        translationId: translations[i].id,
      },
    });
    reviews.push(review);
  }

  const shuffledUsers = faker.helpers.shuffle([...users]);
  const shuffledTranslations = faker.helpers.shuffle([...translations]);
  for (let i = 0; i < COUNT; i++) {
    await prisma.like.create({
      data: {
        likerId: shuffledUsers[i].id,
        translationId: shuffledTranslations[i].id,
      },
    });
  }

  for (let i = 0; i < COUNT; i++) {
    const targetType = randomItem(Object.values(TargetType));
    let targetId;
    switch (targetType) {
      case TargetType.CHALLENGE:
        targetId = randomItem(challenges).id;
        break;
      case TargetType.WORK:
        targetId = randomItem(translations).id;
        break;
      case TargetType.FEEDBACK:
        targetId = randomItem(reviews).id;
        break;
      case TargetType.FAVORITE:
        targetId = randomItem(translations).id;
        break;
    }

    await prisma.notification.create({
      data: {
        message: faker.lorem.sentence(),
        isRead: faker.datatype.boolean(),
        targetId,
        targetType,
        action: randomItem(Object.values(NotificationAction)),
        userId: randomItem(users).id,
      },
    });
  }

  console.log('Seed completed: 20 records created for each model.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
