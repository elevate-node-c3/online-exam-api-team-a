# Database Schema & Indexes

## User

```ts
{
  firstName: String,
  lastName: String,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  photo: String,
  role: { type: String, enum: ["student", "admin"], default: "student" },
  fastestTime: Number,
  correctAnswers: Number,
  quizzesPassed: Number,
  credentialsChangedAt: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

**Indexes**
| Field(s) | Type | Reason |
|---|---|---|
| `email` | Unique, single | Enforces uniqueness, speeds up login/register lookup by email |

---

## Diploma

```ts
{
  diplomaName: String,
  diplomaDescription: String,
  photo: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

**Indexes**
No dedicated index needed — collection is small and read via full list (`GET /diplomas`), not filtered by a specific field.

---

## Quiz

```ts
{
  quizName: String,
  description: String,
  photo: String,
  time: Number,
  passingThreshold: Number,
  diplomaId: { type: mongoose.Schema.Types.ObjectId, ref: "Diploma", required: true, index: true },
  questions: [
    {
      text: String,
      type: { type: String, enum: ["radio button", "check box"] },
      options: [
        { text: String }
      ],
      correctOptionIndex: [Number]
    }
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

**Indexes**
| Field(s) | Type | Reason |
|---|---|---|
| `diplomaId` | Single | Filtering/joining quizzes by diploma |
| `quizName`, `description` | Text (compound text index) | Supports `GET /quizzes?query=...` search |

---

## Attempt

```ts
{
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true, index: true },
  startTime: Date,
  submittedAt: Date,
  timeTaken: Number,
  scorePercentage: Number,
  passed: Boolean,
  totalCorrectQuestions: Number,
  answers: [
    {
      questionId: mongoose.Schema.Types.ObjectId,
      selectedOptionIds: [mongoose.Schema.Types.ObjectId]
    }
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

**Indexes**
| Field(s) | Type | Reason |
|---|---|---|
| `userId` | Single | `GET /attempts` (list current user's attempts) |
| `quizId` | Single | Looking up all attempts for a given quiz |
| `userId + quizId` | Compound | Checking for an existing/in-progress attempt before allowing a new `start`; also the main filter used in dashboard aggregation |
| `userId + passed` | Compound | Speeds up dashboard aggregation queries filtered to a user's passed attempts (fastest time, correct count) |
