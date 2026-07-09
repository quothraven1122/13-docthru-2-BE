# 13-docthru-2-BE

## 👥 팀 소개

🐶 **Dog Throw**

> 📋 [팀 노션 바로가기](https://app.notion.com/p/cd1db44120f68291ac4a01bf4bd976da?v=581db44120f682da931708f6c690ab7c&source=copy_link)

| 이름   | GitHub                                               |
| ------ | ---------------------------------------------------- |
| 정민주 | [@quothraven1122](https://github.com/quothraven1122) |
| 김대영 | [@daeyeong1573](https://github.com/daeyeong1573)     |
| 조서현 | [@sxohyuni](https://github.com/sxohyuni)             |
| 윤다정 | [@torang1013](https://github.com/torang1013)         |
| 이진태 | [@jeantae](https://github.com/jeantae)               |
| 방민재 | [@extermins](https://github.com/extermins)           |
| 이은범 | [@3unbum](https://github.com/3unbum)                 |

---

## 📌 프로젝트 소개

> 대다수의 개발 시장 콘텐츠가 영어로 작성되어 있어, 영어를 잘하지 못하는 한국인들이 해당 기술을 습득하는데 어려움을 겪고 있습니다.
> 따라서 개발 관련 영어 문서를 함께 번역하는 챌린지를 진행하고, 번역 작업 에디터에서 번역을 진행하며 번역문에 대한 피드백을 주고받을 수 있는 서비스를 제작합니다.

**프로젝트 기간** : 2026. 07. 08 ~ 2026. 07. 31

---

## 🛠 기술 스택

| 구분          | 기술                          |
| ------------- | ----------------------------- |
| **Frontend**  | Next.js, Tailwind CSS         |
| **Backend**   | Express.js, Prisma ORM        |
| **Database**  | PostgreSQL                    |
| **공통 Tool** | Git & GitHub, Discord, Notion |

## 📁 프로젝트 구조

```
docthru/
├── http/
├── prisma/
└── src/
    ├── app.js
    ├── modules/
    │   ├── challenge/
    │   │   ├── challengeRoute.js
    │   │   ├── challengeController.js
    │   │   ├── challengeService.js
    │   │   ├── challengeRepository.js
    │   │   └── challengeSchema.js
    │   ├── feedback/
    │   └── user/
    ├── common/
    │   ├── middlewares/
    │   ├── utils/
    │   └── configs/
```
