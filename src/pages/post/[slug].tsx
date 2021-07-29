import { GetStaticPaths, GetStaticProps } from 'next';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';
import Prismic from '@prismicio/client'

import { RichText } from "prismic-dom"

import { FiUser, FiCalendar, FiClock} from 'react-icons/fi'

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { useRouter } from 'next/router';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR/index';

interface Post {
  first_publication_date: string | null;
  uid?: string;
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
  post: Post;
}

export default function Post({post, ...props} : PostProps) {
  const router = useRouter();


  function getReadingTimeReduce(content){
    const Regex = /\s+/g

    return content.reduce((acc, contentAtual) =>{
      const headingAmount = contentAtual.heading ? contentAtual.heading?.split(Regex).length : 0;
      const bodyAmount = RichText.asText(contentAtual.body).split(Regex).length;
      return acc + headingAmount + bodyAmount

    }, 0);

  }

  function getReadingTime(){
    const reduceValue = getReadingTimeReduce(post.data.content);
    console.log(reduceValue)
    const readingInMinutes = reduceValue / 200;

    return readingInMinutes < 1 ? '< 1 min' : `${Math.ceil(readingInMinutes)} min`
  }

  const aproxReadingTime = getReadingTime()

  if (router.isFallback) {
    return <div>Carregando...</div>
  }
  return(
    <>
    <Header />
    <main className={styles.postMain}>
      <img src={post.data.banner.url} alt="Post Image" />
      <article>
        <h1>{post.data.title}</h1>
        <div className={styles.postInfos}>
          <div className={styles.infoItem}>
            <FiCalendar />
            <p>{format(new Date(post.first_publication_date),"dd MMM yyyy" ,{locale: ptBR,})}</p>
          </div>
          <div className={styles.infoItem}>
            <FiUser />
            <p>{post.data.author}</p>
          </div>
          <div className={styles.infoItem}>
            <FiClock />
            <p>{aproxReadingTime}</p>
          </div>
        </div>
        {post.data.content.map(content =>{
          return(
            <div key={content.heading} className={styles.postContent}>
              <h2>{content.heading}</h2>
              <div dangerouslySetInnerHTML={{__html: RichText.asHtml(content.body)}} />
            </div>
          )
        })}

      </article>
    </main>
    </>
  )
}

 export const getStaticPaths: GetStaticPaths = async () => {
   const prismic = getPrismicClient();
   const posts = await prismic.query([
    Prismic.predicates.at('document.type', 'posts')], 
    {
      fetch: ['posts.title','posts.subtitle', 'posts.author', 'posts.banner', 'posts.content'], 
      pageSize: 20,
    })
   return{
    paths: [{params: {slug: posts.results[0].uid}}, {params: {slug: posts.results[1].uid}}],
    fallback: true
  }
}

 export const getStaticProps : GetStaticProps = async ({params}) => {
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(params.slug) , {});

  const post: Post = {
    data: {
      ...response.data,
      content: response.data.content.map(section => ({
        heading: section.heading,
        body: section.body,
      })),
    },
    uid: response.uid,
    first_publication_date: response.first_publication_date,
  };

  return { props: { post } };
 }