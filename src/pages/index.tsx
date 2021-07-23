import { GetStaticProps } from "next";
import Head from "next/head";

import Prismic from "@prismicio/client";
import { RichText } from "prismic-dom";

import { getPrismicClient } from "../services/prismic";

import commonStyles from "../styles/common.module.scss";
import styles from "./home.module.scss";

interface Post {
  uid?: string;
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
          <article key={post.uid}>
            <h1>{post.data.title}</h1>
            <p>{post.data.subtitle}</p>
            <div>
              <img src="/images/calendar.png" />
              <time>{post.first_publication_date}</time>
              <img src="/images/user.png" />
              <span>{post.data.author}</span>
            </div>
          </article>
        ))}
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
