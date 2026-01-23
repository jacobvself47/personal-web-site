import Link from "next/link";

const socialLinks = [
  {
    href: "https://linkedin.com/in/jacobvself",
    label: "LinkedIn",
  },
  {
    href: "https://github.com/jacobvself47",
    label: "GitHub",
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-800 mt-auto">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            {socialLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <p className="text-sm text-neutral-500 dark:text-neutral-500">
            &copy; {new Date().getFullYear()} Jake. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
