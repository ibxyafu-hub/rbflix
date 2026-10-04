import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Eye, Database, Trash2, UserCheck } from 'lucide-react';
import { BackButton } from '../components/BackButton';

export const PrivacyPolicyPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  const sections = [
    {
      id: 'introduction',
      title: '1. Introduction',
      icon: <Shield className="w-5 h-5 text-[#e50914]" />,
      content: 'Welcome to RBflix. We respect your privacy and are committed to protecting your personal data. This Privacy Policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.',
    },
    {
      id: 'info-collect',
      title: '2. Information We Collect',
      icon: <Eye className="w-5 h-5 text-[#e50914]" />,
      content: 'We collect information that you provide directly to us, such as when you create an account, update your profile, or use our interactive features. This includes your name, email address, and any other information you choose to provide.',
    },
    {
      id: 'use-info',
      title: '3. How We Use Information',
      icon: <UserCheck className="w-5 h-5 text-[#e50914]" />,
      content: 'We use the information we collect to provide, maintain, and improve our services, including personalize your experience, processing transactions, and sending you technical notices and support messages.',
    },
    {
      id: 'auth',
      title: '4. Accounts and Authentication',
      icon: <Lock className="w-5 h-5 text-[#e50914]" />,
      content: 'RBflix uses secure authentication methods to protect your account. We store your account credentials and profile information securely. We do not share your password with any third parties.',
    },
    {
      id: 'history-list',
      title: '5. Watch History and My List',
      icon: <Database className="w-5 h-5 text-[#e50914]" />,
      content: 'To improve your experience, we store your "My List" selections and "Continue Watching" progress. This data is stored locally on your device using Local Storage and may be synced to our servers if you are logged in.',
    },
    {
      id: 'cookies',
      title: '6. Cookies and Local Storage',
      icon: <Database className="w-5 h-5 text-[#e50914]" />,
      content: 'We use cookies and similar technologies (like Local Storage) to remember your preferences, keep you logged in, and analyze how our service is used. You can control the use of cookies through your browser settings.',
    },
    {
      id: 'third-party',
      title: '7. Third-Party Services',
      icon: <Shield className="w-5 h-5 text-[#e50914]" />,
      content: 'We may use third-party services for analytics, hosting, and content delivery. These services may collect information about your interactions with RBflix in accordance with their own privacy policies.',
    },
    {
      id: 'tmdb',
      title: '8. TMDB and Metadata',
      icon: <Database className="w-5 h-5 text-[#e50914]" />,
      content: 'Content metadata and images are provided by The Movie Database (TMDB). Your interactions with this content are processed by RBflix to provide a seamless interface.',
    },
    {
      id: 'embeds',
      title: '9. Third-Party Video Embeds',
      icon: <Shield className="w-5 h-5 text-[#e50914]" />,
      content: 'RBflix may utilize third-party video players and embeds to deliver streaming content. These providers may collect data such as your IP address and playback statistics.',
    },
    {
      id: 'storage',
      title: '10. Data Storage',
      icon: <Database className="w-5 h-5 text-[#e50914]" />,
      content: 'Your data is stored using industry-standard secure storage solutions, including Supabase and local device storage. We retain your information for as long as your account is active or as needed to provide you services.',
    },
    {
      id: 'security',
      title: '11. Data Security',
      icon: <Lock className="w-5 h-5 text-[#e50914]" />,
      content: 'We implement technical and organizational measures to protect your data from unauthorized access, loss, or alteration. However, no method of transmission over the Internet is 100% secure.',
    },
    {
      id: 'rights',
      title: '12. User Rights',
      icon: <UserCheck className="w-5 h-5 text-[#e50914]" />,
      content: 'You have the right to access, correct, or delete your personal data. You can manage your profile information directly through your account settings.',
    },
    {
      id: 'deletion',
      title: '13. Data Deletion Requests',
      icon: <Trash2 className="w-5 h-5 text-[#e50914]" />,
      content: 'To request the complete deletion of your account and associated data, please contact our support team. We will process your request in accordance with applicable laws.',
    },
    {
      id: 'children',
      title: '14. Children\'s Privacy',
      icon: <Shield className="w-5 h-5 text-[#e50914]" />,
      content: 'RBflix is intended for a general audience. We do not knowingly collect personal information from children under the age of 13 without parental consent.',
    },
    {
      id: 'changes',
      title: '15. Changes to This Privacy Policy',
      icon: <Shield className="w-5 h-5 text-[#e50914]" />,
      content: 'We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.',
    },
    {
      id: 'contact',
      title: '16. Contact',
      icon: <Shield className="w-5 h-5 text-[#e50914]" />,
      content: 'If you have any questions about this Privacy Policy, please contact us at privacy@rbflix.stream.',
    },
  ];

  return (
    <div className="pt-24 pb-20 min-h-screen bg-[#141414]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="space-y-4 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-zinc-400 text-sm font-medium">
            Last updated: October 4, 2026
          </p>
          <div className="h-1 w-20 bg-[#e50914] rounded-full" />
        </div>

        {/* Content */}
        <div className="space-y-12">
          {sections.map((section, index) => (
            <section 
              key={section.id} 
              className="space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-700"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center gap-3">
                {section.icon}
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {section.title}
                </h2>
              </div>
              <p className="text-zinc-300 leading-relaxed text-sm sm:text-base">
                {section.content}
              </p>
            </section>
          ))}
        </div>

        {/* Footer Note */}
        <div className="mt-16 pt-8 border-t border-zinc-800 text-center text-zinc-500 text-xs">
          <p>© 2026 RBflix, Inc. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};
