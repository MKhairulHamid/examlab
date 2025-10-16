import useSyncStore from '../../stores/syncStore'
import { formatDate } from '../../utils/formatters'

function SyncIndicator({ className = '' }) {
  const { 
    isOnline, 
    isSyncing, 
    pendingCount, 
    lastSyncTime,
    syncError,
    getSyncStatusText,
    getSyncStatusColor
  } = useSyncStore()

  const statusColor = getSyncStatusColor()
  const statusText = getSyncStatusText()

  const colorClasses = {
    gray: 'bg-gray-400',
    red: 'bg-red-500',
    yellow: 'bg-yellow-400',
    green: 'bg-green-400',
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Status dot */}
      <div className="relative">
        <div className={`w-2.5 h-2.5 rounded-full ${colorClasses[statusColor]} ${
          isSyncing ? 'animate-pulse' : ''
        }`}></div>
        {pendingCount > 0 && !isSyncing && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 text-white text-[8px] rounded-full flex items-center justify-center">
            {pendingCount > 9 ? '9+' : pendingCount}
          </div>
        )}
      </div>

      {/* Status text */}
      <div className="flex flex-col">
        <span className="text-white/90 text-xs font-medium">
          {statusText}
        </span>
        {lastSyncTime && !isSyncing && isOnline && (
          <span className="text-white/50 text-[10px]">
            Last synced {formatDate(lastSyncTime)}
          </span>
        )}
        {syncError && (
          <span className="text-red-400 text-[10px]">
            {syncError}
          </span>
        )}
      </div>
    </div>
  )
}

export default SyncIndicator

