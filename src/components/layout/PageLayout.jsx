import Header from './Header'
import Footer from './Footer'

function PageLayout({ children, showHeader = true, showFooter = true, className = '' }) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-primary">
      {showHeader && <Header />}
      <main className={`flex-1 ${className}`}>
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  )
}

export default PageLayout

