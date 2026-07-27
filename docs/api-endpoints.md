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

### GET `/attempts?limit&page`
**Access:** Protected
**Body**
_None_
**Response**
```json
{
  "success": true,
  "message": "string",
  "attemptsData": [
    {
      "attemptId": "string",
      "quizId": "string",
      "scorePercentage": "number",
      "passed": "boolean",
      "submittedAt": "date"
    }
  ]
}
```

### GET `/attempts/:id`
**Access:** Protected
**Body**
_None_
**Response**
```json
{
  "success": true,
  "message": "string",
  "attemptData": {
    "attemptId": "string",
    "quizId": "string",
    "scorePercentage": "number",
    "passed": "boolean",
    "correctCount": "number",
    "totalQuestions": "number",
    "questions": [
      {
        "questionId": "string",
        "text": "string",
        "selectedOptionIds": ["string"],
        "correctOptionIds": ["string"],
        "isCorrect": "boolean"
      }
    ]
  }
}
```

### POST `/attempts/:id/submit`
**Access:** Protected
**Body**
```json
{
  "answers": [
    { "questionId": "string", "selectedOptionIds": ["string"] }
  ]
}
```
**Response**
```json
{
  "success": true,
  "message": "string",
  "attemptData": {
    "attemptId": "string",
    "scorePercentage": "number",
    "passed": "boolean",
    "correctCount": "number",
    "totalQuestions": "number",
    "timeSpentSeconds": "number"
  }
}
```

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

**Form Data**:

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
    "diplomaPhoto": "/uploads/diploma-photos/string"
  }
}
```

`diplomaPhoto` is `null` when no file is uploaded. When present, it is a public
path relative to the API origin.
