import type { Metadata } from "next";
import { getAllPosts } from "@/lib/blog";
import BlogPost from "@/components/BlogPost";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Technical writing on AI security, GRC engineering, and building in public.",
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <header className="mb-12">
        <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
          Blog
        </h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-400">
          Technical writing on AI security, GRC engineering, and building in
          public. Sharing what I learn along the way.
        </p>
      </header>

      {posts.length > 0 ? (
        <div className="space-y-2">
          {posts.map((post) => (
            <BlogPost
              key={post.slug}
              slug={post.slug}
              title={post.title}
              date={post.date}
              description={post.description}
              tags={post.tags}
            />
          ))}
        </div>
      ) : (
        <p className="text-neutral-500 dark:text-neutral-500 italic">
          No posts yet. Check back soon!
        </p>
      )}
    </div>
  );
}
