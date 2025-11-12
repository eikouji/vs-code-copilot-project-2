# Task Manager

A small accessible task manager web app (add, delete, mark complete) that persists data to localStorage.

Files
- `index.html` — semantic markup and structure
- `styles.css` — modern responsive styles
- `app.js` — application logic (add, delete, toggle complete, localStorage)

How to run

Open `task-manager/index.html` in your browser directly, or serve the directory with a static server (recommended for consistent behavior):

```bash
# from the repository root
cd thoroughbred-article-page/task-manager
python3 -m http.server 8000
# then open http://localhost:8000 in your browser
```

Accessibility notes
- Form controls have labels and focus outlines
- Buttons use clear aria-labels where appropriate
- Task list updates are announced with `aria-live`

Extensions
- You can add features like edit, due-dates, filters, or sync with a backend.

Filters
- Use the filter buttons (All / Active / Completed) above the task list to show a subset of tasks.
- The selected filter is persisted in localStorage so your choice is remembered across reloads.

Poll
- A quick poll was added to the page where visitors can vote for one of three choices: Chores, Errands, or Clean up.
- Votes are persisted in localStorage and users can vote once per browser. An admin or user may reset the poll using the "Reset" button.

This project was made possible by Visual Studio Code's Copilot feature

# URL of website 
https://eikouji.github.io/vs-code-copilot-project-2/task-manager/

# Screenshot of working website 
<img width="1272" height="911" alt="Screenshot-Task-Manager-Copilot" src="https://github.com/user-attachments/assets/2ea48679-642e-4462-a4ed-20b8ad6332c1" />
