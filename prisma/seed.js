import {
  PrismaClient,
  Role,
  Grade,
  DocType,
  ChallengeStatus,
  Field,
  TargetType,
  NotificationAction,
} from "@prisma/client";
import { faker } from "@faker-js/faker";
import bcrypt from "bcrypt";

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

  const password = await bcrypt.hash("Password123!", 10);

  // mychallenge API 테스트용 계정
  const testUser = await prisma.user.create({
    data: {
      email: "mychallenge@test.com",
      password,
      nickname: "testMyChallengeUser",
      role: Role.MEMBER,
      grade: Grade.NORMAL,
    },
  });

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

  const APPROVED_PARTICIPATION_COUNT = 10;
  const EXPIRED_DEADLINE_COUNT = 3;
  const testUserApprovedParticipations = [];
  for (let i = 0; i < APPROVED_PARTICIPATION_COUNT; i++) {
    const approver = randomItem(users);
    const creator = randomItem(users);
    const isExpired = i < EXPIRED_DEADLINE_COUNT;

    const approvedChallenge = await prisma.challenge.create({
      data: {
        title: isExpired ? `[테스트] 데드라인 지난 완료 챌린지 ${i + 1}` : `[테스트] 참여중인 승인된 챌린지 ${i + 1}`,
        link: faker.internet.url(),
        content: faker.lorem.paragraphs(2),
        field: randomItem(Object.values(Field)),
        docType: randomItem(Object.values(DocType)),
        deadline: isExpired ? faker.date.past() : faker.date.future(),
        headcount: faker.number.int({ min: 1, max: 10 }),
        status: ChallengeStatus.APPROVED,
        creatorId: creator.id,
        approverId: approver.id,
        approvedAt: faker.date.recent(),
      },
    });

    const participation = await prisma.participation.create({
      data: {
        participatorId: testUser.id,
        challengeId: approvedChallenge.id,
      },
    });
    testUserApprovedParticipations.push(participation);
  }

  const approverForMyApplications = randomItem(users);

  const rejectedApplication = await prisma.challenge.create({
    data: {
      title: `[테스트] 거절된 신청 챌린지`,
      link: faker.internet.url(),
      content: faker.lorem.paragraphs(2),
      field: randomItem(Object.values(Field)),
      docType: randomItem(Object.values(DocType)),
      deadline: faker.date.future(),
      headcount: faker.number.int({ min: 1, max: 10 }),
      status: ChallengeStatus.REJECTED,
      creatorId: testUser.id,
      approverId: approverForMyApplications.id,
      rejectReason: "원문 링크가 유효하지 않습니다.",
    },
  });

  const deletedApplication = await prisma.challenge.create({
    data: {
      title: `[테스트] 삭제(취소)된 신청 챌린지`,
      link: faker.internet.url(),
      content: faker.lorem.paragraphs(2),
      field: randomItem(Object.values(Field)),
      docType: randomItem(Object.values(DocType)),
      deadline: faker.date.future(),
      headcount: faker.number.int({ min: 1, max: 10 }),
      status: ChallengeStatus.WAITING,
      creatorId: testUser.id,
      deletedAt: faker.date.recent(),
      deletionReason: "테스트용 취소",
      deleterId: testUser.id,
    },
  });

  const approvedApplication = await prisma.challenge.create({
    data: {
      title: `[테스트] 승인완료된 신청 챌린지`,
      link: faker.internet.url(),
      content: faker.lorem.paragraphs(2),
      field: randomItem(Object.values(Field)),
      docType: randomItem(Object.values(DocType)),
      deadline: faker.date.future(),
      headcount: faker.number.int({ min: 1, max: 10 }),
      status: ChallengeStatus.APPROVED,
      creatorId: testUser.id,
      approverId: approverForMyApplications.id,
      approvedAt: faker.date.recent(),
    },
  });

  const waitingApplication1 = await prisma.challenge.create({
    data: {
      title: `[테스트] 승인대기중인 신청 챌린지 1`,
      link: faker.internet.url(),
      content: faker.lorem.paragraphs(2),
      field: randomItem(Object.values(Field)),
      docType: randomItem(Object.values(DocType)),
      deadline: faker.date.future(),
      headcount: faker.number.int({ min: 1, max: 10 }),
      status: ChallengeStatus.WAITING,
      creatorId: testUser.id,
    },
  });

  const waitingApplication2 = await prisma.challenge.create({
    data: {
      title: `[테스트] 승인대기중인 신청 챌린지 2`,
      link: faker.internet.url(),
      content: faker.lorem.paragraphs(2),
      field: randomItem(Object.values(Field)),
      docType: randomItem(Object.values(DocType)),
      deadline: faker.date.future(),
      headcount: faker.number.int({ min: 1, max: 10 }),
      status: ChallengeStatus.WAITING,
      creatorId: testUser.id,
    },
  });

  const testUserApplications = [
    rejectedApplication,
    deletedApplication,
    approvedApplication,
    waitingApplication1,
    waitingApplication2,
  ];

  const participations = [];
  const shuffledParticipators = faker.helpers.shuffle([...users]);
  for (let i = 0; i < COUNT; i++) {
    // participatorId를 유저 셔플로 매번 다르게 뽑아 (participatorId, challengeId) 유니크 제약 충돌을 방지
    const participation = await prisma.participation.create({
      data: {
        participatorId: shuffledParticipators[i].id,
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

  // 목록 조회(페이지네이션/translationId 필터링) 테스트용 - 번역글 하나에 리뷰를 몰아서 생성
  const targetTranslation = translations[0];
  const TARGET_REVIEW_COUNT = 15;
  for (let i = 0; i < TARGET_REVIEW_COUNT; i++) {
    const review = await prisma.review.create({
      data: {
        content: faker.lorem.sentences(2),
        reviewerId: randomItem(users).id,
        translationId: targetTranslation.id,
      },
    });
    reviews.push(review);
  }

  // 소프트 삭제된 리뷰 (deletedAt 필터링 확인용, 목록/단건 조회에서 제외되어야 함)
  await prisma.review.create({
    data: {
      content: faker.lorem.sentences(2),
      reviewerId: randomItem(users).id,
      translationId: targetTranslation.id,
      deletedAt: faker.date.recent(),
      deletionReason: "테스트용 삭제",
    },
  });

  for (let i = 1; i < COUNT; i++) {
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

  console.log("Seed completed: 20 records created for each model.");
  console.log(
    `목록 조회 테스트용 translationId: ${targetTranslation.id} (리뷰 ${TARGET_REVIEW_COUNT}개 + 삭제된 리뷰 1개)`,
  );
  console.log(`테스트 로그인 계정: ${users[0].email} / Password123!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
