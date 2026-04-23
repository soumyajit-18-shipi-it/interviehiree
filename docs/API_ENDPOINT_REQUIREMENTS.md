
## 1. Dashboard > Job Configuration

### Resume Analysis
The resume criteria panel should persist the exact values edited in the UI.

Required endpoints:
- `GET /jobs/jobs/{jobId}/resume-configuration/`
- `PATCH /jobs/jobs/{jobId}/resume-configuration/`

Required payload support:
- `required_skills: string[]`
- `preferred_skills: string[]`
- `auto_reject_keywords: string[]`
- `min_experience_years` if the backend wants to expose experience gating later

### Recruiter Screening
The screening panel is currently the clearest remaining backend gap. The UI edits parameter toggles, parameter weights, and estimated duration, so the API must persist those values instead of returning read-only defaults.

Note for backend implementation: the GET and PATCH routes already exist, but the request/response shape still needs to support the full parameter model and duration values.

Required endpoints:
- `GET /jobs/jobs/{jobId}/screening-configuration/`
- `PATCH /jobs/jobs/{jobId}/screening-configuration/`

Required payload support:
- `screening_questions: string[]` for the configured question/parameter labels
- `passing_score: number`
- `duration_minutes: number` for the estimated duration
- structured parameter data if the backend wants to persist the UI controls directly:
  - `label: string`
  - `enabled: boolean`
  - `weight: number`

Requirement:
- The backend must persist the current parameter set, not just a summary score.
- The backend must persist the estimated duration selected in the UI.

### Functional Interview / Create Interview Questions
The create interview questions UI offers a fixed set of frontend question types. The create and update endpoints must accept those exact values.

Required endpoints:
- `GET /jobs/jobs/{jobId}/interview-questions/`
- `POST /jobs/jobs/{jobId}/interview-questions/`
- `GET /jobs/jobs/{jobId}/interview-questions/{questionId}/`
- `PATCH /jobs/jobs/{jobId}/interview-questions/{questionId}/`
- `DELETE /jobs/jobs/{jobId}/interview-questions/{questionId}/`

Required payload support:
- `question_text: string`
- `question_type: string`
- `duration_minutes: number`
- `order: number`
- `is_mandatory: boolean`

Frontend `question_type` values that must be accepted:
- `technical`
- `problem_solving`
- `communication`
- `leadership`
- `adaptability`

Requirement:
- The API should echo and preserve the saved `question_type` value so the frontend can round-trip the configuration.

### Collaborators
The collaborator modal is now wired, but the backend still needs to support full CRUD and role updates.

Required endpoints:
- `GET /jobs/jobs/{jobId}/collaborators/`
- `POST /jobs/jobs/{jobId}/collaborators/`
- `PATCH /jobs/jobs/{jobId}/collaborators/{collaboratorId}/`
- `DELETE /jobs/jobs/{jobId}/collaborators/{collaboratorId}/`

Required payload support:
- `user: string`
- `role: string`

Recommended role values:
- `viewer`
- `editor`
- `admin`

### Interview Settings Modal
The interview settings modal is still local-only UI state. It needs a job-level settings endpoint so the toggles survive refresh.

Note for backend implementation: this endpoint is not present in the collection yet, so it still needs to be added to the backend contract.

Required endpoint:
- `PATCH /jobs/jobs/{jobId}/interview-settings/`

Required payload support:
- `interview_status: boolean`
- `allow_mobile: boolean`
- `allow_late_attempts: boolean`
- `continue_from_middle: boolean`
- `allow_reattempt: boolean`
- `request_cv: boolean`
- `access_type: string`

## 2. Dashboard > Job Details

### Edit Job Description modal
The edit JD modal currently only updates local state and closes. It needs a backend save path.

Create Job note: the create-job modal should also support uploading a job description file; if the existing create route cannot handle that as `FormData`, the backend should add a dedicated upload route for job descriptions.

Required endpoint:
- `PATCH /jobs/jobs/{jobId}/`

Required payload support:
- `title: string`
- `location: string`
- `employment_type` or equivalent field for the select control
- `description: string` / overview text
- role requirement fields such as:
  - `must_haves: string[]`
  - `good_to_haves: string[]`

Requirement:
- The backend should accept the job description fields shown in the modal, not just job status or archive state.

### Candidate Responses tab
The responses tab needs read access to application response data, and possibly write access later if the UI becomes editable.

Required endpoints:
- `GET /candidates/applications/{applicationId}/responses/summary/`
- `GET /candidates/applications/{applicationId}/responses/`

Optional if responses become editable in the UI:
- `POST /candidates/applications/{applicationId}/responses/`
- `PATCH /candidates/applications/{applicationId}/responses/{responseId}/`
- `DELETE /candidates/applications/{applicationId}/responses/{responseId}/`

### AI Insights
The overview card now reads AI insights from the backend. This endpoint should keep supporting either a list or a response object with a list payload.

Required endpoint:
- `GET /jobs/jobs/{jobId}/ai-insights/`

Requirement:
- Return at least one of these shapes consistently:
  - an array of insight objects, or
  - an object containing an insight list field

## 3. Dashboard > Candidate / Screening / Interview Flows

### Candidate side panel
The side panel has tabs for Profile, Resume Match, Screening, Interview Summary, and Emails. Only the profile shell is currently populated, so the remaining tabs need backend data.

Required endpoints:
- candidate summary/profile details
- resume match or resume analysis detail for the selected candidate/application
- screening stage detail for the selected candidate/application
- interview summary detail for the selected candidate/application
- email/message history for the candidate/application

Recommended action endpoints:
- reject application
- move candidate to next round
- reschedule interview

### Recruiter Screening screen
This screen already consumes live list/create/update/delete endpoints for candidates, applications, resume analysis, and interviews. It is mostly backend-backed, but the following capabilities should exist if the UI is expanded further:

Potential endpoint support:
- stage transition reason / notes
- score overrides
- direct scheduling from screening
- retry / re-analysis actions

### Functional Interview screen
This screen is already list-backed, but if it becomes actionable it will need:

Potential endpoint support:
- interview score update
- interview notes update
- interview status update
- schedule rescheduling

### Calendar Overview / Reschedule modal
The calendar view and reschedule modal are still static UI shells.

Required endpoints:
- list scheduled interviews over a date range
- update/reschedule an interview
- optionally cancel an interview

Required payload support for rescheduling:
- `scheduled_for: string`
- `timezone: string`
- optional `notes` or reason text

### Career Page Setup
The career page setup flow is wired, but the backend must keep supporting the saved theme color and media assets.

Required endpoints:
- career page setup create/read/update
- career page media list/upload/detail/update/delete

Required payload support:
- `brand_color: string`
- uploaded media `File` payloads for logo/media assets

Public page requirement:
- career page detail responses should include `brand_color`, headline, subheadline, and slug so the public portal can match the settings screen.

