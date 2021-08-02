import { GetStaticProps } from 'next';

import { getPrismicClient } from '../services/prismic';
import Prismic from '@prismicio/client'

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import Header from '../components/Header';
import { FiUser, FiCalendar} from 'react-icons/fi'
import Link from 'next/link';

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState } from 'react';

import ExitPreviewButton from '../components/ExitPreviewButton';

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
  preview: boolean;
  previewData: any;
}

interface Next_Page_Response extends Response{
  results: [{
    uid: string;
    first_publication_date: string;
    data:{
      title: string;
      subtitle: string;
      author: string;
    }
  }];
}

export default function Home(props:HomeProps) {
  const [allPosts, setAllPosts] = useState<Post[]>(props.postsPagination.results);
  const [nextPage, setNextPage] = useState(props.postsPagination.next_page);

  async function handleNextPage(){

    try{
      await fetch(nextPage).then((res: Next_Page_Response ) => {
        return res.json()
      }).then(res => {
        setNextPage(res.next_page);
        res.results.map(result => {
          let newPost = {
            uid: result.uid,
            first_publication_date: format(new Date(result.first_publication_date),"dd MMM yyyy" ,{locale: ptBR,}),
            data:{
              title: result.data.title,
              subtitle: result.data.subtitle,
              author: result.data.author,
            }
          }
         setAllPosts([...allPosts, newPost])
        })
      })
    }catch(err){
      alert(err);
    }
  }

  return(
    <>
    <Header />
    <div className={styles.container}>
      {allPosts.map(post => { //15 Mar 2021
        return(
          <Link key={post.uid} href={`/post/${post.uid}`}>
            <div className={styles.postItem}>
              <h1>{post.data.title}</h1>
              <p>{post.data.subtitle}</p>
              <section className={styles.infos}>
                <div className={styles.infosItem}>
                  <FiCalendar />
                  <time>{format(new Date(post.first_publication_date),"dd MMM yyyy" ,{locale: ptBR,})} </time> 
                </div>
                <div className={styles.infosItem}>
                  <FiUser />
                  <a>{post.data.author}</a>
                </div>
              </section>
            </div>
          </Link>
        )
      })}
    {nextPage ? <button className={styles.morePosts} onClick={handleNextPage}>Carregar mais posts</button> : '' }
    </div>
    {props.preview ? <ExitPreviewButton /> : ''}
    </>
  )
}

 export const getStaticProps : GetStaticProps = async ({preview = false, previewData}) => {
  
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type', 'posts')], 
    {
      fetch: ['posts.title','posts.subtitle', 'posts.author', 'posts.banner', 'posts.content'], 
      pageSize: 1,
      ref: previewData?.ref ?? null
    }) 

    return {
      props:{
        postsPagination: {
          next_page: postsResponse.next_page,
          results: postsResponse.results
        },
        preview
        
      },
      redirect: 60 * 60 * 24, //24 Horas
    };
 };
