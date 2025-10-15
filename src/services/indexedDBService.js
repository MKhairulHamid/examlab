/**
 * IndexedDB Service - Store large data like question sets and exam attempts
 * Uses idb library for Promise-based API
 */

import { openDB } from 'idb'
import { IDB_NAME, IDB_VERSION } from '../utils/constants.js'

const DB_NAME = IDB_NAME
const DB_VERSION = IDB_VERSION

// Store names
const STORES = {
  QUESTION_SETS: 'questionSets',
  EXAM_ATTEMPTS: 'examAttempts',
  EXAM_RESULTS: 'examResults'
}

let dbPromise = null

/**
 * Initialize database
 */
async function initDB() {
  if (dbPromise) return dbPromise
  
  dbPromise = openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Question Sets store
      if (!db.objectStoreNames.contains(STORES.QUESTION_SETS)) {
        const questionSetStore = db.createObjectStore(STORES.QUESTION_SETS, {
          keyPath: 'id'
        })
        questionSetStore.createIndex('examTypeId', 'examTypeId')
        questionSetStore.createIndex('version', 'version')
        questionSetStore.createIndex('lastUpdated', 'lastUpdated')
      }

      // Exam Attempts store (in-progress exams)
      if (!db.objectStoreNames.contains(STORES.EXAM_ATTEMPTS)) {
        const attemptStore = db.createObjectStore(STORES.EXAM_ATTEMPTS, {
          keyPath: 'id'
        })
        attemptStore.createIndex('userId', 'userId')
        attemptStore.createIndex('questionSetId', 'questionSetId')
        attemptStore.createIndex('status', 'status')
        attemptStore.createIndex('startedAt', 'startedAt')
      }

      // Exam Results store (completed exams)
      if (!db.objectStoreNames.contains(STORES.EXAM_RESULTS)) {
        const resultStore = db.createObjectStore(STORES.EXAM_RESULTS, {
          keyPath: 'id'
        })
        resultStore.createIndex('userId', 'userId')
        resultStore.createIndex('questionSetId', 'questionSetId')
        resultStore.createIndex('completedAt', 'completedAt')
      }
    }
  })

  console.log('✅ IndexedDB initialized')
  return dbPromise
}

export const indexedDBService = {
  /**
   * Store a question set
   */
  async setQuestionSet(questionSet) {
    const db = await initDB()
    await db.put(STORES.QUESTION_SETS, {
      ...questionSet,
      lastUpdated: Date.now()
    })
    console.log(`✅ Question set stored: ${questionSet.id}`)
  },

  /**
   * Get a question set by ID
   */
  async getQuestionSet(id) {
    const db = await initDB()
    const questionSet = await db.get(STORES.QUESTION_SETS, id)
    if (questionSet) {
      console.log(`📦 Question set loaded: ${id}`)
    }
    return questionSet
  },

  /**
   * Get all question sets for an exam type
   */
  async getQuestionSetsByExamType(examTypeId) {
    const db = await initDB()
    return db.getAllFromIndex(STORES.QUESTION_SETS, 'examTypeId', examTypeId)
  },

  /**
   * Delete a question set
   */
  async deleteQuestionSet(id) {
    const db = await initDB()
    await db.delete(STORES.QUESTION_SETS, id)
    console.log(`🗑️ Question set deleted: ${id}`)
  },

  /**
   * Store an exam attempt (in-progress)
   */
  async setExamAttempt(attempt) {
    const db = await initDB()
    await db.put(STORES.EXAM_ATTEMPTS, {
      ...attempt,
      updatedAt: Date.now()
    })
    console.log(`✅ Exam attempt saved: ${attempt.id}`)
  },

  /**
   * Get an exam attempt by ID
   */
  async getExamAttempt(id) {
    const db = await initDB()
    return db.get(STORES.EXAM_ATTEMPTS, id)
  },

  /**
   * Get all exam attempts for a user
   */
  async getExamAttemptsByUser(userId) {
    const db = await initDB()
    return db.getAllFromIndex(STORES.EXAM_ATTEMPTS, 'userId', userId)
  },

  /**
   * Delete an exam attempt
   */
  async deleteExamAttempt(id) {
    const db = await initDB()
    await db.delete(STORES.EXAM_ATTEMPTS, id)
  },

  /**
   * Store an exam result (completed)
   */
  async setExamResult(result) {
    const db = await initDB()
    await db.put(STORES.EXAM_RESULTS, result)
    console.log(`✅ Exam result saved: ${result.id}`)
  },

  /**
   * Get an exam result by ID
   */
  async getExamResult(id) {
    const db = await initDB()
    return db.get(STORES.EXAM_RESULTS, id)
  },

  /**
   * Get all exam results for a user and question set
   */
  async getExamResultsByUserAndSet(userId, questionSetId) {
    const db = await initDB()
    const allResults = await db.getAllFromIndex(STORES.EXAM_RESULTS, 'userId', userId)
    return allResults.filter(r => r.questionSetId === questionSetId)
  },

  /**
   * Get all exam results for a user
   */
  async getExamResultsByUser(userId) {
    const db = await initDB()
    return db.getAllFromIndex(STORES.EXAM_RESULTS, 'userId', userId)
  },

  /**
   * Clear all data (for testing/debugging)
   */
  async clearAll() {
    const db = await initDB()
    await db.clear(STORES.QUESTION_SETS)
    await db.clear(STORES.EXAM_ATTEMPTS)
    await db.clear(STORES.EXAM_RESULTS)
    console.log('🗑️ All IndexedDB data cleared')
  },

  /**
   * Get database statistics
   */
  async getStats() {
    const db = await initDB()
    const questionSetsCount = await db.count(STORES.QUESTION_SETS)
    const attemptsCount = await db.count(STORES.EXAM_ATTEMPTS)
    const resultsCount = await db.count(STORES.EXAM_RESULTS)
    
    return {
      questionSets: questionSetsCount,
      attempts: attemptsCount,
      results: resultsCount
    }
  }
}

export default indexedDBService

