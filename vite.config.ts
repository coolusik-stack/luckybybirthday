import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import type { Plugin } from 'vite'

function loadDevVars(): Record<string, string> {
  try {
    const content = readFileSync(resolve(__dirname, '.dev.vars'), 'utf-8')
    const vars: Record<string, string> = {}
    for (const line of content.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eqIdx = trimmed.indexOf('=')
      if (eqIdx > 0) {
        vars[trimmed.slice(0, eqIdx)] = trimmed.slice(eqIdx + 1)
      }
    }
    return vars
  } catch {
    return {}
  }
}

function fortuneApiPlugin(): Plugin {
  return {
    name: 'fortune-api',
    configureServer(server) {
      const devVars = loadDevVars()

      server.middlewares.use('/api/fortune', async (req, res) => {
        if (req.method === 'OPTIONS') {
          res.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST', 'Access-Control-Allow-Headers': 'Content-Type' })
          res.end()
          return
        }

        if (req.method !== 'POST') {
          res.writeHead(405, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'Method not allowed' }))
          return
        }

        let body = ''
        req.on('data', (chunk: Buffer) => { body += chunk.toString() })
        req.on('end', async () => {
          try {
            const { year, month, day, hour, minute } = JSON.parse(body)
            if (!year || !month || !day) {
              res.writeHead(400, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ error: '생년월일은 필수입니다.' }))
              return
            }

            const birthInfo = `나는 ${year}년 ${month}월 ${day}일${hour ? ` ${hour}시` : ''}${minute ? ` ${minute}분` : ''} 생이다`

            const apiKey = process.env.OPENAI_API_KEY || devVars.OPENAI_API_KEY
            if (!apiKey) {
              res.writeHead(500, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ error: 'OPENAI_API_KEY가 설정되지 않았습니다. .dev.vars 파일을 확인하세요.' }))
              return
            }

            const apiRes = await fetch('https://api.openai.com/v1/responses', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
              },
              body: JSON.stringify({
                prompt: {
                  id: 'pmpt_69897a6089148193ba48b5d85cb9badb0ab3da406226d921',
                  version: '1',
                },
                input: [
                  {
                    role: 'user',
                    content: [{ type: 'input_text', text: birthInfo }],
                  },
                ],
                reasoning: {},
                store: true,
                include: ['reasoning.encrypted_content', 'web_search_call.action.sources'],
              }),
            })

            if (!apiRes.ok) {
              const errText = await apiRes.text()
              console.error('OpenAI API error:', errText)
              res.writeHead(502, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ error: 'AI 서비스에 문제가 발생했습니다.' }))
              return
            }

            const data: any = await apiRes.json()
            let text = ''
            if (data.output) {
              for (const item of data.output) {
                if (item.type === 'message' && item.content) {
                  for (const content of item.content) {
                    if (content.type === 'output_text') {
                      text += content.text
                    }
                  }
                }
              }
            }

            if (!text) {
              res.writeHead(502, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ error: 'AI 응답을 받지 못했습니다.' }))
              return
            }

            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ content: text }))
          } catch (err) {
            console.error('Fortune API error:', err)
            res.writeHead(500, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: '서버 오류가 발생했습니다.' }))
          }
        })
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), fortuneApiPlugin()],
  base: '/',
})
