import { Link } from 'react-router-dom'

function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-primary py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="text-white font-bold mb-3">ExamPrep</h3>
            <p className="text-white/70 text-sm">
              Professional exam practice platform for certification success
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold mb-3">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/dashboard" className="text-white/70 hover:text-white text-sm transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <a href="#" className="text-white/70 hover:text-white text-sm transition-colors">
                  Available Exams
                </a>
              </li>
              <li>
                <a href="#" className="text-white/70 hover:text-white text-sm transition-colors">
                  My Progress
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-bold mb-3">Support</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-white/70 hover:text-white text-sm transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-white/70 hover:text-white text-sm transition-colors">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="text-white/70 hover:text-white text-sm transition-colors">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10 text-center">
          <p className="text-white/50 text-sm">
            © {currentYear} ExamPrep. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer

