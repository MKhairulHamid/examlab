/**
 * Conflict resolution utility for syncing local and remote data
 * Rule: Latest timestamp wins
 */

/**
 * Resolve conflict between local and remote data
 * @param {Object} local - Local data with updated_at timestamp
 * @param {Object} remote - Remote data with updated_at timestamp
 * @returns {Object} - { data, source: 'local'|'remote' }
 */
export function resolveConflict(local, remote) {
  if (!local && !remote) {
    return { data: null, source: null }
  }
  
  if (!local) {
    return { data: remote, source: 'remote' }
  }
  
  if (!remote) {
    return { data: local, source: 'local' }
  }
  
  // Compare timestamps
  const localTime = getTimestamp(local)
  const remoteTime = getTimestamp(remote)
  
  console.log('🔄 Resolving conflict:', {
    local: localTime?.toISOString(),
    remote: remoteTime?.toISOString()
  })
  
  if (remoteTime > localTime) {
    console.log('✅ Remote is newer')
    return { data: remote, source: 'remote' }
  } else {
    console.log('✅ Local is newer or equal')
    return { data: local, source: 'local' }
  }
}

/**
 * Get timestamp from data object (tries multiple field names)
 */
function getTimestamp(data) {
  if (!data) return new Date(0)
  
  // Try different timestamp field names
  const timestampFields = [
    'updatedAt',
    'updated_at',
    'lastUpdated',
    'last_updated',
    'lastSyncedAt',
    'last_synced_at',
    'modifiedAt',
    'modified_at'
  ]
  
  for (const field of timestampFields) {
    if (data[field]) {
      return new Date(data[field])
    }
  }
  
  // Fallback to createdAt if no updated timestamp
  const createdFields = ['createdAt', 'created_at']
  for (const field of createdFields) {
    if (data[field]) {
      return new Date(data[field])
    }
  }
  
  // No timestamp found
  return new Date(0)
}

/**
 * Merge multiple data sources, keeping the newest
 */
export function mergeDataSources(sources) {
  if (!sources || sources.length === 0) {
    return null
  }
  
  if (sources.length === 1) {
    return sources[0]
  }
  
  // Find the source with the latest timestamp
  let latest = sources[0]
  let latestTime = getTimestamp(latest.data)
  
  for (let i = 1; i < sources.length; i++) {
    const currentTime = getTimestamp(sources[i].data)
    if (currentTime > latestTime) {
      latest = sources[i]
      latestTime = currentTime
    }
  }
  
  return latest
}

/**
 * Check if data needs sync based on timestamps
 */
export function needsSync(local, remote) {
  if (!local) return false
  if (!remote) return true
  
  const localTime = getTimestamp(local)
  const remoteTime = getTimestamp(remote)
  
  return localTime > remoteTime
}

/**
 * Merge arrays of data with conflict resolution
 * Useful for merging exam results or progress items
 */
export function mergeArrays(localArray, remoteArray, idField = 'id') {
  const merged = new Map()
  
  // Add all remote items
  remoteArray.forEach(item => {
    merged.set(item[idField], { data: item, source: 'remote' })
  })
  
  // Add or merge local items
  localArray.forEach(local => {
    const id = local[idField]
    const remote = merged.get(id)?.data
    
    if (remote) {
      // Item exists in both - resolve conflict
      const resolved = resolveConflict(local, remote)
      merged.set(id, resolved)
    } else {
      // Item only exists locally
      merged.set(id, { data: local, source: 'local' })
    }
  })
  
  return Array.from(merged.values()).map(item => item.data)
}

export default {
  resolveConflict,
  mergeDataSources,
  needsSync,
  mergeArrays
}

