# 에러 처리 (ErrorHandler) 사용 가이드

이 프로젝트는 컨트롤러/서비스에서 발생한 에러를 한 곳(`errorHandler`)에서 모아 처리합니다.
각 라우트 핸들러에서 직접 `try/catch`로 status/message를 만들 필요 없이, 에러를 `throw` 하거나 `next(error)`로 넘기기만 하면 됩니다.

## 구조

```
src/
├── app.js                             # errorHandler를 마지막 미들웨어로 등록
└── common/
    ├── middlewares/
    │   ├── errorHandler.js            # 에러를 받아 응답(res)으로 변환하는 최종 처리기
    │   └── validate.js                # zod 스키마 검증, 실패 시 ZodError를 next로 전달
    └── utils/
        ├── errors.js                  # AppError 및 하위 커스텀 에러 클래스 정의
        └── asyncHandler.js            # async 컨트롤러의 예외를 자동으로 next(err)로 전달
```

### 처리 흐름

```
라우터 핸들러(컨트롤러)
   │  throw new NotFoundError() 또는 validate() 실패
   ▼
asyncHandler가 catch → next(error)
   │
   ▼
app.js의 app.use(errorHandler)  (모든 라우트 등록 이후 마지막에 위치해야 함)
   │
   ▼
errorHandler가 에러 종류를 판별해 적절한 status/message로 응답
```

## 1. `AppError`와 커스텀 에러 (`src/common/utils/errors.js`)

모든 커스텀 에러는 `AppError`(status, isOperational 포함)를 상속합니다. 직접 `AppError`를 사용하기보다 아래 하위 클래스를 사용합니다.

| 클래스 | status | 기본 메시지 | 사용 시점 |
|---|---|---|---|
| `NotFoundError` | 404 | 요청한 데이터를 찾을 수 없습니다. | 데이터가 존재하지 않을 때 |
| `UnauthorizedError` | 401 | 인증 권한이 없습니다. 로그인 후 이용해 주세요. | 로그인 필요/인증 실패 |
| `ForbiddenError` | 403 | 접근 권한이 없습니다. | 인증은 됐지만 권한 없음 |
| `ConflictError` | 409 | 이미 존재하는 데이터입니다. | 중복 데이터 |
| `BadRequestError` | 400 | 잘못된 요청입니다. | 잘못된 요청 데이터 |

### 사용법

```js
import { NotFoundError, ConflictError } from "#src/common/utils/errors.js";

// 기본 메시지
throw new NotFoundError();

// 커스텀 메시지
throw new ConflictError("이미 사용 중인 이메일입니다.");
```

새로운 에러 상황이 필요하면 `AppError`를 상속하는 클래스를 `errors.js`에 추가합니다.

## 2. `asyncHandler` (`src/common/utils/asyncHandler.js`)

async 컨트롤러 안에서 발생한 예외를 자동으로 `next(err)`로 넘겨줍니다. 컨트롤러마다 `try/catch`를 반복 작성하지 않아도 됩니다.

```js
import { asyncHandler } from "#src/common/utils/asyncHandler.js";

export const authController = {
  register: asyncHandler(async (req, res) => {
    // 여기서 throw한 에러(NotFoundError 등)는 자동으로 errorHandler까지 전달됨
    const { user, accessToken, refreshToken } = await authService.register(req.validatedData);
    res.status(201).json({ user, accessToken });
  }),
};
```

라우터에 연결할 모든 async 컨트롤러 함수는 `asyncHandler`로 감싸야 합니다.

### try/catch로 직접 작성한 경우와 비교

`asyncHandler` 없이 작성하면 컨트롤러마다 아래처럼 반복해서 `try/catch`를 작성해야 합니다.

```js
// try/catch 버전 (asyncHandler 미사용)
export const authController = {
  register: async (req, res, next) => {
    try {
      const { user, accessToken, refreshToken } = await authService.register(req.validatedData);
      res.cookie("refreshToken", refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);
      return res.status(201).json({ user, accessToken });
    } catch (err) {
      next(err); // 잊으면 에러가 처리되지 않고 서버가 응답을 못 보냄
    }
  },
};
```

```js
// asyncHandler 버전
export const authController = {
  register: asyncHandler(async (req, res) => {
    const { user, accessToken, refreshToken } = await authService.register(req.validatedData);
    res.cookie("refreshToken", refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);
    return res.status(201).json({ user, accessToken });
  }),
};
```

| | try/catch 버전 | asyncHandler 버전 |
|---|---|---|
| 코드량 | 함수마다 try/catch 반복 | `asyncHandler(...)`로 감싸기만 하면 됨 |
| 실수 위험 | `catch`에서 `next(err)` 호출을 빼먹으면 요청이 응답 없이 멈춤 | 항상 `next(err)`가 자동 호출되어 실수 여지가 적음 |
| 가독성 | 비즈니스 로직과 에러 전달 코드가 섞임 | 비즈니스 로직만 남아 가독성이 좋음 |

두 버전 모두 최종적으로 `next(err)`를 통해 `errorHandler`로 전달되는 흐름은 동일합니다. 차이는 그 전달 과정을 매번 직접 쓰느냐, `asyncHandler`에 위임하느냐입니다.

## 3. `validate` 미들웨어 (`src/common/middlewares/validate.js`)

요청 데이터를 zod 스키마로 검증합니다. 검증 실패 시 `ZodError`를 `next(error)`로 전달하여 errorHandler가 처리하도록 합니다. 성공 시 `req.validatedData`에 파싱된 데이터를 담아줍니다.

```js
import { validate } from "#src/common/middlewares/validate.js";
import { registerSchema } from "./authSchema.js";

authRouter.post("/register", validate(registerSchema), authController.register);
```

컨트롤러에서는 `req.body` 대신 `req.validatedData`를 사용합니다.

기본값은 `body` 검증이며, 필요 시 두 번째 인자로 검증 대상을 지정합니다.

```js
validate(paramsSchema, "params");
validate(querySchema, "query");
```

### body / query / params 값 저장 방식

`validate(schema, source)`의 `source`는 검증할 **원본 위치**(`req.body`, `req.query`, `req.params`)만 지정할 뿐, 검증에 통과한 값은 항상 같은 이름의 필드인 **`req.validatedData` 하나에** 저장됩니다.

```js
export const validate = (schema, source = "body") => {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]); // body/query/params 중 어디서 읽을지만 결정

    if (!result.success) {
      return next(result.error);
    }

    req.validatedData = result.data; // source와 무관하게 항상 같은 필드에 저장
    next();
  };
};
```

- `validate(registerSchema)` (기본값 `body`) → `req.body`를 검증해 `req.validatedData`에 저장
- `validate(idParamSchema, "params")` → `req.params`를 검증해 `req.validatedData`에 저장
- `validate(listQuerySchema, "query")` → `req.query`를 검증해 `req.validatedData`에 저장

컨트롤러에서는 검증 대상이 무엇이었든 동일하게 `req.validatedData`로 접근합니다.

```js
// params만 검증한 라우트
authRouter.get("/:id", validate(idParamSchema, "params"), authController.getById);

getById: asyncHandler(async (req, res) => {
  const { id } = req.validatedData; // params로 검증했지만 접근 방식은 동일
  ...
}),
```

**주의:** 한 라우트에 `body`, `query`, `params` 검증을 동시에 여러 개 연결하면, 모두 같은 `req.validatedData` 필드에 저장되므로 **나중에 실행된 `validate`가 먼저 저장된 값을 덮어씁니다.**

```js
// 잘못된 예 — query 검증 결과가 params 검증 결과를 덮어써서 params 값이 사라짐
authRouter.get(
  "/:id",
  validate(idParamSchema, "params"),
  validate(listQuerySchema, "query"),
  authController.getById
);
```

한 라우트에서 여러 위치(body/query/params)를 동시에 검증해야 한다면, `req.validatedData`를 소스별로 분리해서 저장하도록 `validate` 미들웨어를 수정하거나(`req.validatedData = { ...req.validatedData, [source]: result.data }` 등), 소스마다 다른 필드명을 쓰는 방식을 검토해야 합니다.

### GET / POST 예시

**GET 예시 (`query` 검증)** — 목록 조회처럼 쿼리스트링을 검증하는 경우

```js
// authSchema.js
export const getUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

// authRoute.js
authRouter.get("/users", validate(getUsersQuerySchema, "query"), authController.getUsers);

// authController.js
getUsers: asyncHandler(async (req, res) => {
  const { page, limit } = req.validatedData; // req.query 대신 사용
  const users = await authService.getUsers({ page, limit });
  return res.status(200).json({ users });
}),
```

**POST 예시 (`body` 검증)** — 회원가입처럼 요청 본문을 검증하는 경우

```js
// authSchema.js
export const registerSchema = z.object({
  email: z.email("올바른 이메일 형식이 아닙니다."),
  nickname: z.string().min(2).max(10),
  password: z.string().min(9),
});

// authRoute.js
authRouter.post("/register", validate(registerSchema), authController.register); // source 기본값 "body"

// authController.js
register: asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.register(req.validatedData); // req.body 대신 사용
  res.cookie("refreshToken", refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);
  return res.status(201).json({ user, accessToken });
}),
```

두 경우 모두 라우터에서 검증 대상(`query`/`body`)만 다를 뿐, 컨트롤러에서는 동일하게 `req.validatedData`로 접근하고, 검증 실패 시 동일하게 `errorHandler`의 `ZodError` 분기(400 응답)로 처리됩니다.

### validate 미들웨어 적용 전/후 비교

`validate` 미들웨어 없이 컨트롤러 안에서 직접 zod로 파싱하면, 검증 실패 처리를 컨트롤러마다 반복 작성해야 합니다.

```js
// 적용 전 (컨트롤러에서 직접 검증)
export const authController = {
  register: asyncHandler(async (req, res, next) => {
    const result = registerSchema.safeParse(req.body);

    if (!result.success) {
      return next(result.error); // 매 컨트롤러마다 이 분기를 반복 작성해야 함
    }

    const { user, accessToken } = await authService.register(result.data);
    return res.status(201).json({ user, accessToken });
  }),
};

authRouter.post("/register", authController.register);
```

```js
// 적용 후 (validate 미들웨어 사용)
authRouter.post("/register", validate(registerSchema), authController.register);

export const authController = {
  register: asyncHandler(async (req, res) => {
    // 검증은 이미 라우터 단계에서 끝났으므로 req.validatedData를 바로 사용
    const { user, accessToken } = await authService.register(req.validatedData);
    return res.status(201).json({ user, accessToken });
  }),
};
```

| | 적용 전 (컨트롤러에서 직접 검증) | 적용 후 (validate 미들웨어) |
|---|---|---|
| 코드량 | 컨트롤러마다 `safeParse` + 실패 분기 반복 | 라우터에 `validate(schema)` 한 줄만 추가 |
| 관심사 분리 | 검증 로직과 비즈니스 로직이 컨트롤러에 섞임 | 검증은 라우터 단계, 비즈니스 로직은 컨트롤러에만 집중 |
| 실수 위험 | 검증 분기(`next(result.error)`)를 빼먹거나 다르게 구현할 수 있음 | 모든 라우트가 동일한 방식으로 검증 실패를 처리함 |
| 재사용성 | 스키마가 같아도 각 컨트롤러에 검증 코드를 복붙 | 동일한 `validate(schema)`를 여러 라우트에서 재사용 |

## 4. `errorHandler` (`src/common/middlewares/errorHandler.js`)

모든 에러가 최종적으로 도착하는 곳입니다. 에러 종류에 따라 다음 순서로 분기합니다.

1. **`ZodError`** (validate 실패) → 400, 필드별 에러 메시지 배열 반환
2. **Prisma `P2025`** (레코드 없음) → 404, "데이터를 찾을 수 없습니다."
3. **`AppError`** (커스텀 에러) → `error.status`, `error.message` 그대로 반환 (500 이상이면 서버 로그로 `console.error` 남김)
4. **그 외 예상치 못한 에러** → 500. `NODE_ENV=production`이면 메시지를 숨기고 "Internal Server Error"로, 아니면 실제 메시지를 반환

### 응답 형식

```json
{
  "path": "/auth/register",
  "method": "POST",
  "message": "이미 사용 중인 이메일입니다.",
  "date": "2026-07-16T00:00:00.000Z"
}
```

ZodError의 경우 `message` 대신 `errors` 배열(`field`, `message`)을 반환합니다.

### 등록 위치 (`src/app.js`)

Express 에러 미들웨어는 반드시 **모든 라우터 등록 이후, 가장 마지막**에 등록해야 합니다.

```js
app.use("/auth", authRouter);
// ... 다른 라우터들

app.use(errorHandler); // 항상 마지막
```

## 새 라우트를 추가할 때 체크리스트

1. 컨트롤러 함수는 `asyncHandler`로 감싼다.
2. 요청 검증이 필요하면 라우터에 `validate(schema)`를 추가하고, 컨트롤러에서 `req.validatedData`를 사용한다.
3. 에러 상황은 res.status().json()으로 직접 응답하지 말고, `errors.js`의 커스텀 에러를 `throw`한다.
4. 기존 에러 클래스로 표현할 수 없는 상황이면 `errors.js`에 `AppError`를 상속한 새 클래스를 추가한다.
