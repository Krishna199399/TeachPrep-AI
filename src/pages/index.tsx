import Head from 'next/head';
import Dashboard from '@/components/Dashboard';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';

export default function Home() {
  return (
    <ProtectedRoute>
      <Layout>
        <Head>
          <title>TeachPrep AI | Empower Your Teaching</title>
          <meta name="description" content="AI-powered lesson planning and resource management for educators" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        
        <div className="p-6">
          <Dashboard />
        </div>
      </Layout>
    </ProtectedRoute>
  );
} 