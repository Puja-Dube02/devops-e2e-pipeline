let tasks = [];
let nextId = 1;

function reset() {
  tasks = [];
  nextId = 1;
}

function listTasks() {
  return tasks;
}

function addTask(title) {
  const task = { id: nextId++, title, done: false };
  tasks.push(task);
  return task;
}

function completeTask(id) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return null;
  task.done = true;
  return task;
}

module.exports = { listTasks, addTask, completeTask, reset };
