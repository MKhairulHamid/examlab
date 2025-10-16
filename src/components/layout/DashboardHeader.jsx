import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '../../stores/authStore'
import useSyncStore from '../../stores/syncStore'

function DashboardHeader() {
  const navigate = useNavigate()
  const { user, profile, logout, updateProfile } = useAuthStore()
  const { isOnline, isSyncing, pendingCount, getSyncStatusText } = useSyncStore()
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    full_name: '',
    phone: ''
  })

  if (!user) return null

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User'
  const userInitial = displayName.charAt(0).toUpperCase()

  const handleLogout = async () => {
    await logout()
    setShowProfileModal(false)
    navigate('/')
  }

  const handleEditProfile = () => {
    setEditForm({
      full_name: profile?.full_name || '',
      phone: profile?.phone || ''
    })
    setIsEditing(true)
  }

  const handleSaveProfile = async () => {
    const result = await updateProfile(editForm)
    if (result.success) {
      setIsEditing(false)
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditForm({
      full_name: profile?.full_name || '',
      phone: profile?.phone || ''
    })
  }

  return (
    <>
      {/* Professional Dashboard Header */}
      <header className="bg-white/10 backdrop-blur-lg border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link 
              to="/dashboard" 
              className="flex items-center space-x-2 hover:opacity-90 transition-opacity"
            >
              <span className="text-2xl">📚</span>
              <span className="text-white font-bold text-lg sm:text-xl">Cloud Exam Lab</span>
            </Link>

            {/* Right Section */}
            <div className="flex items-center space-x-4">
              {/* Sync Status Indicator */}
              <div className="hidden md:flex items-center space-x-2 px-3 py-2 bg-white/5 rounded-lg border border-white/10">
                <div className={`w-2 h-2 rounded-full ${
                  !isOnline ? 'bg-gray-400' :
                  isSyncing ? 'bg-yellow-400 animate-pulse' :
                  pendingCount > 0 ? 'bg-orange-400 animate-pulse' :
                  'bg-green-400'
                }`}></div>
                <span className="text-white/80 text-xs">
                  {getSyncStatusText()}
                </span>
              </div>

              {/* Navigation Links */}
              <Link
                to="/"
                className="hidden md:inline-flex items-center px-4 py-2 text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              >
                Browse Exams
              </Link>

              {/* User Profile Button */}
              <button
                onClick={() => setShowProfileModal(true)}
                className="flex items-center space-x-2 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all border border-white/30 group"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center text-white font-bold text-sm shadow-lg">
                  {userInitial}
                </div>
                <span className="text-white text-sm font-medium hidden sm:inline max-w-[120px] truncate">
                  {displayName}
                </span>
                <svg 
                  className="w-4 h-4 text-white/70 hidden sm:block" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Profile Modal Popup */}
      {showProfileModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          {/* Modal Container */}
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            style={{ maxHeight: '90vh', overflowY: 'auto' }}
          >
            {/* Header */}
            <div className="relative bg-gradient-to-br from-accent to-accent-dark p-6">
              <button
                onClick={() => {
                  setShowProfileModal(false)
                  setIsEditing(false)
                }}
                className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* User Avatar */}
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-lg flex items-center justify-center text-white font-bold text-3xl border-4 border-white/30 shadow-lg">
                  {userInitial}
                </div>
                {!isEditing && (
                  <>
                    <h2 className="mt-4 text-2xl font-bold text-white">
                      {displayName}
                    </h2>
                    <p className="mt-1 text-white/80 text-sm">
                      {user?.email}
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              {isEditing ? (
                /* Edit Profile Form */
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Profile</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={editForm.full_name}
                      onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={user?.email}
                      disabled
                      className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-500 cursor-not-allowed"
                    />
                    <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone (Optional)
                    </label>
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                      placeholder="Enter your phone number"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleSaveProfile}
                      className="flex-1 bg-gradient-to-r from-accent to-accent-dark text-white font-semibold py-2.5 px-4 rounded-lg hover:shadow-lg transition-all"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="flex-1 bg-gray-100 text-gray-700 font-semibold py-2.5 px-4 rounded-lg hover:bg-gray-200 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                /* Profile View */
                <div className="space-y-4">
                  {/* Profile Info */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Full Name</p>
                        <p className="text-sm text-gray-900 font-semibold mt-0.5">
                          {profile?.full_name || 'Not set'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Email</p>
                        <p className="text-sm text-gray-900 font-semibold mt-0.5">
                          {user?.email}
                        </p>
                      </div>
                    </div>

                    {profile?.phone && (
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Phone</p>
                          <p className="text-sm text-gray-900 font-semibold mt-0.5">
                            {profile.phone}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Sync Status - Mobile */}
                    <div className="md:hidden flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Sync Status</p>
                        <div className="flex items-center mt-1">
                          <div className={`w-2 h-2 rounded-full mr-2 ${
                            !isOnline ? 'bg-gray-400' :
                            isSyncing ? 'bg-yellow-400' :
                            pendingCount > 0 ? 'bg-orange-400' :
                            'bg-green-400'
                          }`}></div>
                          <p className="text-sm text-gray-900 font-semibold">
                            {getSyncStatusText()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2 pt-4 border-t border-gray-200">
                    <button
                      onClick={handleEditProfile}
                      className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-accent to-accent-dark text-white font-semibold py-2.5 px-4 rounded-lg hover:shadow-lg transition-all"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span>Edit Profile</span>
                    </button>

                    <Link
                      to="/"
                      onClick={() => setShowProfileModal(false)}
                      className="md:hidden w-full flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 font-semibold py-2.5 px-4 rounded-lg hover:bg-gray-200 transition-all"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <span>Browse Exams</span>
                    </Link>

                    <button
                      onClick={() => navigate('/dashboard')}
                      className="w-full flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 font-semibold py-2.5 px-4 rounded-lg hover:bg-gray-200 transition-all"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      <span>Dashboard</span>
                    </button>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center space-x-2 bg-red-50 text-red-600 font-semibold py-2.5 px-4 rounded-lg hover:bg-red-100 transition-all"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default DashboardHeader

