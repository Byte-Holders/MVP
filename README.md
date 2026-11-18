# CodeGuardian

An AI-powered platform that analyses GitHub repositories and produces a single report on their **security, dependencies, test coverage and documentation**, including LLM-generated remediation suggestions.

CodeGuardian was built by the **Byte Holders** team as the capstone project of the Software Engineering course (BSc in Computer Science, University of Padua), with **Var Group S.p.A.** as the client. This repository contains the MVP.

## How it works

1. A user signs in, creates a **workspace**, invites team members and links GitHub repositories.
2. When a scan is requested, the backend starts an isolated **scan container** as an **AWS ECS** task.
3. Inside the container, a **LangGraph** workflow clones the repository and runs five analysis agents in parallel:

| Agent | What it does |
|-------|--------------|
| Security | Static analysis with **Semgrep**, then an LLM step that turns the findings into concrete **remediation** advice |
| Dependencies | Builds an SBOM with **Syft**, finds vulnerable packages with **Grype**, and has an LLM assess them |
| Coverage | Analyses the test suite and coverage |
| Docs | Evaluates the repository's documentation |
| GitHub | Detects the languages used and collects repository metadata |

4. A **synthesizer** agent merges every partial result into one final report, which is stored and shown in the web app.

LLM steps run on **Amazon Bedrock** through LangChain's `ChatBedrockConverse`. The model is configurable.

```
START → orchestrator (clone repo)
          ├─ security ──→ remediation ─┐
          ├─ dependencies ─────────────┤
          ├─ coverage ─────────────────┼─→ synthesizer → END
          ├─ docs ─────────────────────┤
          └─ github ───────────────────┘
```

## Architecture

The project is split into three applications:

| Folder | Role | Stack |
|--------|------|-------|
| `frontend/` | Web app: workspaces, members, repositories, scans and reports | React, TypeScript, Vite, TanStack Router/Query/Form, Tailwind CSS, shadcn/ui, Recharts, Zustand, Zod |
| `backend/` | REST API: auth, workspaces, memberships, repositories, scans, reports | NestJS, MongoDB/Mongoose, Passport JWT, Amazon Cognito, Swagger, AWS SDK (ECS) |
| `container/` | Scan worker started on demand for each analysis | NestJS, LangChain, LangGraph, Amazon Bedrock, Semgrep, Syft, Grype, isomorphic-git |

**Design highlights**
- Backend organised in feature modules, following a layered modular architecture, with services behind interfaces so they can be swapped and tested in isolation.
- Frontend organised by feature (`src/features/`), following an MVVM approach where hooks act as the view-model layer.
- Authentication with **Amazon Cognito** (OIDC) on the frontend, and JWT verification against Cognito's JWKS on the backend.
- API documented with **Swagger/OpenAPI**.

## Quality

- **120+ test files**: unit tests with Jest (backend and container) and Vitest (frontend), plus integration and end-to-end suites for the backend
- **GitHub Actions** workflows for build, tests and formatting checks
- ESLint, Prettier and Husky pre-commit hooks

## Getting started

**Requirements:** Docker and Docker Compose, a MongoDB instance, an AWS account with Cognito, ECS and Bedrock access.

1. Clone the repository:
   ```bash
   git clone https://github.com/Byte-Holders/MVP.git
   cd MVP
   ```
2. Create `backend/.env` with your configuration:
   ```ini
   DB_IP=...
   DB_PORT=27017
   DB_NAME=...
   DB_USER=...
   DB_PASSWORD=...
   JWT_SECRET_KEY=...
   JWT_EXPIRATION_TIME_IN_SECONDS=3600
   AWS_COGNITO_AUTHORITY=...
   AWS_BEARER_TOKEN_BEDROCK=...
   CONTAINER_CLUSTER=...
   CONTAINER_REGION=...
   ```
3. Start the frontend and backend:
   ```bash
   docker compose up --build
   ```
   The frontend runs on `http://localhost:3000` and the API on `http://localhost:3001`.

The scan worker in `container/` is built as its own image and run as an ECS task. To use a different model, set `BEDROCK_MODEL_ID` and `BEDROCK_AWS_REGION`.

## Team

Byte Holders, Software Engineering course, University of Padua (2025/26).
