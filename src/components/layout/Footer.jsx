import { Link } from 'react-router-dom'

function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gradient-to-b from-primary to-primary-dark border-t border-white/10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {/* About Section */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-3xl">📚</span>
              <div className="flex flex-col">
                <h3 className="text-white font-bold text-lg leading-none">Cloud Exam Lab</h3>
                <span className="text-accent text-xs font-medium">Certification Practice</span>
              </div>
            </div>
            <p className="text-white/70 text-sm leading-relaxed mb-4">
              Professional exam practice platform for cloud certification success. Master AWS, Azure, and GCP certifications with exam-realistic questions.
            </p>
            {/* Social Links */}
            <div className="flex items-center space-x-3">
              <a 
                href="#" 
                className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-all duration-200 border border-white/10 hover:border-white/20"
                aria-label="Twitter"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"></path>
                </svg>
              </a>
              <a 
                href="#" 
                className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-all duration-200 border border-white/10 hover:border-white/20"
                aria-label="LinkedIn"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"></path>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </a>
              <a 
                href="#" 
                className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-all duration-200 border border-white/10 hover:border-white/20"
                aria-label="GitHub"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"></path>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wide">Quick Links</h3>
            <ul className="space-y-2.5">
              <li>
                <Link to="/" className="text-white/70 hover:text-white hover:translate-x-1 text-sm transition-all duration-200 inline-flex items-center group">
                  <span className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-white/70 hover:text-white hover:translate-x-1 text-sm transition-all duration-200 inline-flex items-center group">
                  <span className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/#certifications" className="text-white/70 hover:text-white hover:translate-x-1 text-sm transition-all duration-200 inline-flex items-center group">
                  <span className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  All Certifications
                </Link>
              </li>
              <li>
                <Link to="/#pricing" className="text-white/70 hover:text-white hover:translate-x-1 text-sm transition-all duration-200 inline-flex items-center group">
                  <span className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Certifications */}
          <div>
            <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wide">Certifications</h3>
            <ul className="space-y-2.5">
              <li>
                <Link to="/#certifications" className="text-white/70 hover:text-white hover:translate-x-1 text-sm transition-all duration-200 inline-flex items-center group">
                  <span className="mr-2">🔶</span>
                  AWS Certifications
                </Link>
              </li>
              <li>
                <Link to="/#certifications" className="text-white/70 hover:text-white hover:translate-x-1 text-sm transition-all duration-200 inline-flex items-center group">
                  <span className="mr-2">☁️</span>
                  Azure Certifications
                </Link>
              </li>
              <li>
                <Link to="/#certifications" className="text-white/70 hover:text-white hover:translate-x-1 text-sm transition-all duration-200 inline-flex items-center group">
                  <span className="mr-2">🔷</span>
                  GCP Certifications
                </Link>
              </li>
              <li>
                <Link to="/#breakdown" className="text-white/70 hover:text-white hover:translate-x-1 text-sm transition-all duration-200 inline-flex items-center group">
                  <span className="mr-2">📊</span>
                  Question Breakdown
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & Legal */}
          <div>
            <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wide">Support & Legal</h3>
            <ul className="space-y-2.5">
              <li>
                <a href="mailto:support@cloudexamlab.com" className="text-white/70 hover:text-white hover:translate-x-1 text-sm transition-all duration-200 inline-flex items-center group">
                  <span className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  Contact Support
                </a>
              </li>
              <li>
                <Link to="/#faq" className="text-white/70 hover:text-white hover:translate-x-1 text-sm transition-all duration-200 inline-flex items-center group">
                  <span className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  FAQ
                </Link>
              </li>
              <li>
                <a href="#" className="text-white/70 hover:text-white hover:translate-x-1 text-sm transition-all duration-200 inline-flex items-center group">
                  <span className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-white/70 hover:text-white hover:translate-x-1 text-sm transition-all duration-200 inline-flex items-center group">
                  <span className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-10 pt-8 border-t border-white/10">
          {/* Disclaimer */}
          <div className="mb-6 px-4 py-3 bg-white/5 rounded-lg border border-white/10">
            <p className="text-white/60 text-xs leading-relaxed text-center max-w-4xl mx-auto">
              <strong className="text-white/80">Disclaimer:</strong> Independent practice questions for certification preparation. 
              Not affiliated with or endorsed by Amazon Web Services (AWS), Microsoft Azure, Google Cloud Platform (GCP), 
              or any other certification provider. All trademarks are property of their respective owners.
            </p>
          </div>

          {/* Copyright and Links */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-white/50 text-sm">
              © {currentYear} <span className="text-white/70 font-medium">Cloud Exam Lab</span>. All rights reserved.
            </p>
            <div className="flex items-center space-x-4 text-xs text-white/50">
              <a href="#" className="hover:text-white/80 transition-colors">Terms</a>
              <span>•</span>
              <a href="#" className="hover:text-white/80 transition-colors">Privacy</a>
              <span>•</span>
              <a href="#" className="hover:text-white/80 transition-colors">Cookies</a>
            </div>
          </div>

          {/* Made with love */}
          <p className="text-center text-white/40 text-xs mt-4">
            Made with ❤️ for Cloud Certification Students
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer

