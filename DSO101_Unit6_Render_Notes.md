# Unit 6: Render — CI/CD in the Cloud

---

## Part 1: What is Render?

Render is a cloud hosting platform that lets you deploy web applications, databases, and static sites with minimal setup. What makes it particularly useful in a CI/CD context is that it comes with **deployment automation built in** — the moment you push code to GitHub, Render picks it up and deploys the latest version automatically. No manual uploads, no server babysitting.

---

## Part 2: Connecting Render to a GitHub Repository

There's nothing to install locally. The setup process is straightforward:

1. Create an account on [Render.com](https://render.com) using your GitHub account
2. Click **New** and select **Web Service**
3. Choose and connect your GitHub repository
4. Render automatically scans the project and identifies the language/framework

You'll then need to provide two key configuration values:

| Setting | Example |
|--------|---------|
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |

Once saved, every `git push` to the connected branch kicks off a fresh deployment automatically.

---

## Part 3: CI/CD Flow on Render

Here's what happens under the hood every time you push code:

| Step | What Render Does |
|------|-----------------|
| 1 | Detects a push to the `main` or `master` branch |
| 2 | Clones the latest code from your GitHub repository |
| 3 | Executes the build command |
| 4 | Executes the start command |
| 5 | If successful — live traffic is switched to the new version |
| 6 | If failed — deployment halts and the previous version keeps running |

No manual server access or file uploads are ever needed.

---

## Part 4: Practical Considerations

### Port Binding
Render expects your app to listen on `process.env.PORT`. Make sure your code uses this environment variable instead of a hardcoded port number.

```js
const PORT = process.env.PORT || 3000;
app.listen(PORT);
```

### Environment Variables
API keys and other secrets should **never** be hardcoded in your source code. Set them directly in the Render dashboard — they get injected into the app at runtime.

### Deploy Logs
Render provides real-time logs during every deployment. If something breaks, the exact error message is displayed so you can diagnose quickly.

### Auto-Deploy
Auto-deploy is enabled by default but can be turned off if you prefer to trigger deployments manually.

---

## Part 5: Pre-Deployment Checklist

Before pushing to your connected branch, verify the following:

- [ ] App runs locally using a `PORT` environment variable
- [ ] Start command executes without errors
- [ ] No credentials, API keys, or passwords are hardcoded in the code
- [ ] Your `git push` targets the correct connected branch

> Deployments typically complete within **1–2 minutes**.

---

## Part 6: Theoretical Framework

### Where Render Fits in the CI/CD Pipeline

| Phase | Description | Render's Role |
|-------|-------------|---------------|
| **Continuous Integration** | Push code, run tests, merge changes | Triggers the whole process |
| **Continuous Delivery** | Build the app and prepare it for release | Handles this automatically |
| **Continuous Deployment** | Ship to production without manual approval | Handles this automatically |

Render excels at **continuous delivery and deployment**. For full CI (running automated test suites), you'll need to configure tests separately as part of your build command.

---

### The Deployment Pipeline in Detail

Each `git push` kicks off this internal sequence:

```
Git Push
  → Clone Repository
    → Install Dependencies
      → Run Build Command
        → Run Tests (if configured)
          → Start Server
            → Health Check
              → Switch Traffic
```

Each step acts as a **gate** — if any stage fails, the pipeline stops immediately. The health check is especially critical: Render waits for the application to respond on its expected port before marking the deployment as live.

---

### Blue-Green Deployment

Render uses a **blue-green deployment** strategy behind the scenes. The new version of your app starts up alongside the old version. Live traffic only switches over once the new version passes its health check. This guarantees **zero downtime** during deployments.

---

### Immutable Infrastructure

Every deployment on Render spins up a **completely fresh environment**. You can't SSH into a server and manually tweak files — and that's by design. This approach means:

- Deployments are **repeatable** — the same code always produces the same result
- Deployments are **predictable** — no leftover state from a previous run can cause unexpected behavior
- If persistent data is needed (e.g. a database), it must live in a **separate, dedicated service** like Render PostgreSQL

---

### Build Phase vs. Runtime Phase

Understanding the distinction between these two phases is fundamental to any CI/CD system:

| Aspect | Build Phase | Runtime Phase |
|--------|-------------|---------------|
| **Timing** | During deployment (on push) | After the app is live |
| **Commands** | `npm install`, `npm run build`, tests | `npm start` |
| **Environment Variables** | Build-time values (e.g. API endpoints) | Runtime secrets (e.g. database passwords) |
| **Render Setting** | Build Command | Start Command |

Render gives a clean separation between these two phases, which is one of the hallmarks of a proper CI/CD platform.

---

### Deployment Trigger Methods

| Trigger Type | How It Works on Render |
|--------------|------------------------|
| **Push Trigger** | A `git push` to the connected branch starts deployment automatically |
| **Manual Trigger** | Click *Deploy Latest Commit* from the Render dashboard |
| **Scheduled Trigger** | Cron-based deployment at set times (available on paid plans) |

This illustrates the distinction between **event-driven CI/CD** (push trigger) and **time-driven CI/CD** (scheduled trigger).

---

### Rollback Mechanism

If a new deployment fails its health check, Render automatically keeps the **old version running** — nothing breaks for your users. You can also manually roll back by clicking **Rollback** in the dashboard, which redeploys a previous container image from Render's temporary artifact storage.

> This is known as **artifact retention** — Render holds onto older builds for a period so rollbacks are possible.

---

### Limitations of Render (Theoretical Perspective)

| Missing Feature | What Real CI/CD Systems Do Instead |
|-----------------|-------------------------------------|
| **Artifact Storage** | Tools like Docker Registry or AWS S3 handle explicit artifact management |
| **Complex Pipelines** | Full CI systems support parallel stages, conditional logic, and branching |
| **Self-Hosted Runners** | Production environments often require private build servers for security or performance |

---

## Part 7: Theory Summary Table

| Concept | Definition | How Render Implements It |
|---------|------------|--------------------------|
| **Continuous Integration** | Auto-test and merge code changes | Runs test command if configured |
| **Continuous Delivery** | Auto-build and prepare for release | Builds a container from your code |
| **Continuous Deployment** | Auto-release to production | Pushes live without manual approval |
| **Pipeline** | Sequence of automated steps | Build → Test → Start → Health Check |
| **Immutable Infrastructure** | Fresh environment per deployment | New container on every deploy |
| **Rollback** | Revert to a previously working version | Redeploys a stored older image |

---

## Part 8: Core Takeaway

Render is a **managed CI/CD platform** that follows the same theoretical principles as Jenkins, GitHub Actions, and GitLab CI — it just abstracts away all the server management so you can focus on your code. Understanding *why* Render needs a build command, a start command, and a health check gives you a mental model that transfers directly to any other CI/CD tool. The platform changes, but the underlying theory stays the same.
