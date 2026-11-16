# Novithra Tech Solution — Developer Assessment & Coding Platform

**Internship Project**  
**Company:** Novithra Tech Solution  
**Developer:** Rahul Kumar Sharma  

---

## 1. Project Overview

This project was developed during the internship at **Novithra Tech Solution**. It is a modern, responsive, web-based **Online Coding & Technical Assessment Platform** designed for developer screening, coding tests, and technical practice.

The platform provides a code-editor environment similar to industry standards (like LeetCode), featuring multi-language compilation, real-time automated testcase evaluation, syntax highlighting, and execution performance metrics.

---

## 2. Core Features

- **Multi-Language Compilation & Execution**: Full support for **Python 3, JavaScript (Node.js), C++ (GCC 13.2), and Java (OpenJDK 21)**.
- **Monaco Code Editor**: Embedded VS Code editing engine with syntax highlighting, auto-closing brackets, line numbering, and dark theme (`vs-dark`).
- **Automated Testcase Verification**: Real-time evaluation against hidden and visible test cases with pass/fail badges, expected vs. actual outputs, and execution time (ms).
- **Custom Input Sandbox**: Option for candidates to enter custom standard input (`stdin`) to test arbitrary test cases.
- **State Preservation**: Smart in-memory code caching ensures typed code is preserved when navigating across problems or languages.
- **Modern Responsive Dark UI**: Built with Tailwind CSS adhering to Novithra Tech Solution branding.

---

## 3. Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18 + TypeScript + Vite | Component modularity, state management, and high-performance hot-reloading |
| **Code Editor Engine** | `@monaco-editor/react` (v0.46) | Industry-standard code editor with multi-language AST syntax parsing |
| **Styling & Design** | Tailwind CSS + PostCSS | Dark-themed developer UI (`#121212`, `#1e1e1e`) |
| **UI Icons** | Lucide React | Status badges, navigation controls, terminal tabs |
| **Code Execution Engine** | Wandbox Compiler API | Sandboxed, keyless multi-language execution (GCC, CPython, Node.js, OpenJDK) |

---

## 4. Architecture & Execution Workflow

```
[Candidate writes solution in Monaco Editor]
                   │
                   ▼ Click "Run Code"
         [codeRunner Service]
                   │
                   ▼ Injects Test Harness & Formatters
        [Wandbox Cloud Sandbox]
   (Compiles & Executes in Isolated Sandbox)
                   │
                   ▼ Captures stdout, stderr, exit code
            [Verdict Engine]
   (Compares Actual Output vs. Expected Output)
                   │
                   ▼
[UI Result Terminal: Accepted / Wrong Answer / Runtime Error]
```

---

## 5. Project Structure

```text
InternProject/
├── index.html                           # Novithra Tech Solution branded shell
├── package.json                         # Project dependencies and run commands
├── vite.config.ts                       # Vite server configuration (port 5173)
├── tailwind.config.js                   # Custom theme palettes
└── src/
    ├── types.ts                         # TypeScript data schemas (Problem, TestCase, Verdicts)
    ├── data/
    │   └── problems.ts                  # Problem bank & starter code boilerplates
    ├── services/
    │   └── codeRunner.ts                # Sandbox execution service & test harness
    ├── components/
    │   ├── Navbar.tsx                   # Novithra Tech Solution branded top bar
    │   ├── ProblemDescription.tsx       # Problem statement, examples, constraints
    │   ├── CodeEditor.tsx               # Monaco editor & language selector
    │   └── ConsoleOutput.tsx            # Testcases & execution verdict terminal
    ├── App.tsx                          # Root state orchestrator & grid layout
    ├── index.css                        # Global stylesheets & scrollbars
    └── main.tsx                         # React entrypoint
```

---

## 6. Running the Project Locally

```bash
# 1. Install dependencies
npm install

# 2. Start local development server
npm run dev

# 3. Build for production deployment
npm run build
```
Local URL: `http://localhost:5173/`
