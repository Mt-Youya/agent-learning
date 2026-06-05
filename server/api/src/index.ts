import "dotenv/config"
import { createApp } from "./app.js"
import { config } from "./config.js"

const app = createApp()

app.listen(config.port, () => {
  console.log(`[@agent-learning/api] http://localhost:${config.port}`)
  console.log(`  GET /api/chapters          list all chapters`)
  console.log(`  GET /api/chapters/:slug    get chapter by slug`)
  console.log(`  GET /health                liveness probe`)
})
