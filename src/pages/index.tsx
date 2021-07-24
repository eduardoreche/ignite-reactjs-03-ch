import { GetStaticProps } from "next";
import Head from "next/head";
import Link from "next/link";

import Prismic from "@prismicio/client";
import { RichText } from "prismic-dom";

import { getPrismicClient } from "../services/prismic";

import styles from "./home.module.scss";

interface Post {
  slug?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  posts: Post[];
  postsPagination: PostPagination;
}

export default function Home({ posts }: HomeProps) {
  return (
    <>
      <Head>
        <title>Home | ig.blog</title>
      </Head>
      <main className={styles.postsContainer}>
        {posts.map((post) => (
          <Link href={`/posts/${post.slug}`}>
            <a key={post.slug}>
              <h1>{post.data.title}</h1>
              <p>{post.data.subtitle}</p>
              <div>
                <div>
                  <img src="/images/calendar.png" />
                  <time>{post.first_publication_date}</time>
                </div>
                <div>
                  <img src="/images/user.png" />
                  <span>{post.data.author}</span>
                </div>
              </div>
            </a>
          </Link>
        ))}

        <div className={styles.bottom}>
          <Link href="/posts/">
            <a>Carregar mais posts</a>
          </Link>
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const response = await prismic.query(
    [Prismic.predicates.at("document.type", "posts")],
    {
      fetch: ["post.title", "post.content"],
      pageSize: 20,
    }
  );

  const posts = response.results.map((post) => {
    return {
      slug: post.uid,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
      first_publication_date: new Date(
        post.first_publication_date
      ).toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    };
  });

  return {
    props: {
      posts,
    },
  };
};
