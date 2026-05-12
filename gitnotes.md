 # DSO101 Notes


| | |
|---|---|
| **Course** | DSO101 - Continuous Integration and Continuous Deployment |
| **Program** | Bachelor's of Engineering in Software Engineering (SWE) |
| **Student** | Sonia Adhikari |
| **GitHub Repository** | [SoniaAdhikari_02250371_DSO101](https://github.com/Sonia-adhikari5/SoniaAdhikari_02250371_DSO101.git) |
---

# Unit 1: Introduction to Docker

## What is Docker?

Docker is an open-source platform designed to help developers build, package, and run applications inside isolated environments called **containers**. A container bundles an application together with everything it needs to run — libraries, config files, dependencies — so it behaves consistently no matter where it's deployed.

---

## Why Use Docker?

- Solves the classic "it works on my machine" issue once and for all
- Significantly more lightweight than traditional virtual machines
- Enables faster build and deployment cycles
- Scales up or down with ease

---

## Docker vs Virtual Machines

| Feature | Docker (Containers) | Virtual Machines |
| ----------- | ------------------- | ---------------- |
| Size | Lightweight | Heavy |
| Boot Time | Seconds | Minutes |
| Performance | Near-native | Slower |
| Isolation | Process-level | Full OS |

---

## Docker Architecture

- **Docker Client** – The command-line interface that lets users interact with Docker
- **Docker Daemon** – The background service responsible for running and managing containers
- **Docker Images** – Read-only blueprints or templates that define what a container looks like
- **Docker Containers** – Live, running instances created from a Docker image

---

## Basic Commands

```bash
docker --version       # Check installed Docker version
docker info            # Display system-wide Docker info
docker help            # List available commands and usage
```

<img src="Images/docker_version.png" alt=" ">

---

## Docker Lab

### Lab: Basic Commands

This lab consists of 17 questions. Answers are documented below according to their respective question numbers.

1. 25.0.5
2. 0
3. 9
4. <img src="Images/lab1_4.png" alt=" ">
5. <img src="Images/lab1_5.png" alt=" ">
6. 0
7. 4
8. 6
9. nginx:alpine
10. awesome_northcut
11. 866
12. Exited
13. <img src="Images/lab1_13.png" alt=" ">
14. <img src="Images/lab1_14.png" alt=" ">
15. <img src="Images/lab1_15.png" alt=" ">
16. <img src="Images/lab1_16.png" alt=" ">

### Lab Completion

<img src="Images/labsuccess1.png" alt=" ">

---

# Unit 2: Docker Images and Containers

## Docker Images

A Docker image is a read-only template used as the foundation for creating containers. Think of it as a snapshot of your application and its environment, frozen in time and ready to be deployed.

<img src="Images/images.png" alt=" ">

---

## Docker Containers

A container is the live, running instance of a Docker image. Once you spin up a container from an image, it becomes an active, isolated process running your application.

<img src="Images/containers.png" alt=" ">

---

## Essential Commands

```bash
docker run <image>          # Create and start a new container from an image
docker ps                   # List all currently running containers
docker ps -a                # List all containers (including stopped ones)
docker stop <container>     # Gracefully stop a running container
docker start <container>    # Start a previously stopped container
docker restart <container>  # Restart a container
docker rm <container>       # Remove a stopped container
docker images               # List all locally available images
docker rmi <image>          # Delete a local image
```

---

## Running Containers

```bash
docker run nginx                # Run an nginx container in the foreground
docker run -it ubuntu bash      # Run Ubuntu interactively with a bash terminal
```

---

## Port Mapping

Map a port on your local machine to a port inside the container so you can access services from your browser.

```bash
docker run -p 8080:80 nginx     # Host port 8080 → Container port 80
```

---

## Detached Mode

Run a container in the background so it doesn't block your terminal.

```bash
docker run -d nginx
```

---

## Viewing Logs

Stream or view the output logs of a running or stopped container.

```bash
docker logs <container_id>
```

---

## Docker Exec — Running Commands Inside Containers

`docker exec` lets you run commands directly inside an already-running container — super useful for debugging or inspecting the container's internal state.

### Check the OS inside a container

```bash
docker exec <container_id> cat /etc/os-release
```

### Open an interactive shell

```bash
docker exec -it <container_id> bash
```

---

## Docker Lab

### Lab: Docker Images

Answers:

1. 9
2. 7.81 MB
3. 1.14 - alpine
4. python:3.6
5. /opt
6. python app.py
7. 8080
8. <img src="Images/lab2_8.png" alt=" ">
9. `docker run -p 8282:8080 webapp-color`
10. -
11. -
12. 920 MB
13. <img src="Images/lab2_13.png" alt=" ">
14. <img src="Images/lab2_14.png" alt=" ">
15. <img src="Images/lab2_15.png" alt=" ">

### Lab Completion

<img src="Images/labsuccess2.png" alt=" ">

---

# Unit 3: Dockerfile and Docker Compose

## What is a Dockerfile?

A Dockerfile is essentially a recipe — a plain text script containing a sequence of instructions that Docker follows step by step to build a custom image. Every line in a Dockerfile adds a new layer to the image.

<img src="Images/dockerfile.png" alt=" ">

---

## Sample Dockerfile

```dockerfile
FROM node:22-alpine        # Use the lightweight Node.js Alpine base image

WORKDIR /app               # Set the working directory inside the container

COPY package.json .        # Copy package.json first (for caching optimization)

RUN npm install            # Install project dependencies

COPY . .                   # Copy the rest of the source code

CMD ["npm", "start"]       # Default command to run when the container starts
```

---

## Build an Image from a Dockerfile

```bash
docker build -t my-app .
```

The `-t` flag lets you tag (name) the image. The `.` tells Docker to look for the Dockerfile in the current directory.

---

## Run Your Built Image

```bash
docker run -p 3000:3000 my-app
```

---

## Docker Compose

Docker Compose is a tool for defining and running **multi-container** applications. Instead of running multiple `docker run` commands manually, you describe your entire application stack in a single `docker-compose.yml` file.

---

## Example docker-compose.yml

```yaml
version: '3'
services:
  web:
    image: nginx
    ports:
      - "8080:80"

  app:
    build: .
    ports:
      - "3000:3000"
```

---

## Docker Compose Commands

```bash
docker-compose up       # Start all services defined in the compose file
docker-compose down     # Stop and remove all running services
docker-compose build    # Rebuild the images for services
```

---

## Volumes (Data Persistence)

By default, data inside a container is lost when the container stops. Volumes solve this by mounting persistent storage that survives container restarts.

```bash
docker run -v myvolume:/data nginx
```

---

## Networks

Docker networks allow containers to communicate with each other securely.

```bash
docker network ls                      # List all existing networks
docker network create mynetwork        # Create a custom network
```

---

# Unit 4: CI/CD and Jenkins

## What is CI/CD?

**Continuous Integration (CI)** is the practice of frequently merging developer code into a shared branch — sometimes multiple times per day. Every merge triggers an automated build and test run, catching issues early before they snowball.

**Continuous Delivery (CD)** means your codebase is always in a deployable state. The difference from full automation is that a human still manually approves and pushes the final release to production — great for teams that need a sign-off step.

**Continuous Deployment** takes it a step further: every change that clears all automated tests is deployed to production automatically, with no human intervention needed at all.

### The Pipeline Flow

```
Commit → Build → Unit Tests → Integration Tests → Deploy to Staging → (Manual Approval) → Production
```

### Why Use CI/CD?

- Catch bugs early when they're far cheaper to fix
- Deploy more frequently with less risk and stress
- Eliminate repetitive manual testing and release processes
- Build team confidence to ship anytime

### Challenges

- Proper setup requires an upfront time investment
- Relies heavily on good test coverage — a pipeline is only as strong as its tests
- Teams need to adapt their development workflow and habits

---

## Jenkins Architecture

### Master (Controller)

The Jenkins master is the brain of the operation. It handles scheduling jobs, serving the web UI (accessible on port 8080), storing all configuration, and coordinating agents — but it doesn't do any actual building itself.

### Agents (Nodes)

Agents are the workers. They receive instructions from the master and actually execute builds and tests. You can have multiple agents running on different operating systems, and the more agents you have, the more builds can run in parallel.

> **Why separate master and agents?** The master stays lean while agents handle the heavy lifting. You can scale agents up or down independently based on workload.

---

## Jenkins Job Types

### Freestyle Project

- Configured entirely through the web interface
- Simple and beginner-friendly
- Not version-controlled, so changes aren't tracked
- Gradually being replaced by pipeline-based approaches

### Pipeline (Recommended)

- Build logic is defined in a `Jenkinsfile` stored directly in your repository
- Treated like any other code — reviewable, versioned, and auditable
- Survives Jenkins restarts without losing state

### Multibranch Pipeline

- Automatically discovers branches and creates a pipeline for each one using that branch's `Jenkinsfile`
- Main branch can deploy to production; feature branches run tests first

---

## Jenkinsfile Basics (Declarative Syntax)

```groovy
pipeline {
    agent any  // Run on any available agent

    stages {
        stage('Build') {
            steps {
                echo 'Compiling source code...'
                sh 'mvn compile'
            }
        }

        stage('Test') {
            steps {
                sh 'mvn test'
            }
        }

        stage('Package') {
            steps {
                sh 'mvn package'
            }
        }
    }

    post {
        always {
            echo 'Runs regardless of outcome'
            junit '**/surefire-reports/*.xml'
        }
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Something went wrong — investigate logs'
        }
    }
}
```

### Key Sections Explained

| Section | Purpose |
|---------|---------|
| `agent` | Defines where the pipeline runs (`any`, `label`, `docker`, `none`) |
| `stages` | Container block that holds all your stage definitions |
| `stage` | A logical phase in the pipeline (e.g., Build, Test, Deploy) |
| `steps` | The actual shell commands or actions to execute |
| `post` | Cleanup and notification logic based on build outcome |

---

## Build Triggers

| Trigger | How it works |
|---------|--------------|
| Poll SCM | Jenkins periodically checks the repository for new commits |
| GitHub Webhook | GitHub notifies Jenkins instantly on every push |
| Build periodically | Runs on a cron schedule (e.g., nightly at 2 AM) |
| Upstream trigger | Starts automatically after another job completes |
| Generic trigger | Any external system can hit the Jenkins API to kick off a build |

---

## Plugins

Jenkins is a minimal engine out of the box — plugins are what give it power. Almost every meaningful feature comes from a plugin.

### Essential Plugins

| Plugin | Purpose |
|--------|---------|
| Git | Clone and interact with Git repositories |
| Pipeline | Enable Jenkinsfile-based pipeline execution |
| JUnit | Parse test results and visualize pass/fail trends |
| Blue Ocean | Clean, modern pipeline UI |
| Docker | Build images and run containers as build steps |
| Slack / Email | Send build notifications to your team |

**To install:** Navigate to `Manage Jenkins → Plugins → Available tab → Search → Install`

---

## Build Steps and Post-Build Actions

**Build steps** are the core actions in your pipeline:
- Run shell scripts
- Execute Maven, Gradle, or npm commands
- Invoke other Jenkins jobs
- Copy or archive files

**Post-build actions** run after the main build completes:
- Publish test reports (track trends over time)
- Archive build artifacts like JAR or WAR files
- Send failure email notifications
- Trigger downstream dependent jobs
- Deploy to a staging or production server

---

# Unit 5: Advanced Pipelines

## Declarative vs Scripted Pipeline

### Declarative Pipeline

- Follows a clean, opinionated structure that's easy to read and write
- Integrates seamlessly with the Blue Ocean visual editor
- The right choice for the vast majority of use cases

### Scripted Pipeline

- Uses full Groovy syntax, giving you unrestricted programming flexibility
- Supports native loops, conditionals, and error handling
- Steeper learning curve, but necessary when Declarative hits its limits

---

### Side-by-Side Comparison

**Declarative:**

```groovy
pipeline {
    agent any
    stages {
        stage('Build') {
            steps {
                sh 'make'
            }
        }
    }
}
```

**Scripted:**

```groovy
node('any') {
    stage('Build') {
        sh 'make'
        if (currentBuild.result == 'SUCCESS') {
            echo 'Build completed successfully'
        }
    }
}
```

### When to Use Which

| Scenario | Recommendation |
|----------|----------------|
| New to Jenkins | Start with Declarative |
| Need complex conditionals or loops | Use Scripted |
| Building shared pipeline libraries | Scripted works better |
| Most production pipelines | Declarative is sufficient |

---

## Pipeline as Code

The core principle: your pipeline definition lives **in your repository**, not buried in the Jenkins web UI.

### Why It Matters

- Pipeline changes go through pull requests and code review
- Each branch can have its own pipeline behavior
- Full history of every pipeline modification
- Rollback a bad pipeline change just like any other code

---

### Using a Shared Library in a Jenkinsfile

```groovy
@Library('my-shared-library') _

pipeline {
    stages {
        stage('Deploy') {
            steps {
                slackNotify('Deploying to production')
            }
        }
    }
}
```

---

## Integrating External Tools

### Source Control (Git)

```groovy
stage('Checkout') {
    steps {
        git branch: 'main',
            url: 'https://github.com/myorg/myapp.git',
            credentialsId: 'github-creds'
    }
}
```

### Build Tools

**Maven:**

```groovy
stage('Build') {
    steps {
        sh 'mvn clean package'
    }
}
```

**Node.js / npm:**

```groovy
stage('Build') {
    steps {
        sh 'npm ci'           // Clean install from lock file
        sh 'npm run build'    // Build the project
    }
}
```

### Artifact Repositories (Nexus / Artifactory)

Store compiled JARs, Docker images, or npm packages for later use or deployment.

```groovy
stage('Upload Artifact') {
    steps {
        sh 'curl -u user:pass --upload-file myapp.war http://nexus/releases/'
    }
}
```

---

## Testing in Pipelines

### Unit Tests

```groovy
stage('Unit Tests') {
    steps {
        sh 'mvn test'
    }
    post {
        always {
            junit 'target/surefire-reports/*.xml'
        }
    }
}
```

The `junit` step parses XML test reports and displays pass/fail graphs in Jenkins over time. Tests that fail cause the build to turn **yellow (unstable)** rather than **red (failed)** — useful for distinguishing test failures from build errors.

### Integration Tests

Verify that different services or components communicate correctly. These often require supporting infrastructure like databases or message brokers to be running.

### End-to-End (E2E) Tests

Full simulations of real user workflows via browser automation or API testing. Slow to run but the most comprehensive safety net.

### Test Types at a Glance

| Test Type | Speed | What It Catches |
|-----------|-------|-----------------|
| Unit | Fast | Logic bugs in isolated functions |
| Integration | Medium | Communication issues between services |
| E2E | Slow | Real user-facing workflow failures |

---

## Common Pipeline Patterns

### Parallel Execution

Run multiple test suites simultaneously to cut down on total pipeline time.

```groovy
stage('Parallel Tests') {
    parallel {
        stage('Unit') {
            steps { sh 'npm run test:unit' }
        }
        stage('Integration') {
            steps { sh 'npm run test:integration' }
        }
        stage('E2E') {
            steps { sh 'npm run test:e2e' }
        }
    }
}
```

### Conditional Execution

Gate certain stages so they only run under specific conditions — like only deploying from the `main` branch.

```groovy
stage('Deploy') {
    when {
        branch 'main'
    }
    steps {
        sh 'deploy.sh'
    }
}
```

### Post Actions

Execute cleanup or notification steps regardless of whether the build passed or failed.

```groovy
post {
    always {
        echo 'Cleaning up workspace...'
        cleanWs()
    }
    success {
        echo 'Build passed!'
    }
    failure {
        echo 'Build failed — check the logs'
    }
}
```

### Environment Variables

Define reusable values at the top of the pipeline to avoid repetition.

```groovy
pipeline {
    environment {
        APP_NAME = 'myapp'
        VERSION  = '1.0.0'
    }
    stages {
        stage('Print Info') {
            steps {
                echo "Building ${APP_NAME} version ${VERSION}"
            }
        }
    }
}
```

### Credentials Management

Never hardcode passwords or API keys. Use Jenkins' built-in credentials store and reference them by ID.

```groovy
pipeline {
    environment {
        DOCKER_PASSWORD = credentials('docker-hub-creds')
    }
    stages {
        stage('Docker Login') {
            steps {
                sh 'echo $DOCKER_PASSWORD | docker login -u myuser --password-stdin'
            }
        }
    }
}
```

### Manual Approval Gates

Pause the pipeline and wait for a human to approve before proceeding — ideal for production deployments.

```groovy
stage('Deploy to Production') {
    input {
        message "Ready to deploy to production?"
        ok "Yes, deploy now"
        submitter "admin"
    }
    steps {
        sh 'deploy-prod.sh'
    }
}
```

---

## Best Practices Summary

| Practice | Why It Matters |
|----------|----------------|
| Store Jenkinsfile in version control | Enables code review and full change history |
| Use Declarative pipeline syntax | More readable and easier to maintain |
| Run tests in parallel | Reduces total pipeline execution time |
| Publish test results | Track quality trends over time |
| Use the Credentials plugin | Keeps secrets out of your codebase |
| Clean workspace after builds | Prevents disk space issues on agents |
| Use shared libraries | Promote reuse and avoid copy-paste pipelines |

---

## References

- [Jenkins Pipeline Documentation](https://www.jenkins.io/doc/book/pipeline/)
- [Pipeline Syntax Reference](https://www.jenkins.io/doc/book/pipeline/syntax/)
- [Shared Libraries](https://www.jenkins.io/doc/book/pipeline/shared-libraries/)
- [Blue Ocean UI](https://www.jenkins.io/projects/blueocean/)