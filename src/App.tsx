import { useState, useEffect } from "react";

interface Todolist {
    id: string;
    title: string;
    isCompleted: boolean;
}

function App() {
    const [userInput, setUserInput] = useState("");
    const [todos, setTodos] = useState<Todolist[]>(() => {
        const savedTodos = localStorage.getItem("todos");
        return savedTodos ? JSON.parse(savedTodos) : [];
    });

    // 過去に一度でもタスクが存在したかどうかのフラグ
    const [hasStarted, setHasStarted] = useState<boolean>(() => {
        const savedFlag = localStorage.getItem("hasStarted");
        return savedFlag ? JSON.parse(savedFlag) : false;
    });

    useEffect(() => {
        localStorage.setItem("todos", JSON.stringify(todos));
    }, [todos]);

    // 💡 フラグが変化したときも localStorage に保存する
    useEffect(() => {
        localStorage.setItem("hasStarted", JSON.stringify(hasStarted));
    }, [hasStarted]);

    const addToList = () => {
        if (!userInput.trim()) return;

        const newTodo: Todolist = {
            id: crypto.randomUUID(),
            title: userInput,
            isCompleted: false,
        };

        setTodos([...todos, newTodo]);
        setUserInput("");

        setHasStarted(true);
    };

    const deleteTodo = (id: string) => {
        setTodos(todos.filter((todo) => todo.id !== id));
    };

    const toggleComplete = (id: string) => {
        setTodos(
            todos.map((todo) =>
                todo.id === id
                    ? { ...todo, isCompleted: !todo.isCompleted }
                    : todo,
            ),
        );
    };

    const clearAll = () => {
        setTodos([]);
    };

    return (
        <div
            style={{
                backgroundColor: "#000000",
                color: "#ffffff",
                minHeight: "100vh",
                padding: "40px 20px",
                fontFamily: "'Courier New', Courier, monospace, sans-serif",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                boxSizing: "border-box",
            }}
        >
            <div style={{ textAlign: "center", marginBottom: "40px" }}>
                <h1
                    style={{
                        fontSize: "2.5rem",
                        fontWeight: "900",
                        color: "#00ffff",
                        textShadow:
                            "0 0 10px #00ffff, 0 0 20px #00ffff, 0 0 40px #ff00ff",
                        letterSpacing: "4px",
                        margin: "0 0 10px 0",
                        textTransform: "uppercase",
                    }}
                >
                    ⚡️ ABSOLUTE TODO ⚡️
                </h1>
                <p
                    style={{
                        color: "#ff00ff",
                        fontSize: "0.9rem",
                        fontWeight: "bold",
                        textShadow: "0 0 5px #ff00ff",
                        letterSpacing: "2px",
                    }}
                >
                    ⚠️ 警告:
                    登録したタスクは、直ちに完遂せよ。遅延は敗北を意味する。
                </p>
            </div>

            <div
                style={{
                    width: "100%",
                    maxWidth: "500px",
                    backgroundColor: "#0d0d0d",
                    border: "3px solid #ff4500",
                    borderRadius: "0px",
                    padding: "24px",
                    boxShadow: "0 0 20px #ff4500, inset 0 0 10px #ff4500",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        gap: "12px",
                        marginBottom: "24px",
                    }}
                >
                    <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="貴殿の義務を入力するのだ！"
                        style={{
                            flex: 1,
                            padding: "12px",
                            backgroundColor: "#1a1a1a",
                            border: "2px solid #00ffff",
                            color: "#ffff00",
                            fontWeight: "bold",
                            fontSize: "1rem",
                            outline: "none",
                            boxShadow: "0 0 8px #00ffff",
                        }}
                    />
                    <button
                        onClick={addToList}
                        style={{
                            padding: "12px 24px",
                            backgroundColor: "#00ffff",
                            color: "#000000",
                            border: "none",
                            fontWeight: "900",
                            fontSize: "1rem",
                            cursor: "pointer",
                            boxShadow: "0 0 12px #00ffff",
                            textTransform: "uppercase",
                        }}
                    >
                        生成
                    </button>
                </div>

                {todos.length > 0 && (
                    <button
                        onClick={clearAll}
                        style={{
                            width: "100%",
                            marginBottom: "24px",
                            padding: "10px",
                            backgroundColor: "#ff0055",
                            color: "#ffffff",
                            border: "2px solid #ffffff",
                            fontWeight: "bold",
                            fontSize: "0.9rem",
                            letterSpacing: "3px",
                            cursor: "pointer",
                            boxShadow: "0 0 15px #ff0055",
                            textTransform: "uppercase",
                        }}
                    >
                        💥 全タスク強制破棄（現実逃避） 💥
                    </button>
                )}

                <ul style={{ padding: 0, margin: 0 }}>
                    {todos.map((todo) => (
                        <li
                            key={todo.id}
                            style={{
                                listStyle: "none",
                                marginBottom: "12px",
                                backgroundColor: todo.isCompleted
                                    ? "#051a05"
                                    : "#1a0000",
                                border: todo.isCompleted
                                    ? "2px solid #00ff00"
                                    : "2px solid #ff0000",
                                boxShadow: todo.isCompleted
                                    ? "0 0 10px #00ff00"
                                    : "0 0 10px #ff0000",
                                padding: "14px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "12px",
                                    flex: 1,
                                }}
                            >
                                <input
                                    type="checkbox"
                                    checked={todo.isCompleted}
                                    onChange={() => toggleComplete(todo.id)}
                                    style={{
                                        width: "20px",
                                        height: "20px",
                                        cursor: "pointer",
                                        accentColor: "#00ff00",
                                    }}
                                />
                                <span
                                    style={{
                                        fontSize: "1.1rem",
                                        fontWeight: "bold",
                                        color: todo.isCompleted
                                            ? "#00ff00"
                                            : "#ffffff",
                                        textDecoration: todo.isCompleted
                                            ? "line-through"
                                            : "none",
                                        textShadow: todo.isCompleted
                                            ? "0 0 5px #00ff00"
                                            : "none",
                                        wordBreak: "break-all",
                                    }}
                                >
                                    {todo.title}{" "}
                                    {todo.isCompleted && "【完遂】"}
                                </span>
                            </div>

                            <button
                                onClick={() => deleteTodo(todo.id)}
                                style={{
                                    marginLeft: "12px",
                                    padding: "6px 12px",
                                    backgroundColor: "transparent",
                                    color: "#ff4500",
                                    border: "1px solid #ff4500",
                                    fontWeight: "bold",
                                    cursor: "pointer",
                                    boxShadow: "0 0 5px #ff4500",
                                }}
                            >
                                抹消
                            </button>
                        </li>
                    ))}
                </ul>

                {/* タスクが空、かつ、一度でもタスクを入れたことがある場合のみ表示 */}
                {todos.length === 0 && hasStarted && (
                    <div
                        style={{
                            textAlign: "center",
                            padding: "20px",
                            color: "#ffff00",
                            fontWeight: "bold",
                            border: "1px dashed #ffff00",
                            textShadow: "0 0 5px #ffff00",
                        }}
                    >
                        現在、タスクは皆無だ。貴殿の従順さに感服する。
                    </div>
                )}

                {todos.length === 0 && !hasStarted && (
                    <div
                        style={{
                            textAlign: "center",
                            padding: "20px",
                            color: "#888888",
                            fontSize: "0.9rem",
                            border: "1px dashed #333333",
                        }}
                    >
                        システム待機中... 最初の命令を入力せよ。
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;
