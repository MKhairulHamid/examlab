import { Link } from 'react-router-dom'

function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-primary py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-white font-bold mb-3">Cloud Exam Lab</h3>
            <p className="text-white/70 text-sm leading-relaxed">
              Professional exam practice platform for cloud certification success. Master AWS, Azure, and GCP certifications.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold mb-3">Quick Links</h3>
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
                <Link to="/#exams" className="text-white/70 hover:text-white text-sm transition-colors">
                  Available Exams
                </Link>
              </li>
              <li>
                <Link to="/#features" className="text-white/70 hover:text-white text-sm transition-colors">
                  Features
                </Link>
              </li>
            </ul>
          </div>

          {/* Certifications */}
          <div>
            <h3 className="text-white font-bold mb-3">Certifications</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/#exams" className="text-white/70 hover:text-white text-sm transition-colors">
                  AWS Certifications
                </Link>
              </li>
              <li>
                <Link to="/#exams" className="text-white/70 hover:text-white text-sm transition-colors">
                  Azure Certifications
                </Link>
              </li>
              <li>
                <Link to="/#exams" className="text-white/70 hover:text-white text-sm transition-colors">
                  GCP Certifications
                </Link>
              </li>
              <li>
                <Link to="/#pricing" className="text-white/70 hover:text-white text-sm transition-colors">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & Legal */}
          <div>
            <h3 className="text-white font-bold mb-3">Support & Legal</h3>
            <ul className="space-y-2">
              <li>
                <a href="mailto:support@cloudexamlab.com" className="text-white/70 hover:text-white text-sm transition-colors">
                  Contact Us
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
        <div className="mt-8 pt-6 border-t border-white/10">
          <p className="text-white/50 text-xs text-center mb-3 max-w-3xl mx-auto">
            <strong>Disclaimer:</strong> Independent practice questions for certification preparation. 
            Not affiliated with or endorsed by Amazon Web Services (AWS), Microsoft Azure, Google Cloud Platform (GCP), 
            or any other certification provider. All trademarks are property of their respective owners.
          </p>
          <p className="text-white/50 text-sm text-center">
            © {currentYear} Cloud Exam Lab. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer

