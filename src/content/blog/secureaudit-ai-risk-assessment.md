---
title: "SecureAudit-AI Development Risk Assessment"
date: "2025-02-03"
description: "A risk assessment for developing SecureAudit-AI, covering credential disclosure, CI/CD security, and AI system unpredictability."
tags: ["ai-security", "risk-assessment", "grc", "building-in-public"]
---

As part of building SecureAudit-AI in public, I wanted to share the risk assessment I performed before diving into development. This exercise forced me to think through what could go wrong and what controls I need in place from the start.

## Scope

Ensure risks are properly considered and addressed in the context of developing the SecureAudit-AI system.
**Assumptions**:
- Using a combination of VSCode and ClaudeCode to develop and manage the deployment of source code.
- Deploy Kubernetes infrastructure to Azure.
- Store source code on a public GitHub repository.
- Using Claude API keys

---
## Risk Assessment Matrix

### Likelihood Definitions
- **Low**: Unlikely to occur without specific circumstances aligning
- **Medium**: Could reasonably occur during normal operations
- **High**: Likely to occur without preventive controls in place

### Impact Definitions
- **Low**: Minor inconvenience, minimal cost, easily recoverable
- **Medium**: Significant disruption, moderate cost increase, requires effort to recover
- **High**: Major service failure, data breach, substantial unplanned costs, or reputational damage

### Risk Rating Matrix

|                | **Low Impact** | **Medium Impact** | **High Impact** |
|----------------|----------------|-------------------|-----------------|
| **High Likelihood**   | Medium Risk    | High Risk         | Critical Risk   |
| **Medium Likelihood** | Low Risk       | Medium Risk       | High Risk       |
| **Low Likelihood**    | Low Risk       | Low Risk          | Medium Risk     |

## Identified Risks

### RISK-001: Disclosure of sensitive information - API keys, Cloud Credentials, etc.

| Attribute | Value |
|-----------|-------|
| **Category** | Information Disclosure |
| **Likelihood** | High |
| **Impact** | High |
| **Risk Rating** | Critical |
| **Status** | Open |

**Risk Assessment:**

| Assessment | Details |
|------------|---------|
| **Likelihood** | **High** - Without the proper protections in place, the likelihood of accidentally committing sensitive information to a public repository is high. |
| **Impact** | **High** - Disclosure of sensitive information could directly result in financial impact. The two most likely scenarios are: (1) API keys leveraged to consume pre-loaded Claude API tokens. (2) Cloud credentials leveraged to spin up Azure resources without knowledge, driving up hosting bills |

**Affected Resources:**
- Claude_API Key
- Cloud Secrets
- GitHub PATs
- Kubeconfig Files

**Recommended Actions:**
1. Use .gitignore files plus .env files to manage secrets in local repositories.
2. Implement Pre-Commit hooks on my development machine to scan for secrets before committing to GitHub.
3. Enable GitHub Secret Protection (available for free on public repos).
4. Post-commit GitHub Action to detect secrets via a different scanning engine.

---
### RISK-002: Lack of approval gates could lead to a flawed or compromised build being automatically deployed to AKS.

| Attribute | Value |
|-----------|-------|
| **Category** | CI/CD |
| **Likelihood** | High |
| **Impact** | High |
| **Severity** | Critical Risk |
| **Status** | Open |

**Risk Assessment:**

| Assessment | Details |
|------------|---------|
| **Likelihood** | **High** - Without deployment approval gates or quality checks in the CI/CD pipeline, every code push to the main branch could trigger an automatic deployment to AKS. Given active development and frequent commits, the likelihood of deploying untested or flawed code is high.|
| **Impact** | **High** - Flawed or compromised code could lead to exposed credentials, open access to the cluster, or leak sensitive information.|

**Affected Resources:**
- Kubernetes
- Azure

**Recommended Actions:**
1. Implement a manual approval gate that is enforced prior to code being pushed to production.
2. Implement SAST Scanning as a CI job.
3. Implement Automated Testing as a CI job.

---

### RISK-003: AI systems behaving unpredictably resulting in destructive actions

| Attribute | Value |
|-----------|-------|
| **Category** | Development |
| **Likelihood** | High |
| **Impact** | Moderate |
| **Severity** | High Risk |
| **Status** | Open |

**Risk Assessment:**

| Assessment | Details |
|------------|---------|
| **Likelihood** | **High** - Without any controls in place to prevent Claude Code from making destructive commands, the likelihood that they occur is high.  I plan to extensively use Claude Code to help streamline the development and deployment of Kubernetes resources and application code.  With increased reliance on ClaudeCode and limited experience with AI-assisted development workflows, the likelihood of unintended destructive actions is high. |
| **Impact** | **Moderate** - At this time this is a personal project so the only impact would be to me.  It could force me to spend extra cycles to fix broken code, but ultimately the impact is Moderate |

**Affected Resources:**
- Claude Code
- Kubernetes
- Azure
- Source Code

**Recommended Actions:**
1. Implement a solution to prevent destructive tool calls using [Claude Code native functionality](https://code.claude.com/docs/en/features-overview#match-features-to-your-goal):
    - [Permissions](https://code.claude.com/docs/en/permissions)
    - [Subagents](https://code.claude.com/docs/en/best-practices#create-custom-subagents)
    - [Hooks](https://code.claude.com/docs/en/best-practices#set-up-hooks)
2. Alternatively, implement a third-party solution to prevent destructive tool calls
