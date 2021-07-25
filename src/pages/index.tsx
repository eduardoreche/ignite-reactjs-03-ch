import { useState } from "react";
import { GetStaticProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { format } from "date-fns";
import ptBR from "date-fns/locale/pt-BR";

import Prismic from "@prismicio/client";

import { getPrismicClient } from "../services/prismic";

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
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const [loadedPosts, setLoadedPosts] = useState<Post[]>(
    postsPagination.results
  );
  const [nextPage, setNextPage] = useState<string>(postsPagination.next_page);

  const loadMorePosts = () => {
    if (nextPage) {
      fetch(nextPage)
        .then((response) => response.json())
        .then((data) => {
          const posts = data.results.map((post) => {
            return {
              uid: post.uid,
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

          setNextPage(data.next_page);
          setLoadedPosts([...loadedPosts, ...posts]);
        });
    }
  };

  return (
    <>
      <Head>
        <title>Home | spacetraveling.</title>
      </Head>
      <main className={styles.postsContainer}>
        {loadedPosts?.map((post) => (
          <Link href={`/post/${post.uid}`} key={post.uid}>
            <a>
              <h1>{post.data.title}</h1>
              <p>{post.data.subtitle}</p>
              <div>
                <div>
                  <img src="/images/calendar.png" />
                  <time>
                    {format(
                      new Date(post.first_publication_date),
                      "dd MMM yyyy",
                      {
                        locale: ptBR,
                      }
                    )}
                  </time>
                </div>
                <div>
                  <img src="/images/user.png" />
                  <span>{post.data.author}</span>
                </div>
              </div>
            </a>
          </Link>
        ))}

        {nextPage && (
          <div className={styles.bottom}>
            <a onClick={loadMorePosts}>Carregar mais posts</a>
          </div>
        )}
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
      pageSize: 1,
      page: 1,
    }
  );

  const results = response.results.map((post) => {
    return {
      uid: post.uid,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
      first_publication_date: post.first_publication_date,
    };
  });

  return {
    props: {
      postsPagination: {
        results,
        next_page: response.next_page,
      },
    },
  };
};
