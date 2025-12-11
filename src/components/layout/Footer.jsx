import { Link } from 'react-router-dom'

function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-primary border-t border-white/10 mt-auto w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* About Section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">📚</span>
              <h3 className="text-white font-bold text-base">Cloud Exam Lab</h3>
            </div>
            <p className="text-white/70 text-sm leading-relaxed">
              Professional exam practice platform for cloud certification success. Master AWS, Azure, and GCP certifications.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold mb-3 text-sm">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-white/70 hover:text-white text-sm transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-white/70 hover:text-white text-sm transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/#certifications" className="text-white/70 hover:text-white text-sm transition-colors">
                  All Certifications
                </Link>
              </li>
              <li>
                <Link to="/#pricing" className="text-white/70 hover:text-white text-sm transition-colors">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Certifications */}
          <div>
            <h3 className="text-white font-bold mb-3 text-sm">Certifications</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/#certifications" className="text-white/70 hover:text-white text-sm transition-colors">
                  AWS Certifications
                </Link>
              </li>
              <li>
                <Link to="/#certifications" className="text-white/70 hover:text-white text-sm transition-colors">
                  Azure Certifications
                </Link>
              </li>
              <li>
                <Link to="/#certifications" className="text-white/70 hover:text-white text-sm transition-colors">
                  GCP Certifications
                </Link>
              </li>
              <li>
                <Link to="/#breakdown" className="text-white/70 hover:text-white text-sm transition-colors">
                  Question Breakdown
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & Legal */}
          <div>
            <h3 className="text-white font-bold mb-3 text-sm">Support & Legal</h3>
            <ul className="space-y-2">
              <li>
                <a href="mailto:support@cloudexamlab.com" className="text-white/70 hover:text-white text-sm transition-colors">
                  Contact Support
                </a>
              </li>
              <li>
                <Link to="/#faq" className="text-white/70 hover:text-white text-sm transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <a href="#" className="text-white/70 hover:text-white text-sm transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-white/70 hover:text-white text-sm transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="border-t border-white/10 pt-6 pb-4">
          <p className="text-white/60 text-xs leading-relaxed text-center mb-4">
            <strong className="text-white/70">Disclaimer:</strong> Independent practice questions for certification preparation. 
            Not affiliated with or endorsed by Amazon Web Services (AWS), Microsoft Azure, Google Cloud Platform (GCP), 
            or any other certification provider. All trademarks are property of their respective owners.
          </p>

          {/* Copyright */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-white/50 text-xs">
            <p>© {currentYear} Cloud Exam Lab. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer

