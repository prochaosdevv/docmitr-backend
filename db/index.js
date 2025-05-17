// In-memory database
export const db = {
  users: [],
  patients: [],
  doctors: [],
  appointments: [],
  staff: [],
  medicalRecords: [],
  vitals: [],
}

// Helper functions to work with the database
export const findById = (collection, id) => {
  return db[collection].find((item) => item.id === id)
}

export const findAll = (collection, query = {}) => {
  let results = [...db[collection]]

  // Apply filters if provided
  if (query.search) {
    const searchLower = query.search.toLowerCase()
    results = results.filter(
      (item) =>
        (item.name && item.name.toLowerCase().includes(searchLower)) ||
        (item.firstName && item.firstName.toLowerCase().includes(searchLower)) ||
        (item.lastName && item.lastName.toLowerCase().includes(searchLower)) ||
        (item.email && item.email.toLowerCase().includes(searchLower)),
    )
  }

  // Apply pagination
  const page = Number.parseInt(query.page) || 1
  const limit = Number.parseInt(query.limit) || 10
  const startIndex = (page - 1) * limit
  const endIndex = page * limit

  const paginatedResults = {
    data: results.slice(startIndex, endIndex),
    pagination: {
      total: results.length,
      page,
      limit,
      pages: Math.ceil(results.length / limit),
    },
  }

  return paginatedResults
}

export const create = (collection, item) => {
  const newItem = { ...item, id: generateId() }
  db[collection].push(newItem)
  return newItem
}

export const update = (collection, id, updates) => {
  const index = db[collection].findIndex((item) => item.id === id)
  if (index !== -1) {
    db[collection][index] = { ...db[collection][index], ...updates }
    return db[collection][index]
  }
  return null
}

export const remove = (collection, id) => {
  const index = db[collection].findIndex((item) => item.id === id)
  if (index !== -1) {
    const removed = db[collection][index]
    db[collection].splice(index, 1)
    return removed
  }
  return null
}

// Helper function to generate unique IDs
const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}
