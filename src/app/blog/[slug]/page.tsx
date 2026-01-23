import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPostSlugs, getPostBySlug } from "@/lib/blog";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const slugs = getAllPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      {/* Breadcrumb */}
      <nav className="mb-8">
        <ol className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
          <li>
            <Link
              href="/blog"
              className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
            >
              Blog
            </Link>
          </li>
          <li>/</li>
          <li className="text-neutral-900 dark:text-neutral-100 truncate max-w-[200px]">
            {post.title}
          </li>
        </ol>
      </nav>

      <article>
        <header className="mb-8">
          <time className="text-sm text-neutral-500 dark:text-neutral-500">
            {new Date(post.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
          <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-neutral-100 mt-2 mb-4">
            {post.title}
          </h1>
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        <div
          className="prose"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>

      <div className="mt-12 pt-8 border-t border-neutral-200 dark:border-neutral-800">
        <Link
          href="/blog"
          className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
        >
          &larr; Back to all posts
        </Link>
      </div>
    </div>
  );
}
