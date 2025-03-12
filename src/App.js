"use client"

// Filename: App.jsx
// Code enhanced by: v0

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import confetti from "canvas-confetti"
import "./App.css"
// import levelUpSound from "./assets/level-up.mp3"
// import completeSound from "./assets/complete.mp3"
// import addSound from "./assets/add.mp3"

// Game characters
const characters = [
  { level: 1, name: "Novice Adventurer", image: "/placeholder.svg?height=80&width=80" },
  { level: 5, name: "Apprentice Hero", image: "/placeholder.svg?height=80&width=80" },
  { level: 10, name: "Skilled Warrior", image: "/placeholder.svg?height=80&width=80" },
  { level: 15, name: "Veteran Champion", image: "/placeholder.svg?height=80&width=80" },
  { level: 20, name: "Legendary Master", image: "/placeholder.svg?height=80&width=80" },
]

function App() {
  // Game state
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem("tasks")
    return savedTasks
      ? JSON.parse(savedTasks)
      : [
          {
            id: 1,
            task: "50 dossier",
            status: "Not Started",
            xp: 100,
            createdAt: new Date().toISOString(),
          },
        ]
  })

  const [playerStats, setPlayerStats] = useState(() => {
    const savedStats = localStorage.getItem("playerStats")
    return savedStats
      ? JSON.parse(savedStats)
      : {
          level: 1,
          xp: 0,
          totalXp: 0,
          tasksCompleted: 0,
          streak: 0,
          lastCompleted: null,
        }
  })

  const [newTaskXp, setNewTaskXp] = useState(100)
  const [showLevelUp, setShowLevelUp] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [taskInput, setTaskInput] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)

  // Sound effects
  // const levelUpAudio = new Audio(levelUpSound)
  // const completeAudio = new Audio(completeSound)
  // const addAudio = new Audio(addSound)

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks))
    localStorage.setItem("playerStats", JSON.stringify(playerStats))
  }, [tasks, playerStats])

  // Calculate XP needed for next level
  const getXpForNextLevel = (level) => {
    return Math.floor(100 * Math.pow(1.5, level - 1))
  }

  // Get current character based on level
  const getCurrentCharacter = () => {
    for (let i = characters.length - 1; i >= 0; i--) {
      if (playerStats.level >= characters[i].level) {
        return characters[i]
      }
    }
    return characters[0]
  }

  // Add a new task
  const addTask = (taskText) => {
    if (!taskText.trim()) return

    // addAudio.play()

    const newTask = {
      id: Date.now(),
      task: taskText,
      status: "Not Started",
      xp: newTaskXp,
      createdAt: new Date().toISOString(),
    }

    setTasks([...tasks, newTask])
    setTaskInput("")
    setIsFormOpen(false)
  }

  // Delete a task
  const deleteTask = (taskId) => {
    setTasks(tasks.filter((task) => task.id !== taskId))
  }

  // Change task status
  const handleStatusChange = (id, newStatus) => {
    const taskIndex = tasks.findIndex((task) => task.id === id)

    if (taskIndex === -1) return

    const updatedTasks = [...tasks]
    const oldStatus = updatedTasks[taskIndex].status
    updatedTasks[taskIndex].status = newStatus

    // If task is newly completed
    if (newStatus === "Done" && oldStatus !== "Done") {
      completeTask(updatedTasks[taskIndex])
    }

    setTasks(updatedTasks)
  }

  // Complete a task and earn XP
  const completeTask = (task) => {
    // completeAudio.play()
    setShowConfetti(true)

    setTimeout(() => {
      setShowConfetti(false)
    }, 2500)

    // Launch confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    })

    // Update player stats
    const xpGained = task.xp
    const newTotalXp = playerStats.totalXp + xpGained
    const newTasksCompleted = playerStats.tasksCompleted + 1

    // Check for streak
    const today = new Date().toDateString()
    const lastCompletedDay = playerStats.lastCompleted ? new Date(playerStats.lastCompleted).toDateString() : null

    let newStreak = playerStats.streak
    if (lastCompletedDay !== today) {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayString = yesterday.toDateString()

      if (lastCompletedDay === yesterdayString) {
        newStreak += 1
      } else if (!lastCompletedDay) {
        newStreak = 1
      } else {
        newStreak = 1 // Reset streak if not consecutive
      }
    }

    // Calculate new level
    let { level, xp } = playerStats
    xp += xpGained

    let xpForNextLevel = getXpForNextLevel(level)
    let leveledUp = false

    // Level up if enough XP
    while (xp >= xpForNextLevel) {
      xp -= xpForNextLevel
      level += 1
      leveledUp = true
      xpForNextLevel = getXpForNextLevel(level)
    }

    if (leveledUp) {
      // levelUpAudio.play()
      setShowLevelUp(true)
      setTimeout(() => setShowLevelUp(false), 3000)
    }

    setPlayerStats({
      level,
      xp,
      totalXp: newTotalXp,
      tasksCompleted: newTasksCompleted,
      streak: newStreak,
      lastCompleted: new Date().toISOString(),
    })
  }

  // Calculate XP progress percentage
  const xpProgressPercentage = Math.min(100, Math.floor((playerStats.xp / getXpForNextLevel(playerStats.level)) * 100))

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "Done":
        return "status-done"
      case "In Progress":
        return "status-progress"
      case "Stuck":
        return "status-stuck"
      case "Not Done":
        return "status-not-done"
      default:
        return "status-not-started"
    }
  }

  // Get relative time
  const getRelativeTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now - date) / 1000)

    if (diffInSeconds < 60) return "just now"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return `${Math.floor(diffInSeconds / 86400)}d ago`
  }

  // Current character
  const currentCharacter = getCurrentCharacter()

  return (
    <div className="game-container">
      {/* Level up notification */}
      <AnimatePresence>
        {showLevelUp && (
          <motion.div
            className="level-up-notification"
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
          >
            <h2>LEVEL UP!</h2>
            <p>You've reached level {playerStats.level}!</p>
            {playerStats.level === 5 ||
            playerStats.level === 10 ||
            playerStats.level === 15 ||
            playerStats.level === 20 ? (
              <p>You've evolved to {currentCharacter.name}!</p>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confetti overlay */}
      {showConfetti && <div className="confetti-overlay"></div>}

      <div className="game-header">
        <div className="player-info">
          <div className="character-portrait">
            <img src={currentCharacter.image || "/placeholder.svg"} alt={currentCharacter.name} />
          </div>
          <div className="player-stats">
            <h2>{currentCharacter.name}</h2>
            <div className="level-info">
              <span className="level-badge">LVL {playerStats.level}</span>
              <div className="xp-bar-container">
                <div className="xp-bar" style={{ width: `${xpProgressPercentage}%` }}></div>
                <span className="xp-text">
                  {playerStats.xp} / {getXpForNextLevel(playerStats.level)} XP
                </span>
              </div>
            </div>
            <div className="stats-row">
              <div className="stat-item">
                <span className="stat-value">{playerStats.tasksCompleted}</span>
                <span className="stat-label">Quests</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{playerStats.totalXp}</span>
                <span className="stat-label">Total XP</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{playerStats.streak}</span>
                <span className="stat-label">Streak</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="game-content">
        <div className="quest-board">
          <div className="quest-header">
            <h2>Quest Board</h2>
            <button className="add-quest-btn" onClick={() => setIsFormOpen(!isFormOpen)}>
              {isFormOpen ? "Cancel" : "+ New Quest"}
            </button>
          </div>

          {/* Add task form */}
          <AnimatePresence>
            {isFormOpen && (
              <motion.div
                className="add-quest-form"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    addTask(taskInput)
                  }}
                >
                  <div className="form-group">
                    <label htmlFor="task">Quest Description</label>
                    <input
                      type="text"
                      id="task"
                      value={taskInput}
                      onChange={(e) => setTaskInput(e.target.value)}
                      placeholder="Enter your quest..."
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="xp">Quest Reward (XP)</label>
                    <div className="xp-selector">
                      <button
                        type="button"
                        className={newTaskXp === 50 ? "selected" : ""}
                        onClick={() => setNewTaskXp(50)}
                      >
                        Easy (50 XP)
                      </button>
                      <button
                        type="button"
                        className={newTaskXp === 100 ? "selected" : ""}
                        onClick={() => setNewTaskXp(100)}
                      >
                        Normal (100 XP)
                      </button>
                      <button
                        type="button"
                        className={newTaskXp === 200 ? "selected" : ""}
                        onClick={() => setNewTaskXp(200)}
                      >
                        Hard (200 XP)
                      </button>
                    </div>
                  </div>

                  <button type="submit" className="submit-quest-btn">
                    Add Quest
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Task list */}
          <div className="quest-list">
            <AnimatePresence>
              {tasks.length === 0 ? (
                <div className="empty-quests">
                  <p>No quests available. Add a new quest to begin your adventure!</p>
                </div>
              ) : (
                tasks.map((task) => (
                  <motion.div
                    key={task.id}
                    className={`quest-item ${task.status === "Done" ? "completed" : ""}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="quest-content">
                      <div className="quest-info">
                        <h3>{task.task}</h3>
                        <div className="quest-meta">
                          <span className="quest-xp">{task.xp} XP</span>
                          <span className="quest-time">{getRelativeTime(task.createdAt)}</span>
                        </div>
                      </div>

                      <div className="quest-actions">
                        <div className="status-selector">
                          <select
                            className={getStatusColor(task.status)}
                            value={task.status}
                            onChange={(e) => handleStatusChange(task.id, e.target.value)}
                          >
                            <option value="Not Started">Not Started</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Stuck">Stuck</option>
                            <option value="Done">Done</option>
                            <option value="Not Done">Not Done</option>
                          </select>
                        </div>

                        <button className="delete-quest-btn" onClick={() => deleteTask(task.id)}>
                          ×
                        </button>
                      </div>
                    </div>

                    {task.status === "Done" && (
                      <div className="quest-complete-badge">
                        <span>✓ COMPLETED</span>
                      </div>
                    )}
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="game-footer">
        <p>Quest Master v1.0 • Your Adventure Awaits</p>
      </div>
    </div>
  )
}

export default App

