import { useState } from 'react'
import Markdown from 'react-markdown'
import './App.css'

function App() {
  const [year, setYear] = useState('')
  const [month, setMonth] = useState('')
  const [day, setDay] = useState('')
  const [hour, setHour] = useState('')
  const [minute, setMinute] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showResult, setShowResult] = useState(false)

  const fetchFortune = async () => {
    if (!year || !month || !day) return

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/fortune', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year,
          month,
          day,
          ...(hour && { hour }),
          ...(minute && { minute }),
        }),
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => null)
        throw new Error(errData?.error || '서버 오류가 발생했습니다.')
      }

      const data = await response.json()
      setContent(data.content)
      setShowResult(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setYear('')
    setMonth('')
    setDay('')
    setHour('')
    setMinute('')
    setContent('')
    setError('')
    setShowResult(false)
  }

  return (
    <div className="app">
      <header className="header">
        <h1 className="title">Lucky By Birthday</h1>
        <p className="subtitle">AI 사주풀이로 나만의 행운 번호를 찾아보세요</p>
      </header>

      <main className="main">
        {!showResult ? (
          <div className="form-card">
            <h2 className="form-title">생년월일을 입력하세요</h2>

            <div className="input-group">
              <label className="input-label">생년월일 (필수)</label>
              <div className="date-inputs">
                <div className="input-wrapper">
                  <input
                    type="number"
                    placeholder="1990"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    min="1900"
                    max="2026"
                    className="input"
                    disabled={loading}
                  />
                  <span className="input-suffix">년</span>
                </div>
                <div className="input-wrapper">
                  <input
                    type="number"
                    placeholder="1"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    min="1"
                    max="12"
                    className="input"
                    disabled={loading}
                  />
                  <span className="input-suffix">월</span>
                </div>
                <div className="input-wrapper">
                  <input
                    type="number"
                    placeholder="1"
                    value={day}
                    onChange={(e) => setDay(e.target.value)}
                    min="1"
                    max="31"
                    className="input"
                    disabled={loading}
                  />
                  <span className="input-suffix">일</span>
                </div>
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">태어난 시간 (선택)</label>
              <div className="time-inputs">
                <div className="input-wrapper">
                  <input
                    type="number"
                    placeholder="0"
                    value={hour}
                    onChange={(e) => setHour(e.target.value)}
                    min="0"
                    max="23"
                    className="input"
                    disabled={loading}
                  />
                  <span className="input-suffix">시</span>
                </div>
                <div className="input-wrapper">
                  <input
                    type="number"
                    placeholder="0"
                    value={minute}
                    onChange={(e) => setMinute(e.target.value)}
                    min="0"
                    max="59"
                    className="input"
                    disabled={loading}
                  />
                  <span className="input-suffix">분</span>
                </div>
              </div>
            </div>

            {error && <p className="error-message">{error}</p>}

            <button
              className="submit-btn"
              onClick={fetchFortune}
              disabled={!year || !month || !day || loading}
            >
              {loading ? (
                <span className="loading-content">
                  <span className="spinner" />
                  사주 분석 중...
                </span>
              ) : (
                '사주풀이 & 행운 번호 받기'
              )}
            </button>
          </div>
        ) : (
          <div className="result-card">
            <div className="result-header">
              <h2 className="result-title">사주풀이 결과</h2>
              <p className="result-date">
                {year}년 {month}월 {day}일
                {hour && minute ? ` ${hour}시 ${minute}분` : hour ? ` ${hour}시` : ''} 생
              </p>
            </div>

            <div className="fortune-content">
              <Markdown>{content}</Markdown>
            </div>

            <button className="retry-btn" onClick={reset}>
              다시 하기
            </button>
          </div>
        )}
      </main>

      <footer className="footer">
        <p>* 본 서비스는 재미를 위한 것이며, 당첨을 보장하지 않습니다.</p>
      </footer>
    </div>
  )
}

export default App
