import { type FC, useState } from 'react';
import { useUiStore } from '@/store/uiStore';

export const Footer: FC = () => {
  const { newsletterEmail, setNewsletterEmail, newsletterSubscribed, subscribeNewsletter } = useUiStore();
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.includes('@')) {
      subscribeNewsletter();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  return (
    <footer className="border-t border-theme mt-12 pb-20 md:pb-0" style={{ background: `rgba(var(--theme-bg-primary), 0.8)` }}>
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `rgba(var(--theme-accent), 0.2)` }}>
                <svg width="16" height="16" viewBox="0 0 32 32" fill="none"><path d="M16 2L28 9V23L16 30L4 23V9L16 2Z" fill="currentColor" style={{ color: `rgb(var(--theme-accent))` }} /></svg>
              </div>
              <span className="font-bold text-theme">Tech<span className="text-gradient">Prep</span> Pro</span>
            </div>
            <p className="text-sm text-theme-muted mb-6 max-w-sm">
              The AI-powered platform for mastering system design, data structures, and behavioral interviews. Built for senior engineers who want to level up.
            </p>

            {/* Newsletter */}
            {!newsletterSubscribed ? (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email for updates..."
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="input-field flex-1 max-w-xs"
                  required
                />
                <button type="submit" className="btn-primary px-4 py-2.5 text-sm whitespace-nowrap">
                  Subscribe
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-2 text-sm" style={{ color: `rgb(var(--theme-accent))` }}>
                <span>✅</span>
                <span className="font-medium">{showSuccess ? 'Subscribed! Check your inbox.' : 'You\'re subscribed to updates!'}</span>
              </div>
            )}
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold text-theme mb-3">Practice</h4>
            <ul className="space-y-2">
              {['System Design', 'Low-Level Design', 'Data Structures', 'AI/ML Design', 'Behavioral'].map((item) => (
                <li key={item}><span className="text-sm text-theme-muted hover:text-theme-secondary cursor-pointer transition-colors">{item}</span></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-theme mb-3">Platform</h4>
            <ul className="space-y-2">
              {['Pro Plan', 'AI Tutor', 'Progress Tracking', 'Community', 'Changelog'].map((item) => (
                <li key={item}><span className="text-sm text-theme-muted hover:text-theme-secondary cursor-pointer transition-colors">{item}</span></li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-theme pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-theme-muted">© 2026 TechPrep Pro. Built with 💜 for engineers, by engineers.</p>
          <div className="flex items-center gap-4">
            {['Privacy', 'Terms', 'Support'].map((link) => (
              <span key={link} className="text-xs text-theme-muted hover:text-theme-secondary cursor-pointer transition-colors">{link}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
