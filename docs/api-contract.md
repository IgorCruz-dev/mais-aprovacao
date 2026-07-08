# Contrato de API

Este documento e a fonte de verdade para compatibilidade entre `apps/web` (Next.js), `apps/api` (Fastify) e `apps/ai` (FastAPI). Nenhum endpoint novo deve ser implementado sem atualizar este arquivo.

## Convencoes gerais

- **Fastify API:** URL base externa definida em `NEXT_PUBLIC_API_URL`, sem prefixo `/api`. Em dev: `http://localhost:3001`.
- **AI Service:** servico separado, URL interna definida em `AI_SERVICE_URL`. Todos os endpoints usam prefixo `/ai/...`.
- **Next.js:** Server Components e Route Handlers podem chamar o Fastify via `NEXT_PUBLIC_API_URL`. Client Components nao chamam o Fastify diretamente para dados sensiveis; usam Route Handlers em `apps/web/src/app/api/...` como proxy autenticado.
- **Auth Clerk:** endpoints Fastify autenticados recebem `Authorization: Bearer <clerk_session_token>`. A role efetiva vem da tabela `users`; `publicMetadata.role` e usado apenas como cache para roteamento no frontend.
- **Valores de Auth neste contrato:** `público`, `autenticado`, `student`, `teacher`, `manager`, `parent`, `admin`, `webhook`, `service`.
- **IDs:** UUID em string, salvo quando indicado (`Repertoire.id` e `BigInt`).
- **Datas:** ISO 8601 em UTC (`2026-06-26T20:00:00.000Z`). Campos `@db.Date` tambem trafegam como string ISO de data.
- **Paginacao:** toda listagem aceita `limit` (`number`, default 20, max 100) e `cursor` (`string`, opcional). Respostas paginadas retornam `next_cursor: string | null`.
- **Erro Fastify:** `{ error: string, code: string }`.
- **Erro AI Service:** `{ error: string, detail: string }`.
- **Versionamento:** mudancas breaking exigem criar nova secao de versao neste documento antes de alterar implementacao. Mudancas aditivas podem ser feitas na versao atual, desde que campos existentes nao mudem de tipo ou semantica.
- **Acesso a conteudo pago:** exigir `enrollment.status = "active"` e `expires_at > now()` ou `expires_at = null`. Aulas `is_preview = true` sao publicas.
- **Webhooks:** todos validam assinatura propria e idempotencia via `webhook_events` (`source`, `event_id`).

## Observacoes de schema

O `schema.prisma` atual modela catalogo, matriculas, progresso, certificados, lives, checkout, questoes, repertorio e redacoes. A migration `0002_complete_schema` tambem cria `users`, `payments`, `essay_prompts`, `live_attendance`, `polls`, `question_attempts`, `exam_sessions`, `parent_student_links`, `announcements`, `webhook_events` e gamificacao. Esses dominios estao incluidos no contrato porque aparecem no banco/migration e no `CLAUDE.md`, embora alguns modelos ainda precisem ser refletidos no Prisma.

## Tipos compartilhados

### `CourseSummary`

Campos obrigatorios: `id: string`, `slug: string`, `title: string`, `price_cents: number`, `currency: string`, `type: "extensivo" | "semi_extensivo" | "intensivo" | "por_materia" | "avulso"`, `is_featured: boolean`, `thumbnail_url: string | null`, `starts_at: string | null`.

### `UserProfile`

Campos obrigatorios: `id: string`, `clerk_id: string`, `email: string`, `name: string`, `role: "student" | "teacher" | "manager" | "parent" | "admin"`, `avatar_url: string | null`, `created_at: string`.

### `QuestionPublic`

Campos obrigatorios: `id: string`, `external_id: string`, `exam_year: number`, `subject: string | null`, `discipline: string | null`, `bank: "ENEM" | "UFU" | "UEG" | null`, `difficulty: "easy" | "medium" | "hard" | string | null`, `title: string | null`, `context: string | null`, `alternatives_intro: string | null`, `alternatives: object | null`, `images: string[]`.

## Operacional

### `GET /health`

- **Auth:** `público`
- **Query params:** nenhum
- **Request body:** nenhum
- **Response body:** `ok: boolean`
- **Erros:** nenhum esperado

Observacao: este endpoint existe no Fastify e no AI Service como health check operacional. Endpoints de negocio do AI Service continuam usando `/ai/...`.

## Catalogo publico

### `GET /courses`

- **Auth:** `público`
- **Query params:** `type?: CourseSummary.type`, `featured?: boolean`, `limit?: number`, `cursor?: string`
- **Request body:** nenhum
- **Response body:** `courses: CourseSummary[]`, `next_cursor: string | null`
- **Erros:** `400 VALIDATION_ERROR`

### `GET /courses/:slug`

- **Auth:** `público`
- **Query params:** nenhum
- **Request body:** nenhum
- **Response body:** `course: { id: string, slug: string, title: string, description: string | null, thumbnail_url: string | null, trailer_url: string | null, price_cents: number, currency: string, access_days: number | null, type: CourseSummary.type, starts_at: string | null, modules: { id: string, title: string, description: string | null, subject: string | null, order_index: number, lessons: { id: string, title: string, description: string | null, duration_secs: number | null, order_index: number, is_preview: boolean, released_at: string | null }[] }[] }`
- **Erros:** `404 COURSE_NOT_FOUND`

### `GET /courses/:slug/cohorts`

- **Auth:** `público`
- **Query params:** nenhum
- **Request body:** nenhum
- **Response body:** `cohorts: { id: string, course_id: string, name: string, starts_at: string, ends_at: string | null, max_students: number | null, available_seats: number | null }[]`
- **Erros:** `404 COURSE_NOT_FOUND`

## Auth e perfil

### `GET /me`

- **Auth:** `autenticado`
- **Query params:** nenhum
- **Request body:** nenhum
- **Response body:** `user: UserProfile`
- **Erros:** `401 UNAUTHORIZED`, `404 USER_NOT_FOUND`

### `PATCH /me`

- **Auth:** `autenticado`
- **Query params:** nenhum
- **Request body:** `name?: string`, `avatar_url?: string | null`
- **Response body:** `user: UserProfile`
- **Erros:** `400 VALIDATION_ERROR`, `401 UNAUTHORIZED`, `404 USER_NOT_FOUND`

## Matriculas e pagamentos

### `POST /enrollments`

- **Auth:** `student`
- **Query params:** nenhum
- **Request body:** `course_id: string`, `cohort_id?: string`, `success_url: string`, `cancel_url: string`
- **Response body:** `checkout_session: { id: string, stripe_session_id: string, url: string, amount_cents: number, currency: string, status: string }`
- **Erros:** `400 VALIDATION_ERROR`, `401 UNAUTHORIZED`, `403 FORBIDDEN`, `404 COURSE_NOT_FOUND`, `409 ENROLLMENT_EXISTS`

### `GET /enrollments/me`

- **Auth:** `student`
- **Query params:** `status?: "active" | "expired" | "cancelled" | "pending"`, `limit?: number`, `cursor?: string`
- **Request body:** nenhum
- **Response body:** `enrollments: { id: string, status: string, started_at: string, expires_at: string | null, course: CourseSummary, cohort: { id: string, name: string } | null }[]`, `next_cursor: string | null`
- **Erros:** `401 UNAUTHORIZED`, `403 FORBIDDEN`

### `GET /enrollments/:courseId/access`

- **Auth:** `student`
- **Query params:** nenhum
- **Request body:** nenhum
- **Response body:** `access: { course_id: string, has_access: boolean, reason: "active_enrollment" | "preview_only" | "expired" | "not_enrolled" | "pending_payment", enrollment_id: string | null, expires_at: string | null }`
- **Erros:** `401 UNAUTHORIZED`, `403 FORBIDDEN`, `404 COURSE_NOT_FOUND`

### `GET /payments/me`

- **Auth:** `student`
- **Query params:** `status?: "pending" | "paid" | "failed" | "refunded"`, `limit?: number`, `cursor?: string`
- **Request body:** nenhum
- **Response body:** `payments: { id: string, course_id: string, course_title: string, stripe_payment_intent_id: string | null, stripe_checkout_session_id: string | null, amount_cents: number, currency: string, status: string, paid_at: string | null, created_at: string }[]`, `next_cursor: string | null`
- **Erros:** `401 UNAUTHORIZED`, `403 FORBIDDEN`

## Conteudo e aulas

### `GET /lessons/:id`

- **Auth:** `público` para preview, `student` para aula paga
- **Query params:** nenhum
- **Request body:** nenhum
- **Response body:** `lesson: { id: string, course_id: string, module_id: string, title: string, description: string | null, duration_secs: number | null, order_index: number, is_preview: boolean, released_at: string | null, video_url: string | null, materials: { id: string, title: string, file_url: string, type: "pdf" | "slides" | "spreadsheet" | "other" }[] }`
- **Erros:** `401 UNAUTHORIZED`, `403 CONTENT_LOCKED`, `404 LESSON_NOT_FOUND`, `409 LESSON_NOT_READY`

### `POST /lessons/:id/bunny-upload-url`

- **Auth:** `teacher` ou `admin`
- **Query params:** nenhum
- **Request body:** `file_name: string`, `file_size: number`, `content_type: string`
- **Response body:** `upload: { lesson_id: string, bunny_video_id: string, tus_upload_url: string, expires_at: string }`
- **Erros:** `400 VALIDATION_ERROR`, `401 UNAUTHORIZED`, `403 FORBIDDEN`, `404 LESSON_NOT_FOUND`

## Progresso

### `PATCH /progress/lessons/:lessonId`

- **Auth:** `student`
- **Query params:** nenhum
- **Request body:** `watched_pct?: number`, `watched_seconds?: number`, `completed?: boolean`
- **Response body:** `progress: { id: string, student_id: string, lesson_id: string, course_id: string, watched_pct: number, watched_seconds: number, completed: boolean, completed_at: string | null, last_watched_at: string }`
- **Erros:** `400 VALIDATION_ERROR`, `401 UNAUTHORIZED`, `403 CONTENT_LOCKED`, `404 LESSON_NOT_FOUND`

### `POST /progress/modules/:moduleId/complete`

- **Auth:** `student`
- **Query params:** nenhum
- **Request body:** nenhum
- **Response body:** `completion: { id: string, student_id: string, module_id: string, course_id: string, completed_at: string }`
- **Erros:** `401 UNAUTHORIZED`, `403 CONTENT_LOCKED`, `404 MODULE_NOT_FOUND`, `409 MODULE_ALREADY_COMPLETED`

### `GET /progress/courses/:courseId`

- **Auth:** `student`
- **Query params:** nenhum
- **Request body:** nenhum
- **Response body:** `progress: { course_id: string, completed_lessons: number, total_lessons: number, completed_modules: number, total_modules: number, watched_pct_avg: number, is_course_completed: boolean, lessons: { lesson_id: string, watched_pct: number, watched_seconds: number, completed: boolean, last_watched_at: string | null }[] }`
- **Erros:** `401 UNAUTHORIZED`, `403 CONTENT_LOCKED`, `404 COURSE_NOT_FOUND`

## Ao vivo

### `GET /live-classes`

- **Auth:** `student`
- **Query params:** `course_id?: string`, `status?: "scheduled" | "live" | "ended" | "cancelled"`, `from?: string`, `limit?: number`, `cursor?: string`
- **Request body:** nenhum
- **Response body:** `live_classes: { id: string, course_id: string | null, module_id: string | null, title: string, scheduled_at: string, duration_mins: number, status: string, started_at: string | null, ended_at: string | null }[]`, `next_cursor: string | null`
- **Erros:** `401 UNAUTHORIZED`, `403 FORBIDDEN`

### `GET /live-classes/:id`

- **Auth:** `student`
- **Query params:** nenhum
- **Request body:** nenhum
- **Response body:** `live_class: { id: string, course_id: string | null, module_id: string | null, title: string, scheduled_at: string, duration_mins: number, status: string, ivs_playback_url: string | null, recording_url: string | null, started_at: string | null, ended_at: string | null }`
- **Erros:** `401 UNAUTHORIZED`, `403 CONTENT_LOCKED`, `404 LIVE_CLASS_NOT_FOUND`

### `POST /live-classes/:id/attendance`

- **Auth:** `student`
- **Query params:** nenhum
- **Request body:** `event: "join" | "leave"`
- **Response body:** `attendance: { id: string, session_id: string, student_id: string, joined_at: string, left_at: string | null }`
- **Erros:** `400 VALIDATION_ERROR`, `401 UNAUTHORIZED`, `403 CONTENT_LOCKED`, `404 LIVE_CLASS_NOT_FOUND`

### `POST /live-classes/:id/end`

- **Auth:** `teacher` ou `admin`
- **Query params:** nenhum
- **Request body:** `recording_url?: string`
- **Response body:** `live_class: { id: string, status: "ended", ended_at: string, recording_url: string | null }`
- **Erros:** `401 UNAUTHORIZED`, `403 FORBIDDEN`, `404 LIVE_CLASS_NOT_FOUND`, `409 LIVE_CLASS_NOT_LIVE`

### `GET /live-classes/:id/polls`

- **Auth:** `student`
- **Query params:** nenhum
- **Request body:** nenhum
- **Response body:** `polls: { id: string, session_id: string, question: string, is_active: boolean, created_at: string, options: { id: string, text: string, order: number, vote_count?: number }[], my_vote_option_id: string | null }[]`
- **Erros:** `401 UNAUTHORIZED`, `403 CONTENT_LOCKED`, `404 LIVE_CLASS_NOT_FOUND`

### `POST /live-classes/:id/polls`

- **Auth:** `teacher` ou `admin`
- **Query params:** nenhum
- **Request body:** `question: string`, `options: { text: string, order: number }[]`
- **Response body:** `poll: { id: string, session_id: string, question: string, is_active: boolean, options: { id: string, text: string, order: number }[] }`
- **Erros:** `400 VALIDATION_ERROR`, `401 UNAUTHORIZED`, `403 FORBIDDEN`, `404 LIVE_CLASS_NOT_FOUND`

### `POST /polls/:pollId/votes`

- **Auth:** `student`
- **Query params:** nenhum
- **Request body:** `option_id: string`
- **Response body:** `vote: { id: string, poll_id: string, option_id: string, student_id: string, voted_at: string }`
- **Erros:** `400 VALIDATION_ERROR`, `401 UNAUTHORIZED`, `403 CONTENT_LOCKED`, `404 POLL_NOT_FOUND`, `409 POLL_ALREADY_VOTED`

## Certificados

### `POST /certificates/:courseId`

- **Auth:** `student`
- **Query params:** nenhum
- **Request body:** nenhum
- **Response body:** `certificate: { id: string, student_id: string, course_id: string, credential_id: string, issued_at: string, cert_url: string | null }`
- **Erros:** `401 UNAUTHORIZED`, `403 COURSE_NOT_COMPLETED`, `404 COURSE_NOT_FOUND`, `409 CERTIFICATE_ALREADY_EXISTS`

### `GET /certificates/me`

- **Auth:** `student`
- **Query params:** `limit?: number`, `cursor?: string`
- **Request body:** nenhum
- **Response body:** `certificates: { id: string, course_id: string, course_title: string, credential_id: string, issued_at: string, cert_url: string | null }[]`, `next_cursor: string | null`
- **Erros:** `401 UNAUTHORIZED`, `403 FORBIDDEN`

### `GET /certificates/verify/:credentialId`

- **Auth:** `público`
- **Query params:** nenhum
- **Request body:** nenhum
- **Response body:** `certificate: { credential_id: string, issued_at: string, cert_url: string | null, student_name: string, course_title: string, valid: boolean }`
- **Erros:** `404 CERTIFICATE_NOT_FOUND`

## Questoes e simulados

### `GET /questions`

- **Auth:** `autenticado`
- **Query params:** `subject?: string`, `discipline?: string`, `topic?: string`, `bank?: "ENEM" | "UFU" | "UEG" | "UFG" | "UNESP" | string`, `difficulty?: "easy" | "medium" | "hard"`, `exam_year?: number`, `tab?: "todo" | "done"`, `limit?: number`, `cursor?: string`
- **Request body:** nenhum
- **Response body:** `questions: QuestionPublic[]`, `next_cursor: string | null`
- **Erros:** `400 VALIDATION_ERROR`, `401 UNAUTHORIZED`

### `GET /questions/topics`

- **Auth:** `autenticado`
- **Query params:** `subject?: string`, `bank?: "ENEM" | "UFU" | "UEG" | "UFG" | "UNESP" | string`
- **Request body:** nenhum
- **Response body:** `topics: { name: string, count: number }[]`
- **Erros:** `400 VALIDATION_ERROR`, `401 UNAUTHORIZED`

### `GET /questions/:id`

- **Auth:** `autenticado`
- **Query params:** `include_answer?: boolean` somente `teacher` ou `admin`
- **Request body:** nenhum
- **Response body:** `question: QuestionPublic & { correct_alternative?: string | null, metadata?: object | null }`
- **Erros:** `401 UNAUTHORIZED`, `403 FORBIDDEN`, `404 QUESTION_NOT_FOUND`

### `POST /question-attempts`

- **Auth:** `student`
- **Query params:** nenhum
- **Request body:** `question_id: string`, `selected_option: string`, `time_spent_ms?: number`
- **Response body:** `attempt: { id: string, question_id: string, selected_option: string, is_correct: boolean, is_first_correct: boolean, already_answered_correctly: boolean, correct_alternative: string | null, explanation: string, time_spent_ms: number | null, attempted_at: string, points_awarded: number }`
- **Erros:** `400 VALIDATION_ERROR`, `401 UNAUTHORIZED`, `403 CONTENT_LOCKED`, `404 QUESTION_NOT_FOUND`, `409 QUESTION_NOT_AVAILABLE`

Observacoes: qualquer primeiro acerto correto no banco de questoes vale `3` pontos e gera `gamification_points`. Tentativas repetidas sao registradas, mas nao pontuam de novo.

### `POST /exam-sessions`

- **Auth:** `student`
- **Query params:** nenhum
- **Request body:** `course_id?: string`, `question_ids?: string[]`, `config?: { format?: "linguagens" | "humanas" | "natureza" | "matematica" | "dia1" | "dia2" | "completo" | "custom", bank?: string, year?: number, subject?: string, difficulty?: "easy" | "medium" | "hard" | "misto" | string, qty?: number, time_limit_secs?: number }`, `is_printed?: boolean`
- **Response body:** `exam_session: { id: string, student_id: string, course_id: string | null, status: "in_progress", total_questions: number, correct_count: number | null, score: number | null, is_printed: boolean, started_at: string, config: object }`, `answers: { id: string, question_id: string, order_index: number, selected_option: string | null, is_correct: boolean | null, is_annulled: boolean }[]`, `questions: QuestionPublic[]`
- **Erros:** `400 VALIDATION_ERROR`, `400 INVALID_FORMAT`, `401 UNAUTHORIZED`, `403 CONTENT_LOCKED`, `404 QUESTION_NOT_FOUND`, `404 NO_QUESTIONS_FOUND`

### `GET /exam-sessions/me`

- **Auth:** `student`
- **Query params:** `status?: "in_progress" | "completed" | "abandoned"`, `limit?: number`, `cursor?: string`
- **Request body:** nenhum
- **Response body:** `exam_sessions: { id: string, course_id: string | null, status: string, total_questions: number, correct_count: number, score: number | null, is_printed: boolean, started_at: string, finished_at: string | null }[]`, `next_cursor: string | null`
- **Erros:** `401 UNAUTHORIZED`

### `GET /exam-sessions/:id`

- **Auth:** `student`
- **Query params:** nenhum
- **Request body:** nenhum
- **Response body:** `exam_session: { id: string, student_id: string, course_id: string | null, status: string, total_questions: number | null, correct_count: number | null, score: number | null, tri_score: number | null, results_by_subject: object, config: object, is_printed: boolean, answer_sheet_image_url: string | null, ocr_status: string | null, started_at: string, finished_at: string | null }`, `answers: { id: string, question_id: string, order_index: number, selected_option: string | null, is_correct: boolean | null, is_annulled: boolean, answered_at: string | null, question: QuestionPublic }[]`
- **Erros:** `401 UNAUTHORIZED`, `403 FORBIDDEN`, `404 EXAM_SESSION_NOT_FOUND`

### `PATCH /exam-sessions/:id/answers/:questionId`

- **Auth:** `student`
- **Query params:** nenhum
- **Request body:** `selected_option: string`
- **Response body:** `answer: { id: string, session_id: string, question_id: string, selected_option: string, is_correct: boolean, answered_at: string }`
- **Erros:** `400 VALIDATION_ERROR`, `401 UNAUTHORIZED`, `403 FORBIDDEN`, `404 EXAM_SESSION_NOT_FOUND`, `409 EXAM_SESSION_CLOSED`

### `POST /exam-sessions/:id/complete`

- **Auth:** `student`
- **Query params:** nenhum
- **Request body:** `time_taken_secs?: number`
- **Response body:** `exam_session: { id: string, status: "completed", total_questions: number, correct_count: number, score: number, percentage: number, tri_score: number | null, results_by_subject: object, results_by_bank: object, annulled_question_ids: string[], annulled_questions_count: number, time_taken_secs: number | null, finished_at: string, points_awarded: 0 }`
- **Erros:** `400 MIN_ANSWERS_NOT_REACHED` com `answered_count`, `minimum_required`, `total_questions`; `401 UNAUTHORIZED`, `403 FORBIDDEN`, `404 EXAM_SESSION_NOT_FOUND`, `409 EXAM_SESSION_CLOSED`

### `GET /exam-sessions/:id/review`

- **Auth:** `student`
- **Query params:** nenhum
- **Request body:** nenhum
- **Response body:** `review: { session_id: string, annulled_question_ids: string[], annulled_questions_count: number, explanations: Record<string, { explanation: string, correct_answer: string | null, user_answer: string | null, is_correct: boolean, is_annulled: boolean, subject: string | null }> }`
- **Erros:** `401 UNAUTHORIZED`, `403 FORBIDDEN`, `404 EXAM_SESSION_NOT_FOUND`

### `POST /question-reports`

- **Auth:** `student`
- **Query params:** nenhum
- **Request body:** `question_id: string`, `error_category: "estrutural" | "conteudo" | "resposta" | "outro"`, `description?: string`
- **Response body:** `report: { id: string, question_id: string, error_category: string, description: string | null, status: "pending", created_at: string }`
- **Erros:** `400 VALIDATION_ERROR`, `401 UNAUTHORIZED`, `403 CONTENT_LOCKED`, `404 QUESTION_NOT_FOUND`, `409 QUESTION_REPORT_ALREADY_OPEN`

### `GET /question-reports/me`

- **Auth:** `student`
- **Query params:** `limit?: number`, `cursor?: string`
- **Request body:** nenhum
- **Response body:** `reports: { id: string, question_id: string, error_category: string, description: string | null, status: string, created_at: string, resolved_at: string | null }[]`, `next_cursor: string | null`
- **Erros:** `401 UNAUTHORIZED`

### `POST /exam-sessions/:id/answer-sheet`

- **Auth:** `student`
- **Query params:** nenhum
- **Request body:** `image_url: string`
- **Response body:** `exam_session: { id: string, answer_sheet_image_url: string, ocr_status: "pending" | "processing" }`
- **Erros:** `400 VALIDATION_ERROR`, `401 UNAUTHORIZED`, `403 FORBIDDEN`, `404 EXAM_SESSION_NOT_FOUND`

## Redacoes

### `GET /essay-prompts`

- **Auth:** `student`
- **Query params:** `course_id?: string`, `essay_type?: "enem" | "ufu" | "ueg" | "fuvest" | "vunesp"`, `active?: boolean`, `limit?: number`, `cursor?: string`
- **Request body:** nenhum
- **Response body:** `prompts: { id: string, course_id: string, title: string, description: string | null, support_items: object | null, essay_type: string, starts_at: string | null, ends_at: string | null }[]`, `next_cursor: string | null`
- **Erros:** `400 VALIDATION_ERROR`, `401 UNAUTHORIZED`, `403 CONTENT_LOCKED`

### `POST /essays`

- **Auth:** `student`
- **Query params:** nenhum
- **Request body:** `prompt_id?: string`, `course_id?: string`, `text?: string`, `image_url?: string`, `theme?: string`, `essay_type: "enem" | "ufu" | "ueg" | "fuvest" | "vunesp"`
- **Response body:** `essay: { id: string, student_id: string, course_id: string | null, prompt_id: string | null, text: string | null, image_url: string | null, theme: string | null, essay_type: string, status: "pending" | "transcribing" | "correcting" | "corrected" | "seen" | "error", submitted_at: string }`
- **Erros:** `400 VALIDATION_ERROR`, `401 UNAUTHORIZED`, `403 CONTENT_LOCKED`

### `GET /essays/me`

- **Auth:** `student`
- **Query params:** `status?: string`, `course_id?: string`, `limit?: number`, `cursor?: string`
- **Request body:** nenhum
- **Response body:** `essays: { id: string, course_id: string | null, prompt_id: string | null, theme: string | null, essay_type: string, status: string, total_score: number | null, submitted_at: string, corrected_at: string | null, seen_at: string | null }[]`, `next_cursor: string | null`
- **Erros:** `401 UNAUTHORIZED`

### `GET /essays/:id`

- **Auth:** `student` dono, `teacher`, `manager` ou `admin`
- **Query params:** nenhum
- **Request body:** nenhum
- **Response body:** `essay: { id: string, student_id: string, course_id: string | null, prompt_id: string | null, text: string | null, transcribed_text: string | null, image_url: string | null, theme: string | null, essay_type: string, status: string, general_comment: string | null, total_score: number | null, submitted_at: string, corrected_at: string | null, seen_at: string | null, competency_scores: { competency: number, score: number, comment: string | null }[] }`
- **Erros:** `401 UNAUTHORIZED`, `403 FORBIDDEN`, `404 ESSAY_NOT_FOUND`

### `POST /essays/:id/correct`

- **Auth:** `teacher` ou `admin`
- **Query params:** nenhum
- **Request body:** `force?: boolean`
- **Response body:** `essay: { id: string, status: "correcting" | "corrected", total_score: number | null, corrected_at: string | null }`
- **Erros:** `401 UNAUTHORIZED`, `403 FORBIDDEN`, `404 ESSAY_NOT_FOUND`, `409 ESSAY_ALREADY_CORRECTED`

### `GET /essays/:id/correction`

- **Auth:** `student` dono, `teacher`, `manager` ou `admin`
- **Query params:** nenhum
- **Request body:** nenhum
- **Response body:** `correction: { essay_id: string, status: string, total_score: number | null, general_comment: string | null, competency_scores: { competency: number, score: number, comment: string | null }[], corrected_at: string | null }`
- **Erros:** `401 UNAUTHORIZED`, `403 FORBIDDEN`, `404 ESSAY_NOT_FOUND`, `409 ESSAY_NOT_CORRECTED`

## Gamificacao

### `GET /gamification/ranking/monthly`

- **Auth:** `autenticado`
- **Query params:** `month?: string`, `limit?: number`, `cursor?: string`
- **Request body:** nenhum
- **Response body:** `ranking: { rank: number, student_id: string, student_name: string, avatar_url: string | null, total_points: number, month: string }[]`, `next_cursor: string | null`
- **Erros:** `400 VALIDATION_ERROR`, `401 UNAUTHORIZED`

### `GET /gamification/streak/me`

- **Auth:** `student`
- **Query params:** nenhum
- **Request body:** nenhum
- **Response body:** `streak: { student_id: string, current_streak: number, longest_streak: number, last_activity_date: string | null, shield_count: number }`
- **Erros:** `401 UNAUTHORIZED`, `403 FORBIDDEN`

### `GET /gamification/me`

- **Auth:** `student`
- **Query params:** nenhum
- **Request body:** nenhum
- **Response body:** `gamification: { total_points: number, current_month_points: number, streak: { current_streak: number, shield_count: number }, titles: { title_key: string, title_name: string, earned_at: string }[] }`
- **Erros:** `401 UNAUTHORIZED`, `403 FORBIDDEN`

### `GET /gamification/points/me`

- **Auth:** `student`
- **Query params:** `limit?: number`, `cursor?: string`
- **Request body:** nenhum
- **Response body:** `points: { id: string, points: number, origin_type: string, origin_id: string | null, multiplier: number, earned_at: string }[]`, `next_cursor: string | null`
- **Erros:** `401 UNAUTHORIZED`, `403 FORBIDDEN`

## Comunicacao e responsaveis

### `GET /announcements`

- **Auth:** `autenticado`
- **Query params:** `course_id?: string`, `limit?: number`, `cursor?: string`
- **Request body:** nenhum
- **Response body:** `announcements: { id: string, course_id: string | null, title: string, body: string, published_at: string, created_at: string }[]`, `next_cursor: string | null`
- **Erros:** `401 UNAUTHORIZED`, `403 CONTENT_LOCKED`

### `GET /parent/student-links`

- **Auth:** `parent`
- **Query params:** nenhum
- **Request body:** nenhum
- **Response body:** `links: { id: string, parent_user_id: string, student_user_id: string, verified: boolean, created_at: string, student: { id: string, name: string, email: string, avatar_url: string | null } }[]`
- **Erros:** `401 UNAUTHORIZED`, `403 FORBIDDEN`

### `POST /parent/student-links`

- **Auth:** `parent`
- **Query params:** nenhum
- **Request body:** `student_email: string`
- **Response body:** `link: { id: string, parent_user_id: string, student_user_id: string, verified: boolean, created_at: string }`
- **Erros:** `400 VALIDATION_ERROR`, `401 UNAUTHORIZED`, `403 FORBIDDEN`, `404 STUDENT_NOT_FOUND`, `409 LINK_ALREADY_EXISTS`

### `GET /parent/students/:studentId/progress`

- **Auth:** `parent`
- **Query params:** `course_id?: string`
- **Request body:** nenhum
- **Response body:** `student: { id: string, name: string }`, `courses: { course_id: string, course_title: string, completed_lessons: number, total_lessons: number, watched_pct_avg: number }[]`, `gamification: { total_points: number, current_streak: number }`
- **Erros:** `401 UNAUTHORIZED`, `403 PARENT_LINK_NOT_VERIFIED`, `404 STUDENT_NOT_FOUND`

## Webhooks

### `POST /webhooks/stripe`

- **Auth:** `webhook`
- **Query params:** nenhum
- **Request body:** payload bruto da Stripe
- **Response body:** `received: boolean`, `event_id: string`, `processed: boolean`
- **Erros:** `400 INVALID_SIGNATURE`, `400 INVALID_PAYLOAD`, `500 WEBHOOK_PROCESSING_FAILED`

### `POST /webhooks/clerk`

- **Auth:** `webhook`
- **Query params:** nenhum
- **Request body:** payload bruto da Clerk
- **Response body:** `received: boolean`, `event_id: string`, `processed: boolean`
- **Erros:** `400 INVALID_SIGNATURE`, `400 INVALID_PAYLOAD`, `500 WEBHOOK_PROCESSING_FAILED`

### `POST /webhooks/bunny`

- **Auth:** `webhook`
- **Query params:** nenhum
- **Request body:** payload bruto da Bunny Stream
- **Response body:** `received: boolean`, `event_id: string`, `processed: boolean`
- **Erros:** `400 INVALID_SIGNATURE`, `400 INVALID_PAYLOAD`, `404 LESSON_NOT_FOUND`, `500 WEBHOOK_PROCESSING_FAILED`

### `POST /internal/jobs/:jobName`

- **Auth:** `webhook`
- **Query params:** nenhum
- **Request body:** payload assinado pelo QStash
- **Response body:** `received: boolean`, `job_name: string`, `processed: boolean`
- **Erros:** `400 INVALID_SIGNATURE`, `404 JOB_NOT_FOUND`, `500 JOB_FAILED`

Jobs obrigatorios: `daily-streak-check` e `monthly-ranking-reset`.

## Admin

### `POST /admin/courses`

- **Auth:** `teacher` ou `admin`
- **Query params:** nenhum
- **Request body:** `slug: string`, `title: string`, `description?: string`, `thumbnail_url?: string`, `trailer_url?: string`, `price_cents: number`, `currency?: string`, `access_days?: number | null`, `type: CourseSummary.type`, `is_active?: boolean`, `is_featured?: boolean`, `starts_at?: string`
- **Response body:** `course: CourseSummary & { description: string | null, access_days: number | null, is_active: boolean }`
- **Erros:** `400 VALIDATION_ERROR`, `401 UNAUTHORIZED`, `403 FORBIDDEN`, `409 COURSE_SLUG_EXISTS`

### `PATCH /admin/courses/:id`

- **Auth:** `teacher` dono ou `admin`
- **Query params:** nenhum
- **Request body:** mesmos campos opcionais de `POST /admin/courses`
- **Response body:** `course: CourseSummary & { description: string | null, access_days: number | null, is_active: boolean }`
- **Erros:** `400 VALIDATION_ERROR`, `401 UNAUTHORIZED`, `403 FORBIDDEN`, `404 COURSE_NOT_FOUND`, `409 COURSE_SLUG_EXISTS`

### `POST /admin/courses/:id/modules`

- **Auth:** `teacher` dono ou `admin`
- **Query params:** nenhum
- **Request body:** `title: string`, `description?: string`, `subject?: string`, `order_index?: number`, `is_active?: boolean`
- **Response body:** `module: { id: string, course_id: string, title: string, description: string | null, subject: string | null, order_index: number, is_active: boolean }`
- **Erros:** `400 VALIDATION_ERROR`, `401 UNAUTHORIZED`, `403 FORBIDDEN`, `404 COURSE_NOT_FOUND`

### `POST /admin/modules/:moduleId/lessons`

- **Auth:** `teacher` dono ou `admin`
- **Query params:** nenhum
- **Request body:** `title: string`, `description?: string`, `duration_secs?: number`, `order_index?: number`, `is_preview?: boolean`, `is_active?: boolean`, `released_at?: string`
- **Response body:** `lesson: { id: string, module_id: string, course_id: string, title: string, description: string | null, duration_secs: number | null, order_index: number, is_preview: boolean, is_active: boolean, released_at: string | null }`
- **Erros:** `400 VALIDATION_ERROR`, `401 UNAUTHORIZED`, `403 FORBIDDEN`, `404 MODULE_NOT_FOUND`

### `POST /admin/live-classes`

- **Auth:** `teacher` ou `admin`
- **Query params:** nenhum
- **Request body:** `course_id?: string`, `module_id?: string`, `title: string`, `scheduled_at: string`, `duration_mins?: number`
- **Response body:** `live_class: { id: string, course_id: string | null, module_id: string | null, title: string, scheduled_at: string, duration_mins: number, status: "scheduled", ivs_channel_arn: string | null, ivs_ingest_endpoint: string | null }`
- **Erros:** `400 VALIDATION_ERROR`, `401 UNAUTHORIZED`, `403 FORBIDDEN`, `404 COURSE_NOT_FOUND`

### `GET /admin/courses/:id/students`

- **Auth:** `teacher` dono, `manager` ou `admin`
- **Query params:** `status?: "active" | "expired" | "cancelled" | "pending"`, `limit?: number`, `cursor?: string`
- **Request body:** nenhum
- **Response body:** `students: { enrollment_id: string, status: string, started_at: string, expires_at: string | null, student: { id: string, name: string, email: string, avatar_url: string | null }, cohort: { id: string, name: string } | null }[]`, `next_cursor: string | null`
- **Erros:** `401 UNAUTHORIZED`, `403 FORBIDDEN`, `404 COURSE_NOT_FOUND`

### `GET /admin/questions`

- **Auth:** `teacher` ou `admin`
- **Query params:** `status?: string`, `is_verified?: boolean`, `is_ai_generated?: boolean`, `bank?: string`, `limit?: number`, `cursor?: string`
- **Request body:** nenhum
- **Response body:** `questions: (QuestionPublic & { correct_alternative: string | null, is_verified: boolean, is_public: boolean, status: string, is_ai_generated: boolean, generation_prompt: string | null, metadata: object | null })[]`, `next_cursor: string | null`
- **Erros:** `401 UNAUTHORIZED`, `403 FORBIDDEN`

### `PATCH /admin/questions/:id`

- **Auth:** `teacher` ou `admin`
- **Query params:** nenhum
- **Request body:** campos editaveis de questao, incluindo `is_verified?: boolean`, `is_public?: boolean`, `status?: string`, `correct_alternative?: string`
- **Response body:** `question: QuestionPublic & { correct_alternative: string | null, is_verified: boolean, is_public: boolean, status: string }`
- **Erros:** `400 VALIDATION_ERROR`, `401 UNAUTHORIZED`, `403 FORBIDDEN`, `404 QUESTION_NOT_FOUND`

### `POST /admin/questions/generate`

- **Auth:** `teacher` ou `admin`
- **Query params:** nenhum
- **Request body:** `subject: string`, `discipline?: string`, `bank?: "ENEM" | "UFU" | "UEG"`, `difficulty: "easy" | "medium" | "hard"`, `quantity: number`, `prompt?: string`
- **Response body:** `job: { id: string, status: "queued" | "processing" }`
- **Erros:** `400 VALIDATION_ERROR`, `401 UNAUTHORIZED`, `403 FORBIDDEN`, `502 AI_UNAVAILABLE`

### `GET /admin/essays`

- **Auth:** `teacher`, `manager` ou `admin`
- **Query params:** `status?: string`, `course_id?: string`, `limit?: number`, `cursor?: string`
- **Request body:** nenhum
- **Response body:** `essays: { id: string, student_id: string, student_name: string, course_id: string | null, theme: string | null, essay_type: string, status: string, total_score: number | null, submitted_at: string, corrected_at: string | null }[]`, `next_cursor: string | null`
- **Erros:** `401 UNAUTHORIZED`, `403 FORBIDDEN`

### `GET /admin/users`

- **Auth:** `admin`
- **Query params:** `role?: "student" | "teacher" | "manager" | "parent" | "admin"`, `q?: string`, `limit?: number`, `cursor?: string`
- **Request body:** nenhum
- **Response body:** `users: UserProfile[]`, `next_cursor: string | null`
- **Erros:** `401 UNAUTHORIZED`, `403 FORBIDDEN`

### `POST /admin/users/managers`

- **Auth:** `admin`
- **Query params:** nenhum
- **Request body:** `name: string`, `email: string`, `password: string`
- **Response body:** `user: UserProfile`
- **Erros:** `400 VALIDATION_ERROR`, `401 UNAUTHORIZED`, `403 FORBIDDEN`, `502 CLERK_CREATE_FAILED`
- **Observação:** cria o usuário no Clerk com `publicMetadata.role = "manager"` e provisiona a linha local em `users`. `admin` continua sendo criado fora da plataforma por desenvolvedores.

### `PATCH /admin/users/:id`

- **Auth:** `admin`
- **Query params:** nenhum
- **Request body:** `role?: UserProfile.role`, `name?: string`, `avatar_url?: string | null`
- **Response body:** `user: UserProfile`
- **Erros:** `400 VALIDATION_ERROR`, `401 UNAUTHORIZED`, `403 FORBIDDEN`, `404 USER_NOT_FOUND`

### `GET /admin/parent-links`

- **Auth:** `admin`
- **Query params:** `verified?: boolean`, `limit?: number`, `cursor?: string`
- **Request body:** nenhum
- **Response body:** `links: { id: string, verified: boolean, created_at: string, parent: { id: string, name: string, email: string }, student: { id: string, name: string, email: string } }[]`, `next_cursor: string | null`
- **Erros:** `401 UNAUTHORIZED`, `403 FORBIDDEN`

### `PATCH /admin/parent-links/:id/verify`

- **Auth:** `admin`
- **Query params:** nenhum
- **Request body:** nenhum
- **Response body:** `link: { id: string, parent_user_id: string, student_user_id: string, verified: boolean, created_at: string }`
- **Erros:** `401 UNAUTHORIZED`, `403 FORBIDDEN`, `404 LINK_NOT_FOUND`
- **Observação:** idempotente — verificar um vínculo já verificado retorna o vínculo sem erro.

### `POST /admin/announcements`

- **Auth:** `teacher`, `manager` ou `admin`
- **Query params:** nenhum
- **Request body:** `course_id?: string`, `title: string`, `body: string`, `published_at?: string`
- **Response body:** `announcement: { id: string, course_id: string | null, title: string, body: string, published_at: string, created_at: string }`
- **Erros:** `400 VALIDATION_ERROR`, `401 UNAUTHORIZED`, `403 FORBIDDEN`, `404 COURSE_NOT_FOUND`

## AI Service FastAPI

Todos os endpoints desta secao exigem `X-AI-Secret: <AI_SERVICE_SECRET>` e sao chamados pelo Fastify, nao pelo browser.

### `POST /ai/essays/correct`

- **Auth:** `service`
- **Query params:** nenhum
- **Request body:** `essay_id: string`, `text: string`, `theme?: string`, `essay_type: "enem" | "ufu" | "ueg" | "fuvest" | "vunesp"`
- **Response body:** `essay_id: string`, `total_score: number`, `general_comment: string`, `competency_scores: { competency: number, score: number, comment: string | null }[]`
- **Erros:** `401 { error: "UNAUTHORIZED", detail: string }`, `422 { error: "VALIDATION_ERROR", detail: string }`, `502 { error: "AI_UNAVAILABLE", detail: string }`

### `POST /ai/essays/transcribe`

- **Auth:** `service`
- **Query params:** nenhum
- **Request body:** `essay_id: string`, `image_url: string`
- **Response body:** `essay_id: string`, `transcribed_text: string`, `confidence: number | null`
- **Erros:** `401 { error: "UNAUTHORIZED", detail: string }`, `422 { error: "VALIDATION_ERROR", detail: string }`, `502 { error: "AI_UNAVAILABLE", detail: string }`

### `POST /ai/questions/generate`

- **Auth:** `service`
- **Query params:** nenhum
- **Request body:** `subject: string`, `discipline?: string`, `bank?: "ENEM" | "UFU" | "UEG"`, `difficulty: "easy" | "medium" | "hard"`, `quantity: number`, `prompt?: string`
- **Response body:** `questions: { title: string | null, context: string | null, alternatives_intro: string | null, alternatives: object, correct_alternative: string, explanation?: string, metadata: object }[]`
- **Erros:** `401 { error: "UNAUTHORIZED", detail: string }`, `422 { error: "VALIDATION_ERROR", detail: string }`, `502 { error: "AI_UNAVAILABLE", detail: string }`

### `POST /ai/answer-sheets/read`

- **Auth:** `service`
- **Query params:** nenhum
- **Request body:** `exam_session_id: string`, `image_url: string`, `question_count: number`
- **Response body:** `exam_session_id: string`, `answers: { question_number: number, selected_option: string | null, confidence: number | null }[]`
- **Erros:** `401 { error: "UNAUTHORIZED", detail: string }`, `422 { error: "VALIDATION_ERROR", detail: string }`, `502 { error: "AI_UNAVAILABLE", detail: string }`

### `POST /ai/repertoire/search`

- **Auth:** `service`
- **Query params:** nenhum
- **Request body:** `query: string`, `match_count?: number`
- **Response body:** `matches: { id: number, content: string, author: string | null, category: string | null, similarity: number }[]`
- **Erros:** `401 { error: "UNAUTHORIZED", detail: string }`, `422 { error: "VALIDATION_ERROR", detail: string }`, `502 { error: "AI_UNAVAILABLE", detail: string }`
