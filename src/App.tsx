import { useState } from 'react'
import './App.css'

function App() {
  const [year, setYear] = useState('')
  const [month, setMonth] = useState('')
  const [day, setDay] = useState('')
  const [hour, setHour] = useState('')
  const [minute, setMinute] = useState('')
  const [numbers, setNumbers] = useState<number[]>([])
  const [bonusNumber, setBonusNumber] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)

  const generateLottoNumbers = () => {
    if (!year || !month || !day) return

    const seed =
      parseInt(year) * 10000 +
      parseInt(month) * 100 +
      parseInt(day) +
      (hour ? parseInt(hour) * 60 : 0) +
      (minute ? parseInt(minute) : 0)

    const generated = new Set<number>()
    let current = seed

    while (generated.size < 7) {
      current = ((current * 9301 + 49297) % 233280)
      const num = (current % 45) + 1
      generated.add(num)
    }

    const arr = Array.from(generated)
    const main = arr.slice(0, 6).sort((a, b) => a - b)
    const bonus = arr[6]

    setNumbers(main)
    setBonusNumber(bonus)
    setShowResult(true)
  }

  const reset = () => {
    setYear('')
    setMonth('')
    setDay('')
    setHour('')
    setMinute('')
    setNumbers([])
    setBonusNumber(null)
    setShowResult(false)
  }

  const getBallColor = (num: number) => {
    if (num <= 10) return 'ball-yellow'
    if (num <= 20) return 'ball-blue'
    if (num <= 30) return 'ball-red'
    if (num <= 40) return 'ball-gray'
    return 'ball-green'
  }

  return (
    <div className="app">
      <header className="header">
        <h1 className="title">Lucky By Birthday</h1>
        <p className="subtitle">생년월일로 나만의 행운 번호를 찾아보세요</p>
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
                  />
                  <span className="input-suffix">분</span>
                </div>
              </div>
            </div>

            <button
              className="submit-btn"
              onClick={generateLottoNumbers}
              disabled={!year || !month || !day}
            >
              행운 번호 받기
            </button>
          </div>
        ) : (
          <div className="result-card">
            <h2 className="result-title">당신의 행운 번호</h2>
            <p className="result-date">
              {year}년 {month}월 {day}일
              {hour && minute ? ` ${hour}시 ${minute}분` : hour ? ` ${hour}시` : ''} 생
            </p>

            <div className="balls-container">
              {numbers.map((num, i) => (
                <div key={i} className={`ball ${getBallColor(num)}`}>
                  {num}
                </div>
              ))}
              <span className="plus">+</span>
              <div className={`ball bonus ${getBallColor(bonusNumber!)}`}>
                {bonusNumber}
              </div>
            </div>

            <div className="result-info">
              <p>보너스 번호: <strong>{bonusNumber}</strong></p>
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
