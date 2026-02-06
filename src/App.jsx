import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import Layout from './components/layout/Layout';
import { AuthProvider } from './contexts/AuthContext';
import AdminRoute from './components/admin/AdminRoute';

const Home = lazy(() => import('./pages/Home'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsAndConditions = lazy(() => import('./pages/TermsAndConditions'));
const DeleteAccount = lazy(() => import('./pages/DeleteAccount'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const NotFound = lazy(() => import('./pages/NotFound'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const Admin = lazy(() => import('./pages/Admin'));

const LANG_PREFIXES = ['', '/fr', '/de'];

const PAGE_ROUTES = [
  { index: true, element: <Home /> },
  { path: 'privacy-policy', element: <PrivacyPolicy /> },
  { path: 'terms', element: <TermsAndConditions /> },
  { path: 'delete-account', element: <DeleteAccount /> },
  { path: 'blog', element: <Blog /> },
  { path: 'blog/:slug', element: <BlogPost /> },
];

function Loading() {
  return (
    <div className="flex items-center justify-center py-32">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<Loading />}>
            <Routes>
              {/* Admin routes (no language prefix) */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <Admin />
                  </AdminRoute>
                }
              />

              {/* Public routes with language prefixes */}
              {LANG_PREFIXES.map((prefix) => (
                <Route key={prefix} path={prefix || '/'} element={<Layout />}>
                  {PAGE_ROUTES.map((route) =>
                    route.index ? (
                      <Route key="index" index element={route.element} />
                    ) : (
                      <Route key={route.path} path={route.path} element={route.element} />
                    )
                  )}
                </Route>
              ))}
              <Route path="*" element={<Layout />}>
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </MotionConfig>
  );
}
