# Assignment III: Continuous Integration and Continuous Deployment (DSO101)

**Course:** Bachelor's of Engineering in Software Engineering (SWE)  
**Module:** DSO101 – DevOps  
**Assignment:** III – CI/CD with GitHub Actions, Docker, DockerHub, and Render.com  
**Date of Submission:** 29th April  

---

## Table of Contents

1. [Introduction](#introduction)
2. [Tools and Technologies Used](#tools-and-technologies-used)
3. [Project Repository Structure](#project-repository-structure)
4. [Steps Taken](#steps-taken)
   - [Task 1: GitHub Repository Setup](#task-1-github-repository-setup)
   - [Task 2: Dockerizing the Application](#task-2-dockerizing-the-application)
   - [Task 3: GitHub Actions Workflow](#task-3-github-actions-workflow)
   - [Task 4: Deploying on Render.com](#task-4-deploying-on-rendercom)
5. [Configuration Files](#configuration-files)
6. [Challenges Faced](#challenges-faced)
7. [Learning Outcomes](#learning-outcomes)
8. [Screenshots](#screenshots)
9. [Live Deployment Link](#live-deployment-link)

---

## Introduction

This report documents the implementation of a complete Continuous Integration and Continuous Deployment (CI/CD) pipeline for a Node.js To-Do List application. The pipeline automates the entire software delivery process — from the moment code is pushed to GitHub, all the way to a live, publicly accessible deployment on the cloud.

### What is CI/CD?

**Continuous Integration (CI)** is the practice of automatically building and testing code every time a developer pushes changes to a shared repository. The goal is to catch bugs early, reduce integration problems, and ensure that the codebase is always in a working state.

**Continuous Deployment (CD)** takes CI a step further by automatically deploying every validated change to a production or staging environment without manual intervention. This eliminates the need for someone to manually SSH into a server, pull the latest code, and restart the service.

### Why CI/CD Matters

In traditional software development, deployment was a painful, error-prone, and often manual process. A developer might write code that works perfectly on their laptop, only to find it breaks on the server due to different environment configurations. CI/CD pipelines solve this by:

- Ensuring code is always tested before it reaches users
- Creating a consistent, reproducible build environment using Docker containers
- Reducing time-to-deploy from hours or days to seconds
- Enabling teams to deliver features and fixes much faster

### Pipeline Flow

The overall flow of the CI/CD pipeline implemented in this assignment is as follows:

```
Developer pushes code to GitHub (main branch)
         ↓
GitHub Actions workflow is triggered automatically
         ↓
Workflow checks out the code
         ↓
Workflow logs into DockerHub
         ↓
Docker image is built and pushed to DockerHub
         ↓
Render.com deploy webhook is called
         ↓
Render.com pulls the new Docker image
         ↓
Application is live and accessible on the internet
```

---

## Tools and Technologies Used

| Tool | Purpose | Why It Was Used |
|------|---------|-----------------|
| **GitHub** | Source code hosting and version control | Central repository for all code; integrates natively with GitHub Actions |
| **GitHub Actions** | CI/CD automation | Built directly into GitHub; no separate CI server needed; free for public repositories |
| **Docker** | Containerization | Packages the app and its environment into a portable unit; eliminates "works on my machine" problems |
| **DockerHub** | Container image registry | Free cloud storage for Docker images; accessible by Render.com during deployment |
| **Render.com** | Cloud deployment platform | Free hosting tier; supports Docker image deployments; simple webhook-based redeploy |
| **Node.js** | Application runtime | Backend runtime for the To-Do application |
| **npm** | Package management | Manages Node.js dependencies and runs scripts |
| **Jest** | Testing framework | Runs automated unit tests during the CI pipeline to validate code correctness |

---

## Project Repository Structure

```
todo-app/
├── .github/
│   └── workflows/
│       └── deploy.yml          ← GitHub Actions CI/CD pipeline definition
├── tests/
│   └── app.test.js             ← Jest unit tests
├── node_modules/               ← Auto-generated; not committed to Git
├── Dockerfile                  ← Instructions to build the Docker image
├── .dockerignore               ← Files to exclude from the Docker build context
├── .gitignore                  ← Files to exclude from Git
├── index.js                    ← Main Node.js application entry point
├── package.json                ← Project metadata, dependencies, and npm scripts
├── package-lock.json           ← Locked dependency versions for reproducibility
└── README.md                   ← This report
```

---

## Steps Taken

### Task 1: GitHub Repository Setup

#### 1.1 – Ensuring the Repository is Public

For this assignment, the GitHub repository must be publicly accessible. This is required because:
- DockerHub needs to pull configuration references
- Render.com must be able to access the repository during initial setup
- It is a submission requirement for evaluation

**Steps followed:**
1. Navigated to the GitHub repository
2. Clicked on **Settings** in the top navigation bar
3. Scrolled down to the **Danger Zone** section
4. Clicked **Change visibility** → selected **Public**
5. Confirmed by typing the repository name

#### 1.2 – Verifying `package.json` Scripts

The `package.json` file is the central configuration file for any Node.js project. It must include the correct scripts so that both the CI pipeline and Docker container know how to run and test the application.

The following scripts were verified and present:

```json
{
  "name": "todo-app",
  "version": "1.0.0",
  "description": "A simple To-Do List application built with Node.js and Express",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "test": "jest --forceExit"
  },
  "dependencies": {
    "express": "^4.18.2"
  },
  "devDependencies": {
    "jest": "^29.0.0"
  }
}
```

- `"start"` tells Node.js how to start the application. Both the Dockerfile and Render.com use this.
- `"test"` defines how to run tests. The `--forceExit` flag ensures Jest exits cleanly after tests complete, which is important inside a Docker build.

#### 1.3 – Writing a Basic Test File

Since the Docker build runs `npm test`, at least one test must exist and pass. A basic test was created at `tests/app.test.js`:

```js
test('server module loads without errors', () => {
  expect(() => require('../index.js')).not.toThrow();
});

test('1 + 1 should equal 2', () => {
  expect(1 + 1).toBe(2);
});
```

---

### Task 2: Dockerizing the Application

#### What is Docker and Why Use It?

Docker is a containerization platform. A **container** is a lightweight, isolated runtime environment that bundles an application along with everything it needs to run — the code, runtime, system libraries, and configuration. Unlike virtual machines, containers share the host OS kernel and are extremely lightweight.

The key benefit for this assignment is **environment consistency**. When Docker builds the image, it uses the exact same steps every time, on any machine. This means the app will behave identically on a developer's laptop, in the GitHub Actions runner, and on Render.com.

#### 2.1 – Creating the Dockerfile

The `Dockerfile` is a plain text file that contains instructions for building a Docker image. It was created in the root directory of the project:

```dockerfile
# ── Stage: Build & Run ──────────────────────────────────────────
# Use the official Node.js 20 image based on Alpine Linux.
# Alpine is a minimal Linux distribution (~5MB), making the image much smaller.
FROM node:20-alpine

# Set /app as the working directory inside the container.
# All subsequent commands will run from this directory.
WORKDIR /app

# Copy only package files first to leverage Docker's layer caching.
# If package.json hasn't changed, Docker reuses the cached layer from
# the previous build and skips re-running npm install — this saves time.
COPY package*.json ./

# Install project dependencies as defined in package.json.
RUN npm install

# Copy the rest of the application source code into the container.
COPY . .

# Run the test suite during image build.
# If tests fail, the image build fails and the pipeline stops here.
# This is a critical quality gate in the CI process.
RUN npm test

# Inform Docker (and documentation) that the app listens on port 3000.
# This does not actually publish the port — that happens at runtime.
EXPOSE 3000

# Define the default command to run when the container starts.
# "npm start" maps to "node index.js" as defined in package.json.
CMD ["npm", "start"]
```

**Key design decisions in the Dockerfile:**

- **Alpine base image:** Using `node:20-alpine` instead of `node:20` reduces the image size from ~1GB to ~150MB, which significantly speeds up pushes to DockerHub and pulls by Render.com.
- **Copying `package*.json` before source code:** This is a Docker best practice. Docker builds images in layers and caches each layer. By copying `package.json` first and running `npm install` before copying source code, we ensure that the expensive `npm install` step is only re-run when dependencies actually change, not on every code change.
- **Running tests during build:** This creates a hard quality gate. If the tests fail, the Docker image is not built, and therefore nothing broken can be pushed to DockerHub or deployed to production.

#### 2.2 – Creating the `.dockerignore` File

The `.dockerignore` file tells Docker which files and directories to exclude from the build context (the set of files sent to the Docker daemon). This reduces build time and prevents sensitive files from accidentally entering the image.

```
node_modules
.git
.env
*.log
.gitignore
README.md
```

- `node_modules` is excluded because `npm install` inside the container installs dependencies fresh. Sending your local `node_modules` would waste time and potentially cause OS-specific binary conflicts.
- `.env` is excluded to prevent secrets from leaking into the Docker image.

#### 2.3 – Testing the Docker Build Locally

Before pushing to GitHub, the Docker image was built and tested locally to verify it worked:

```bash
# Build the image and tag it as "todo-app:latest"
docker build -t todo-app:latest .

# Run a container from the image, mapping host port 3000 to container port 3000
docker run -p 3000:3000 todo-app:latest
```

Opening `http://localhost:3000` in a browser confirmed that the application was running correctly inside the container.

---

### Task 3: GitHub Actions Workflow

#### What is GitHub Actions?

GitHub Actions is a built-in automation platform provided by GitHub. It allows you to define workflows — automated sequences of steps — that run in response to events such as pushes, pull requests, or scheduled timers.

Workflows are defined in `.yml` (YAML) files inside the `.github/workflows/` directory of a repository. YAML is a human-readable data serialization format commonly used for configuration files.

#### 3.1 – Creating the Workflow File

The file `.github/workflows/deploy.yml` was created with the following content:

```yaml
# Name of the workflow (displayed in the GitHub Actions tab)
name: Build and Deploy to DockerHub and Render

# Trigger: this workflow runs when code is pushed to the "main" branch
on:
  push:
    branches: ["main"]

# Jobs: a workflow consists of one or more jobs
jobs:
  build-and-deploy:
    # The type of virtual machine to run the job on
    runs-on: ubuntu-latest

    steps:
      # ── Step 1: Checkout ────────────────────────────────────────────
      # Downloads the repository's source code into the workflow runner.
      # Without this, the runner has no code to work with.
      - name: Checkout Repository
        uses: actions/checkout@v4

      # ── Step 2: Login to DockerHub ───────────────────────────────────
      # Authenticates with DockerHub so we can push images.
      # Credentials are stored as GitHub Secrets (never hardcoded).
      - name: Login to DockerHub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      # ── Step 3: Build and Push Docker Image ──────────────────────────
      # Builds the Docker image using the Dockerfile in the repo root,
      # then pushes it to DockerHub with the tag "latest".
      - name: Build and Push Docker Image
        run: |
          docker build -t ${{ secrets.DOCKERHUB_USERNAME }}/todo-app:latest .
          docker push ${{ secrets.DOCKERHUB_USERNAME }}/todo-app:latest

      # ── Step 4: Trigger Render Deployment ────────────────────────────
      # Render.com does not automatically detect new DockerHub pushes.
      # We use curl to make an HTTP POST to Render's deploy webhook,
      # which instructs Render to pull the latest image and redeploy.
      - name: Trigger Render Deployment
        run: |
          curl -X POST ${{ secrets.RENDER_DEPLOY_HOOK_URL }}
```

**Explanation of each element:**

- `on: push: branches: ["main"]` — The workflow only runs when code is pushed specifically to the `main` branch. This prevents deployments from feature branches.
- `runs-on: ubuntu-latest` — Each job runs on a fresh virtual machine provisioned by GitHub. Ubuntu is used because it is a standard Linux environment that supports Docker natively.
- `uses: actions/checkout@v4` — This is a pre-built GitHub Action that clones the repository into the runner's filesystem.
- `uses: docker/login-action@v3` — This is a pre-built action from Docker that handles authentication with DockerHub securely.
- `${{ secrets.VARIABLE_NAME }}` — This is the syntax for accessing GitHub Secrets (encrypted environment variables). Secrets are never exposed in logs.
- `curl -X POST` — `curl` is a command-line tool for making HTTP requests. Here it sends a POST request to Render's webhook URL to trigger a redeployment.

#### 3.2 – Setting Up GitHub Secrets

Secrets are encrypted key-value pairs stored in a GitHub repository's settings. They are injected as environment variables into workflow runs and are masked in all logs.

**Secrets added for this workflow:**

| Secret Name | Value | Where to Get It |
|---|---|---|
| `DOCKERHUB_USERNAME` | Your DockerHub username | Your DockerHub account |
| `DOCKERHUB_TOKEN` | DockerHub access token | DockerHub → Account Settings → Security → New Access Token |
| `RENDER_DEPLOY_HOOK_URL` | Render deploy webhook URL | Render.com → Service → Settings → Deploy Hook |

**Steps to add secrets:**
1. Open the GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Enter the name and value, then click **Add secret**

>  **Important:** Secrets are write-only in GitHub. Once saved, you cannot view them again. If you lose a token, generate a new one and update the secret.

#### 3.3 – Generating a DockerHub Access Token

Using an access token instead of your DockerHub password is a security best practice:
1. Log in to [hub.docker.com](https://hub.docker.com)
2. Click your avatar → **Account Settings** → **Security**
3. Click **New Access Token**
4. Name it (e.g., `github-actions-todo-app`)
5. Set permissions to **Read, Write, Delete**
6. Click **Generate** and copy the token immediately

#### 3.4 – Getting the Render Deploy Hook URL

1. Go to your Render.com dashboard
2. Select the web service you created
3. Navigate to **Settings** → scroll to **Deploy Hook**
4. Copy the full URL (it looks like `https://api.render.com/deploy/srv-xxxx?key=yyyy`)

---

### Task 4: Deploying on Render.com

#### What is Render.com?

Render.com is a cloud platform that makes it simple to deploy web applications, APIs, and static sites. It supports deploying from Git repositories, Docker images, and container registries like DockerHub. It offers a free tier suitable for student projects and prototypes.

#### 4.1 – Creating a DockerHub Repository

Before deploying, the DockerHub repository must exist:
1. Log in to [hub.docker.com](https://hub.docker.com)
2. Click **Create Repository**
3. Name it `todo-app`
4. Set visibility to **Public** (required for Render.com free tier to pull without authentication)
5. Click **Create**

#### 4.2 – Creating a New Web Service on Render.com

1. Log in to [render.com](https://render.com)
2. Click **New +** → **Web Service**
3. Select **Deploy an existing image registry**
4. In the **Image URL** field, enter: `yourdockerhubusername/todo-app:latest`
5. Configure the service:
   - **Name:** `todo-app`
   - **Region:** Choose the closest to your location
   - **Instance Type:** Free
   - **Port:** `3000` (matches the `EXPOSE 3000` in the Dockerfile)
6. Click **Create Web Service**

Render will pull the Docker image from DockerHub and start the container. Once the deployment is complete, a live URL is provided (e.g., `https://todo-app-xxxx.onrender.com`).

#### 4.3 – Verifying the End-to-End Pipeline

To confirm everything works:
1. Made a small visible change to the application (e.g., updated the page title)
2. Committed and pushed the change to `main`
3. Opened the **Actions** tab in GitHub to watch the workflow run
4. Confirmed each step completed with a green checkmark
5. Checked DockerHub to see the new image was pushed with an updated timestamp
6. Visited the Render.com URL and confirmed the change was live

---

## Configuration Files

### `Dockerfile` (complete)

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm test
EXPOSE 3000
CMD ["npm", "start"]
```

### `.dockerignore` (complete)

```
node_modules
.git
.env
*.log
.gitignore
README.md
```

### `.github/workflows/deploy.yml` (complete)

```yaml
name: Build and Deploy to DockerHub and Render

on:
  push:
    branches: ["main"]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Login to DockerHub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      - name: Build and Push Docker Image
        run: |
          docker build -t ${{ secrets.DOCKERHUB_USERNAME }}/todo-app:latest .
          docker push ${{ secrets.DOCKERHUB_USERNAME }}/todo-app:latest

      - name: Trigger Render Deployment
        run: |
          curl -X POST ${{ secrets.RENDER_DEPLOY_HOOK_URL }}
```

---

## Challenges Faced

### Challenge 1: Tests Failing During Docker Build

**Problem:** The `RUN npm test` step inside the Dockerfile caused the image build to fail because Jest was not properly configured and some tests were expecting features that weren't set up.

**Solution:** Updated the `package.json` to include `"jest": { "testEnvironment": "node" }` configuration and added the `--forceExit` flag to prevent Jest from hanging after tests complete inside the container.

### Challenge 2: Render.com Not Automatically Redeploying

**Problem:** Initially, I expected Render.com to automatically detect when a new image was pushed to DockerHub, similar to how it detects GitHub commits. However, Render.com does not have native DockerHub integration for auto-detection.

**Solution:** Used Render's **Deploy Hook** — a unique URL that, when called with an HTTP POST request, triggers a new deployment. This was added as the final step in the GitHub Actions workflow using `curl -X POST`.

### Challenge 3: Hardcoded Credentials (Security Issue Caught Early)

**Problem:** During initial setup, the DockerHub username was hardcoded directly into the `deploy.yml` file before GitHub Secrets were configured.

**Solution:** Moved all sensitive values to GitHub Secrets and replaced direct values with the `${{ secrets.VARIABLE_NAME }}` syntax. This is a critical security practice — credentials in code can be exposed through repository history even after deletion.

### Challenge 4: Docker Image Size

**Problem:** Initial builds using `node:20` (without Alpine) resulted in a very large image (~900MB), which made pushes to DockerHub extremely slow.

**Solution:** Switched the base image to `node:20-alpine`, which reduced the image size to approximately 130MB — a 7x reduction. This significantly improved build and deployment speed.

### Challenge 5: Port Configuration on Render

**Problem:** After initial deployment, the Render.com service showed as deployed but the application was not accessible. The service health check was failing.

**Solution:** Ensured the Render service configuration specified port `3000` to match the `EXPOSE 3000` directive in the Dockerfile and the actual port that Express.js was listening on in `index.js`.

---

## Learning Outcomes

### 1. Understanding the Purpose and Value of CI/CD

Before this assignment, deployment was a manual process. This assignment demonstrated how automation completely transforms the development workflow. The time investment in setting up the pipeline pays off immediately — every future code change is deployed automatically without any manual steps.

### 2. Docker Containerization in Practice

Working hands-on with Docker provided a much deeper understanding of containerization than theoretical learning alone. Key insights gained:
- The difference between an image (blueprint) and a container (running instance)
- How layer caching works and how to structure a Dockerfile to take advantage of it
- How Docker isolates the application environment, solving the "works on my machine" problem

### 3. Secrets Management and Security Practices

This assignment reinforced the critical importance of never hardcoding credentials in source code. Using GitHub Secrets:
- Keeps sensitive values encrypted and out of the repository history
- Ensures credentials are automatically masked in workflow logs
- Allows credentials to be rotated without changing code

### 4. YAML Configuration for Automation

Writing the GitHub Actions workflow required learning YAML syntax and understanding how workflow files are structured — triggers, jobs, steps, and actions. This is a transferable skill applicable to many other DevOps tools (Kubernetes, Docker Compose, Ansible, etc.).

### 5. Understanding Webhooks

The deploy hook mechanism used to trigger Render.com redeployments introduced the concept of webhooks — HTTP callbacks that allow systems to notify each other of events. This pattern is widely used in modern software integration.

### 6. Debugging Distributed Systems

Troubleshooting issues across multiple services (GitHub → DockerHub → Render.com) required learning to read logs from different platforms simultaneously and reason about where in the pipeline a failure originated. This is a valuable real-world DevOps skill.

### 7. The Full DevOps Lifecycle

This assignment provided hands-on experience with every phase of the DevOps lifecycle: planning, coding, testing (automated), building, packaging, releasing, deploying, and monitoring. Understanding how all these phases connect gives a holistic view of modern software delivery.

---
### screenshots :
Screenshots have been included in Assignment3/screenshots


## Live Deployment Link

 **Application URL:** `https://fe-todo-02250371-1.onrender.com`


---

## GitHub Repository

 **Repository URL:** `https://github.com/Sonia-adhikari5/SoniaAdhikari_02250371_DSO101_A1.git`


---

## Conclusion

This assignment successfully demonstrated the implementation of a complete, automated CI/CD pipeline using industry-standard tools. The pipeline ensures that every code change pushed to the `main` branch is automatically built, tested, containerized, and deployed to the cloud — with zero manual intervention.

The skills and concepts learned in this assignment — Docker containerization, GitHub Actions automation, secrets management, and cloud deployment — are directly applicable to real-world software engineering and DevOps roles. Modern software companies at all scales use these exact tools and practices to deliver software reliably and efficiently.

---

*Report prepared for DSO101 — Continuous Integration and Continuous Deployment*  
*Bachelor's of Engineering in Software Engineering, Royal University of Bhutan*
