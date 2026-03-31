---
title: "From Local to Trusted"
date: "2026-03-30"
description: "The journey an agentic system must take to meet customer-grade security and compliance standards."
tags: ["ai-security", "building-in-public", "grc", "agents", "SOC2"]
---

I spent the last few months building SecureAudit AI, a system that automatically reviews Kubernetes RBAC configurations and generates compliance findings.  I built the system in a way that I would want an Agentic AI system built: Workload Identities instead of stored credentials, agents restricted to single functional domains, deterministic detection logic segregated from LLM reasoning, and inter-agent communications governed by a validated JSON schema.

What I have works for my security model, least privileged scopes, defined tool calls, and reviewable artifact outputs from the agents.

But after taking a pause from the rush that comes with agentic development to review the purpose behind this whole project, I was left with a big question, is what I have something that could pass a SOC 2 audit.

---

## What my personal security model covers
The technical controls are solid.  Credentials are managed outside of code (ensured by my reusable security workflows ([repo](https://github.com/jacobvself47/security_controls))). Each agent in my Four-Agent pipeline is isolated: the RBAC-agent is the only component that touches the Kubernetes cluster, the Entra-agent is the only agent that touches Azure AD, and the Risk-agent and Report-agent are read-only.  Security violations are detected by deterministic Python logic, which ensures that the same input produces the same finding every time.

## The gap between my security model and SOC 2
When I started mapping SecureAudit AI to SOC 2 Trust Services Criteria, most of the conventional controls map cleanly, or aren't something I am going to implement for this project since I am not running a real software company.  But there were a few places in the Criteria and Points of Focus where I saw a real gap.  The gap exists simply because the current version of SOC 2 was written before autonomous AI agents were relevant.

Below are the criteria, that if I were a customer of SecureAudit AI, I would want addressed.

### CC3.4 - Changes to Impacting Internal Control System
CC3.4 calls out identifying and assessing changes to the system and technology that could impact the system of internal control. In practice, I need to identify a control to monitor for model degradation.  I think there is one metric the industry seems to be tracking to help identify model degradation is token consumption.  Baselining and alerting on token consumption is a control that could work here.

### CC4.1 - Ongoing Evaluation of Internal Control
CC4.1 most often has controls related to external penetration assessment, which I would definitely want to include in my control environment.  But I think going one step further for an Agentic system would be important.  Establishing baseline outputs from SecureAudit AI that could be tested periodically would help ensure that new model updates aren't materially changing the behavior of the outputs.

### CC5.2 - Technology Infrastructure Controls
CC5.2 requires control activities over technology infrastructure designed to ensure completeness, accuracy, and availability of processing. This is where I'd place the architectural requirement for what I've been calling agent domain isolation. Each of my four agents is restricted to a single functional domain and communicates with other agents only through validated interfaces.  This architectural decision to isolate agent functionality helps to ensure completeness, accuracy, and availability of processing by forcing agents to work with small context windows.  As we are all realizing, context-bloat leads to poor outcomes.  Protecting customers from poor outcomes should be an internal control of SecureAudit AI.  I would implement a control like the following to help codify this important architectural decision.
> Agent scope definitions are documented at deployment and reviewed periodically. Changes to agent responsibilities require documented approval. Reviews assess both security boundary integrity and operational performance.

### CC6.2 - Logical Access Architecture
CC6.2 covers logical access security for protected information assets.  Traditionally, this control has been scoped to human and service accounts.  But in the new agentic world, we want to understand access between agents within the system.  My four agent set up helps to establish segregation between agents, but this segregation is only at the design layer.  I need to implement system-enforced constraints: The RBAC agent should authenticate with a scoped Kubernetes Service Account that can only read RBAC resources.  The entra-agent should authenticate as a dedicated service principal.  Moving to this implementation would allow me to meet the following control:
> Agent credentials are scoped to the minimum permissions required for the agent's defined domain, enforced at the target system boundary, reviewed periodically, and changes require documented approval.

### CC7.2 - Anomaly Detection
CC7.2 relates to implementing detection measures to identify unauthorized actions.  I frequently see these controls pointed towards external threats, but I have yet to see a control implementation for malicious input detection.  I know this is a rapidly developing space in the security world, and the LLMs have some built-in protections, but it would be something I would need to explore more in depth.  My first thought was to create a sanitization agent that would check for prompt injection attacks, but routing potentially malicious prompts to another LLM doesn't actually mitigate the risk.  The best risk mitigation I can think of for prompt injection is to use deterministic python logic to take outputs from the LLM to produce the findings report.  But ultimately, this is not a control that would detect anomalies, and so it wouldn't fit under CC7.2.

### CC9.2 - Vendor Risk
CC9.2 relates to assessing and managing risk associated with vendors.  Traditionally, vendor risk management can be somewhat of a check-the-box activity: establish vendor risk, obtain compliance documentation, and assess against preset questions.  But with LLMs, I think there are new risks related to the previously mentioned model degradation.  I would implement baselines and periodic regression tests to supplement the traditional vendor risk management procedures.

---

## Wrapping Up
The questions I raised above are just the ones that surfaced during my initial review of the criteria and points of focus. I am not claiming to have a complete picture of what SOC 2 looks like for agentic systems — nobody does yet. But I do think the exercise of mapping a real system to the existing criteria reveals something useful: the gaps are specific, they are not obvious until you are in them, and some of the intuitive solutions don't hold up under scrutiny.

If you are building an agentic system and thinking about customer trust, I would encourage you to do this mapping yourself rather than assuming the conventional controls are sufficient. The unique challenges are real and worth thinking through carefully before a customer asks you to.
