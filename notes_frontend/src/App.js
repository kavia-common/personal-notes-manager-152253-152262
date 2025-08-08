import React, { useState, useEffect, useRef } from "react";
import "./App.css";

// Color scheme variables for easy reference (used in inline style, also syncs with App.css)
const COLORS = {
  accent: "#F5A623",
  primary: "#4A90E2",
  secondary: "#D1D5DB",
};

// Returns a unique ID for notes
function generateId() {
  return (
    Date.now().toString(36) +
    Math.random().toString(36).substr(2, 4)
  );
}

// PUBLIC_INTERFACE
function App() {
  // Notes data, persisted in localStorage or in-memory fallback
  const [notes, setNotes] = useState(() =>
    (() => {
      try {
        const saved = localStorage.getItem("notes_v1");
        return saved ? JSON.parse(saved) : [];
      } catch {
        return [];
      }
    })()
  );
  const [activeId, setActiveId] = useState("");
  const [search, setSearch] = useState("");

  // For edit area
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const titleInputRef = useRef();

  // Sync notes with localStorage
  useEffect(() => {
    try {
      localStorage.setItem("notes_v1", JSON.stringify(notes));
    } catch {
      /* Ignore. In-memory fallback. */
    }
  }, [notes]);

  // When selecting a note (activeId), load for editing
  useEffect(() => {
    if (!activeId) {
      setEditTitle("");
      setEditBody("");
      return;
    }
    const selected = notes.find((n) => n.id === activeId);
    if (selected) {
      setEditTitle(selected.title);
      setEditBody(selected.body);
    }
  }, [activeId, notes]);

  // PUBLIC_INTERFACE
  function handleSelectNote(id) {
    setActiveId(id);
  }

  // PUBLIC_INTERFACE
  function handleNewNote() {
    const newNote = {
      id: generateId(),
      title: "",
      body: "",
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
    };
    setNotes([newNote, ...notes]);
    setActiveId(newNote.id);
    setTimeout(() => {
      titleInputRef.current && titleInputRef.current.focus();
    }, 10);
  }

  // PUBLIC_INTERFACE
  function handleDeleteNote(id) {
    setNotes(notes.filter((n) => n.id !== id));
    if (activeId === id) setActiveId("");
  }

  // PUBLIC_INTERFACE
  function handleSaveNote() {
    if (!activeId) return;
    setNotes((prev) =>
      prev.map((n) =>
        n.id === activeId
          ? {
              ...n,
              title: editTitle,
              body: editBody,
              updated: new Date().toISOString(),
            }
          : n
      )
    );
  }

  // PUBLIC_INTERFACE
  function handleTitleChange(e) {
    setEditTitle(e.target.value);
  }
  // PUBLIC_INTERFACE
  function handleBodyChange(e) {
    setEditBody(e.target.value);
  }

  // PUBLIC_INTERFACE
  function handleSearchChange(e) {
    setSearch(e.target.value);
  }

  // Filter notes by search string; most recently updated first
  const filteredNotes = notes
    .filter((n) => {
      const s = search.toLowerCase();
      return (
        n.title.toLowerCase().includes(s) ||
        n.body.toLowerCase().includes(s)
      );
    })
    .sort((a, b) => (b.updated || "") > (a.updated || "") ? 1 : -1);

  // Helper
  const selectedNote = notes.find((n) => n.id === activeId);

  return (
    <div
      className="notes-app-root"
      style={{
        minHeight: "100vh",
        display: "flex",
        background: "var(--bg-primary, #fff)",
        color: "var(--text-primary, #282c34)",
      }}
    >
      {/* Sidebar */}
      <aside
        className="sidebar"
        style={{
          width: 240,
          background: COLORS.secondary,
          borderRight: `1px solid ${COLORS.primary}`,
          padding: "0 0.5rem",
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        <div style={{ fontWeight: 700, padding: "1.25rem 0", fontSize: 20 }}>
          <span
            style={{
              color: COLORS.primary,
            }}
          >
            Notes
          </span>
        </div>
        <button
          className="btn new-note"
          style={{
            margin: "0.25rem 0.5rem 1rem 0.5rem",
            background: COLORS.primary,
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "0.55rem 0.75rem",
            fontWeight: 600,
            fontSize: 14,
            cursor: "pointer",
          }}
          onClick={handleNewNote}
        >
          + New Note
        </button>
        <input
          placeholder="Search notes…"
          value={search}
          onChange={handleSearchChange}
          style={{
            margin: "0 0.5rem 1rem 0.5rem",
            padding: "0.5rem",
            border: `1px solid ${COLORS.primary}`,
            borderRadius: 4,
            outline: "none",
          }}
          aria-label="Search notes"
        />
        <nav
          className="notes-list-nav"
          style={{
            flex: 1,
            overflowY: "auto",
          }}
        >
          {filteredNotes.length === 0 && (
            <div
              style={{
                color: "#888",
                fontSize: 15,
                padding: "1rem 1rem",
                textAlign: "center",
              }}
            >
              No notes found.
            </div>
          )}
          <ul
            className="notes-list"
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              width: "100%",
            }}
          >
            {filteredNotes.map((note) => (
              <li key={note.id} style={{marginBottom: 2}}>
                <button
                  onClick={() => handleSelectNote(note.id)}
                  style={{
                    width: "100%",
                    background:
                      activeId === note.id
                        ? COLORS.accent
                        : "transparent",
                    color:
                      activeId === note.id
                        ? "#222"
                        : "#222",
                    border: "none",
                    textAlign: "left",
                    padding: "0.7rem 0.6rem 0.5rem",
                    borderRadius: 6,
                    cursor: "pointer",
                    fontSize: 15,
                    fontWeight: activeId === note.id ? 600 : 400,
                    transition: "background 0.13s",
                  }}
                  aria-current={activeId === note.id ? "true" : undefined}
                >
                  <div style={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: "170px"
                  }}>
                    {note.title ? note.title : <span style={{color: "#aaa"}}><em>(untitled)</em></span>}
                  </div>
                  <div style={{
                    fontSize: 12,
                    color: "#555",
                    marginTop: 2,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: "160px"
                  }}>
                    {note.body.slice(0, 28)}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div style={{height:8}} />
      </aside>
      {/* Main content area */}
      <main
        className="main"
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          background: "#fff",
        }}
      >
        {/* App header */}
        <header
          className="app-header"
          style={{
            background: "#fff",
            borderBottom: `1.5px solid ${COLORS.secondary}`,
            padding: "20px 28px 14px 28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: COLORS.primary,
              letterSpacing: 1.4,
            }}
          >
            <span style={{
              color: COLORS.primary, 
              background: COLORS.secondary, 
              borderRadius: 8, 
              padding: "2px 10px 2px 4px"
            }}>🗒️</span> Notes App
          </span>
        </header>
        {/* Note editing/view area */}
        <section
          className="note-area"
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            maxWidth: "700px",
            margin: "32px auto 0 auto",
            padding: "16px 12px 24px",
          }}
        >
          {!selectedNote ? (
            <div
              style={{
                fontSize: 16,
                fontWeight: 400,
                color: "#888",
                textAlign: "center",
                paddingTop: 40,
              }}
            >
              {notes.length === 0 ? (
                <div>
                  No notes yet. Click <span style={{color: COLORS.primary, fontWeight: 600}}>+ New Note</span> to get started!
                </div>
              ) : (
                <div>
                  Select a note from the left to view or edit.
                </div>
              )}
            </div>
          ) : (
            <form
              className="note-form"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 16,
                width: "100%",
              }}
              onSubmit={e => { e.preventDefault(); handleSaveNote(); }}
              autoComplete="off"
            >
              <input
                ref={titleInputRef}
                className="note-title"
                type="text"
                data-testid="note-title"
                placeholder="Title"
                value={editTitle}
                onChange={handleTitleChange}
                style={{
                  fontSize: 20,
                  fontWeight: 600,
                  padding: "8px 10px",
                  border: `1.6px solid ${COLORS.primary}`,
                  borderRadius: 7,
                  marginBottom: 2,
                }}
                maxLength={60}
                autoFocus
              />
              <textarea
                className="note-body"
                data-testid="note-body"
                placeholder="Write your note here…"
                value={editBody}
                onChange={handleBodyChange}
                style={{
                  minHeight: 140,
                  resize: "vertical",
                  fontSize: 16,
                  border: `1px solid ${COLORS.secondary}`,
                  borderRadius: 7,
                  padding: "9px 11px",
                }}
                maxLength={10240}
              />
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  marginTop: 12,
                  alignItems: "center",
                  justifyContent: "flex-start",
                }}
              >
                <button
                  type="submit"
                  className="btn btn-save"
                  style={{
                    background: COLORS.accent,
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    padding: "8px 1.4em",
                    fontWeight: 600,
                    fontSize: 15,
                    cursor: "pointer",
                  }}
                >
                  Save
                </button>
                <button
                  type="button"
                  className="btn btn-delete"
                  style={{
                    background: COLORS.secondary,
                    color: COLORS.primary,
                    border: `1.2px solid ${COLORS.primary}`,
                    borderRadius: 6,
                    padding: "8px 1.2em",
                    fontWeight: 540,
                    fontSize: 15,
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    if (
                      window.confirm(
                        "Are you sure you want to permanently delete this note?"
                      )
                    ) {
                      handleDeleteNote(selectedNote.id);
                    }
                  }}
                >
                  Delete
                </button>
                <span style={{color:"#aaa", fontSize:13, marginLeft:10}}>
                  Last updated:{" "}
                  {new Date(selectedNote.updated).toLocaleString()}
                </span>
              </div>
            </form>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
