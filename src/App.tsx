import { useState, useEffect, useMemo } from "react";
import './App.css';

// --- 型定義 ---
export type Priority = "low" | "medium" | "high";

export interface TodoItem {
    id: string;
    title: string;
    isCompleted: boolean;
    dueDate: string;
    priority: Priority;
    tags: string[];
}

export interface FilterState {
    searchQuery: string;
    showOnlyIncomplete: boolean;
    selectedTag: string | "all";
    sortBy: "dueDateAsc" | "dueDateDesc" | "priorityHigh" | "none";
}

// --- 定数 ---
const INITIAL_TODOS: TodoItem[] = [
    {
        id: "1",
        title: "ToDoアプリを作る",
        isCompleted: false,
        dueDate: "2026-05-22",
        priority: "high",
        tags: ["勉強", "React"],
    },
    {
        id: "2",
        title: "部屋の掃除",
        isCompleted: true,
        dueDate: "2026-05-20",
        priority: "low",
        tags: ["日常"],
    },
    {
        id: "3",
        title: "食材の買い出し",
        isCompleted: false,
        dueDate: "2026-05-25",
        priority: "medium",
        tags: ["日常", "買い物"],
    },
];

const PRIORITY_SCORE: Record<Priority, number> = { high: 3, medium: 2, low: 1 };

const PRIORITY_LABEL: Record<Priority, string> = {
    high: "HIGH (至高)",
    medium: "MEDIUM (普通)",
    low: "LOW (低俗)",
};

const PRIORITY_BADGE_CLASS: Record<Priority, string> = {
    high: "badge-high",
    medium: "badge-medium",
    low: "badge-low",
};

// --- ユーティリティ ---
function getToday(): string {
    return new Date().toISOString().split("T")[0];
}

function parseTags(input: string): string[] {
    return input
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
}

// --- サブコンポーネント ---
function TodoMetaBadges({ todo }: { todo: TodoItem }) {
    return (
        <div className="todo-meta">
            <span className="badge badge-date">{todo.dueDate || "—"}</span>
            <span className={`badge ${PRIORITY_BADGE_CLASS[todo.priority]}`}>
                P:{todo.priority.toUpperCase()}
            </span>
            {todo.tags.map((tag) => (
                <span key={tag} className="badge badge-tag">
                    #{tag}
                </span>
            ))}
        </div>
    );
}

function TodoListItem({
    todo,
    onToggle,
    onDelete,
}: {
    todo: TodoItem;
    onToggle: (id: string) => void;
    onDelete: (id: string) => void;
}) {
    return (
        <li className={`todo-item${todo.isCompleted ? " done" : ""}`}>
            <div className="todo-top">
                <div className="todo-left">
                    <input
                        type="checkbox"
                        checked={todo.isCompleted}
                        onChange={() => onToggle(todo.id)}
                    />
                    <span className="todo-title">
                        {todo.title}
                        {todo.isCompleted && (
                            <span className="done-badge"> ✓ DONE</span>
                        )}
                    </span>
                </div>
                <button className="del-btn" onClick={() => onDelete(todo.id)}>
                    DEL
                </button>
            </div>
            <TodoMetaBadges todo={todo} />
        </li>
    );
}

function EmptyState({
    todos,
    hasStarted,
}: {
    todos: TodoItem[];
    hasStarted: boolean;
}) {
    if (todos.length > 0) return null;
    const message = hasStarted
        ? "現在、タスクは皆無だ。貴殿の従順さに感服する。"
        : "システム待機中 — 最初の命令を入力せよ。";
    return <div className="empty-state">{message}</div>;
}

// --- メインコンポーネント ---
function App() {
    // 入力用ステート
    const [userInput, setUserInput] = useState("");
    const [inputDueDate, setInputDueDate] = useState("");
    const [inputPriority, setInputPriority] = useState<Priority>("medium");
    const [inputTags, setInputTags] = useState("");

    // フィルター・ソート用ステート
    const [filter, setFilter] = useState<FilterState>({
        searchQuery: "",
        showOnlyIncomplete: false,
        selectedTag: "all",
        sortBy: "none",
    });

    // タスク本体のステート（localStorage から復元）
    const [todos, setTodos] = useState<TodoItem[]>(() => {
        try {
            const saved = localStorage.getItem("myTodos");
            return saved ? JSON.parse(saved) : INITIAL_TODOS;
        } catch {
            return INITIAL_TODOS;
        }
    });

    const [hasStarted, setHasStarted] = useState<boolean>(() => {
        try {
            const saved = localStorage.getItem("hasStarted");
            return saved ? JSON.parse(saved) : false;
        } catch {
            return false;
        }
    });

    // localStorage への同期
    useEffect(() => {
        localStorage.setItem("myTodos", JSON.stringify(todos));
    }, [todos]);
    useEffect(() => {
        localStorage.setItem("hasStarted", JSON.stringify(hasStarted));
    }, [hasStarted]);

    // 全タグの抽出
    const allTags = useMemo(() => {
        const set = new Set<string>();
        todos.forEach((t) => t.tags.forEach((tag) => set.add(tag)));
        return Array.from(set);
    }, [todos]);

    // フィルタリング＆ソート
    const filteredAndSortedTodos = useMemo(() => {
        let result = [...todos];
        if (filter.searchQuery.trim()) {
            result = result.filter((t) =>
                t.title
                    .toLowerCase()
                    .includes(filter.searchQuery.toLowerCase()),
            );
        }
        if (filter.showOnlyIncomplete)
            result = result.filter((t) => !t.isCompleted);
        if (filter.selectedTag !== "all")
            result = result.filter((t) => t.tags.includes(filter.selectedTag));
        if (filter.sortBy === "dueDateAsc") {
            result.sort((a, b) =>
                !a.dueDate
                    ? 1
                    : !b.dueDate
                      ? -1
                      : new Date(a.dueDate).getTime() -
                        new Date(b.dueDate).getTime(),
            );
        } else if (filter.sortBy === "dueDateDesc") {
            result.sort((a, b) =>
                !a.dueDate
                    ? 1
                    : !b.dueDate
                      ? -1
                      : new Date(b.dueDate).getTime() -
                        new Date(a.dueDate).getTime(),
            );
        } else if (filter.sortBy === "priorityHigh") {
            result.sort(
                (a, b) =>
                    PRIORITY_SCORE[b.priority] - PRIORITY_SCORE[a.priority],
            );
        }
        return result;
    }, [todos, filter]);

    // --- アクション ---
    const addTodo = () => {
        if (!userInput.trim()) return;
        const newTodo: TodoItem = {
            id: crypto.randomUUID(),
            title: userInput.trim(),
            isCompleted: false,
            dueDate: inputDueDate || getToday(),
            priority: inputPriority,
            tags: parseTags(inputTags),
        };
        setTodos((prev) => [...prev, newTodo]);
        setUserInput("");
        setInputDueDate("");
        setInputPriority("medium");
        setInputTags("");
        setHasStarted(true);
    };

    const deleteTodo = (id: string) =>
        setTodos((prev) => prev.filter((t) => t.id !== id));
    const toggleComplete = (id: string) =>
        setTodos((prev) =>
            prev.map((t) =>
                t.id === id ? { ...t, isCompleted: !t.isCompleted } : t,
            ),
        );
    const clearAll = () => setTodos([]);

    const updateFilter = (patch: Partial<FilterState>) =>
        setFilter((prev) => ({ ...prev, ...patch }));

    return (
        <>
            <div className="app">
                <div className="header">
                    <h1>⚡ ABSOLUTE TODO ⚡</h1>
                    <div className="subtitle">
                        【警告】<br />
                        登録したタスクは直ちに完遂せよ。<br />
                        遅延は敗北を意味する。
                    </div>
                </div>

                <div className="panel">
                    {/* タスク追加 */}
                    <div className="add-section">
                        <div className="section-label">MISSION INPUT</div>
                        <div className="main-input-row">
                            <input
                                className="task-input"
                                type="text"
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                onKeyDown={(e) =>
                                    e.key === "Enter" && addTodo()
                                }
                                placeholder="貴殿の義務を入力するのだ！"
                            />
                            <button className="add-btn" onClick={addTodo}>
                                生成
                            </button>
                        </div>
                        <div className="meta-row">
                            <div className="meta-field">
                                <div className="meta-label">期限</div>
                                <input
                                    className="ctrl"
                                    type="date"
                                    value={inputDueDate}
                                    onChange={(e) =>
                                        setInputDueDate(e.target.value)
                                    }
                                />
                            </div>
                            <div className="meta-field">
                                <div className="meta-label">優先度</div>
                                <select
                                    className="ctrl"
                                    value={inputPriority}
                                    onChange={(e) =>
                                        setInputPriority(
                                            e.target.value as Priority,
                                        )
                                    }
                                >
                                    {(
                                        ["high", "medium", "low"] as Priority[]
                                    ).map((p) => (
                                        <option key={p} value={p}>
                                            {PRIORITY_LABEL[p]}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="meta-field wide">
                                <div className="meta-label">
                                    タグ (カンマ区切り)
                                </div>
                                <input
                                    className="ctrl"
                                    type="text"
                                    value={inputTags}
                                    onChange={(e) =>
                                        setInputTags(e.target.value)
                                    }
                                    placeholder="例: 勉強, React"
                                />
                            </div>
                        </div>
                    </div>

                    {/* フィルター・ソート */}
                    <div className="filter-section">
                        <div className="section-label">CONTROL PROTOCOL</div>
                        <div className="filter-row">
                            <input
                                className="ctrl"
                                type="text"
                                placeholder="タスクを検索..."
                                value={filter.searchQuery}
                                onChange={(e) =>
                                    updateFilter({
                                        searchQuery: e.target.value,
                                    })
                                }
                            />
                            <select
                                className="ctrl"
                                value={filter.selectedTag}
                                onChange={(e) =>
                                    updateFilter({
                                        selectedTag: e.target.value,
                                    })
                                }
                            >
                                <option value="all">すべてのタグ</option>
                                {allTags.map((tag) => (
                                    <option key={tag} value={tag}>
                                        {tag}
                                    </option>
                                ))}
                            </select>
                            <select
                                className="ctrl"
                                value={filter.sortBy}
                                onChange={(e) =>
                                    updateFilter({
                                        sortBy: e.target
                                            .value as FilterState["sortBy"],
                                    })
                                }
                            >
                                <option value="none">並び替え: なし</option>
                                <option value="dueDateAsc">期限が近い順</option>
                                <option value="dueDateDesc">
                                    期限が遠い順
                                </option>
                                <option value="priorityHigh">優先度: 高</option>
                            </select>
                        </div>
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={filter.showOnlyIncomplete}
                                onChange={(e) =>
                                    updateFilter({
                                        showOnlyIncomplete: e.target.checked,
                                    })
                                }
                            />
                            未完のタスクのみを表示
                        </label>
                    </div>

                    {/* 全削除ボタン */}
                    {todos.length > 0 && (
                        <button className="clear-btn" onClick={clearAll}>
                            [ 全タスク破棄 — 現実逃避するのもよかろう ]
                        </button>
                    )}

                    {/* タスクリスト */}
                    <ul className="todo-list">
                        {filteredAndSortedTodos.map((todo) => (
                            <TodoListItem
                                key={todo.id}
                                todo={todo}
                                onToggle={toggleComplete}
                                onDelete={deleteTodo}
                            />
                        ))}
                    </ul>

                    {/* 検索結果なし */}
                    {filteredAndSortedTodos.length === 0 &&
                        todos.length > 0 && (
                            <div className="empty-state">
                                検索・抽出条件に合致するタスクは見当たらない。
                            </div>
                        )}

                    {/* 空状態 */}
                    <EmptyState todos={todos} hasStarted={hasStarted} />
                </div>
            </div>
        </>
    );
}

export default App;
