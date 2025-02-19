document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("todoForm");
  const input = document.getElementById("taskInput");
  const list = document.getElementById("todoList");

  // Load todos on startup
  fetchTodos();

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!input.value.trim()) return;

    await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task: input.value }),
    });

    input.value = "";
    fetchTodos();
  });

  async function fetchTodos() {
    const response = await fetch("/api/todos");
    const todos = await response.json();
    renderTodos(todos);
  }

  function renderTodos(todos) {
    list.innerHTML = "";
    todos.forEach((todo) => {
      const li = document.createElement("li");
      li.className = `group flex items-center p-4 rounded-xl ${
        todo.completed
          ? "bg-green-50 border-2 border-green-200"
          : "bg-white border-2 border-blue-50 hover:border-blue-100"
      } transition-all duration-300 shadow-sm hover:shadow-md`;

      li.innerHTML = `
            <div class="flex items-center flex-1">
                <input 
                    type="checkbox" 
                    class="w-5 h-5 mr-4 rounded-full border-2 border-blue-400 checked:bg-blue-600 checked:border-blue-600 cursor-pointer transition-colors"
                    ${todo.completed ? "checked" : ""}
                    onchange="toggleTodo(${todo.id}, ${todo.completed})"
                >
                <span class="todo-text text-lg ${
                  todo.completed
                    ? "line-through text-gray-400"
                    : "text-gray-700"
                }">${todo.task}</span>
            </div>
            <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                    onclick="editTodo(${todo.id})"
                    class="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors"
                >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                    </svg>
                </button>
                <button 
                    onclick="deleteTodo(${todo.id})"
                    class="p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 transition-colors"
                >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                </button>
            </div>
        `;
      list.appendChild(li);
    });
  }

  window.toggleTodo = async (id, currentStatus) => {
    const checkbox = event.target;
    checkbox.disabled = true; // Prevent multiple clicks

    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !currentStatus }),
      });

      if (!response.ok) throw new Error("Update failed");

      // Visual feedback
      checkbox.parentElement.classList.toggle("completed");
      setTimeout(() => {
        fetchTodos(); // Full refresh after animation
      }, 300);
    } catch (error) {
      console.error("Toggle error:", error);
      checkbox.checked = currentStatus; // Revert visual state
      alert("Failed to update status");
    } finally {
      checkbox.disabled = false;
    }
  };
  window.deleteTodo = async (id) => {
    await fetch(`/api/todos/${id}`, { method: "DELETE" });
    fetchTodos();
  };

  window.editTodo = async (id) => {
    const newTask = prompt("Edit task:");
    if (newTask) {
      await fetch(`/api/todos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: newTask }),
      });
      fetchTodos();
    }
  };
});
