import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Security and GRC engineering projects focused on AI systems, threat modeling, and compliance.",
};

const projects = [
  {
    title: "RBAC Security Report",
    description:
      "AI-enhanced Kubernetes RBAC security assessment with detailed findings, attack scenarios, and remediation steps. Demonstrates SecureAudit AI capabilities.",
    href: "/projects/security-report",
    tags: ["Kubernetes", "RBAC", "AI", "Security Assessment"],
    status: "Live",
  },
  {
    title: "Threat Model Viewer",
    description:
      "Interactive visualization tool for exploring threat models with assets, threats, and mitigations organized by layer. Built to help security teams understand and communicate threat landscapes.",
    href: "/projects/threat-model-viewer",
    tags: ["Security", "React", "Next.js", "Threat Modeling"],
    status: "Live",
  },
];

export default function ProjectsPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <header className="mb-12">
        <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
          Projects
        </h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-400">
          Security engineering projects, tools, and experiments. Building in
          public and sharing what I learn along the way.
        </p>
      </header>

      <div className="grid gap-6">
        {projects.map((project) => (
          <Link
            key={project.title}
            href={project.href}
            className="group block p-6 border border-neutral-200 dark:border-neutral-800 rounded-lg hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {project.title}
                </h2>
                <p className="text-neutral-600 dark:text-neutral-400 mt-2">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded shrink-0">
                {project.status}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
