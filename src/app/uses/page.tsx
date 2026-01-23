import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Uses",
  description:
    "Tools, software, and setup I use for security engineering and development.",
};

type Tool = {
  name: string;
  description: string;
  link?: string;
};

type Category = {
  title: string;
  items: Tool[];
};

const categories: Category[] = [
  {
    title: "AI & Development",
    items: [
      {
        name: "Claude",
        description:
          "AI assistant for coding, writing, and problem-solving. Primary tool for AI-assisted development.",
        link: "https://claude.ai",
      },
      {
        name: "VS Code",
        description:
          "Primary code editor with Claude integration via extensions.",
        link: "https://code.visualstudio.com",
      },
      {
        name: "Next.js",
        description:
          "React framework for building this website and other web projects.",
        link: "https://nextjs.org",
      },
      {
        name: "TypeScript",
        description: "Type-safe JavaScript for better code quality.",
        link: "https://www.typescriptlang.org",
      },
    ],
  },
  {
    title: "Security & GRC",
    items: [
      {
        name: "Threat Modeling",
        description:
          "STRIDE, PASTA, and custom frameworks for identifying security risks.",
      },
      {
        name: "NIST Frameworks",
        description:
          "NIST CSF, 800-53, and AI RMF for compliance and risk management.",
      },
      {
        name: "SOC 2",
        description: "Trust Services Criteria for service organization audits.",
      },
    ],
  },
  {
    title: "Infrastructure",
    items: [
      {
        name: "Vercel",
        description: "Hosting for this website. Free tier is perfect for static sites.",
        link: "https://vercel.com",
      },
      {
        name: "GitHub",
        description: "Version control and code collaboration.",
        link: "https://github.com",
      },
      {
        name: "Kubernetes",
        description:
          "Container orchestration for scalable applications and security research.",
      },
    ],
  },
];

export default function UsesPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <header className="mb-12">
        <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
          Uses
        </h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-400">
          Tools, software, and frameworks I use for security engineering and
          development. Inspired by{" "}
          <a
            href="https://uses.tech"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            uses.tech
          </a>
          .
        </p>
      </header>

      <div className="space-y-12">
        {categories.map((category) => (
          <section key={category.title}>
            <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 mb-6 border-b border-neutral-200 dark:border-neutral-800 pb-2">
              {category.title}
            </h2>
            <ul className="space-y-4">
              {category.items.map((item) => (
                <li key={item.name} className="flex flex-col gap-1">
                  {item.link ? (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-neutral-900 dark:text-neutral-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {item.name}
                    </a>
                  ) : (
                    <span className="font-medium text-neutral-900 dark:text-neutral-100">
                      {item.name}
                    </span>
                  )}
                  <p className="text-neutral-600 dark:text-neutral-400">
                    {item.description}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
