const monthColors = [
  '#FFD6E0', // Pink
  '#E8DDF5', // Lavender
  '#D6F0FF', // Baby Blue
  '#D9F2E6', // Mint
  '#FFF2B8', // Butter Yellow
  '#FFE0CC', // Peach
  '#F8D7E8', // Blush
  '#DDEBFF', // Powder Blue
  '#DDE8D5', // Sage
  '#FFF0D6'  // Cream
];

let nav = 0;
let clicked = null;
let activeEvent = null;
let activeTask = null;

let events = localStorage.getItem('events')
  ? JSON.parse(localStorage.getItem('events'))
  : [];
  
let tasks = localStorage.getItem('tasks')
  ? JSON.parse(localStorage.getItem('tasks'))
  : [];
  
const calendar = document.getElementById('calendar');
const dayActionModal = document.getElementById('dayActionModal');
const newEventModal = document.getElementById('newEventModal');
const newTaskModal = document.getElementById('taskModal');
const deleteEventModal = document.getElementById('deleteEventModal');
const deleteTaskModal = document.getElementById('deleteTaskModal');
const backDrop = document.getElementById('modalBackDrop');
const eventTitleInput = document.getElementById('eventTitleInput');
const eventDateInput = document.getElementById('eventDateInput');
const eventTimeInput = document.getElementById('eventTimeInput');
const taskInput = document.getElementById('taskInput');
const taskDateInput = document.getElementById('taskDateInput');
const taskTimeInput = document.getElementById('taskTimeInput');
const viewButtons = document.querySelectorAll('[data-calendar-view]');
const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Task Sidebar
const taskSidebar = document.createElement('div');
taskSidebar.id = 'taskSidebar';

taskSidebar.innerHTML = `
  <div class="task-sidebar-header">
    <span id="taskSidebarTitle">Tasks</span>
    <button id="closeTaskSidebar">×</button>
  </div>

  <div id="taskList"></div>

  <button id="sidebarAddTask">+ Add Task</button>
`;

document.body.appendChild(taskSidebar);


function setCalendarView(view) {
  document.body.classList.toggle('view-web', view === 'web');
  document.body.classList.toggle('view-mobile', view === 'mobile');
  localStorage.setItem('calendarView', view);

  viewButtons.forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.calendarView === view));
  });

  alignCalendarToFirstDate(view);
}

function alignCalendarToFirstDate(view) {
  const calendarScroll = document.getElementById('calendarScroll');
  if (view !== 'web' || calendarScroll.scrollWidth <= calendarScroll.clientWidth) {
    calendarScroll.scrollLeft = 0;
    return;
  }

  const firstDate = calendar.querySelector('.day:not(.padding)');
  if (!firstDate) return;

  const scrollLeft = calendarScroll.getBoundingClientRect().left;
  const firstDateLeft = firstDate.getBoundingClientRect().left;
  calendarScroll.scrollLeft += firstDateLeft - scrollLeft;
}

function toISODate(date) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
  const [month, day, year] = date.split('/');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

function todayISODate() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

function showNewEventForm(date = clicked || todayISODate()) {
  activeEvent = null;
  eventTitleInput.value = '';
  eventDateInput.value = date;
  eventTimeInput.value = '';
  document.getElementById('eventModalTitle').innerText = 'New Event';
  document.getElementById('saveButton').innerText = 'Save';
  dayActionModal.style.display = 'none';
  newEventModal.style.display = 'block';
  backDrop.style.display = 'block';
}

function showNewTaskForm(date = clicked || todayISODate()) {
  activeTask = null;
  taskInput.value = '';
  taskDateInput.value = date;
  taskTimeInput.value = '';
  document.getElementById('taskModalTitle').innerText = 'New Task';
  document.getElementById('saveButtonTwo').innerText = 'Save';
  dayActionModal.style.display = 'none';
  newTaskModal.style.display = 'block';
  backDrop.style.display = 'block';
}

function openDayActionModal(date) {
  clicked = date;
  backDrop.style.display = 'block';
  dayActionModal.style.display = 'block';
}

function openRecordModal(record, type) {
  clicked = record.date;
  if (type === 'event') {
    activeEvent = record;
    const eventDateTime = [toISODate(record.date), record.time].filter(Boolean).join(' at ');
    document.getElementById('eventText').innerText = `${record.title}\n${eventDateTime}`;
    deleteEventModal.style.display = 'block';
  } else {
    activeTask = record;
    const taskDateTime = [toISODate(record.date), record.time].filter(Boolean).join(' at ');
    document.getElementById('taskText').innerText = `${record.title}\n${taskDateTime}`;
    deleteTaskModal.style.display = 'block';
  }
  backDrop.style.display = 'block';
}
function showTaskSidebar(date) {
  clicked = date;

  const taskList = document.getElementById('taskList');
  const taskSidebarTitle = document.getElementById('taskSidebarTitle');

  const dateObject = new Date(date + 'T00:00:00');

  const formattedDate = dateObject.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric'
  });

  taskSidebarTitle.innerText = `Tasks for ${formattedDate}`;

  taskList.innerHTML = '';

  const tasksForDay = tasks.filter(task => toISODate(task.date) === date);

  if (tasksForDay.length === 0) {
    taskList.innerHTML = '<p class="no-tasks">No tasks yet! 🌸</p>';
  }

  tasksForDay.forEach(task => {
    const taskItem = document.createElement('div');
    taskItem.classList.add('sidebar-task');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.done || false;

    const taskText = document.createElement('span');
    taskText.innerText = task.title;

    if (task.done) {
      taskText.classList.add('completed-task');
    }

    checkbox.addEventListener('change', () => {
      task.done = checkbox.checked;

      localStorage.setItem('tasks', JSON.stringify(tasks));

      if (checkbox.checked) {
        taskText.classList.add('completed-task');
      } else {
        taskText.classList.remove('completed-task');
      }
    });

    taskItem.appendChild(checkbox);
    taskItem.appendChild(taskText);

    taskList.appendChild(taskItem);
  });

  taskSidebar.classList.add('open');
}
function load() {
  const dt = new Date();

  if (nav !== 0) {
    dt.setMonth(new Date().getMonth() + nav);
  }

  const day = dt.getDate();
  const month = dt.getMonth();
  const year = dt.getFullYear();

  const monthColor = monthColors[month % monthColors.length];
document.documentElement.style.setProperty('--month-color', monthColor);

  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  const dateString = firstDayOfMonth.toLocaleDateString('en-us', {
    weekday: 'long',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });
  const paddingDays = weekdays.indexOf(dateString.split(', ')[0]);

  document.getElementById('monthDisplay').innerText =
    `${dt.toLocaleDateString('en-us', { month: 'long' })} ${year}`;

  calendar.innerHTML = '';

  for(let i = 1; i <= paddingDays + daysInMonth; i++) {
    const daySquare = document.createElement('div');
    daySquare.classList.add('day');

    const dayString = `${year}-${String(month + 1).padStart(2, '0')}-${String(i - paddingDays).padStart(2, '0')}`;

    if (i > paddingDays) {
      daySquare.innerText = i - paddingDays;
      const eventsForDay = events.filter(event => toISODate(event.date) === dayString);
      const tasksForDay = tasks.filter(task => toISODate(task.date) === dayString);

      if (i - paddingDays === day && nav === 0) {
        daySquare.id = 'currentDay';
      }

        eventsForDay.forEach(event => {
          const eventDiv = document.createElement('div');
          eventDiv.classList.add('event');
          eventDiv.innerText = event.title;
          eventDiv.addEventListener('click', click => {
            click.stopPropagation();
            openRecordModal(event, 'event');
          });
          daySquare.appendChild(eventDiv);
        });

        tasksForDay.forEach(task => {
          const taskDiv = document.createElement('div');
          taskDiv.classList.add('event', 'task');
          taskDiv.innerText = task.title;
          taskDiv.addEventListener('click', click => {
            click.stopPropagation();
            openRecordModal(task, 'task');
          });
          daySquare.appendChild(taskDiv);
        });

        daySquare.addEventListener('click', () => showTaskSidebar(dayString));

    } else {
      daySquare.classList.add('padding');
    }

    calendar.appendChild(daySquare);    
  }
}

function closeModal() {
  eventTitleInput.classList.remove('error');
  taskInput.classList.remove('error');
  dayActionModal.style.display = 'none';
  newTaskModal.style.display = 'none';
  newEventModal.style.display = 'none';
  deleteEventModal.style.display = 'none';
  deleteTaskModal.style.display = 'none';
  backDrop.style.display = 'none';
  eventTitleInput.value = '';
  eventDateInput.value = '';
  eventTimeInput.value = '';
  document.getElementById('eventModalTitle').innerText = 'New Event';
  document.getElementById('saveButton').innerText = 'Save';
  taskInput.value = '';
  taskDateInput.value = '';
  taskTimeInput.value = '';
  document.getElementById('taskModalTitle').innerText = 'New Task';
  document.getElementById('saveButtonTwo').innerText = 'Save';
  clicked = null;
  activeEvent = null;
  activeTask = null;
  load();
}

function saveEvent() {
  if (eventTitleInput.value.trim() && eventDateInput.value) {
    eventTitleInput.classList.remove('error');

    const eventData = {
      date: eventDateInput.value,
      time: eventTimeInput.value,
      title: eventTitleInput.value.trim(),
    };

    if (activeEvent) {
      Object.assign(activeEvent, eventData);
    } else {
      events.push(eventData);
    }

    localStorage.setItem('events', JSON.stringify(events));
    closeModal();
  } else {
    eventTitleInput.classList.add('error');
  }
}

function deleteEvent() {
  events = events.filter(event => event !== activeEvent);
  localStorage.setItem('events', JSON.stringify(events));
  closeModal();
}

function editEvent() {
  if (!activeEvent) return;
  eventTitleInput.value = activeEvent.title;
  eventDateInput.value = toISODate(activeEvent.date);
  eventTimeInput.value = activeEvent.time || '';
  document.getElementById('eventModalTitle').innerText = 'Edit Event';
  document.getElementById('saveButton').innerText = 'Update';
  deleteEventModal.style.display = 'none';
  newEventModal.style.display = 'block';
}

function editTask() {
  if (!activeTask) return;
  taskInput.value = activeTask.title;
  taskDateInput.value = toISODate(activeTask.date);
  taskTimeInput.value = activeTask.time || '';
  document.getElementById('taskModalTitle').innerText = 'Edit Task';
  document.getElementById('saveButtonTwo').innerText = 'Update';
  deleteTaskModal.style.display = 'none';
  newTaskModal.style.display = 'block';
}

const myEvents = [
  { date: '2026-10-04', title: 'Dentist Appointment' },
  { date: '2026-10-15', title: 'Conference Call' }
];

function renderCalendar(year, month) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const calendarGrid = document.getElementById('calendar-grid');
  calendarGrid.innerHTML = ''; // Clear previous view

  for (let day = 1; day <= daysInMonth; day++) {
    // 1. Format the current cell date padding months/days to 2 digits
    const currentMonthString = String(month + 1).padStart(2, '0');
    const currentDayString = String(day).padStart(2, '0');
    const dateString = `${year}-${currentMonthString}-${currentDayString}`;

    // 2. Create the HTML day cell element
    const dayCell = document.createElement('div');
    dayCell.classList.add('calendar-day');
    dayCell.innerHTML = `<span class="day-number">${day}</span>`;

    // 3. Find if any event matches this cell's date string
    const todaysEvents = myEvents.filter(event => event.date === dateString);
    
    // 4. Append events if found
    todaysEvents.forEach(event => {
      const eventElement = document.createElement('div');
      eventElement.classList.add('event-tag');
      eventElement.innerText = event.title;
      dayCell.appendChild(eventElement);
    });

    calendarGrid.appendChild(dayCell);
  }
}

function saveTask() {
  if (taskInput.value.trim() && taskDateInput.value) {
    taskInput.classList.remove('error');

    const taskData = {
      date: taskDateInput.value,
      time: taskTimeInput.value,
      title: taskInput.value.trim(),
    };

    if (activeTask) {
      Object.assign(activeTask, taskData);
    } else {
      tasks.push(taskData);
    }

    localStorage.setItem('tasks', JSON.stringify(tasks));
    closeModal();
  } else {
    taskInput.classList.add('error');
  }
}

function deleteTask() {
  tasks = tasks.filter(task => task !== activeTask);
  localStorage.setItem('tasks', JSON.stringify(tasks));
  closeModal();
}

function initButtons() {
  viewButtons.forEach(button => {
    button.addEventListener('click', () => setCalendarView(button.dataset.calendarView));
  });

  document.getElementById('nextButton').addEventListener('click', () => {
    nav++;
    load();
  });

  document.getElementById('backButton').addEventListener('click', () => {
    nav--;
    load();
  });

  document.getElementById('createEventButton').addEventListener('click', () => showNewEventForm());
  document.getElementById('createTaskButton').addEventListener('click', () => showNewTaskForm());
  document.getElementById('sidebarAddTask').addEventListener('click', () => showNewTaskForm());
  document.getElementById('addEventButton').addEventListener('click', () => {
    showNewEventForm();
  });
  document.getElementById('addTaskButton').addEventListener('click', () => {
    showNewTaskForm();
  });
  document.getElementById('cancelActionButton').addEventListener('click', closeModal);
  document.getElementById('saveButton').addEventListener('click', saveEvent);
  document.getElementById('cancelButton').addEventListener('click', closeModal);
  document.getElementById('deleteButton').addEventListener('click', deleteEvent);
  document.getElementById('closeButton').addEventListener('click', closeModal);
  document.getElementById('editEventButton').addEventListener('click', editEvent);

  document.getElementById('saveButtonTwo').addEventListener('click', saveTask);
  document.getElementById('cancelButtonTwo').addEventListener('click', closeModal);
  document.getElementById('deleteButtonTwo').addEventListener('click', deleteTask);
  document.getElementById('closeButtonTwo').addEventListener('click', closeModal);
  document.getElementById('editTaskButton').addEventListener('click', editTask);
}

const savedView = localStorage.getItem('calendarView');
const initialView = savedView || (window.matchMedia('(max-width: 600px)').matches ? 'mobile' : 'web');
setCalendarView(initialView);
initButtons();
load();
alignCalendarToFirstDate(initialView);



