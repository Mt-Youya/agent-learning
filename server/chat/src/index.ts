import "dotenv/config"
import { createApp } from "./app.js"
import { config } from "./config.js"

const app = createApp()

app.listen(config.port, () => {
  console.log(`[@agent-learning/chat] http://localhost:${config.port}`)
  console.log(`  POST /api/chat    streaming completions`)
  console.log(`  GET  /api/health  liveness probe`)
})
