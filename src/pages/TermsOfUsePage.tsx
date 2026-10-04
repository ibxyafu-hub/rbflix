import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Globe, UserCheck, ShieldAlert, Zap, Layers, AlertCircle } from 'lucide-react';
import { BackButton } from '../components/BackButton';

export const TermsOfUsePage: React.FC = () => {
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
      id: 'acceptance',
      title: '1. Acceptance of Terms',
      icon: <UserCheck className="w-5 h-5 text-[#e50914]" />,
      content: 'By accessing or using RBflix, you agree to be bound by these Terms of Use and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.',
    },
    {
      id: 'use-service',
      title: '2. Use of the Service',
      icon: <Globe className="w-5 h-5 text-[#e50914]" />,
      content: 'RBflix provides a cinematic interface for browsing and viewing movies and TV series. You are granted a limited, non-exclusive, non-transferable license to access and use the service for personal, non-commercial purposes.',
    },
    {
      id: 'accounts',
      title: '3. User Accounts',
      icon: <AlertCircle className="w-5 h-5 text-[#e50914]" />,
      content: 'You may be required to create an account to access certain features. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.',
    },
    {
      id: 'responsibilities',
      title: '4. User Responsibilities',
      icon: <UserCheck className="w-5 h-5 text-[#e50914]" />,
      content: 'You agree not to use RBflix for any unlawful purpose or in any way that could damage, disable, or impair the service. You are responsible for ensuring that your use of the service complies with all local regulations.',
    },
    {
      id: 'content-third-party',
      title: '5. Content and Third-Party Services',
      icon: <Layers className="w-5 h-5 text-[#e50914]" />,
      content: 'RBflix displays metadata, images, and other information provided by third-party services such as The Movie Database (TMDB). We do not claim ownership of this third-party content and are not responsible for its accuracy.',
    },
    {
      id: 'video-embeds',
      title: '6. Third-Party Video Embeds',
      icon: <Zap className="w-5 h-5 text-[#e50914]" />,
      content: 'Streaming content on RBflix may be delivered via third-party video embeds and external player providers. These third parties control the content delivery and availability. RBflix does not host or store the video files.',
    },
    {
      id: 'intellectual-property',
      title: '7. Intellectual Property',
      icon: <FileText className="w-5 h-5 text-[#e50914]" />,
      content: 'The RBflix software, branding, logos, and user interface are the property of RBflix or its licensors and are protected by intellectual property laws. All movies, series, and associated media are the property of their respective owners.',
    },
    {
      id: 'prohibited',
      title: '8. Prohibited Activities',
      icon: <ShieldAlert className="w-5 h-5 text-[#e50914]" />,
      content: 'You may not attempt to gain unauthorized access to our systems, reverse engineer the website, or use automated scripts to collect data from our service without explicit permission.',
    },
    {
      id: 'availability',
      title: '9. Service Availability',
      icon: <AlertCircle className="w-5 h-5 text-[#e50914]" />,
      content: 'We strive to maintain high availability but do not guarantee that RBflix will be uninterrupted or error-free. We reserve the right to modify or discontinue any part of the service at any time.',
    },
    {
      id: 'disclaimer',
      title: '10. Disclaimer',
      icon: <AlertCircle className="w-5 h-5 text-[#e50914]" />,
      content: 'RBflix is provided "as is" without any warranties, expressed or implied. We disclaim all other warranties including, without limitation, implied warranties of merchantability or fitness for a particular purpose.',
    },
    {
      id: 'liability',
      title: '11. Limitation of Liability',
      icon: <ShieldAlert className="w-5 h-5 text-[#e50914]" />,
      content: 'In no event shall RBflix or its suppliers be liable for any damages arising out of the use or inability to use the service, even if we have been notified of the possibility of such damage.',
    },
    {
      id: 'changes',
      title: '12. Changes to These Terms',
      icon: <FileText className="w-5 h-5 text-[#e50914]" />,
      content: 'We reserve the right to revise these Terms of Use at any time without notice. By using this website, you are agreeing to be bound by the then-current version of these Terms of Use.',
    },
    {
      id: 'contact',
      title: '13. Contact',
      icon: <FileText className="w-5 h-5 text-[#e50914]" />,
      content: 'If you have any questions regarding these Terms of Use, please contact us at terms@rbflix.stream.',
    },
  ];

  return (
    <div className="pt-24 pb-20 min-h-screen bg-[#141414]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="space-y-4 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
            Terms of Use
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
