"use client";

import Link from "next/link";
import { useState } from "react";

type Finding = {
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  resource: string;
  priority: number;
  analysis: string;
  attackScenario: string;
  remediation: string[];
};

const findings: Finding[] = [
  {
    severity: "critical",
    title: "Cluster Admin Binding Detected",
    resource: "cluster-admin",
    priority: 10,
    analysis:
      "This ClusterRoleBinding grants full cluster-admin rights to system:masters group. This means any user or service account in this group has unrestricted, root-level access across the entire Kubernetes cluster.",
    attackScenario:
      "An insider or external attacker who gains credentials for a system:masters group member could completely compromise the cluster, create/delete resources, access sensitive workloads, and potentially exfiltrate data.",
    remediation: [
      "Audit and remove unnecessary members from system:masters group",
      "Use principle of least privilege for cluster administration",
      "Implement strong multi-factor authentication for admin access",
    ],
  },
  {
    severity: "critical",
    title: "Cluster Admin Binding Detected",
    resource: "kubeadm:cluster-admins",
    priority: 9,
    analysis:
      "This ClusterRoleBinding assigns cluster-admin privileges to the kubeadm:cluster-admins group, potentially exposing broad administrative capabilities to an unnecessary scope of users or services.",
    attackScenario:
      "A compromised service account or user within this group could manipulate cluster-wide configurations, create malicious pods, or perform destructive actions across all namespaces.",
    remediation: [
      "Review and restrict membership in kubeadm:cluster-admins group",
      "Create more granular, namespace-specific roles",
      "Implement strict authentication and authorization controls",
    ],
  },
  {
    severity: "critical",
    title: "Cluster Admin Binding Detected",
    resource: "risky-cluster-admin-binding",
    priority: 10,
    analysis:
      "Binding cluster-admin permissions to a service account creates a significant security vulnerability by granting unrestricted cluster-wide access to a potentially less-secured account.",
    attackScenario:
      "If the app-service-account's credentials are compromised, an attacker could gain complete administrative control over the entire Kubernetes cluster.",
    remediation: [
      "Remove cluster-admin binding from service account",
      "Create role-specific permissions tailored to the service account's actual requirements",
      "Implement robust credential rotation and management",
    ],
  },
  {
    severity: "high",
    title: "Wildcard Permissions Detected",
    resource: "cluster-admin",
    priority: 10,
    analysis:
      "The cluster-admin ClusterRole with wildcard (*) permissions on all verbs and resources represents an extreme security risk, providing unrestricted access to the entire cluster.",
    attackScenario:
      "An attacker who obtains credentials with this ClusterRole could perform any action in the cluster, including creating/deleting resources, accessing sensitive data, and completely compromising the infrastructure.",
    remediation: [
      "Replace cluster-admin role with fine-grained, specific roles",
      "Implement strict RBAC with least-privilege principles",
      "Use namespace-scoped roles instead of cluster-wide permissions",
    ],
  },
  {
    severity: "high",
    title: "Wildcard Permissions Detected",
    resource: "overly-permissive-developer",
    priority: 9,
    analysis:
      "An overly permissive developer ClusterRole with wildcard (*) on all verbs and resources violates security best practices and creates significant risk for unauthorized actions.",
    attackScenario:
      "A compromised developer account or credentials could be used to modify, delete, or access resources across the entire cluster without meaningful restrictions.",
    remediation: [
      "Create role-based access control specific to development needs",
      "Implement strict namespace-level permissions",
      "Use temporary, time-bound elevated access for specific tasks",
    ],
  },
  {
    severity: "high",
    title: "Wildcard Permissions Detected",
    resource: "system:controller:generic-garbage-collector",
    priority: 8,
    analysis:
      "The garbage collector controller role has extremely broad permissions to delete, modify, and watch all resources, which could be exploited if the controller's authentication is compromised.",
    attackScenario:
      "An attacker who gains access to this controller could potentially manipulate or delete critical cluster resources under the guise of garbage collection.",
    remediation: [
      "Limit the role's permissions to specific resource types",
      "Implement strong authentication for controller services",
      "Monitor and audit controller actions",
    ],
  },
  {
    severity: "high",
    title: "Wildcard Permissions Detected",
    resource: "system:controller:namespace-controller",
    priority: 8,
    analysis:
      "The namespace controller has extensive permissions to delete, list, and modify resources across the entire cluster, representing a significant potential attack surface.",
    attackScenario:
      "A compromised namespace controller could manipulate or delete entire namespaces, potentially causing widespread service disruption or data loss.",
    remediation: [
      "Limit namespace controller permissions to specific resource types",
      "Implement strong authentication and authorization controls",
      "Monitor and audit namespace-level changes",
    ],
  },
  {
    severity: "high",
    title: "Wildcard Permissions Detected",
    resource: "system:kubelet-api-admin",
    priority: 8,
    analysis:
      "This ClusterRole grants full ('*') access to kubelet-related sensitive endpoints, allowing extensive access to node logs, metrics, and proxy capabilities.",
    attackScenario:
      "An attacker could exploit these permissions to access node logs, retrieve sensitive metrics, and potentially use node proxy to pivot between network segments.",
    remediation: [
      "Remove '*' verb and replace with specific, required verbs",
      "Implement strict network policies",
      "Use certificate-based authentication for node access",
    ],
  },
  {
    severity: "high",
    title: "Wildcard Permissions Detected",
    resource: "rbac-test-env/wildcard-verbs",
    priority: 9,
    analysis:
      "A Role with wildcard ('*') verbs on deployments indicates unrestricted create, update, delete, and read permissions. This allows complete manipulation of deployment resources within the namespace.",
    attackScenario:
      "An attacker could create malicious deployments, modify existing ones, or delete critical application deployments, potentially causing service disruption or introducing malicious workloads.",
    remediation: [
      "Replace wildcard verbs with explicit, required actions",
      "Use more restrictive RBAC roles",
      "Implement strict deployment change management",
    ],
  },
  {
    severity: "medium",
    title: "Secrets Access Detected",
    resource: "admin",
    priority: 6,
    analysis:
      "The admin ClusterRole provides read-level access across all resources, which could enable extensive information gathering and potential reconnaissance for further attacks.",
    attackScenario:
      "A compromised admin account could systematically explore cluster resources, identifying potential vulnerabilities and gathering intelligence for targeted attacks.",
    remediation: [
      "Limit admin role permissions",
      "Implement role-based access with least privilege",
      "Use temporary, time-bound access for administrative tasks",
    ],
  },
  {
    severity: "medium",
    title: "Secrets Access Detected",
    resource: "edit",
    priority: 6,
    analysis:
      "The edit ClusterRole provides broad read access, enabling comprehensive resource exploration and potential information disclosure.",
    attackScenario:
      "An attacker with edit role permissions could map cluster resources, potentially identifying misconfigurations or sensitive workload details.",
    remediation: [
      "Restrict edit role to specific namespaces",
      "Implement more granular RBAC policies",
      "Use network policies to limit resource visibility",
    ],
  },
  {
    severity: "medium",
    title: "Secrets Access Detected",
    resource: "rbac-test-env/secret-reader",
    priority: 8,
    analysis:
      "The secret-reader role has read permissions on secrets in the rbac-test-env namespace, which could expose sensitive configuration data like credentials or encryption keys.",
    attackScenario:
      "An attacker who gains access to this role could potentially extract sensitive secrets, leading to credential theft, system compromise, or lateral movement within the cluster.",
    remediation: [
      "Implement strict secret access controls",
      "Use Kubernetes secrets encryption",
      "Rotate secrets regularly",
      "Implement additional authentication layers",
    ],
  },
];

const summary = {
  total: 23,
  critical: 3,
  high: 12,
  medium: 8,
};

function SeverityBadge({ severity }: { severity: Finding["severity"] }) {
  const colors = {
    critical:
      "bg-red-500/20 text-red-400 border-red-500/40",
    high: "bg-orange-500/20 text-orange-400 border-orange-500/40",
    medium:
      "bg-yellow-500/20 text-yellow-400 border-yellow-500/40",
    low: "bg-green-500/20 text-green-400 border-green-500/40",
  };

  return (
    <span
      className={`px-2 py-1 text-xs font-semibold uppercase tracking-wide rounded border ${colors[severity]}`}
    >
      {severity}
    </span>
  );
}

function FindingCard({ finding }: { finding: Finding }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-4 p-4 text-left hover:bg-neutral-800/50 transition-colors"
      >
        <SeverityBadge severity={finding.severity} />
        <span className="flex-1 font-medium text-neutral-100">
          {finding.title}
        </span>
        <span className="text-sm text-neutral-500 font-mono hidden sm:block">
          {finding.resource}
        </span>
        <span className="text-sm text-neutral-400">
          Priority:{" "}
          <span className="text-orange-400 font-bold">{finding.priority}/10</span>
        </span>
        <span
          className={`text-neutral-500 transition-transform ${
            expanded ? "rotate-180" : ""
          }`}
        >
          ▼
        </span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4">
          <div>
            <h4 className="text-xs uppercase tracking-wide text-neutral-500 mb-1">
              Analysis
            </h4>
            <p className="text-neutral-300 text-sm">{finding.analysis}</p>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-wide text-neutral-500 mb-1">
              Attack Scenario
            </h4>
            <p className="text-neutral-300 text-sm">{finding.attackScenario}</p>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-wide text-neutral-500 mb-1">
              Remediation Steps
            </h4>
            <ul className="space-y-1">
              {finding.remediation.map((step, i) => (
                <li key={i} className="text-neutral-300 text-sm flex gap-2">
                  <span className="text-blue-400">→</span>
                  {step}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SecurityReport() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      {/* Breadcrumb */}
      <nav className="mb-8">
        <ol className="flex items-center gap-2 text-sm text-neutral-500">
          <li>
            <Link
              href="/projects"
              className="hover:text-neutral-100 transition-colors"
            >
              Projects
            </Link>
          </li>
          <li>/</li>
          <li className="text-neutral-100">RBAC Security Report</li>
        </ol>
      </nav>

      {/* Header */}
      <header className="text-center mb-12 p-8 bg-neutral-900/50 border border-neutral-800 rounded-2xl">
        <div className="text-5xl mb-4">🛡️</div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
          Kubernetes RBAC Security Assessment
        </h1>
        <p className="text-neutral-400">AI-Enhanced Risk Analysis Report</p>
        <p className="text-neutral-500 text-sm mt-4">
          Generated: January 23, 2026 at 01:03 PM
        </p>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <div className="p-6 text-center bg-blue-500/10 border border-blue-500/30 rounded-xl">
          <div className="text-4xl font-bold text-blue-400">{summary.total}</div>
          <div className="text-sm text-neutral-400 uppercase tracking-wide">
            Total Findings
          </div>
        </div>
        <div className="p-6 text-center bg-red-500/10 border border-red-500/30 rounded-xl">
          <div className="text-4xl font-bold text-red-400">{summary.critical}</div>
          <div className="text-sm text-neutral-400 uppercase tracking-wide">
            Critical
          </div>
        </div>
        <div className="p-6 text-center bg-orange-500/10 border border-orange-500/30 rounded-xl">
          <div className="text-4xl font-bold text-orange-400">{summary.high}</div>
          <div className="text-sm text-neutral-400 uppercase tracking-wide">
            High
          </div>
        </div>
        <div className="p-6 text-center bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
          <div className="text-4xl font-bold text-yellow-400">{summary.medium}</div>
          <div className="text-sm text-neutral-400 uppercase tracking-wide">
            Medium
          </div>
        </div>
      </div>

      {/* Findings */}
      <section className="bg-neutral-900/30 border border-neutral-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-800">
          <h2 className="text-xl font-semibold text-neutral-100">
            Security Findings
          </h2>
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-sm text-purple-400">
            ✨ AI-Enhanced Analysis
          </span>
        </div>

        <div className="space-y-3">
          {findings.map((finding, i) => (
            <FindingCard key={i} finding={finding} />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center mt-12 text-neutral-500 text-sm">
        <p>SecureAudit AI - Kubernetes RBAC Compliance Analysis</p>
        <p className="mt-2">
          Powered by{" "}
          <a
            href="https://anthropic.com/claude"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline"
          >
            Claude AI
          </a>
        </p>
      </footer>
    </div>
  );
}
