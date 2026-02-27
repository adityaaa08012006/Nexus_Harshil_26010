import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Godam Solutions API is running',
    timestamp: new Date().toISOString()
  })
})

// Import routes (to be created)
// app.use('/api/auth', authRoutes)
// app.use('/api/inventory', inventoryRoutes)
// app.use('/api/sensors', sensorRoutes)
// app.use('/api/allocation', allocationRoutes)
// app.use('/api/contacts', contactRoutes)
// app.use('/api/pdf-parse', pdfParseRoutes)

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`)
  console.log(`📡 API Health: http://localhost:${PORT}/api/health`)
})

export default app
