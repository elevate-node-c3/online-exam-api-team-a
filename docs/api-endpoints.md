# API Endpoints

## Auth

### POST `/auth/register`
**Access:** Public
**Body**
```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "password": "string",
  "confirmPassword": "string"
}
```
**Response**
```json
{
  "success": true,
  "message": "string",
  "userData": { ... }
}
```

### POST `/auth/login`
**Access:** Public
**Body**
```json
{
  "email": "string",
  "password": "string"
}
```
**Response**
```json
{
  "success": true,
  "message": "string",
  "userData": { ... }
}
```
`accessToken` and `refreshToken` are set as cookies only — not included in the JSON body.

### POST `/auth/refresh-token`
**Access:** Public
**Body**
_None — reads `refreshToken` from cookie_
**Response**
```json
{
  "success": true,
  "message": "string"
}
```
+ new `accessToken` set in cookie

### POST `/auth/logout`
**Access:** Protected
**Body**
_None_
**Response**
```json
{
  "success": true,
  "message": "string"
}
```

### POST `/auth/forget-password`
**Access:** Public
**Body**
```json
{
  "email": "string"
}
```
**Response**
```json
{
  "success": true,
  "message": "string"
}
```

### POST `/auth/verify-code`
**Access:** Public
**Body**
```json
{
  "email": "string",
  "code": "string"
}
```
**Response**
```json
{
  "success": true,
  "message": "string"
}
```

### POST `/auth/resend-code`
**Access:** Public
**Body**
```json
{
  "email": "string"
}
```
**Response**
```json
{
  "success": true,
  "message": "string"
}
```

### POST `/auth/reset-password`
**Access:** Public
**Body**
```json
{
  "email": "string",
  "otp": "string",
  "newPassword": "string",
  "confirmNewPassword": "string"
}
```
**Response**
```json
{
  "success": true,
  "message": "string"
}
```

---

## Profile / Users

### GET `/profile`
**Access:** Protected
**Body**
_None_
**Response**
```json
{
  "success": true,
  "message": "string",
  "userData": { ... }
}
```

### PATCH `/profile`
**Access:** Protected
**Body**
```json
{
  "firstName": "string",
  "lastName": "string",
  "photo": "string"
}
```
**Response**
```json
{
  "success": true,
  "message": "string",
  "userData": { ... }
}
```

### GET `/users/:id`
**Access:** Protected
**Body**
_None_
**Response**
```json
{
  "success": true,
  "message": "string",
  "userData": { ... }
}
```

---

## Quizzes

### GET `/quizzes?query&limit&page`
**Access:** Protected
**Body**
_None_
**Response**
```json
{
  "success": true,
  "message": "string",
  "quizData": [
    {
      "quizId": "string",
      "quizName": "string",
      "description": "string",
      "time": "number",
      "questionCount": "number",
      "passPercentage": "number"
    }
  ]
}
```

### GET `/quizzes/:id`
**Access:** Protected
**Body**
_None_
**Response**
```json
{
  "success": true,
  "message": "string",
  "quizData": {
    "quizId": "string",
    "quizName": "string",
    "photo": "string",
    "description": "string",
    "time": "number",
    "diplomaId": "string",
    "questionCount": "number"
  }
}
```

### POST `/quizzes`
**Access:** Protected
**Body**
```json
{
  "time": "number",
  "quizName": "string",
  "photo": "string",
  "description": "string",
  "diplomaId": "string",
  "questions": [
    {
      "text": "string",
      "type": "radio button | check box",
      "options": ["string"],
      "correctOptionIndexs": [0]
    }
  ]
}
```
**Response**
```json
{
  "success": true,
  "message": "string",
  "quizData": { ... }
}
```

### PATCH `/quizzes/:id`
**Access:** Protected
**Body**
```json
{
  "time": "number",
  "quizName": "string",
  "photo": "string",
  "description": "string",
  "diplomaId": "string",
  "questions": [
    {
      "text": "string",
      "type": "radio button | check box",
      "options": ["string"],
      "correctOptionIndexs": [0]
    }
  ]
}
```
**Response**
```json
{
  "success": true,
  "message": "string",
  "quizData": { ... }
}
```

### DELETE `/quizzes/:id`
**Access:** Protected
**Body**
_None_
**Response**
```json
{
  "success": true,
  "message": "string"
}
```

### POST `/quizzes/:id/start`
**Access:** Protected
**Body**
```json
{}
```
**Response**
```json
{
  "success": true,
  "message": "string",
  "attemptData": {
    "attemptId": "string",
    "quizId": "string",
    "startTime": "date",
    "time": "number",
    "questions": [
      {
        "questionId": "string",
        "text": "string",
        "type": "radio button | check box",
        "options": [
          { "optionId": "string", "text": "string" }
        ]
      }
    ]
  }
}
```

---

## Attempts

All attempt endpoints require an authenticated `user` session. The server uses
the authenticated user's ID for ownership filtering; callers do not provide a
`userId`.

### POST `/quizzes/:id/attempts`

**Access:** Protected (`user` only)
**Body**

```json
{}
```

**Response (`201 Created`)

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Attempt started",
  "data": {
    "attemptId": "66a000000000000000000099",
    "quizId": "66a000000000000000000000",
    "status": "in_progress",
    "startedAt": "2026-07-29T10:00:00.000Z",
    "expiresAt": "2026-07-29T11:00:00.000Z",
    "timeLimitSeconds": 3600,
    "questions": [
      {
        "questionId": "66a000000000000000000001",
        "text": "Which protocol is connection-oriented?",
        "type": "radio",
        "options": [
          { "optionId": "66a000000000000000000011", "text": "TCP" },
          { "optionId": "66a000000000000000000012", "text": "UDP" }
        ],
        "selectedOptionIds": []
      }
    ]
  }
}
```

Correct option IDs are never returned before submission.

### GET `/attempts?page=1&limit=10`

**Access:** Protected (`user` only)
**Query parameters:** `page` is a positive integer; `limit` is a positive integer capped at `100`.
**Response (`200 OK`)

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Attempts retrieved",
  "data": {
    "attempts": [
      {
        "attemptId": "66a000000000000000000099",
        "quizId": "66a000000000000000000000",
        "status": "submitted",
        "scorePercentage": 85.5,
        "passed": true,
        "submittedAt": "2026-07-29T10:20:00.000Z"
      }
    ],
    "meta": { "page": 1, "size": 10, "totalItems": 1, "totalPages": 1 }
  }
}
```

### GET `/attempts/:id`

**Access:** Protected (`user` only)
**Body:** _None_

The attempt must belong to the authenticated user. While an attempt is
`in_progress` or `expired`, correct answers and correctness flags are omitted.
After submission they are included.

**Response (`200 OK`)

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Attempt retrieved",
  "data": {
    "attemptId": "66a000000000000000000099",
    "quizId": "66a000000000000000000000",
    "status": "submitted",
    "scorePercentage": 85.5,
    "passed": true,
    "correctCount": 17,
    "totalQuestions": 20,
    "startedAt": "2026-07-29T10:00:00.000Z",
    "expiresAt": "2026-07-29T11:00:00.000Z",
    "submittedAt": "2026-07-29T10:20:00.000Z",
    "timeSpentSeconds": 1200,
    "questions": [
      {
        "questionId": "66a000000000000000000001",
        "text": "Which protocol is connection-oriented?",
        "type": "radio",
        "options": [
          { "optionId": "66a000000000000000000011", "text": "TCP" }
        ],
        "selectedOptionIds": ["66a000000000000000000011"],
        "correctOptionIds": ["66a000000000000000000011"],
        "isCorrect": true
      }
    ]
  }
}
```

### POST `/attempts/:id/submit`

**Access:** Protected (`user` only)
**Body**

```json
{
  "answers": [
    {
      "questionId": "66a000000000000000000001",
      "selectedOptionIds": ["66a000000000000000000011"]
    }
  ]
}
```

Exactly one answer is required for every question in the attempt snapshot.
Question IDs and selected option IDs must be unique and belong to the snapshot.

**Response (`200 OK`)

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Attempt submitted",
  "data": {
    "attemptId": "66a000000000000000000099",
    "status": "submitted",
    "scorePercentage": 100,
    "passed": true,
    "correctCount": 1,
    "totalQuestions": 1,
    "timeSpentSeconds": 120,
    "submittedAt": "2026-07-29T10:02:00.000Z"
  }
}
```

Scoring uses exact option-set equality (no partial credit). `scorePercentage`
is `correctCount / totalQuestions * 100`, rounded to two decimal places.
`passed` is true when the score is greater than or equal to the threshold
captured when the attempt starts (default `80`, from
`QUIZ_PASSING_DEFAULT_THRESHOLD`). `timeSpentSeconds` is calculated from
server timestamps and capped at the attempt's time limit.

Common errors: `400` for invalid input or answers, `401` for missing/invalid
authentication, `403` for a non-user role, `404` when the quiz/attempt is not
found or is not owned by the caller, and `409` for an active-attempt conflict,
expired attempt, duplicate submission, or a concurrent submission race.

---

## Diplomas

### GET `/diplomas`

**Access:** Protected (`user` or `admin`)
**Body**
_None_
**Response**

```json
{
  "statusCode": 200,
  "message": "Diplomas fetched successfully",
  "data": [
    {
      "diplomaId": "string",
      "diplomaName": "string",
      "diplomaDescription": "string",
      "photo": "/uploads/diploma-photos/string"
    }
  ]
}
```

### POST `/diplomas`

**Access:** Protected (`admin` only)
**Content-Type:** `multipart/form-data`

**Form Data**

| Field                | Type | Required | Description                         |
| -------------------- | ---- | -------- | ----------------------------------- |
| `diplomaName`        | Text | Yes      | Diploma name                        |
| `diplomaDescription` | Text | Yes      | Diploma description                 |
| `diplomaPhoto`       | File | No       | JPEG, PNG, or WebP image up to 2 MB |

**Response**

```json
{
  "statusCode": 201,
  "message": "Diploma created successfully",
  "data": {
    "diplomaId": "string",
    "diplomaName": "string",
    "diplomaDescription": "string",
    "photo": "/uploads/diploma-photos/string"
  }
}
```

`photo` is `null` when no file is uploaded. When present, it is a public
path relative to the API origin.
