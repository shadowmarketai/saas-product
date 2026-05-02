import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { SuperAdminDashboard } from './pages/superadmin/DashboardPage';
import { FranchisesPage } from './pages/superadmin/FranchisesPage';
import { AdminCustomersPage } from './pages/superadmin/CustomersPage';
import { AdminProductsPage } from './pages/superadmin/ProductsPage';
import { TemplatesPage } from './pages/superadmin/TemplatesPage';
import { FranchiseDashboard } from './pages/franchise/DashboardPage';
import { FranchiseCustomersPage } from './pages/franchise/CustomersPage';
import { CreateProductPage } from './pages/franchise/CreateProductPage';
import { EarningsPage } from './pages/franchise/EarningsPage';
import { ShowcasePage } from './pages/franchise/ShowcasePage';
import { CustomerDashboard } from './pages/customer/DashboardPage';
import { EditProductPage } from './pages/customer/EditProductPage';
import { AnalyticsPage } from './pages/customer/AnalyticsPage';
import { BillingPage } from './pages/customer/BillingPage';
import { SupportPage } from './pages/shared/SupportPage';
import { ProductViewPage } from './pages/public/ProductViewPage';
import { VCardListPage } from './pages/vcards/VCardListPage';
import { VCardEditorPage } from './pages/vcards/VCardEditorPage';
import { VCardPublicPage } from './pages/vcards/VCardPublicPage';
import { MiniSiteListPage } from './pages/minisites/MiniSiteListPage';
import { MiniSiteEditorPage } from './pages/minisites/MiniSiteEditorPage';
import { MiniSitePublicPage } from './pages/minisites/MiniSitePublicPage';
import { CustomerMenuPage } from './pages/qrmenu/CustomerMenuPage';
import { QRMenuHubPage } from './pages/qrmenu/QRMenuHubPage';
import { LinkBioListPage } from './pages/linkbio/LinkBioListPage';
import { LinkBioPublicPage } from './pages/linkbio/LinkBioPublicPage';
import { GoogleReviewsListPage } from './pages/reviews/GoogleReviewsListPage';
import { GoogleReviewsPublicPage } from './pages/reviews/GoogleReviewsPublicPage';
import { SocialPosterPage } from './pages/posters/SocialPosterPage';
import { WhatsAppListPage } from './pages/chatbot/WhatsAppListPage';
import { VerifyEmailPage } from './pages/auth/VerifyEmailPage';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
});

function RoleRedirect() {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!user) return <Navigate to="/login" />;
  if (user.role === 'super_admin') return <Navigate to="/super-admin" />;
  if (user.role === 'franchise_owner') return <Navigate to="/franchise" />;
  return <Navigate to="/dashboard" />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/home" element={<RoleRedirect />} />
            <Route path="/p/:slug" element={<ProductViewPage />} />
            <Route path="/card/:slug" element={<VCardPublicPage />} />
            <Route path="/site/:slug" element={<MiniSitePublicPage />} />
            <Route path="/menu/:qrToken" element={<CustomerMenuPage />} />
            <Route path="/bio/:slug" element={<LinkBioPublicPage />} />
            <Route path="/reviews/:slug" element={<GoogleReviewsPublicPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />

            {/* Super Admin */}
            <Route
              path="/super-admin"
              element={
                <ProtectedRoute roles={['super_admin']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<SuperAdminDashboard />} />
              <Route path="franchises" element={<FranchisesPage />} />
              <Route path="customers" element={<AdminCustomersPage />} />
              <Route path="products" element={<AdminProductsPage />} />
              <Route path="templates" element={<TemplatesPage />} />
              <Route path="vcards" element={<VCardListPage />} />
              <Route path="vcards/new" element={<VCardEditorPage />} />
              <Route path="vcards/:id/edit" element={<VCardEditorPage />} />
              <Route path="websites" element={<MiniSiteListPage />} />
              <Route path="websites/new" element={<MiniSiteEditorPage />} />
              <Route path="websites/:id/edit" element={<MiniSiteEditorPage />} />
              <Route path="qrmenu" element={<QRMenuHubPage />} />
              <Route path="linkbio" element={<LinkBioListPage />} />
              <Route path="linkbio/new" element={<EditProductPage />} />
              <Route path="linkbio/:id/edit" element={<EditProductPage />} />
              <Route path="reviews" element={<GoogleReviewsListPage />} />
              <Route path="reviews/new" element={<EditProductPage />} />
              <Route path="reviews/:id/edit" element={<EditProductPage />} />
              <Route path="posters" element={<SocialPosterPage />} />
              <Route path="posters/new" element={<EditProductPage />} />
              <Route path="posters/:id/edit" element={<EditProductPage />} />
              <Route path="chatbot" element={<WhatsAppListPage />} />
              <Route path="chatbot/new" element={<EditProductPage />} />
              <Route path="chatbot/:id/edit" element={<EditProductPage />} />
              <Route path="support" element={<SupportPage />} />
            </Route>

            {/* Franchise Owner */}
            <Route
              path="/franchise"
              element={
                <ProtectedRoute roles={['franchise_owner']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<FranchiseDashboard />} />
              <Route path="customers" element={<FranchiseCustomersPage />} />
              <Route path="create" element={<CreateProductPage />} />
              <Route path="earnings" element={<EarningsPage />} />
              <Route path="showcase" element={<ShowcasePage />} />
              <Route path="vcards" element={<VCardListPage />} />
              <Route path="vcards/new" element={<VCardEditorPage />} />
              <Route path="vcards/:id/edit" element={<VCardEditorPage />} />
              <Route path="websites" element={<MiniSiteListPage />} />
              <Route path="websites/new" element={<MiniSiteEditorPage />} />
              <Route path="websites/:id/edit" element={<MiniSiteEditorPage />} />
              <Route path="qrmenu" element={<QRMenuHubPage />} />
              <Route path="linkbio" element={<LinkBioListPage />} />
              <Route path="linkbio/new" element={<EditProductPage />} />
              <Route path="linkbio/:id/edit" element={<EditProductPage />} />
              <Route path="reviews" element={<GoogleReviewsListPage />} />
              <Route path="reviews/new" element={<EditProductPage />} />
              <Route path="reviews/:id/edit" element={<EditProductPage />} />
              <Route path="posters" element={<SocialPosterPage />} />
              <Route path="posters/new" element={<EditProductPage />} />
              <Route path="posters/:id/edit" element={<EditProductPage />} />
              <Route path="chatbot" element={<WhatsAppListPage />} />
              <Route path="chatbot/new" element={<EditProductPage />} />
              <Route path="chatbot/:id/edit" element={<EditProductPage />} />
              <Route path="support" element={<SupportPage />} />
            </Route>

            {/* Customer */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute roles={['customer']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<CustomerDashboard />} />
              <Route path="products/:id/edit" element={<EditProductPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="billing" element={<BillingPage />} />
              <Route path="vcards" element={<VCardListPage />} />
              <Route path="vcards/new" element={<VCardEditorPage />} />
              <Route path="vcards/:id/edit" element={<VCardEditorPage />} />
              <Route path="websites" element={<MiniSiteListPage />} />
              <Route path="websites/new" element={<MiniSiteEditorPage />} />
              <Route path="websites/:id/edit" element={<MiniSiteEditorPage />} />
              <Route path="qrmenu" element={<QRMenuHubPage />} />
              <Route path="linkbio" element={<LinkBioListPage />} />
              <Route path="linkbio/new" element={<EditProductPage />} />
              <Route path="linkbio/:id/edit" element={<EditProductPage />} />
              <Route path="reviews" element={<GoogleReviewsListPage />} />
              <Route path="reviews/new" element={<EditProductPage />} />
              <Route path="reviews/:id/edit" element={<EditProductPage />} />
              <Route path="posters" element={<SocialPosterPage />} />
              <Route path="posters/new" element={<EditProductPage />} />
              <Route path="posters/:id/edit" element={<EditProductPage />} />
              <Route path="chatbot" element={<WhatsAppListPage />} />
              <Route path="chatbot/new" element={<EditProductPage />} />
              <Route path="chatbot/:id/edit" element={<EditProductPage />} />
              <Route path="support" element={<SupportPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
