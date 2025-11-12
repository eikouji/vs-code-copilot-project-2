/* Task Manager app.js
   - Add tasks
   - Toggle completed
   - Delete tasks
   - Persist to localStorage
   - Accessible keyboard handling
*/
(function(){
  const STORAGE_KEY = 'taskManager.tasks.v1';
  const FILTER_KEY = 'taskManager.filter.v1';
  const form = document.getElementById('task-form');
  const input = document.getElementById('task-input');
  const addBtn = document.getElementById('add-btn');
  const taskError = document.getElementById('task-error');
  const list = document.getElementById('task-list');
  const noTasks = document.getElementById('no-tasks');
  const filterButtons = Array.from(document.querySelectorAll('.filter-btn'));
  // Poll elements
  const pollBox = document.getElementById('poll-box');
  const pollForm = document.getElementById('poll-form');
  const pollVoteBtn = document.getElementById('poll-vote');
  const pollResetBtn = document.getElementById('poll-reset');
  const pollResultsEl = document.getElementById('poll-results');
  const POLL_KEY = 'taskManager.poll.v1';
  const POLL_VOTED_KEY = 'taskManager.poll.voted.v1';

  let tasks = loadTasks();
  let currentFilter = loadFilter() || 'all';

  function saveTasks(){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }

  function loadTasks(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw? JSON.parse(raw) : [];
    }catch(e){
      console.error('Failed to parse tasks from storage', e);
      return [];
    }
  }

  function saveFilter(){
    try{ localStorage.setItem(FILTER_KEY, currentFilter); }catch(e){/*ignore*/}
  }

  function loadFilter(){
    try{ return localStorage.getItem(FILTER_KEY); }catch(e){return null}
  }

  function render(){
    list.innerHTML = '';

    // apply filter
    const filtered = tasks.filter(t => {
      if(currentFilter === 'all') return true;
      if(currentFilter === 'active') return !t.completed;
      if(currentFilter === 'completed') return t.completed;
      return true;
    });

    if(filtered.length === 0){
      noTasks.style.display = 'block';
      if(currentFilter === 'active') noTasks.textContent = 'No pending tasks.';
      else if(currentFilter === 'completed') noTasks.textContent = 'No completed tasks.';
      else noTasks.textContent = 'No tasks yet — add your first task.';
      updateFilterButtons();
      return;
    }
    noTasks.style.display = 'none';

    filtered.forEach(task => {
      const li = document.createElement('li');
      li.className = 'task-item';
      li.dataset.id = task.id;

      const left = document.createElement('div');
      left.className = 'task-left';

      const checkbox = document.createElement('button');
      checkbox.className = 'task-checkbox';
      checkbox.setAttribute('aria-pressed', task.completed ? 'true' : 'false');
      checkbox.setAttribute('aria-label', task.completed ? 'Mark as incomplete' : 'Mark as complete');
      checkbox.title = checkbox.getAttribute('aria-label');
      checkbox.addEventListener('click', () => toggleComplete(task.id));

      const cbInput = document.createElement('input');
      cbInput.type = 'checkbox';
      cbInput.tabIndex = -1; // avoid double tab stops; button handles keyboard
      cbInput.checked = task.completed;
      checkbox.appendChild(cbInput);

      const desc = document.createElement('div');
      desc.className = 'task-desc' + (task.completed ? ' completed' : '');
      desc.textContent = task.text;
      desc.setAttribute('tabindex', '0');

      left.appendChild(checkbox);
      left.appendChild(desc);

      const meta = document.createElement('div');
      meta.className = 'task-meta';

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'icon-btn';
      deleteBtn.setAttribute('aria-label','Delete task');
      deleteBtn.title = 'Delete task';
      deleteBtn.innerHTML = '🗑️';
      deleteBtn.addEventListener('click', () => deleteTask(task.id));

      meta.appendChild(deleteBtn);

      li.appendChild(left);
      li.appendChild(meta);
      list.appendChild(li);
    });
    updateFilterButtons();
  }

  /* ---------- Poll logic ---------- */
  function loadPoll(){
    try{ const raw = localStorage.getItem(POLL_KEY); return raw? JSON.parse(raw) : {chores:0,errands:0,cleanup:0}; }catch(e){return {chores:0,errands:0,cleanup:0}}
  }

  function savePoll(obj){
    try{ localStorage.setItem(POLL_KEY, JSON.stringify(obj)); }catch(e){}
  }

  function hasVoted(){
    try{ return !!localStorage.getItem(POLL_VOTED_KEY); }catch(e){return false}
  }

  function setVoted(){
    try{ localStorage.setItem(POLL_VOTED_KEY, '1'); }catch(e){}
  }

  function clearVoted(){
    try{ localStorage.removeItem(POLL_VOTED_KEY); }catch(e){}
  }

  function renderPoll(){
    const data = loadPoll();
    const total = data.chores + data.errands + data.cleanup || 0;
    // show results
    pollResultsEl.innerHTML = '';
    ['chores','errands','cleanup'].forEach(key => {
      const count = data[key] || 0;
      const percent = total === 0 ? 0 : Math.round((count/total)*100);
      const row = document.createElement('div');
      row.className = 'poll-row';
      row.innerHTML = `<div class="poll-label">${labelForKey(key)} <span class="count-badge">${count}</span></div>
        <div class="poll-bar" aria-hidden="true"><i style="width:${percent}%;"></i></div>`;
      pollResultsEl.appendChild(row);
    });
    pollResultsEl.hidden = false;
    // disable voting controls if already voted
    const voted = hasVoted();
    setPollControlsDisabled(voted);
  }

  function labelForKey(k){
    if(k === 'chores') return 'Chores';
    if(k === 'errands') return 'Errands';
    return 'Clean up';
  }

  function setPollControlsDisabled(disabled){
    const radios = pollForm.querySelectorAll('input[name="poll"]');
    radios.forEach(r => r.disabled = disabled);
    pollVoteBtn.disabled = disabled;
  }

  function votePoll(){
    const selected = pollForm.querySelector('input[name="poll"]:checked');
    if(!selected) return; // nothing selected
    const key = selected.value;
    const data = loadPoll();
    if(!data[key]) data[key] = 0;
    data[key] = data[key] + 1;
    savePoll(data);
    setVoted();
    renderPoll();
  }

  function resetPoll(){
    savePoll({chores:0,errands:0,cleanup:0});
    clearVoted();
    // re-enable controls
    setPollControlsDisabled(false);
    pollResultsEl.hidden = true;
  }

  // wire poll events
  if(pollVoteBtn){ pollVoteBtn.addEventListener('click', votePoll); }
  if(pollResetBtn){ pollResetBtn.addEventListener('click', resetPoll); }
  // initial poll render (show results if votes exist or if already voted)
  (function(){ const d = loadPoll(); const total = d.chores + d.errands + d.cleanup; if(total>0 || hasVoted()){ renderPoll(); } })();

  function addTask(text){
    const trimmed = text.trim();
    if(!trimmed) return false;
    tasks.unshift({id: Date.now().toString(36) + Math.random().toString(36).slice(2,6), text: trimmed, completed: false});
    saveTasks();
    render();
    return true;
  }

  function toggleComplete(id){
    const t = tasks.find(x => x.id === id);
    if(!t) return;
    t.completed = !t.completed;
    saveTasks();
    render();
  }

  function deleteTask(id){
    tasks = tasks.filter(x => x.id !== id);
    saveTasks();
    render();
  }

  function setFilter(filter){
    if(!['all','active','completed'].includes(filter)) return;
    currentFilter = filter;
    saveFilter();
    render();
  }

  function updateFilterButtons(){
    if(!filterButtons || filterButtons.length === 0) return;
    filterButtons.forEach(btn => {
      const f = btn.dataset.filter;
      btn.setAttribute('aria-pressed', f === currentFilter ? 'true' : 'false');
    });
  }

  function updateAddButtonState(){
    if(!addBtn) return;
    try{
      addBtn.disabled = !input.value.trim();
    }catch(e){ /* ignore */ }
  }

  form.addEventListener('submit', (e) =>{
    e.preventDefault();
    const value = input.value.trim();
    if(!value){
      // show accessible error
      if(taskError){
        taskError.textContent = 'Please enter a task.';
        taskError.hidden = false;
      }
      input.focus();
      return;
    }
    if(addTask(value)){
      input.value = '';
      updateAddButtonState();
      input.focus();
    }
  });

  // allow Enter in input to submit and Shift+Enter for newline (not usually desired here)
  input.addEventListener('keydown', (e)=>{
    if(e.key === 'Enter' && !e.shiftKey){
      e.preventDefault();
      form.requestSubmit();
    }
  });

  // clear error when user types
  input.addEventListener('input', ()=>{
    if(taskError && !taskError.hidden){
      taskError.textContent = '';
      taskError.hidden = true;
    }
    updateAddButtonState();
  });

  // keyboard shortcuts: 'n' to focus new task
  window.addEventListener('keydown', (e)=>{
    if(e.key.toLowerCase() === 'n' && !e.metaKey && !e.ctrlKey && !e.altKey){
      input.focus();
    }
  });

  // wire filter buttons
  if(filterButtons && filterButtons.length){
    filterButtons.forEach(btn => {
      btn.addEventListener('click', ()=> setFilter(btn.dataset.filter));
    });
  }

  // initial render
  render();
  // reflect initial input state on the Add button
  updateAddButtonState();
})();