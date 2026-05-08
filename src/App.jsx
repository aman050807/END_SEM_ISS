import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import ISSTracker from './components/ISS/ISSTracker';
import NewsSection from './components/News/NewsSection';
import ChartsView from './components/ChartsView';
import Chatbot from './components/Chatbot/Chatbot';
import { useISS } from './hooks/useISS';
import { useNews } from './hooks/useNews';

export default function App() {
  const [activeTab, setActiveTab] = useState('ISS');
  const issData = useISS();
  const { getAllArticles } = useNews();

  return (
    <div className="app-wrapper">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--card)',
            color: 'var(--text)',
            border: '1px solid var(--card-border)',
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.85rem',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
          error: { iconTheme: { primary: '#f56565', secondary: '#fff' } },
        }}
      />

      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="main-content">
        {activeTab === 'ISS' && <ISSTracker />}
        {activeTab === 'News' && <NewsSection />}
        {activeTab === 'Charts' && <ChartsView issData={issData} />}
      </main>

      <Chatbot issData={issData} newsData={getAllArticles()} />
    </div>
  );
}
