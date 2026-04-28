import { useState } from "react";

function App() {
  const [task, setTask] = useState("");

  const addTask = async () => {
    await fetch(process.env.REACT_APP_API_URL + "/todos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ task }),
    });
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Todo App</h1>
      <input onChange={(e) => setTask(e.target.value)} />
      <button onClick={addTask}>Add</button>
    </div>
  );
}

export default App;