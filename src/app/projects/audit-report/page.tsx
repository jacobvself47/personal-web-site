"use client";

import Link from "next/link";
import { useState } from "react";

type Severity = "critical" | "high" | "medium";

type Finding = {
  id: number;
  severity: Severity;
  title: string;
  principal: string;
  scope: string;
  action: "Investigate" | "Revoke" | "Review";
  description: string;
  why: string;
  remediation?: string;
};

type Group = {
  name: string;
  access: string;
  members: string;
  rationale: string;
  recommendation: "revoke" | "review" | "confirm";
};

const findings: Finding[] = [
  {
    id: 1,
    severity: "critical",
    title: "CI/CD Pipeline SA Has Cluster-Admin; Managed Identity Broken",
    principal: "azure-devops-pipeline SA",
    scope: "Cluster-wide",
    action: "Investigate",
    description:
      "The azure-devops-pipeline service account holds cluster-admin (full, unrestricted access to every resource in the cluster) and its linked Azure managed identity no longer exists in Azure.",
    why: "Service accounts used by automated pipelines should follow least privilege — deploy-only, not read-all-secrets. The linked Azure managed identity does not exist in the subscription. The identity chain is broken and unauditable.",
    remediation: "kubectl delete clusterrolebinding pipeline-cluster-admin",
  },
  {
    id: 2,
    severity: "critical",
    title: "GitHub Actions Deploy SA Has Near-Cluster-Admin; Identity Broken",
    principal: "github-actions-deploy SA",
    scope: "Cluster-wide",
    action: "Investigate",
    description:
      "The github-actions-deploy service account holds the built-in admin role applied cluster-wide via a ClusterRoleBinding, plus the ability to impersonate other users. Its Azure managed identity also cannot be verified.",
    why: "The built-in admin role includes ability to read all secrets, create pods, and impersonate other service accounts or users. When bound cluster-wide via a ClusterRoleBinding rather than to a specific namespace, it applies across every namespace. The linked managed identity does not exist in the subscription.",
    remediation: "kubectl delete clusterrolebinding cicd-deploy-admin",
  },
  {
    id: 3,
    severity: "critical",
    title: "Built-in `edit` ClusterRole Has Been Tampered With",
    principal: "edit ClusterRole (all subjects with edit bindings)",
    scope: "Cluster-wide",
    action: "Revoke",
    description:
      "The standard Kubernetes edit ClusterRole has been modified to include impersonate on serviceaccounts. This verb is not part of the upstream Kubernetes edit definition. The modification was introduced via system:aggregate-to-edit — an aggregation ClusterRole that feeds into edit — which is the more subtle attack path.",
    why: "The impersonate verb allows a principal to make Kubernetes API calls as any other user or service account. Adding it to edit silently grants impersonation capability to every subject currently bound to edit. This is a supply-chain style modification: invisible to reviewers who rely on standard Kubernetes RBAC documentation rather than inspecting actual role rules.",
    remediation:
      "kubectl edit clusterrole system:aggregate-to-edit\n# Remove: {apiGroups: [\"\"], resources: [\"serviceaccounts\"], verbs: [\"impersonate\"]}",
  },
  {
    id: 4,
    severity: "critical",
    title: "Application Service Account Has Cluster-Admin",
    principal: "app-service-account SA",
    scope: "Cluster-wide",
    action: "Revoke",
    description:
      "A service account named app-service-account has been granted cluster-admin with no apparent operational justification for an application workload.",
    why: "Application workloads should only be granted access to the specific resources they need. Granting an application service account cluster-admin means that if the application is compromised, the attacker can immediately read all secrets, access all workloads, and modify any policy in the cluster. The service account could not be found in the cluster during identity resolution, suggesting the binding may also be stale.",
    remediation: "kubectl delete clusterrolebinding app-platform-admin",
  },
  {
    id: 5,
    severity: "critical",
    title: "External Domain User Has Namespace Admin; Not Found in Directory",
    principal: "jane.doe@[external-domain]",
    scope: "namespace: rbac-test-env",
    action: "Revoke",
    description:
      "A user with an address from an unrecognised external domain holds admin access in the rbac-test-env namespace, but this account does not exist in the organisation's Azure Active Directory.",
    why: "This binding cannot be attributed to a known, controlled identity. The account may be from a former contractor, a test account that was never removed, or a misconfiguration. RBAC bindings for unverifiable identities cannot be audited and represent a persistent, uncontrolled access path.",
    remediation:
      "kubectl delete rolebinding team-environment-admin -n rbac-test-env",
  },
  {
    id: 6,
    severity: "critical",
    title: "Cloud-Engineering Group Holds cluster-admin",
    principal: "Cloud-Engineering (3 members: Alex Chen, Sarah Mitchell, Marcus Thompson)",
    scope: "Cluster-wide",
    action: "Review",
    description:
      "The Cloud-Engineering group is bound to cluster-admin, the highest privilege level in Kubernetes.",
    why: "The CIS Kubernetes Benchmark (Control 5.1.1) states that cluster-admin should only be granted to principals who explicitly require it. For a team whose function is infrastructure management, a scoped admin role is almost always sufficient. No group owners are defined, meaning there is no designated approver for membership changes.",
  },
  {
    id: 7,
    severity: "critical",
    title: "DevOps Group Holds Admin Cluster-Wide with Escalation Capabilities",
    principal: "DevOps (2 members: Jordan Rivera, Casey Williams)",
    scope: "Cluster-wide",
    action: "Review",
    description:
      "The DevOps group holds the built-in admin role applied cluster-wide via a ClusterRoleBinding, granting access to every namespace with the ability to impersonate other users and service accounts, read all secrets, and create pods.",
    why: "CIS Benchmark Control 5.1.1 covers both cluster-admin and the pattern of applying broad built-in roles cluster-wide. The admin role includes impersonate verbs which allow a principal to act as any other user or service account in the cluster. No group owners are defined.",
  },
  {
    id: 8,
    severity: "high",
    title: "Dangerous Unbound ClusterRole with Wildcard Permissions",
    principal: "platform-developer ClusterRole (unbound)",
    scope: "N/A",
    action: "Revoke",
    description:
      "A ClusterRole named platform-developer exists in the cluster with full wildcard permissions (verbs: [*], resources: [*], apiGroups: [*]) — equivalent to cluster-admin — but is not currently bound to any subject.",
    why: "An unbound dangerous role is latent risk. Anyone in the cluster with bind permission (e.g. any subject holding the admin role) can create a ClusterRoleBinding to it at any time, instantly gaining cluster-admin equivalent access. Dangerous ClusterRoles that are not actively used should not exist.",
    remediation: "kubectl delete clusterrole platform-developer",
  },
  {
    id: 9,
    severity: "high",
    title: "Cloud-Engineering Has Duplicate Access Path via Azure RBAC",
    principal: "Cloud-Engineering",
    scope: "Cluster-wide",
    action: "Review",
    description:
      "Cloud-Engineering reaches the cluster through two independent mechanisms: a Kubernetes RBAC binding and an Azure RBAC role assignment. Revoking the Kubernetes binding alone does not remove access — the Azure path persists independently.",
    why: "Dual access paths complicate access reviews and revocation. Revoking one mechanism silently leaves the other active. Azure RBAC-managed access is generally preferred for AKS as it centralises IAM in Azure.",
  },
  {
    id: 10,
    severity: "high",
    title: "DevOps Has Duplicate Access Path via Azure RBAC",
    principal: "DevOps",
    scope: "Cluster-wide",
    action: "Review",
    description:
      "Same dual-path pattern as Issue 9. DevOps holds both a Kubernetes ClusterRoleBinding and an Azure RBAC role assignment for cluster access.",
    why: "Dual access paths complicate access reviews and revocation. Revoking one mechanism silently leaves the other active.",
  },
  {
    id: 11,
    severity: "high",
    title: "Developers-Payments Has Debug Access to the Analytics Namespace",
    principal: "Developers-Payments (5 members: Priya Patel, Ethan Cole, Sofia Zhang, Noah Garcia, Lily Anderson)",
    scope: "namespace: analytics",
    action: "Review",
    description:
      "The Developers-Payments group holds a container-operations role binding in the analytics namespace — a namespace owned by a different team. The role allows executing commands inside running containers (pods/exec).",
    why: "Cross-namespace exec access can expose in-memory data and credentials belonging to the Analytics team. This is a cross-team access grant with no documented business justification.",
    remediation: "kubectl delete rolebinding payments-debug-access -n analytics",
  },
  {
    id: 12,
    severity: "high",
    title: "Developers-Analytics Has Duplicate Azure RBAC Access Path",
    principal: "Developers-Analytics",
    scope: "namespace: analytics",
    action: "Review",
    description:
      "Developers-Analytics reaches the cluster through both a Kubernetes RoleBinding and an Azure RBAC role assignment.",
    why: "Dual access paths complicate access reviews and revocation. Revoking one mechanism silently leaves the other active.",
  },
  {
    id: 13,
    severity: "high",
    title: "Sales Group Has Duplicate Azure RBAC Access Path (Broader Scope)",
    principal: "Sales",
    scope: "Cluster-wide (Azure RBAC); namespace: default (K8s)",
    action: "Review",
    description:
      "Sales holds both a Kubernetes view binding in the default namespace and an Azure RBAC Reader assignment cluster-wide. The Azure path is actually broader than the Kubernetes binding.",
    why: "The Azure RBAC assignment provides cluster-wide read access beyond what the Kubernetes binding grants. This asymmetry means the Kubernetes binding understates actual access.",
  },
  {
    id: 14,
    severity: "medium",
    title: "Two Users Reach the Cluster Through Two Group Memberships",
    principal: "Priya Patel, Noah Garcia",
    scope: "Namespaces: payments, analytics",
    action: "Review",
    description:
      "Two users are members of both Developers-Payments and Developers-Analytics. Because both groups have cluster bindings, these users reach the cluster through two group memberships simultaneously.",
    why: "Multi-path access complicates access reviews — revoking one group membership does not fully remove cluster access. Combined access: edit in analytics, edit in payments, container-operations in analytics.",
  },
];

const groups: Group[] = [
  {
    name: "AKS Admins",
    access: "cluster-admin — cluster-wide",
    members: "1 internal member",
    rationale:
      "A single-member admin group is a plausible break-glass or primary administrator pattern. No group owners are defined.",
    recommendation: "review",
  },
  {
    name: "Cloud-Engineering",
    access: "cluster-admin — cluster-wide",
    members: "3 — Alex Chen, Sarah Mitchell, Marcus Thompson",
    rationale:
      "Infrastructure teams commonly require elevated access, but cluster-admin rather than a scoped admin role should be explicitly justified. No group owners are defined.",
    recommendation: "review",
  },
  {
    name: "DevOps",
    access: "admin cluster-wide (ClusterRoleBinding)",
    members: "2 — Jordan Rivera, Casey Williams",
    rationale:
      "Cluster-wide scope is unusual for a DevOps team that likely operates in specific namespaces. No group owners are defined.",
    recommendation: "review",
  },
  {
    name: "Developers-Analytics",
    access: "edit — namespace: analytics",
    members: "6 — Priya Patel, Noah Garcia, David Kim, Aisha Johnson, Carlos Mendez, Zoe Williams",
    rationale:
      "Developer access to their own namespace is expected. The edit role also grants pods/exec — confirm whether developers need container exec access in production.",
    recommendation: "confirm",
  },
  {
    name: "Developers-Payments",
    access: "edit in payments; container-operations in analytics",
    members: "5 — Priya Patel, Ethan Cole, Sofia Zhang, Noah Garcia, Lily Anderson",
    rationale:
      "Access to payments is expected. The container-operations access in analytics (a different team's namespace) requires explicit justification from both team leads.",
    recommendation: "review",
  },
  {
    name: "Sales",
    access: "view — namespace: default; Azure RBAC Reader — cluster-wide",
    members: "3 — Michael Torres, Emma Davis, Ryan Cooper",
    rationale:
      "The Sales team having read access to a Kubernetes namespace is unusual and warrants explanation. Unless Sales is using a dashboard or reporting tool that reads directly from the cluster, this access appears out of place.",
    recommendation: "review",
  },
];

const positives = [
  "No orphaned group bindings. All 6 groups resolved successfully in Entra ID — no bindings point to groups that have been deleted from the directory.",
  "No guest users with cluster access. All resolved group members are internal accounts.",
  "No disabled accounts with active grants. No bindings were found for deactivated accounts.",
  "Group-based access is the norm. The majority of human access is managed via groups rather than direct user bindings, which is the correct pattern for auditability and bulk revocation.",
  "Namespace scoping is used for developer groups. Developer group bindings are scoped to their respective namespaces rather than cluster-wide.",
];

const infraBindings = [
  { principal: "AKS control plane identities", role: "cluster-admin", notes: "Certificate auth, not Entra accounts" },
  { principal: "AKS support identity", role: "aks-service", notes: "Managed support identity" },
  { principal: "AKS Secrets Store CSI driver", role: "aks-secretprovidersyncing-role", notes: "AKS-managed CSI driver" },
  { principal: "Azure File CSI storage driver", role: "csi-azurefile-node-secret-role", notes: "AKS storage driver" },
  { principal: "Secrets Store rotation controller", role: "secretproviderrotation-role", notes: "AKS secrets rotation" },
  { principal: "Calico network operator", role: "tigera-operator", notes: "AKS network policy engine" },
  { principal: "AKS monitoring agents", role: "system:prometheus, etc.", notes: "AKS telemetry" },
];

function SeverityBadge({ severity }: { severity: Severity }) {
  const colors: Record<Severity, string> = {
    critical: "bg-red-500/20 text-red-400 border-red-500/40",
    high: "bg-orange-500/20 text-orange-400 border-orange-500/40",
    medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40",
  };
  return (
    <span className={`px-2 py-0.5 text-xs font-semibold uppercase tracking-wide rounded border ${colors[severity]}`}>
      {severity}
    </span>
  );
}

function ActionBadge({ action }: { action: Finding["action"] }) {
  const colors = {
    Investigate: "bg-blue-500/20 text-blue-400 border-blue-500/40",
    Revoke: "bg-red-500/20 text-red-400 border-red-500/40",
    Review: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40",
  };
  return (
    <span className={`px-2 py-0.5 text-xs font-semibold rounded border ${colors[action]}`}>
      {action}
    </span>
  );
}

function FindingCard({ finding }: { finding: Finding }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start gap-3 p-4 text-left hover:bg-neutral-800/50 transition-colors"
      >
        <span className="text-neutral-600 font-mono text-sm pt-0.5 w-6 shrink-0">
          {finding.id}
        </span>
        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <SeverityBadge severity={finding.severity} />
            <ActionBadge action={finding.action} />
          </div>
          <span className="font-medium text-neutral-100 text-sm">{finding.title}</span>
          <span className="text-xs text-neutral-500 font-mono truncate">{finding.principal}</span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs text-neutral-600 hidden md:block">{finding.scope}</span>
          <span className={`text-neutral-500 text-sm transition-transform ${expanded ? "rotate-180" : ""}`}>▼</span>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-neutral-800 pt-4">
          <div>
            <h4 className="text-xs uppercase tracking-wide text-neutral-500 mb-1">Issue</h4>
            <p className="text-neutral-300 text-sm">{finding.description}</p>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-wide text-neutral-500 mb-1">Why This Is a Problem</h4>
            <p className="text-neutral-300 text-sm">{finding.why}</p>
          </div>
          {finding.remediation && (
            <div>
              <h4 className="text-xs uppercase tracking-wide text-neutral-500 mb-1">Remediation</h4>
              <pre className="bg-neutral-950 border border-neutral-800 rounded p-3 text-xs text-green-400 font-mono overflow-x-auto whitespace-pre-wrap">
                {finding.remediation}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function GroupRow({ group }: { group: Group }) {
  const [expanded, setExpanded] = useState(false);
  const recColors = {
    revoke: "text-red-400",
    review: "text-yellow-400",
    confirm: "text-green-400",
  };
  const recLabels = {
    revoke: "Revoke (recommended)",
    review: "Requires review",
    confirm: "Confirm appropriate",
  };

  return (
    <div className="border border-neutral-800 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-neutral-800/50 transition-colors"
      >
        <span className="font-mono font-medium text-neutral-100 flex-1 text-sm">{group.name}</span>
        <span className={`text-xs font-medium hidden sm:block ${recColors[group.recommendation]}`}>
          {recLabels[group.recommendation]}
        </span>
        <span className={`text-neutral-500 text-sm transition-transform ${expanded ? "rotate-180" : ""}`}>▼</span>
      </button>
      {expanded && (
        <div className="px-4 pb-4 space-y-2 border-t border-neutral-800 pt-4 text-sm">
          <div>
            <span className="text-xs uppercase tracking-wide text-neutral-500">Access: </span>
            <span className="text-neutral-300 font-mono">{group.access}</span>
          </div>
          <div>
            <span className="text-xs uppercase tracking-wide text-neutral-500">Members: </span>
            <span className="text-neutral-300">{group.members}</span>
          </div>
          <div>
            <span className="text-xs uppercase tracking-wide text-neutral-500">Assessment: </span>
            <span className="text-neutral-300">{group.rationale}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AuditReport() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      {/* Breadcrumb */}
      <nav className="mb-8">
        <ol className="flex items-center gap-2 text-sm text-neutral-500">
          <li>
            <Link href="/projects" className="hover:text-neutral-100 transition-colors">
              Projects
            </Link>
          </li>
          <li>/</li>
          <li className="text-neutral-100">Kubernetes RBAC Audit Report</li>
        </ol>
      </nav>

      {/* Header */}
      <header className="mb-10 p-8 bg-neutral-900/50 border border-neutral-800 rounded-2xl">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-neutral-100 mb-1">
              Kubernetes RBAC Security Audit Report
            </h1>
            <p className="text-neutral-500 text-sm">
              Cluster: <span className="font-mono text-neutral-400">[prod-aks-cluster]</span>
            </p>
          </div>
          <div className="text-right text-sm text-neutral-500">
            <div>Date: <span className="text-neutral-400">2026-03-17</span></div>
            <div>Scope: All ClusterRoleBindings &amp; RoleBindings</div>
            <div>Prepared for: Access Review</div>
          </div>
        </div>
        <p className="text-neutral-300 text-sm leading-relaxed">
          This audit reviewed <span className="text-neutral-100 font-medium">107 RBAC grants</span> across a production AKS cluster
          and resolved all principals against Azure Active Directory. The review identified{" "}
          <span className="text-red-400 font-medium">46 findings</span> across{" "}
          <span className="text-red-400 font-medium">32 CRITICAL</span> and{" "}
          <span className="text-orange-400 font-medium">12 HIGH</span> issues. The most significant
          concerns are two CI/CD service accounts with broad cluster access whose Azure managed identities cannot be verified,
          a built-in Kubernetes ClusterRole that has been tampered with to include privilege escalation capabilities,
          and an account from an unrecognised external domain that holds namespace admin access.
        </p>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="p-5 text-center bg-blue-500/10 border border-blue-500/30 rounded-xl">
          <div className="text-3xl font-bold text-blue-400">107</div>
          <div className="text-xs text-neutral-400 uppercase tracking-wide mt-1">RBAC Grants</div>
        </div>
        <div className="p-5 text-center bg-red-500/10 border border-red-500/30 rounded-xl">
          <div className="text-3xl font-bold text-red-400">32</div>
          <div className="text-xs text-neutral-400 uppercase tracking-wide mt-1">Critical</div>
        </div>
        <div className="p-5 text-center bg-orange-500/10 border border-orange-500/30 rounded-xl">
          <div className="text-3xl font-bold text-orange-400">12</div>
          <div className="text-xs text-neutral-400 uppercase tracking-wide mt-1">High</div>
        </div>
        <div className="p-5 text-center bg-neutral-800/50 border border-neutral-700 rounded-xl">
          <div className="text-3xl font-bold text-neutral-300">46</div>
          <div className="text-xs text-neutral-400 uppercase tracking-wide mt-1">Total Findings</div>
        </div>
      </div>

      {/* Executive Summary Table */}
      <section className="mb-10 bg-neutral-900/30 border border-neutral-800 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-neutral-100 mb-4 pb-3 border-b border-neutral-800">
          Executive Summary
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[500px]">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-neutral-500 border-b border-neutral-800">
                <th className="pb-3 pr-3 w-8">#</th>
                <th className="pb-3 pr-3 w-24">Severity</th>
                <th className="pb-3 pr-3">Issue</th>
                <th className="pb-3 pr-3 w-28 hidden sm:table-cell">Scope</th>
                <th className="pb-3 w-24">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {findings.map((f) => (
                <tr key={f.id} className="hover:bg-neutral-800/20 transition-colors">
                  <td className="py-2.5 pr-3 text-neutral-600 font-mono text-xs">{f.id}</td>
                  <td className="py-2.5 pr-3">
                    <SeverityBadge severity={f.severity} />
                  </td>
                  <td className="py-2.5 pr-3 text-neutral-300 leading-snug">{f.title}</td>
                  <td className="py-2.5 pr-3 text-neutral-500 text-xs hidden sm:table-cell">{f.scope}</td>
                  <td className="py-2.5">
                    <ActionBadge action={f.action} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Identity Issues */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-neutral-100 mb-3">
          1. Identity Issues
        </h2>
        <div className="space-y-2">
          {findings.filter((f) => f.id <= 5 || f.id === 8).map((f) => (
            <FindingCard key={f.id} finding={f} />
          ))}
        </div>
      </section>

      {/* Permission Issues */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-neutral-100 mb-3">
          2. Permission Issues
        </h2>
        <div className="space-y-2">
          {findings.filter((f) => [6, 7, 9, 10, 11, 12, 13, 14].includes(f.id)).map((f) => (
            <FindingCard key={f.id} finding={f} />
          ))}
        </div>
      </section>

      {/* Access Review */}
      <section className="mb-8 bg-neutral-900/30 border border-neutral-800 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-neutral-100 mb-1">
          3. Access Review Items
        </h2>
        <p className="text-sm text-neutral-500 mb-4">Groups — click to expand membership and rationale</p>
        <div className="space-y-2">
          {groups.map((g) => (
            <GroupRow key={g.name} group={g} />
          ))}
        </div>

        <div className="mt-6 pt-5 border-t border-neutral-800">
          <h3 className="text-sm font-semibold text-neutral-300 mb-3">Direct User Bindings</h3>
          <div className="bg-neutral-950 border border-red-500/20 rounded-lg p-4 text-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-red-400 font-semibold">External domain user</span>
              <span className="bg-red-500/20 text-red-400 border border-red-500/40 px-2 py-0.5 text-xs rounded">Revoke recommended</span>
            </div>
            <div className="text-neutral-500 text-xs space-y-1">
              <div>Access: <span className="text-neutral-400 font-mono">admin — namespace: rbac-test-env</span></div>
              <div>Account type: <span className="text-neutral-400">Not found in directory — external domain, not the organisation&apos;s tenant</span></div>
              <div className="text-neutral-600 pt-1">Cannot be attributed to a known identity. Should be treated as a stale or rogue binding. See Issue 5.</div>
            </div>
          </div>
          <p className="text-xs text-neutral-600 mt-3">
            AKS system identities (certificate/token auth) are listed for completeness in the Infrastructure Appendix below — not actionable for this review.
          </p>
        </div>
      </section>

      {/* What Looks Good */}
      <section className="mb-8 bg-green-500/5 border border-green-500/20 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-neutral-100 mb-4">4. What Looks Good</h2>
        <ul className="space-y-2">
          {positives.map((item, i) => (
            <li key={i} className="flex gap-3 text-sm">
              <span className="text-green-400 shrink-0 mt-0.5">✓</span>
              <span className="text-neutral-300">{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Infrastructure Appendix */}
      <section className="mb-8 bg-neutral-900/30 border border-neutral-800 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-neutral-100 mb-1">5. AKS Infrastructure Appendix</h2>
        <p className="text-sm text-neutral-500 mb-4">Expected AKS system components — not actionable for this review.</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-neutral-500 border-b border-neutral-800">
                <th className="pb-3 pr-4">Principal</th>
                <th className="pb-3 pr-4">Role</th>
                <th className="pb-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {infraBindings.map((row, i) => (
                <tr key={i}>
                  <td className="py-2 pr-4 text-neutral-400 font-mono text-xs">{row.principal}</td>
                  <td className="py-2 pr-4 text-neutral-400 font-mono text-xs">{row.role}</td>
                  <td className="py-2 text-neutral-500 text-xs">{row.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Closing Summary */}
      <section className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-neutral-100 mb-4">Closing Summary</h2>

        <div className="space-y-4 text-sm text-neutral-300">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <h3 className="text-red-400 font-semibold mb-1">Top Priority — Issues 1 &amp; 2</h3>
            <p>
              The two CI/CD service accounts with broken managed identity chains. Both are effectively unowned and unauditable.{" "}
              <code className="text-xs bg-neutral-950 px-1 py-0.5 rounded font-mono">azure-devops-pipeline</code> has full{" "}
              <code className="text-xs bg-neutral-950 px-1 py-0.5 rounded font-mono">cluster-admin</code>. Confirm with the pipeline teams,
              then either reconnect the identity chain with workload identity federation or delete the bindings.
              This is the easiest high-impact fix in the report.
            </p>
          </div>

          <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
            <h3 className="text-orange-400 font-semibold mb-1">Most Interesting Finding — Issue 3</h3>
            <p>
              The tampered <code className="text-xs bg-neutral-950 px-1 py-0.5 rounded font-mono">edit</code> ClusterRole.
              Deterministic rule-checking alone would surface this as a CIS violation, but without understanding{" "}
              <em>why</em> edit has impersonate verbs, a reviewer might dismiss it as a cluster customisation.
              The combination of detecting the modification, tracing it to an aggregation role, and identifying which groups
              are affected is where the audit adds value beyond a raw rule scan.
            </p>
          </div>

          <div>
            <h3 className="text-neutral-200 font-semibold mb-2">Quick Wins</h3>
            <div className="space-y-1.5">
              {[
                "kubectl delete clusterrolebinding app-platform-admin",
                "kubectl delete rolebinding team-environment-admin -n rbac-test-env",
                "kubectl delete clusterrole platform-developer",
              ].map((cmd, i) => (
                <pre key={i} className="bg-neutral-900 border border-neutral-700 rounded p-2.5 text-xs text-green-400 font-mono overflow-x-auto">
                  {cmd}
                </pre>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-neutral-200 font-semibold mb-2">Next Steps</h3>
            <ol className="space-y-1 list-decimal list-inside text-neutral-400">
              <li>Re-run the audit after revoking Issues 1–5 to confirm finding count drops</li>
              <li>Have group owners sign off on Issues 6–7 or scope-reduce those bindings</li>
              <li>Add group owners in Entra ID for all six access groups — currently none have designated approvers for membership changes</li>
              <li>For developer groups, evaluate replacing the built-in <code className="text-xs bg-neutral-950 px-1 py-0.5 rounded font-mono">edit</code> role with a custom role that excludes <code className="text-xs bg-neutral-950 px-1 py-0.5 rounded font-mono">pods/exec</code> and impersonation</li>
            </ol>
          </div>
        </div>
      </section>

      <footer className="text-center mt-12 text-neutral-600 text-xs">
        <p>SecureAudit AI — Kubernetes RBAC Access Review</p>
      </footer>
    </div>
  );
}
