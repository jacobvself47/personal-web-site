import Link from "next/link";

type BlogPostProps = {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags?: string[];
};

export default function BlogPost({
  slug,
  title,
  date,
  description,
  tags,
}: BlogPostProps) {
  return (
    <article className="group">
      <Link href={`/blog/${slug}`} className="block">
        <div className="p-4 -mx-4 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800/50 transition-colors">
          <time className="text-sm text-neutral-500 dark:text-neutral-500">
            {new Date(date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mt-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {title}
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            {description}
          </p>
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-1 bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
    </article>
  );
}
