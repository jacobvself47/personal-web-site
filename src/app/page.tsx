import Link from "next/link";

const featuredProjects = [
  {
    title: "Threat Model Viewer",
    description:
      "Interactive visualization tool for exploring threat models with assets, threats, and mitigations organized by layer.",
    href: "/projects/threat-model-viewer",
    tags: ["Security", "React", "Next.js"],
  },
];

export default function Home() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      {/* Hero Section */}
      <section className="mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
          Security & GRC Engineering
          <br />
          <span className="text-neutral-500 dark:text-neutral-400">
            for AI Systems
          </span>
        </h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mb-6">
          I focus on what controls AI service providers need, not just building
          AI-powered security tools.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/projects"
            className="inline-flex items-center px-4 py-2 bg-neutral-900 dark:bg-neutral-100 text-neutral-100 dark:text-neutral-900 rounded-lg hover:bg-neutral-700 dark:hover:bg-neutral-300 transition-colors"
          >
            View Projects
          </Link>
          <Link
            href="https://linkedin.com/in/jacobself"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            Connect on LinkedIn
          </Link>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
            Featured Projects
          </h2>
          <Link
            href="/projects"
            className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
          >
            View all &rarr;
          </Link>
        </div>
        <div className="grid gap-4">
          {featuredProjects.map((project) => (
            <Link
              key={project.title}
              href={project.href}
              className="group block p-6 border border-neutral-200 dark:border-neutral-800 rounded-lg hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
            >
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {project.title}
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 mt-2">
                {project.description}
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section className="mb-16">
        <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
          About
        </h2>
        <div className="prose text-neutral-600 dark:text-neutral-400">
          <p>
            I&apos;m Jake, a security and GRC professional currently focused on AI systems. My
            work centers on understanding what controls AI service providers
            need to operate securely and maintain compliance.
          </p>
          <p>
            I believe in building in public and sharing the learning process.
            This site serves as my portfolio, technical blog, and a
            demonstration of AI-assisted development practices.
          </p>
        </div>
      </section>

      {/* Latest Posts Placeholder */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
            Latest Posts
          </h2>
          <Link
            href="/blog"
            className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
          >
            View all &rarr;
          </Link>
        </div>
        <p className="text-neutral-500 dark:text-neutral-500 italic">
          Blog posts coming soon. Check back for updates on my security
          engineering journey.
        </p>
      </section>
    </div>
  );
}
