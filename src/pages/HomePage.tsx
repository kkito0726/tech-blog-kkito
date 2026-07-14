import { Head } from 'vite-react-ssg'
import { Hero } from '../components/organisms/Hero'
import { PostList } from '../components/organisms/PostList'
import { absoluteUrl, pageTitle, site } from '../config/site'
import { posts } from '../lib/posts'

export function HomePage() {
  return (
    <>
      <Head>
        <title>{pageTitle()}</title>
        <meta name="description" content={site.description} />
        <meta property="og:title" content={site.title} />
        <meta property="og:description" content={site.description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={absoluteUrl('/')} />
        <meta property="og:site_name" content={site.title} />
        <meta name="twitter:card" content="summary" />
      </Head>
      <Hero postCount={posts.length} />
      <PostList posts={posts} />
    </>
  )
}
