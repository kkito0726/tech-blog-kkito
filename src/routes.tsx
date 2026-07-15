import type { RouteRecord } from 'vite-react-ssg'
import { BlogLayout } from './components/templates/BlogLayout'
import { posts } from './lib/posts'
import { HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { PostPage } from './pages/PostPage'

export const routes: RouteRecord[] = [
  {
    path: '/',
    element: <BlogLayout />,
    children: [
      { index: true, Component: HomePage },
      {
        path: 'posts/:slug',
        Component: PostPage,
        getStaticPaths: () => posts.map((post) => `posts/${post.slug}`),
      },
      { path: '404', Component: NotFoundPage },
      { path: '*', Component: NotFoundPage },
    ],
  },
]
