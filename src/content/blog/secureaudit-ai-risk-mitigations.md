---
title: "SecureAudit-AI Development Risk Assessment"
date: "2025-02-11"
description: "Documenting risk mitigations implemented to securely use agentic AI coding systems"
tags: ["ai-security", "risk-assessment", "grc", "building-in-public"]
---

Previously, I identified the risks associated with using AI-assisted development for my personal project [(link)](https://www.jakeself.dev/blog/secureaudit-ai-risk-assessment).  To recap, the key risks are:


1. **RISK-001**: Disclosure of sensitive information - API keys, Cloud Credentials, etc.
2. **RISK-002**: Lack of approval gates could lead to a flawed or compromised build being automatically deployed to AKS.
3. **RISK-003**: AI systems behaving unpredictably, resulting in destructive actions

This past week, I implemented controls to mitigate these risks.

## Protecting Secrets
*Mitigates RISK-001*

I identified secret disclosure as my highest risk.  This is the one that has the most clear-cut path to causing me financial damage.  Hopefully, my chosen mitigations help protect me, if not, I might have to move my cloud spend to a pre-paid credit card.
### Pre-Commit Hooks - Secrets
[Pre-commit](https://pre-commit.com/) is a framework that enables Git hook scripts.  When set up, the pre-commit configuration checks your commit before connecting to GitHub to raise predefined issues.  Pre-commit can be used for a wide array of checks, including linting, code quality, and code formatting.  In my case, this framework allows me to check every commit for secrets like API keys and credentials and block failing commits from reaching GitHub.

Implementing pre-commit hooks for secret detection is simple and widely used by developers.  I chose to use [GitLeaks](https://github.com/gitleaks/gitleaks) for the scanning engine.

```yaml
repos:
  # Secret detection
  - repo: https://github.com/gitleaks/gitleaks
    rev: v8.30.0
    hooks:
      - id: gitleaks
```

### Secret Scanning via GitHub Actions
Because I am an auditor at heart and live by the adage "One is none, and Two is one", I wanted to be extra sure that my Git commits do not contain hard-coded secrets.  I implemented a secret scanner for code committed to GitHub.  GitHub Actions are one of my favorite tools in the GRC engineering toolbox.  As GRC folks, we often don't have much pull in the organization to spin up a Virtual Machine for one-off scripts.  My solution has been to get comfortable with writing GitHub Actions since they have allowed me to use a small, short-lived compute instance.

The implementation here is a bit more complicated than pre-commit.  Still, after a few tries, I was able to set up a GitHub Action that utilizes both GitLeaks and TruffleHog for secret identification (One is none and Two is one).  I also wrote reusable workflows that can be called from actions in other repos.

Link to the workflow that defines the Secret Scanning actions: [secret-scanning.yaml](https://github.com/jacobvself47/security_controls/blob/main/.github/workflows/secret-scanning.yml)

```yaml
name: Security Scans
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
jobs:
  secret-scan:
    uses: jacobvself47/security_controls/.github/workflows/secret-scanning.yml@main
```

## Minimizing Vulnerable Code
*Mitigates RISK-002*

Recognizing my weakness in the development realm, I wanted to make sure that Claude and I were writing code that would not introduce vulnerabilities.  Luckily, the two solutions outlined above, pre-commit and GitHub actions, can be extended to help mitigate this risk.
### Pre-Commit Hooks - Security
Many available pre-commit hooks can help identify and block commits that exhibit common security patterns.  With the languages and frameworks I am working with, I chose to add hooks for Python and Terraform.

```yaml
  # Security linting
  - repo: https://github.com/PyCQA/bandit
    rev: 1.9.3
    hooks:
      - id: bandit
        args: ["-c", "pyproject.toml"]
        additional_dependencies: ["bandit[toml]"]
  # Terraform security
  - repo: https://github.com/antonbabenko/pre-commit-terraform
    rev: v1.105.0
    hooks:
      - id: terraform_tfsec
```
### Semgrep SAST Scan via GitHub Actions
Semgrep offers really great open-source security tools, and I wanted to use their GitHub Action to add another security check to my commits.

Link to the workflow that defines the SAST Scanning actions: [sast-scanning.yaml](https://github.com/jacobvself47/security_controls/blob/main/.github/workflows/sast-scan.yml)

```yaml
name: Security Scans
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
jobs:
  secret-scan:
    uses: jacobvself47/security_controls/.github/workflows/sast-scan.yml@main
```

## Implementing AI Agent Guardrails
*Mitigates RISK-003*
Getting into more AI-specific risks and mitigations, I spent considerable time reading the Claude documentation on [Permissions](https://code.claude.com/docs/en/permissions) and [Hooks](https://code.claude.com/docs/en/hooks).
### Agent Permissions
I have read countless stories in the past couple of months of horrors committed by AI agents on code bases - deleting databases, modifying thousands of files, and spinning up or deleting cloud resources.  In reality, what I have seen myself is that Claude asks for permission before taking seemingly any action.  Up to this point, I have tried my best to read, understand, and explicitly allow/deny.  However, the permission prompting fatigue is real, and I can definitely see myself getting tired and letting Claude run wild.  To still give myself some protection, I set up Permissions that require approval from me for all high-risk actions.  I ended up with close to 40 actions in this "ask" state, and I plan to keep adjusting it as I refine my workflow.  Below are a few of the commands I wanted to make sure to include in my permissions file.

```json
{
    "permissions": {
        "ask": [
           "Bash(kubectl delete *)",
           "Bash(az aks delete *)",
           "Bash(rm -rf *)",
           "Bash(git reset --hard *)",
           // ... a bunch more commands
        ]
    }
}
```
### Agent-Initiated Code Backup
Even with all of those permissions, I know that I will inevitably screw something up.  I wanted a way to roll back changes from a Claude session.  What I landed on for this mitigation was to use Claude Hooks to back up my repo to my local machine.  Claude Hooks run scripts at specific points in Claude's workflow.  From the Claude Docs, "Unlike CLAUDE.md instructions which are advisory, hooks are deterministic and guarantee the action happens."

I asked Claude to write a script to back up the directory in which it is currently operating and save it to a specific directory.  The backup script adds a timestamp and keeps up to 10 backups.  Here is the code for that script: [backup-repo.sh](https://github.com/jacobvself47/security_controls/blob/main/claude-config/hooks/backup-repo.sh)

Enabling the hook is as easy as defining the listener event and the action to take.  My configuration listens for the `SessionStart` event and then runs the `backup-repo.sh` script.

## Wrapping Up
If you want to see all the configurations for my security controls, check out my repo: [jacobvself47/security_controls](https://github.com/jacobvself47/security_controls).  If you see something in there that looks wrong, be a friend and let me know!

As I was doing this write-up, I realized how many third-party dependencies I had introduced into this project.  I will need to keep an eye out for software supply chain issues that might affect my implementations.  But putting my risk hat back on, I am confident that the risk of using these open-source projects is less than the risk of leaking secrets, committing bad code, or having Claude go off the rails.
