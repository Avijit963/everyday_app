// Application State
let todos = JSON.parse(localStorage.getItem("todos")) || []
let incomeEntries = JSON.parse(localStorage.getItem("incomeEntries")) || []
let expenseEntries = JSON.parse(localStorage.getItem("expenseEntries")) || []
let currentTodoFilter = "all"

// DOM Elements
const navLinks = document.querySelectorAll(".nav-link")
const sections = document.querySelectorAll(".section")
const hamburger = document.querySelector(".hamburger")
const navMenu = document.querySelector(".nav-menu")

// Initialize App
document.addEventListener("DOMContentLoaded", () => {
  initializeNavigation()
  initializeTodos()
  initializeIncome()
  initializeExpenses()
  updateDashboard()
  setDefaultDates()
})

// Navigation Functions
function initializeNavigation() {
  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault()
      const targetSection = this.getAttribute("data-section")
      showSection(targetSection)

      // Update active nav link
      navLinks.forEach((l) => l.classList.remove("active"))
      this.classList.add("active")

      // Close mobile menu
      navMenu.classList.remove("active")
    })
  })

  // Mobile menu toggle
  hamburger.addEventListener("click", () => {
    navMenu.classList.toggle("active")
  })
}

function showSection(sectionId) {
  sections.forEach((section) => {
    section.classList.remove("active")
  })
  document.getElementById(sectionId).classList.add("active")

  // Update dashboard when showing home
  if (sectionId === "home") {
    updateDashboard()
  }
}

// Utility Functions
function setDefaultDates() {
  const today = new Date().toISOString().split("T")[0]
  document.getElementById("incomeDate").value = today
  document.getElementById("expenseDate").value = today
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount)
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function getCurrentMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
}

function getLastMonth() {
  const now = new Date()
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  return `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, "0")}`
}

// Todo Functions
function initializeTodos() {
  const todoInput = document.getElementById("todoInput")
  const addTodoBtn = document.getElementById("addTodoBtn")
  const filterBtns = document.querySelectorAll(".filter-btn")

  addTodoBtn.addEventListener("click", addTodo)
  todoInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      addTodo()
    }
  })

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      filterBtns.forEach((b) => b.classList.remove("active"))
      this.classList.add("active")
      currentTodoFilter = this.getAttribute("data-filter")
      renderTodos()
    })
  })

  renderTodos()
}

function addTodo() {
  const todoInput = document.getElementById("todoInput")
  const text = todoInput.value.trim()

  if (text === "") {
    alert("Please enter a todo item")
    return
  }

  const todo = {
    id: Date.now(),
    text: text,
    completed: false,
    createdAt: new Date().toISOString(),
  }

  todos.unshift(todo)
  saveTodos()
  todoInput.value = ""
  renderTodos()
  updateDashboard()
}

function toggleTodo(id) {
  todos = todos.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo))
  saveTodos()
  renderTodos()
  updateDashboard()
}

function deleteTodo(id) {
  if (confirm("Are you sure you want to delete this todo?")) {
    todos = todos.filter((todo) => todo.id !== id)
    saveTodos()
    renderTodos()
    updateDashboard()
  }
}

function renderTodos() {
  const todoList = document.getElementById("todoList")
  let filteredTodos = todos

  if (currentTodoFilter === "active") {
    filteredTodos = todos.filter((todo) => !todo.completed)
  } else if (currentTodoFilter === "completed") {
    filteredTodos = todos.filter((todo) => todo.completed)
  }

  if (filteredTodos.length === 0) {
    todoList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-tasks"></i>
                <h3>No todos found</h3>
                <p>Add a new todo to get started!</p>
            </div>
        `
    return
  }

  todoList.innerHTML = filteredTodos
    .map(
      (todo) => `
        <div class="todo-item slide-in">
            <input type="checkbox" class="todo-checkbox" ${todo.completed ? "checked" : ""} 
                   onchange="toggleTodo(${todo.id})">
            <span class="todo-text ${todo.completed ? "completed" : ""}">${todo.text}</span>
            <span class="todo-date">${formatDate(todo.createdAt)}</span>
            <button class="todo-delete" onclick="deleteTodo(${todo.id})">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `,
    )
    .join("")
}

function saveTodos() {
  localStorage.setItem("todos", JSON.stringify(todos))
}

// Income Functions
function initializeIncome() {
  const addIncomeBtn = document.getElementById("addIncomeBtn")
  addIncomeBtn.addEventListener("click", addIncome)

  // Add enter key support for income inputs
  ;["incomeAmount", "incomeSource"].forEach((id) => {
    document.getElementById(id).addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        addIncome()
      }
    })
  })

  renderIncome()
  updateIncomeSummary()
}

function addIncome() {
  const date = document.getElementById("incomeDate").value
  const amount = Number.parseFloat(document.getElementById("incomeAmount").value)
  const source = document.getElementById("incomeSource").value.trim()

  if (!date || !amount || amount <= 0 || !source) {
    alert("Please fill in all fields with valid values")
    return
  }

  const income = {
    id: Date.now(),
    date: date,
    amount: amount,
    source: source,
    createdAt: new Date().toISOString(),
  }

  incomeEntries.unshift(income)
  saveIncome()

  // Clear inputs
  document.getElementById("incomeAmount").value = ""
  document.getElementById("incomeSource").value = ""

  renderIncome()
  updateIncomeSummary()
  updateDashboard()
}

function deleteIncome(id) {
  if (confirm("Are you sure you want to delete this income entry?")) {
    incomeEntries = incomeEntries.filter((income) => income.id !== id)
    saveIncome()
    renderIncome()
    updateIncomeSummary()
    updateDashboard()
  }
}

function renderIncome() {
  const incomeList = document.getElementById("incomeList")

  if (incomeEntries.length === 0) {
    incomeList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-dollar-sign"></i>
                <h3>No income entries</h3>
                <p>Start tracking your income today!</p>
            </div>
        `
    return
  }

  incomeList.innerHTML = incomeEntries
    .map(
      (income) => `
        <div class="income-item slide-in">
            <span class="item-date">${formatDate(income.date)}</span>
            <div class="item-details">
                <div class="item-source">${income.source}</div>
            </div>
            <span class="item-amount income">${formatCurrency(income.amount)}</span>
            <button class="item-delete" onclick="deleteIncome(${income.id})">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `,
    )
    .join("")
}

function updateIncomeSummary() {
  const currentMonth = getCurrentMonth()
  const lastMonth = getLastMonth()

  const currentMonthIncome = incomeEntries
    .filter((income) => income.date.startsWith(currentMonth))
    .reduce((sum, income) => sum + income.amount, 0)

  const lastMonthIncome = incomeEntries
    .filter((income) => income.date.startsWith(lastMonth))
    .reduce((sum, income) => sum + income.amount, 0)

  const totalIncome = incomeEntries.reduce((sum, income) => sum + income.amount, 0)

  document.getElementById("currentMonthIncome").textContent = formatCurrency(currentMonthIncome)
  document.getElementById("lastMonthIncome").textContent = formatCurrency(lastMonthIncome)
  document.getElementById("totalIncome").textContent = formatCurrency(totalIncome)
}

function saveIncome() {
  localStorage.setItem("incomeEntries", JSON.stringify(incomeEntries))
}

// Expense Functions
function initializeExpenses() {
  const addExpenseBtn = document.getElementById("addExpenseBtn")
  addExpenseBtn.addEventListener("click", addExpense)

  // Add enter key support for expense inputs
  ;["expenseAmount", "expenseDescription"].forEach((id) => {
    document.getElementById(id).addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        addExpense()
      }
    })
  })

  renderExpenses()
  updateExpenseSummary()
}

function addExpense() {
  const date = document.getElementById("expenseDate").value
  const amount = Number.parseFloat(document.getElementById("expenseAmount").value)
  const category = document.getElementById("expenseCategory").value
  const description = document.getElementById("expenseDescription").value.trim()

  if (!date || !amount || amount <= 0 || !description) {
    alert("Please fill in all fields with valid values")
    return
  }

  const expense = {
    id: Date.now(),
    date: date,
    amount: amount,
    category: category,
    description: description,
    createdAt: new Date().toISOString(),
  }

  expenseEntries.unshift(expense)
  saveExpenses()

  // Clear inputs
  document.getElementById("expenseAmount").value = ""
  document.getElementById("expenseDescription").value = ""

  renderExpenses()
  updateExpenseSummary()
  updateDashboard()
}

function deleteExpense(id) {
  if (confirm("Are you sure you want to delete this expense entry?")) {
    expenseEntries = expenseEntries.filter((expense) => expense.id !== id)
    saveExpenses()
    renderExpenses()
    updateExpenseSummary()
    updateDashboard()
  }
}

function renderExpenses() {
  const expenseList = document.getElementById("expenseList")

  if (expenseEntries.length === 0) {
    expenseList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-receipt"></i>
                <h3>No expense entries</h3>
                <p>Start tracking your expenses today!</p>
            </div>
        `
    return
  }

  expenseList.innerHTML = expenseEntries
    .map(
      (expense) => `
        <div class="expense-item slide-in">
            <span class="item-date">${formatDate(expense.date)}</span>
            <div class="item-details">
                <div class="item-category">${expense.category}</div>
                <div class="item-description">${expense.description}</div>
            </div>
            <span class="item-amount expense">${formatCurrency(expense.amount)}</span>
            <button class="item-delete" onclick="deleteExpense(${expense.id})">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `,
    )
    .join("")
}

function updateExpenseSummary() {
  const currentMonth = getCurrentMonth()
  const lastMonth = getLastMonth()

  const currentMonthExpenses = expenseEntries
    .filter((expense) => expense.date.startsWith(currentMonth))
    .reduce((sum, expense) => sum + expense.amount, 0)

  const lastMonthExpenses = expenseEntries
    .filter((expense) => expense.date.startsWith(lastMonth))
    .reduce((sum, expense) => sum + expense.amount, 0)

  const totalExpenses = expenseEntries.reduce((sum, expense) => sum + expense.amount, 0)

  document.getElementById("currentMonthExpenses").textContent = formatCurrency(currentMonthExpenses)
  document.getElementById("lastMonthExpenses").textContent = formatCurrency(lastMonthExpenses)
  document.getElementById("totalExpenses").textContent = formatCurrency(totalExpenses)
}

function saveExpenses() {
  localStorage.setItem("expenseEntries", JSON.stringify(expenseEntries))
}

// Dashboard Functions
function updateDashboard() {
  updateDashboardStats()
  updateRecentActivity()
}

function updateDashboardStats() {
  const currentMonth = getCurrentMonth()

  // Active todos count
  const activeTodos = todos.filter((todo) => !todo.completed).length
  document.getElementById("activeTodos").textContent = activeTodos

  // Monthly income
  const monthlyIncome = incomeEntries
    .filter((income) => income.date.startsWith(currentMonth))
    .reduce((sum, income) => sum + income.amount, 0)
  document.getElementById("monthlyIncome").textContent = formatCurrency(monthlyIncome)

  // Monthly expenses
  const monthlyExpenses = expenseEntries
    .filter((expense) => expense.date.startsWith(currentMonth))
    .reduce((sum, expense) => sum + expense.amount, 0)
  document.getElementById("monthlyExpenses").textContent = formatCurrency(monthlyExpenses)

  // Net balance
  const netBalance = monthlyIncome - monthlyExpenses
  const netBalanceElement = document.getElementById("netBalance")
  netBalanceElement.textContent = formatCurrency(netBalance)
  netBalanceElement.className = `stat-number ${netBalance >= 0 ? "text-green" : "text-red"}`
}

function updateRecentActivity() {
  const recentActivity = document.getElementById("recentActivity")

  // Combine all activities and sort by date
  const allActivities = [
    ...todos.slice(0, 3).map((todo) => ({
      type: "todo",
      text: `${todo.completed ? "Completed" : "Added"} todo: ${todo.text}`,
      date: todo.createdAt,
      icon: "fas fa-tasks",
    })),
    ...incomeEntries.slice(0, 3).map((income) => ({
      type: "income",
      text: `Added income: ${income.source} - ${formatCurrency(income.amount)}`,
      date: income.createdAt,
      icon: "fas fa-arrow-up",
    })),
    ...expenseEntries.slice(0, 3).map((expense) => ({
      type: "expense",
      text: `Added expense: ${expense.category} - ${formatCurrency(expense.amount)}`,
      date: expense.createdAt,
      icon: "fas fa-arrow-down",
    })),
  ]

  // Sort by date (newest first) and take top 5
  allActivities.sort((a, b) => new Date(b.date) - new Date(a.date))
  const recentActivities = allActivities.slice(0, 5)

  if (recentActivities.length === 0) {
    recentActivity.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-clock"></i>
                <h3>No recent activity</h3>
                <p>Start using the app to see your recent activities here!</p>
            </div>
        `
    return
  }

  recentActivity.innerHTML = recentActivities
    .map(
      (activity) => `
        <div class="activity-item fade-in">
            <div class="activity-icon ${activity.type}">
                <i class="${activity.icon}"></i>
            </div>
            <div class="activity-details">
                <div class="activity-text">${activity.text}</div>
                <div class="activity-date">${formatDate(activity.date)}</div>
            </div>
        </div>
    `,
    )
    .join("")
}

// Export/Import Functions (Bonus Feature)
function exportData() {
  const data = {
    todos: todos,
    incomeEntries: incomeEntries,
    expenseEntries: expenseEntries,
    exportDate: new Date().toISOString(),
  }

  const dataStr = JSON.stringify(data, null, 2)
  const dataBlob = new Blob([dataStr], { type: "application/json" })

  const link = document.createElement("a")
  link.href = URL.createObjectURL(dataBlob)
  link.download = `finance-app-backup-${new Date().toISOString().split("T")[0]}.json`
  link.click()
}

// Make functions globally available
window.toggleTodo = toggleTodo
window.deleteTodo = deleteTodo
window.deleteIncome = deleteIncome
window.deleteExpense = deleteExpense
window.exportData = exportData
