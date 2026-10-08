import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './app.css';

const DEMO_DATE = '2026-10-15';
const EVENTS = [
  { id: 'evt-01', name: 'Community workshop', date: 'Oct 22', kind: 'Workshop', color: 'teal' },
  { id: 'evt-02', name: 'Studio open day', date: 'Oct 28', kind: 'Open house', color: 'ochre' },
  { id: 'evt-03', name: 'Partner briefing', date: 'Nov 03', kind: 'Meeting', color: 'plum' },
];
const INITIAL_TASKS = [
  { id: 't1', title: 'Confirm venue access window', eventId: 'evt-01', owner: 'Morgan', due: '2026-10-13', status: 'Waiting', notes: 'Ask the building contact about early room access and the loading entrance.', day: 'Tuesday · 13' },
  { id: 't2', title: 'Draft room setup plan', eventId: 'evt-01', owner: 'Jamie', due: '2026-10-14', status: 'To do', notes: 'Include seating for a small-group discussion and a clear arrival point.', day: 'Tuesday · 13' },
  { id: 't3', title: 'Confirm access and room layout', eventId: 'evt-01', owner: 'Alex', due: '2026-10-15', status: 'In progress', notes: 'Walk through the room with the venue contact. Check tables, access route, and sign-in point.', day: 'Thursday · 15' },
  { id: 't4', title: 'Collect dietary notes', eventId: 'evt-01', owner: 'Morgan', due: '2026-10-17', status: 'To do', notes: 'Gather attendee requirements before the catering check-in.', day: 'Thursday · 15' },
  { id: 't5', title: 'Prepare welcome table', eventId: 'evt-02', owner: 'Jamie', due: '2026-10-20', status: 'To do', notes: 'Check name cards, printed schedule, and materials box.', day: 'Friday · 16' },
  { id: 't6', title: 'Review partner run of show', eventId: 'evt-03', owner: 'Alex', due: '2026-10-22', status: 'In progress', notes: 'Keep the introduction concise and confirm the closing time.', day: 'Saturday · 17' },
  { id: 't7', title: 'Send post-event notes', eventId: 'evt-01', owner: 'Morgan', due: '2026-10-23', status: 'To do', notes: 'Share a short follow-up with the organizing team.', day: 'Saturday · 17' },
  { id: 't8', title: 'Review studio signage', eventId: 'evt-02', owner: 'Jamie', due: '2026-10-29', status: 'To do', notes: 'Check directions are clear from the front entrance.', day: 'Sunday · 18' },
];
const TEMPLATE_TASKS = ['Confirm the venue', 'Set the event schedule', 'Plan room layout', 'Prepare attendee materials', 'Check accessibility details', 'Confirm refreshments', 'Share the run of show', 'Send a follow-up'];
const PATHS = {
  grid: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></>,
  check: <><path d="m5 12 4 4L19 6"/><path d="M21 12a9 9 0 1 1-5-8"/></>,
  plus: <><path d="M12 5v14M5 12h14"/></>,
  search: <><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.5 4.5"/></>,
  arrow: <><path d="M5 12h14M13 6l6 6-6 6"/></>,
  lock: <><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>,
};

function Icon({ name, size = 18 }) {
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round">{PATHS[name]}</svg>;
}

function Badge({ kind = 'neutral', children }) {
  return <span className={`badge badge-${kind}`}>{children}</span>;
}

function BrandMark({ small = false }) {
  return <span className={`brand-mark${small ? ' brand-mark-small' : ''}`} aria-hidden="true"><span /><span /><span /><span /></span>;
}

function BoardFrame({ number, title, subtitle, children, footer = 'Independent portfolio illustration · Fictional data' }) {
  return <main className="board">
    <header className="board-topline">
      <a className="brand-lockup" href="/" aria-label="Fieldnote illustration gallery"><BrandMark /><span>fieldnote</span></a>
      <span className="board-index">FIELDNOTE&nbsp; / &nbsp;PORTFOLIO STUDY</span>
      <span className="board-count">{number}&nbsp; / &nbsp;04</span>
    </header>
    <section className="board-heading"><p className="eyebrow">EVENT OPERATIONS WORKSPACE</p><h1>{title}</h1><p className="board-subtitle">{subtitle}</p></section>
    {children}
    <footer className="board-footer"><span>{footer}</span><span>FIELDNOTE&nbsp; · &nbsp;OCTOBER 2026</span></footer>
  </main>;
}

function DeadlineKind({ task }) {
  if (task.due < DEMO_DATE) return <Badge kind="overdue">Overdue</Badge>;
  if (task.due === DEMO_DATE) return <Badge kind="today">Due today</Badge>;
  const delta = (Date.parse(`${task.due}T00:00:00Z`) - Date.parse(`${DEMO_DATE}T00:00:00Z`)) / 86400000;
  if (delta <= 7) return <Badge kind="soon">In {delta} days</Badge>;
  return <Badge>Later</Badge>;
}

function WorkspaceBoard() {
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [selectedId, setSelectedId] = useState('t3');
  const [filter, setFilter] = useState('all');
  const [showTemplate, setShowTemplate] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [eventName, setEventName] = useState('');
  const selected = tasks.find((task) => task.id === selectedId) ?? tasks[0];
  const event = EVENTS.find((item) => item.id === selected?.eventId) ?? EVENTS[0];
  const visibleTasks = useMemo(() => filter === 'mine' ? tasks.filter((task) => task.owner === 'Alex') : tasks, [filter, tasks]);
  const counts = useMemo(() => ({
    overdue: tasks.filter((task) => task.due < DEMO_DATE).length,
    today: tasks.filter((task) => task.due === DEMO_DATE).length,
    next: tasks.filter((task) => task.due > DEMO_DATE && Date.parse(`${task.due}T00:00:00Z`) <= Date.parse('2026-10-22T00:00:00Z')).length,
  }), [tasks]);
  const grouped = ['Tuesday · 13', 'Thursday · 15', 'Friday · 16', 'Saturday · 17', 'Sunday · 18'].map((day) => ({ day, tasks: visibleTasks.filter((task) => task.day === day) })).filter((group) => group.tasks.length);
  const setStatus = (status) => setTasks((current) => current.map((task) => task.id === selected.id ? { ...task, status } : task));
  const setNotes = (notes) => setTasks((current) => current.map((task) => task.id === selected.id ? { ...task, notes } : task));

  return <BoardFrame number="01" title="From prototype to a shared workspace" subtitle="Authentication, persistent tasks, and a connected event workflow." footer={<><span>Task CRUD · Template generation · Shared database</span><span>Independent portfolio illustration · Fictional data</span></>}>
    <section className="product-shell" aria-label="Illustrative event operations workspace">
      <aside className="product-sidebar">
        <div className="product-brand"><BrandMark small /><span>fieldnote</span></div>
        <span className="side-label">WORKSPACE</span>
        <nav className="side-nav" aria-label="Product navigation">
          <a className="side-link" href="#overview"><Icon name="grid" />Overview</a>
          <a className="side-link side-link-active" href="#events"><Icon name="calendar" />Events</a>
          <a className="side-link" href="#tasks"><Icon name="check" />Tasks <span className="nav-count">8</span></a>
        </nav>
        <div className="sidebar-rule" />
        <div className="side-section-title"><span>UPCOMING EVENTS</span><button className="icon-button" type="button" aria-label="Create event" onClick={() => setShowCreate(true)}><Icon name="plus" size={16} /></button></div>
        <div className="event-list">{EVENTS.map((item) => <button className="event-item" type="button" key={item.id} onClick={() => setShowCreate(false)}><span className={`event-dot dot-${item.color}`} /><span className="event-item-copy"><strong>{item.name}</strong><small>{item.date} <i>·</i> {item.kind}</small></span></button>)}</div>
        <div className="sidebar-bottom"><span className="team-icon"><Icon name="lock" size={14} /></span><span><strong>Shared workspace</strong><small>Team access enabled</small></span></div>
      </aside>

      <section className="agenda-pane" aria-label="Week agenda">
        <div className="agenda-head"><div><div className="crumb">EVENTS <span>/</span> THIS WEEK</div><h2>Week agenda</h2><p>October 12 — 18, 2026 <span className="tiny-dot">·</span> Fixed demo date: Oct 15</p></div><button className="create-button" type="button" onClick={() => setShowCreate(true)}><Icon name="plus" size={15} />Create event</button></div>
        <div className="deadline-strip" aria-label="Task deadlines"><div className="deadline-title"><span>DEADLINES</span><small>as of Oct 15</small></div><div className="deadline-metric"><b className="metric-red">{counts.overdue}</b><span>Overdue</span></div><div className="deadline-metric"><b className="metric-amber">{counts.today}</b><span>Today</span></div><div className="deadline-metric"><b className="metric-teal">{counts.next}</b><span>Next 7 days</span></div></div>
        <div className="agenda-toolbar"><div className="filter-tabs" role="group" aria-label="Filter tasks"><button className={filter === 'all' ? 'filter-active' : ''} type="button" onClick={() => setFilter('all')}>All tasks</button><button className={filter === 'mine' ? 'filter-active' : ''} type="button" onClick={() => setFilter('mine')}>Assigned to me</button></div><button className="search-button" type="button" aria-label="Search tasks"><Icon name="search" size={16} /></button></div>
        <div className="agenda-groups">{grouped.map((group) => <div className="day-group" key={group.day}><div className="day-label"><span>{group.day}</span>{group.day === 'Thursday · 15' && <span className="today-label">TODAY</span>}</div><div className="day-tasks">{group.tasks.map((task) => <button key={task.id} type="button" className={`task-row${task.id === selectedId ? ' task-row-selected' : ''}`} onClick={() => setSelectedId(task.id)}><span className={`task-check${task.status === 'Done' ? ' task-check-done' : ''}`}>{task.status === 'Done' ? '✓' : ''}</span><span className="task-row-copy"><strong>{task.title}</strong><small>{EVENTS.find((item) => item.id === task.eventId)?.name} <i>·</i> {task.owner}</small></span><DeadlineKind task={task} /><span className="row-chevron">›</span></button>)}</div></div>)}</div>
        <div className="template-callout"><span className="template-icon">+</span><div><strong>Start from a template</strong><small>8 illustrative starter tasks, generated with a new event</small></div><button type="button" onClick={() => setShowTemplate((open) => !open)}>{showTemplate ? 'Hide preview' : 'Preview'} <Icon name="arrow" size={13} /></button></div>
        {showTemplate && <div className="template-popover"><div className="template-popover-head"><strong>Workshop · 8 starter tasks</strong><button type="button" aria-label="Close template preview" onClick={() => setShowTemplate(false)}>×</button></div><ol>{TEMPLATE_TASKS.map((item) => <li key={item}>{item}</li>)}</ol><small>Illustrative template preview · not saved</small></div>}
      </section>

      <aside className="inspector-pane" aria-label="Selected task details">
        <div className="inspector-top"><span>TASK DETAILS</span><span className="detail-dots">···</span></div>
        <div className="inspector-status"><span className="task-type"><span />TASK</span><DeadlineKind task={selected} /></div>
        <h3>{selected.title}</h3><div className="detail-id">TASK&nbsp; / &nbsp;{selected.id.toUpperCase()}</div>
        <div className="inspector-divider" />
        <div className="detail-field"><label>RELATED EVENT</label><div className="related-event"><span className={`event-dot dot-${event.color}`} /><span>{event.name}</span><span className="detail-chevron">›</span></div></div>
        <div className="detail-grid"><div className="detail-field"><label>ASSIGNEE</label><div className="assignee">{selected.owner}</div></div><div className="detail-field"><label>DUE DATE</label><div className="date-field"><span className="date-icon"><Icon name="calendar" size={15} /></span>{new Date(`${selected.due}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, 2026</div></div></div>
        <div className="detail-field status-field"><label>STATUS</label><select aria-label="Task status" value={selected.status} onChange={(e) => setStatus(e.target.value)}><option>To do</option><option>In progress</option><option>Waiting</option><option>Done</option></select></div>
        <div className="detail-field notes-field"><label>NOTES</label><textarea aria-label="Editable task notes" value={selected.notes} onChange={(e) => setNotes(e.target.value)} /></div>
        <div className="inspector-foot"><span className="saved-dot" />Local illustration state <span>·</span> not connected</div>
      </aside>
    </section>
    {showCreate && <div className="modal-backdrop" role="presentation" onClick={(e) => { if (e.target === e.currentTarget) setShowCreate(false); }}><section className="create-modal" role="dialog" aria-modal="true" aria-labelledby="create-title"><div className="modal-kicker">ILLUSTRATIVE WORKFLOW</div><button className="modal-close" type="button" aria-label="Close" onClick={() => setShowCreate(false)}>×</button><h2 id="create-title">Create an event</h2><p>In the described project, an event and its template tasks are created together through a database function.</p><label htmlFor="event-name">Event name</label><input id="event-name" value={eventName} onChange={(e) => setEventName(e.target.value)} placeholder="e.g. Community workshop" /><div className="modal-template"><span className="event-dot dot-teal" /><span>Workshop starter set</span><b>8 tasks</b></div><div className="modal-actions"><span>Local demonstration only</span><button type="button" onClick={() => setShowCreate(false)}>Close preview</button></div></section></div>}
  </BoardFrame>;
}

const FLOW_STEPS = [
  { n: '01', title: 'Sign in', text: 'Supabase Auth verifies an active team member.', icon: '01' },
  { n: '02', title: 'Create event', text: 'The event request includes a chosen task template.', icon: '02' },
  { n: '03', title: 'Generate tasks', text: 'A PostgreSQL function creates both together.', icon: '03' },
  { n: '04', title: 'Update task', text: 'Task fields and notes are written to PostgreSQL.', icon: '04' },
  { n: '05', title: 'Reload', text: 'The application requests its working data again.', icon: '05' },
  { n: '06', title: 'Read saved data', text: 'The authenticated member sees persisted records.', icon: '06' },
];

function WorkflowBoard() {
  return <BoardFrame number="02" title="Connect the workflow, preserve the product" subtitle="An existing task flow gains authenticated access and durable records.">
    <section className="workflow-content">
      <div className="sequence-label"><span>THE CONNECTED TASK FLOW</span><span>ILLUSTRATIVE SYSTEM DIAGRAM</span></div>
      <div className="flow-track">{FLOW_STEPS.map((step, index) => <React.Fragment key={step.n}><article className={`flow-step${index === 2 ? ' flow-step-accent' : ''}`}><span className="step-number">{step.n}</span><span className="step-glyph">{step.icon}</span><h2>{step.title}</h2><p>{step.text}</p></article>{index < FLOW_STEPS.length - 1 && <span className="flow-connector"><Icon name="arrow" size={18} /></span>}</React.Fragment>)}</div>
      <div className="workflow-rule"><span /><p>Event creation and template task generation happen together in <code>create_event_with_tasks</code>.</p><span /></div>
      <div className="flow-fragments">
        <article className="fragment-card login-fragment"><div className="fragment-top"><span className="mini-brand"><BrandMark small />fieldnote</span><span>01 / AUTH</span></div><div className="login-content"><div className="fragment-overline">WELCOME BACK</div><strong>Sign in to your team</strong><span className="fake-input">alex@example.test</span><span className="fake-button">Continue with email <Icon name="arrow" size={14} /></span><small>Active team members can access the workspace.</small></div></article>
        <article className="fragment-card preview-fragment"><div className="fragment-top"><span>TEMPLATE PREVIEW</span><span>02 / CREATE</span></div><div className="preview-content"><div className="preview-title"><span className="event-dot dot-teal" /><strong>Community workshop</strong></div><div className="preview-sub">Workshop starter set <Badge kind="teal">8 tasks</Badge></div><ul>{TEMPLATE_TASKS.slice(0, 4).map((task) => <li key={task}><span className="tiny-check" />{task}</li>)}</ul><div className="preview-more">+ 4 more starter tasks</div></div></article>
        <article className="fragment-card record-fragment"><div className="fragment-top"><span>TASK RECORD</span><span>03 / READ</span></div><div className="record-content"><div className="record-title"><span className="record-check">✓</span><div><strong>Confirm access and room layout</strong><small>Community workshop</small></div></div><div className="record-fields"><span>OWNER <b>Alex</b></span><span>DUE <b>Oct 15, 2026</b></span><span>STATUS <Badge kind="teal">In progress</Badge></span></div><div className="record-note">“Walk through the room with the venue contact.”</div><div className="record-foot"><span className="saved-dot" />Example persisted task shape</div></div></article>
      </div>
      <div className="workflow-note"><Icon name="lock" size={16} /><span>Shared, persistent data is read after reload. This diagram explains the implementation; it is not an automated test report.</span></div>
    </section>
  </BoardFrame>;
}

function ArchitectureBoard() {
  return <BoardFrame number="03" title="A practical stack for an existing MVP" subtitle="The browser app talks directly to Supabase using the signed-in member’s session.">
    <section className="architecture-content">
      <div className="architecture-label"><span>REQUEST &amp; DATA PATH</span><span>NO SEPARATE APPLICATION SERVER</span></div>
      <div className="architecture-diagram">
        <article className="arch-node hosting-node"><div className="node-cap"><span className="node-icon cloud-icon"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M7 20.5h17.2a4.3 4.3 0 0 0 .1-8.6A8.4 8.4 0 0 0 8.5 10a5.2 5.2 0 0 0-1.5 10.5Z" /></svg></span><span className="node-label">HOSTING</span></div><h2>Cloudflare Pages</h2><p>Serves the built React + Vite frontend.</p><span className="node-foot">Demo deployment</span></article>
        <span className="arch-link link-hosting"><span>serves app</span><i /></span>
        <article className="arch-node frontend-node"><div className="node-cap"><span className="node-icon frontend-icon"><BrandMark small /></span><span className="node-label">FRONTEND</span></div><h2>React + Vite</h2><p>Existing calendar, list, and event views with task workflows.</p><div className="client-pill">supabase-js client</div><span className="node-foot">User session attached to requests</span></article>
        <div className="supabase-cluster"><div className="cluster-heading"><span className="cluster-mark">S</span><span>SUPABASE</span><span className="cluster-rule" /></div>
          <article className="arch-node auth-node"><div className="node-cap"><span className="node-icon auth-icon"><Icon name="lock" size={20} /></span><span className="node-label">IDENTITY</span></div><h2>Supabase Auth</h2><p>Sign-in for active, allowlisted team members.</p><span className="node-foot">Same edit permissions</span></article>
          <article className="arch-node database-node"><div className="node-cap"><span className="node-icon database-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" /></svg></span><span className="node-label">PERSISTENCE</span></div><h2>PostgreSQL + RLS</h2><p>RLS checks active membership before protected data access.</p><div className="table-chips"><span>events</span><span>tasks</span><span>task_templates</span><span>team_members</span></div><div className="rpc-block"><span>DATABASE FUNCTION</span><strong>create_event_with_tasks</strong><small>Creates event + template-generated tasks together</small></div></article>
        </div>
        <span className="arch-link link-auth"><span>sign-in</span><i /></span>
        <span className="arch-link link-data"><span>session · data · RPC</span><i /></span>
        <div className="flow-key"><span><i className="key-solid" /> authenticated request</span><span><i className="key-dash" /> mutation then reload</span></div>
      </div>
      <div className="architecture-details"><div className="relationship-note"><span className="relationship-symbol">↳</span><div><span>RELATIONSHIP</span><code>tasks.event_id → events.id</code></div><small>UUID link <i>·</i> cascade delete</small></div><div className="reload-note"><span className="reload-symbol"><Icon name="arrow" size={17} /></span><div><span>AFTER A SUCCESSFUL MUTATION</span><p>The frontend reloads application data so the current view reflects saved records.</p></div></div></div>
      <div className="architecture-caveat"><span className="caveat-mark">i</span><span>Shared data loads on refresh; realtime is not implemented.</span></div>
    </section>
  </BoardFrame>;
}

function BeforeAfterBoard() {
  return <BoardFrame number="04" title="Extend an existing MVP" subtitle="The contribution was persistence and integration.">
    <section className="comparison-content">
      <div className="comparison-intro"><span>CONTINUATION, NOT A GREENFIELD REBUILD</span><span>BEFORE → AFTER</span></div>
      <div className="comparison-panels">
        <article className="comparison-panel before-panel"><div className="panel-header"><div><span className="panel-kicker">BEFORE</span><h2>Existing prototype</h2></div><span className="panel-index">01</span></div><div className="panel-illustration prototype-illustration"><div className="mini-window-bar"><span /><span /><span /><b>Workspace · local state</b></div><div className="prototype-body"><div className="prototype-nav"><i /><i /><i /></div><div className="prototype-content"><div className="prototype-head"><b>Upcoming</b><span>Calendar · List · Events</span></div><div className="prototype-task-list"><div><span>OCT 15 · THU</span><b>Community workshop</b><small>Confirm room access · Morgan</small></div><div><span>OCT 16 · FRI</span><b>Studio open day</b><small>Prepare materials · Jamie</small></div><div><span>OCT 19 · MON</span><b>Partner briefing</b><small>Review the agenda · Alex</small></div></div></div></div></div><ul className="comparison-list"><li><span className="list-mark existing-mark">✓</span><span>Calendar and task interface already present.</span></li><li><span className="list-mark existing-mark">✓</span><span>Wedding task-generation logic already present.</span></li><li><span className="list-mark state-mark">↗</span><span>Changes held in React state.</span></li><li><span className="list-mark state-mark">↺</span><span>Reload resets working data.</span></li></ul><div className="panel-foot"><span className="status-dot status-neutral" />Useful working interface, without persistence.</div></article>
        <div className="comparison-divider"><span>INTEGRATION</span><i><Icon name="arrow" size={20} /></i></div>
        <article className="comparison-panel after-panel"><div className="panel-header"><div><span className="panel-kicker">AFTER</span><h2>Connected workflow</h2></div><span className="panel-index">02</span></div><div className="panel-illustration integrated-illustration"><div className="mini-window-bar"><span /><span /><span /><b>Fieldnote · shared workspace</b></div><div className="integrated-body"><div className="integrated-sidebar"><i /><i /><i /></div><div className="integrated-records"><div className="integrated-title">Tasks <span>Oct 15</span></div><div className="integrated-task"><i /><b>Confirm access and room layout</b><em>In progress</em></div><div className="integrated-task"><i /><b>Collect dietary notes</b><em className="amber-em">In 2 days</em></div><div className="integrated-task"><i /><b>Prepare welcome table</b><em>Oct 20</em></div><div className="integrated-saved"><span className="saved-dot" />PostgreSQL · authenticated access</div></div></div></div><ul className="comparison-list after-list"><li><span className="list-mark added-mark">+</span><span>Supabase-backed task persistence.</span></li><li><span className="list-mark added-mark">+</span><span>Authenticated team access.</span></li><li><span className="list-mark added-mark">+</span><span>Database-driven event/task generation.</span></li><li><span className="list-mark added-mark">+</span><span>Task CRUD, status, notes, and visual deadlines.</span></li><li><span className="list-mark added-mark">+</span><span>Demo deployment and handover documentation.</span></li></ul><div className="panel-foot"><span className="status-dot status-teal" />Task persistence integrated with the existing app.</div></article>
      </div>
      <div className="scope-note"><span className="scope-icon">i</span><p>Event editing persistence and advanced user administration remain outside the completed work shown here.</p><span className="scope-tag">DEFINED SCOPE</span></div>
      <div className="comparison-caption"><span>Existing product foundations retained; data handling extended.</span><span>NO CLAIM OF FULL EVENT CRUD</span></div>
    </section>
  </BoardFrame>;
}

const GALLERY_ITEMS = [
  { href: '/mock', number: '01', title: 'Product workspace', description: 'A connected, day-by-day task workflow with a selected task inspector.' },
  { href: '/workflow', number: '02', title: 'Workflow', description: 'From team sign-in to generated tasks and data reloaded from storage.' },
  { href: '/architecture', number: '03', title: 'Architecture', description: 'A direct, session-authenticated React-to-Supabase integration.' },
  { href: '/before-after', number: '04', title: 'Before / after', description: 'Persistence and integration added to an existing working MVP.' },
];

function Gallery() {
  return <main className="gallery-page"><header className="gallery-header"><a className="brand-lockup" href="/"><BrandMark /><span>fieldnote</span></a><span>INDEPENDENT PORTFOLIO STUDY</span><span>2026</span></header><section className="gallery-hero"><p className="eyebrow">EVENT OPERATIONS WORKSPACE</p><h1>Fieldnote, in four frames.</h1><p>A fictional product study illustrating the integration work behind an existing event-planning MVP.</p><div className="gallery-disclaimer"><Icon name="lock" size={16} /><span>Independent portfolio illustration · Fictional data · Not a production app</span></div></section><section className="gallery-grid" aria-label="Illustration boards">{GALLERY_ITEMS.map((item) => <a className="gallery-card" href={item.href} key={item.href}><div className={`gallery-card-art gallery-art-${item.number}`}><span className="art-paper"><BrandMark small /><i /><i /><i /><i /></span><span className="art-caption">INDEPENDENT ILLUSTRATION</span></div><div className="gallery-card-copy"><span className="gallery-card-number">{item.number} / 04</span><h2>{item.title}<Icon name="arrow" size={17} /></h2><p>{item.description}</p></div></a>)}</section><footer className="gallery-footer"><span>Fieldnote is fictional. No production system, backend, or client data is connected.</span><span>SELECT A BOARD TO VIEW</span></footer></main>;
}

function App() {
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  const board = { '/mock': <WorkspaceBoard />, '/workflow': <WorkflowBoard />, '/architecture': <ArchitectureBoard />, '/before-after': <BeforeAfterBoard /> }[path];
  return board ?? <Gallery />;
}

createRoot(document.getElementById('root')).render(<App />);
