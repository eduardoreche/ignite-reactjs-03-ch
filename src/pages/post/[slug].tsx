import { GetStaticPaths, GetStaticProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";
import Prismic from "@prismicio/client";
import { RichText } from "prismic-dom";
import { ptBR } from "date-fns/locale";
import { format } from "date-fns";

import { getPrismicClient } from "../../services/prismic";
import commonStyles from "../../styles/common.module.scss";
import styles from "./post.module.scss";

interface Post {
  first_publication_date: string | null;
  last_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  preview: boolean;
  post: Post;
}

export default function Post({ post, preview }: PostProps) {
  const router = useRouter();

  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  function getReadingTime() {
    const wordCount = post.data.content.reduce((acc, content) => {
      const body = RichText.asText(content.body);

      const heading = content.heading;

      return acc + heading.split(/\s+/).length + body.split(/\s+/).length;
    }, 0);

    return Math.ceil(wordCount / 200);
  }

  return (
    <>
      <Head>
        <title>{post.data.title} | spacetraveling.</title>
      </Head>
      <main className={styles.postContainer}>
        <img src={post.data.banner.url} alt="banner" />
        <h1>{post.data.title}</h1>

        <div className={styles.postInfo}>
          <div>
            <img src="/images/calendar.png" />
            <time>
              {format(new Date(post.first_publication_date), "dd MMM yyyy", {
                locale: ptBR,
              })}
            </time>
          </div>
          <div>
            <img src="/images/user.png" />
            <span>{post.data.author}</span>
          </div>

          <div>
            <img src="/images/clock.png" />
            <span>{getReadingTime()} min</span>
          </div>
        </div>

        <div className={styles.lastEdited}>
          {post.last_publication_date && (
            <span>
              {format(
                new Date(post.last_publication_date),
                "'* editado em' dd MMM yyyy', ??s' HH:mm",
                { locale: ptBR }
              )}
            </span>
          )}
        </div>

        {post.data.content.map((content) => (
          <article key={content.heading} className={styles.postContent}>
            <h2>{content.heading}</h2>
            <div>{content.body.map((body) => body.text)}</div>
          </article>
        ))}

        <hr />

        <section className={styles.navigationLinks}>
          <Link href="/">
            <a>
              <h2>Title1</h2>
              <label>Post anterior</label>
            </a>
          </Link>

          <Link href="/">
            <a>
              <h2>Title2</h2>
              <label>Pr??ximo post</label>
            </a>
          </Link>
        </section>

        <section
          ref={(elem) => {
            if (!elem) {
              return;
            }
            const scriptElem = document.createElement("script");
            scriptElem.src = "https://utteranc.es/client.js";
            scriptElem.async = true;
            scriptElem.crossOrigin = "anonymous";
            scriptElem.setAttribute(
              "repo",
              "eduardoreche/ignite-reactjs-03-ch"
            );
            scriptElem.setAttribute("issue-term", "pathname");
            scriptElem.setAttribute("label", "comments");
            scriptElem.setAttribute("theme", "github-dark");
            elem.appendChild(scriptElem);
          }}
        />

        {preview && (
          <aside>
            <Link href="/api/exit-preview">
              <a>Sair do modo Preview</a>
            </Link>
          </aside>
        )}
      </main>
    </>
  );
}

export const getStaticPaths = async () => {
  const prismic = getPrismicClient();
  const response = await prismic.query(
    [Prismic.predicates.at("document.type", "posts")],
    {
      fetch: ["post.title", "post.content"],
    }
  );

  const paths = response.results.map((post) => ({
    params: { slug: post.uid },
  }));

  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({
  params,
  preview,
  previewData,
}) => {
  const prismic = getPrismicClient();
  const { slug } = params;

  const response = await prismic.getByUID("posts", String(slug), {
    ref: previewData?.ref ?? null,
  });

  return {
    props: {
      preview: !!preview,
      post: {
        first_publication_date: response.first_publication_date,
        last_publication_date: response.last_publication_date,
        uid: response.uid,
        data: {
          title: response.data.title,
          subtitle: response.data.subtitle,
          banner: {
            url: response.data.banner.url,
          },
          author: response.data.author,
          content: response.data.content.map((content) => ({
            heading: content.heading,
            body: content.body,
          })),
        },
      },
    },
  };
};
