---
title: "AI Agent Project Overview"
date: "2025-01-23"
description: "What I am planning to build in Q1"
tags: ["ai-security", "building-in-public", "grc", "agents", "SOC2"]
---

Winter is here in Chicagoland.  As I am writing this, it is currently -13°F. These months are tough, and I usually like to dive into a security certification to occupy myself.  Last year, I completed the CISSP, and the year before that the CRISC.  This year, I was considering the AAISM (Advanced in AI Security Management), but after taking a review course, I realized that trying to secure something I didn’t understand would be challenging.  So instead, I decided to reallocate my certification budget to building and securing something in the AI space, hoping it would be money better spent and provide me with a strong foundation in real-world AI applications.

## SecureAudit-AI
I took to Claude to start planning and ideating on projects that could help me learn how to secure enterprise AI applications.  Working through problem statements and my understanding of where the industry is going, we landed on creating an AI Agent system that I could pretend was built by an enterprise SaaS company that wanted to commit to a SOC 2 attestation over the service.

How I view the AI landscape plays a large role in selecting this project.  I think AI agents are the future of AI at the SaaS level.  It seems like every day during the summer of 2025, large SaaS providers rolled out AI agents to production to assist with user workflows.  I don’t think this trend is going to stop, my opinion is more companies will pop up that offer an agent(s) as their main service.

Where I ended up was an idea for an AI agent that assists with access reviews for Kubernetes clusters.  Claude cleverly named the project SecureAudit-AI.

## Goals

At a very high level, my goals for this project break down into three paths: Vibe-Coding, Enterprise Deployment of Agents, and Compliance Considerations.

### Vibe-Coding

Everyone is doing it, and I want to get up to speed on how a modern developer works.  I hope that by becoming a vibe-coder, I will learn to secure vibe-coding.

### Deployment of Agents

I want to learn how to deploy AI agents at the enterprise level.  I don’t want to become an enterprise, but I want to understand the patterns, tools, and controls that an enterprise might implement.

### Compliance Considerations

This is the big goal - how would a company offering AI agents as a service to customers go about completing a SOC 2 audit?

## So those are my goals.  Here is my plan:

* Create an AI agent locally that will review K8s infrastructure and facilitate decision-making during the review process.
* Deploy a test Kubernetes cluster from Terraform into the cloud.
* Deploy my local agent into the cloud using industry-standard tooling.
* Layer in a second agent to pull context from a mock Active Directory environment.
* Attempt to write and audit SOC 2 controls specific to the service (ignoring the overarching enterprise controls)