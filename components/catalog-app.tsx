import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { CardState, TrademarkRecord, initialTrademarks } from '../lib/catalog-data';

type View = 'overview' | 'catalogue' | 'structure' | 'about';
type Filter = 'all' | CardState;

const navigation: { id: View; number: string; label: string }[] = [
  { id: 'overview', number: '01', label: 'Обзор' },
  { id: 'catalogue', number: '02', label: 'Каталог' },
  { id: 'structure', number: '03', label: 'Поля карточки' },
  { id: 'about', number: '04', label: 'Возможности' },
];

const stateLabels: Record<CardState, string> = {
  partial: 'Заполнено частично',
  filled: 'Заполнено',
  draft: 'Черновик',
};

function RecordRow({ item, onOpen }: { item: TrademarkRecord; onOpen: (item: TrademarkRecord) => void }) {
  return (
    <article className="record-row">
      <span className="monogram">{item.monogram}</span>
      <div className="record-identity">
        <strong>{item.name}</strong>
        <small>{item.owner} · {item.registrationNumber}</small>
      </div>
      <span className={`status ${item.state}`}>{stateLabels[item.state]}</span>
      <div className="record-meta"><strong>{item.kind}</strong><small>МКТУ {item.classes}</small></div>
      <button type="button" onClick={() => onOpen(item)} aria-label={`Открыть карточку ${item.name}`}>Открыть</button>
    </article>
  );
}

export default function CatalogueApp() {
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [view, setView] = useState<View>('overview');
  const [filter, setFilter] = useState<Filter>('all');
  const [trademarks, setTrademarks] = useState(initialTrademarks);
  const [selected, setSelected] = useState<TrademarkRecord | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [query, setQuery] = useState('');
  const [mobileMenu, setMobileMenu] = useState(false);
  const [notice, setNotice] = useState('');

  const catalogueRecords = useMemo(() => {
    const value = query.trim().toLocaleLowerCase('ru-RU');
    return trademarks.filter((item) => {
      const matchesFilter = filter === 'all' || item.state === filter;
      const matchesQuery = !value || `${item.name} ${item.owner} ${item.registrationNumber}`.toLocaleLowerCase('ru-RU').includes(value);
      return matchesFilter && matchesQuery;
    });
  }, [filter, query, trademarks]);

  const partialRecords = useMemo(() => trademarks.filter((item) => item.state === 'partial'), [trademarks]);

  const counts = {
    all: trademarks.length,
    partial: partialRecords.length,
    filled: trademarks.filter((item) => item.state === 'filled').length,
    draft: trademarks.filter((item) => item.state === 'draft').length,
  };

  function changeView(next: View) {
    setView(next);
    setMobileMenu(false);
    setSelected(null);
  }

  function showNotice(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 2600);
  }

  function openCatalogue(nextFilter: Filter) {
    setFilter(nextFilter);
    setView('catalogue');
  }

  function addTrademark(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get('name') ?? '').trim();
    const owner = String(form.get('owner') ?? '').trim();
    const classes = String(form.get('classes') ?? '').trim();
    if (!name || !owner || !classes) return;

    const created: TrademarkRecord = {
      id: `record-${Date.now()}`,
      monogram: name.slice(0, 1).toLocaleUpperCase('ru-RU'),
      name,
      owner,
      registrationNumber: `CAT-TM-${String(trademarks.length + 1).padStart(3, '0')}`,
      classes,
      kind: 'Не указан',
      state: 'draft',
      note: 'Карточка добавлена в текущем сеансе.',
    };

    setTrademarks((items) => [created, ...items]);
    setShowAddForm(false);
    setFilter('all');
    setView('catalogue');
    showNotice(`Карточка «${name}» добавлена`);
  }

  if (!workspaceOpen) {
    return <LandingPage onOpen={() => setWorkspaceOpen(true)} />;
  }

  return (
    <main className="app-shell">
      <aside className={`sidebar ${mobileMenu ? 'mobile-open' : ''}`} id="primary-navigation">
        <button className="brand brand-button" type="button" onClick={() => setWorkspaceOpen(false)} aria-label="Вернуться на главную страницу"><span className="brand-mark">К</span><span>Контроль ИС</span></button>
        <button className="mobile-close" type="button" onClick={() => setMobileMenu(false)}>Закрыть</button>
        <p className="nav-label">РАБОЧИЙ КАБИНЕТ</p>
        <nav className="side-nav" aria-label="Основные разделы">
          {navigation.map((item) => (
            <button className={view === item.id ? 'active' : ''} key={item.id} type="button" onClick={() => changeView(item.id)}>
              <span>{item.number}</span>{item.label}
            </button>
          ))}
        </nav>
        <button
          className="reset-button"
          type="button"
          onClick={() => {
            setTrademarks(initialTrademarks);
            setFilter('all');
            setQuery('');
            showNotice('Исходные данные восстановлены');
          }}
        >
          Сбросить изменения
        </button>
        <div className="data-note"><small>РАБОЧАЯ СЕССИЯ</small><strong>{trademarks.length} записей</strong><p>Новые карточки доступны до обновления страницы.</p></div>
      </aside>

      {mobileMenu && <button className="menu-backdrop" type="button" aria-label="Закрыть меню" onClick={() => setMobileMenu(false)} />}

      <section className="workspace">
        <header className="topbar">
          <button className="menu-button" type="button" aria-controls="primary-navigation" aria-expanded={mobileMenu} onClick={() => setMobileMenu(true)}>Меню</button>
          <div><small>РАБОЧЕЕ ПРОСТРАНСТВО</small><strong>Каталог товарных знаков</strong></div>
          <div className="user-chip"><span>КИ</span><div><strong>Контроль ИС</strong><small>Рабочий кабинет</small></div></div>
        </header>

        <div className="dashboard-content">
          {view === 'overview' && (
            <>
              <ViewHeading
                eyebrow="КАТАЛОГ КАРТОЧЕК"
                title="Обзор портфеля"
                text="Количество и состояние карточек товарных знаков."
                action="Добавить карточку"
                onAction={() => setShowAddForm(true)}
              />

              <section className="metric-grid" aria-label="Сводка по карточкам">
                <button className="metric-card" type="button" onClick={() => openCatalogue('all')}><small>ВСЕ КАРТОЧКИ</small><strong>{counts.all}</strong><p>Все записи каталога</p></button>
                <button className="metric-card attention" type="button" onClick={() => openCatalogue('partial')}><small>ЗАПОЛНЕНО ЧАСТИЧНО</small><strong>{counts.partial}</strong><p>В карточках отсутствуют отдельные поля</p></button>
                <button className="metric-card" type="button" onClick={() => openCatalogue('draft')}><small>ЧЕРНОВИКИ</small><strong>{counts.draft}</strong><p>Карточки в начальном состоянии</p></button>
              </section>

              <div className="dashboard-grid">
                <section className="panel records-panel">
                  <div className="panel-heading"><div><p className="eyebrow"><span /> КАРТОЧКИ</p><h2>Заполнено частично</h2></div><button type="button" onClick={() => openCatalogue('partial')}>Показать все</button></div>
                  <div className="record-list">{partialRecords.slice(0, 3).map((item) => <RecordRow item={item} key={item.id} onOpen={setSelected} />)}</div>
                </section>

                <aside className="panel guide-panel">
                  <p className="eyebrow"><span /> ТРЕБУЮТ ВНИМАНИЯ</p><h2>Состояние карточек</h2>
                  <ol>
                    <li><span>{counts.partial}</span><div><strong>Неполные сведения</strong><p>В карточках отсутствуют отдельные поля.</p></div></li>
                    <li><span>{counts.draft}</span><div><strong>Черновики</strong><p>Записи находятся в начальном состоянии.</p></div></li>
                    <li><span>{counts.filled}</span><div><strong>Заполнено</strong><p>Основные сведения внесены.</p></div></li>
                  </ol>
                  <button className="secondary-button" type="button" onClick={() => changeView('catalogue')}>Открыть каталог</button>
                </aside>
              </div>
            </>
          )}

          {view === 'catalogue' && (
            <section className="view-stack">
              <ViewHeading eyebrow="КАТАЛОГ" title="Товарные знаки" text="Поиск по названию, правообладателю или условному номеру." action="Добавить карточку" onAction={() => setShowAddForm(true)} />
              <FilterTabs filter={filter} onChange={setFilter} counts={counts} />
              <label className="search-field"><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Название, правообладатель или номер" /></label>
              <section className="panel records-panel expanded">
                <div className="panel-heading"><div><p className="eyebrow"><span /> РЕЗУЛЬТАТЫ</p><h2>Найдено: {catalogueRecords.length}</h2></div></div>
                <div className="record-list">
                  {catalogueRecords.length > 0
                    ? catalogueRecords.map((item) => <RecordRow item={item} key={item.id} onOpen={setSelected} />)
                    : <EmptyState onClear={() => { setQuery(''); setFilter('all'); }} />}
                </div>
              </section>
            </section>
          )}

          {view === 'structure' && (
            <section className="view-stack">
              <ViewHeading eyebrow="ДАННЫЕ КАРТОЧКИ" title="Поля карточки" text="Основные сведения по каждому товарному знаку." />
              <div className="info-grid">
                <section className="panel info-card"><span>01</span><h2>Обозначение</h2><p>Название, номер карточки и тип обозначения.</p></section>
                <section className="panel info-card"><span>02</span><h2>Правообладатель и классы</h2><p>Правообладатель и классы МКТУ, указанные в карточке.</p></section>
                <section className="panel info-card"><span>03</span><h2>Статус заполнения</h2><p>Заполнено, заполнено частично или черновик.</p></section>
              </div>
            </section>
          )}

          {view === 'about' && (
            <section className="view-stack">
              <ViewHeading eyebrow="ВОЗМОЖНОСТИ" title="Рабочий кабинет" text="Сводка, каталог и карточки товарных знаков в одном пространстве." />
              <div className="info-grid">
                <section className="panel info-card"><span>01</span><h2>Понятный обзор</h2><p>Крупные показатели и простой список помогают быстро ориентироваться в карточках.</p></section>
                <section className="panel info-card"><span>02</span><h2>Единая структура</h2><p>Название, правообладатель, классы и состояние собраны в одной карточке.</p></section>
                <section className="panel info-card"><span>03</span><h2>Хранение в сеансе</h2><p>Добавленные карточки доступны до обновления страницы; внешние сервисы не используются.</p></section>
              </div>
              <section className="panel scope-panel"><p className="eyebrow"><span /> ДОСТУПНЫЕ ДЕЙСТВИЯ</p><h2>Работа с каталогом</h2><p>Поиск, фильтры, просмотр подробных карточек и добавление записей.</p></section>
            </section>
          )}
        </div>
      </section>

      {selected && <TrademarkDialog item={selected} onClose={() => setSelected(null)} />}
      {showAddForm && <AddTrademarkDialog onClose={() => setShowAddForm(false)} onSubmit={addTrademark} />}
      {notice && <div className="toast" role="status">✓ {notice}</div>}
    </main>
  );
}

function LandingPage({ onOpen }: { onOpen: () => void }) {
  return (
    <main className="landing-page">
      <header className="landing-header">
        <div className="landing-brand"><span>К</span><strong>Контроль ИС</strong></div>
        <nav aria-label="Навигация по главной странице">
          <a href="#capabilities">Возможности</a>
          <a href="#portfolio">Работа с портфелем</a>
        </nav>
        <button type="button" onClick={onOpen}>Открыть кабинет</button>
      </header>

      <section className="landing-hero">
        <div className="hero-copy">
          <p className="landing-kicker"><span /> КАТАЛОГ ТОВАРНЫХ ЗНАКОВ</p>
          <h1>Карточки товарных знаков — <em>в полном порядке.</em></h1>
          <p className="hero-lead">Единый каталог для ведения, поиска и просмотра сведений по товарным знакам.</p>
          <div className="hero-actions">
            <button className="landing-primary" type="button" onClick={onOpen}>Открыть рабочий кабинет <span>→</span></button>
            <a href="#capabilities">Посмотреть возможности</a>
          </div>
          <ul className="hero-points" aria-label="Основные преимущества">
            <li><span>✓</span> Состояние портфеля перед глазами</li>
            <li><span>✓</span> Поиск по основным реквизитам</li>
            <li><span>✓</span> Единая структура карточек</li>
          </ul>
        </div>

        <div className="hero-visual" aria-label="Рабочий кабинет">
          <div className="visual-orbit one" />
          <div className="visual-orbit two" />
          <div className="workspace-preview">
            <div className="preview-bar"><div><span /><span /><span /></div><strong>Контроль ИС</strong><small>Рабочий кабинет</small></div>
            <div className="preview-layout">
              <aside><span className="preview-logo">К</span><i /><i /><i /></aside>
              <div className="preview-content">
                <p>ОБЗОР ПОРТФЕЛЯ</p>
                <h2>Товарные знаки</h2>
                <div className="preview-metrics"><div><small>ВСЕ КАРТОЧКИ</small><strong>8</strong></div><div className="warm"><small>ЗАПОЛНЕНО ЧАСТИЧНО</small><strong>3</strong></div><div><small>ЧЕРНОВИКИ</small><strong>2</strong></div></div>
                <div className="preview-list">
                  <div><b>К</b><span><strong>Кедровый маяк</strong><small>ООО «Кедровый контур»</small></span><em>Частично</em></div>
                  <div><b>Я</b><span><strong>Янтарная нить</strong><small>ООО «Янтарный вектор»</small></span><em className="ready">Заполнено</em></div>
                  <div><b>Т</b><span><strong>Тихая волна</strong><small>ООО «Тихая форма»</small></span><em className="draft">Черновик</em></div>
                </div>
              </div>
            </div>
          </div>
          <div className="floating-card"><small>НАЙДЕНО</small><strong>8 карточек</strong><span>Нужная карточка — за один шаг</span></div>
        </div>
      </section>

      <section className="landing-strip" aria-label="Ключевые разделы">
        <div><span>01</span><strong>Обзор портфеля</strong><p>Количество и состояние карточек.</p></div>
        <div><span>02</span><strong>Быстрый поиск</strong><p>Название, правообладатель или номер записи.</p></div>
        <div><span>03</span><strong>Данные карточки</strong><p>Правообладатель, классы МКТУ и статус.</p></div>
      </section>

      <section className="landing-section" id="capabilities">
        <div className="section-intro"><p className="landing-kicker"><span /> ВОЗМОЖНОСТИ</p><h2>Портфель<br />под контролем.</h2><p>Сведения по товарным знакам собраны в понятной структуре: от общего состояния до отдельной карточки.</p></div>
        <div className="feature-grid">
          <article><span>01</span><div className="feature-icon">◎</div><h3>Состояние портфеля</h3><p>Сводка показывает общее число карточек, черновики и записи с неполными сведениями.</p></article>
          <article><span>02</span><div className="feature-icon">⌕</div><h3>Нужная карточка</h3><p>Поиск по названию, правообладателю или номеру сокращает путь к сведениям.</p></article>
          <article><span>03</span><div className="feature-icon">□</div><h3>Полнота сведений</h3><p>Статусы помогают заметить карточки, в которых ещё не заполнены отдельные поля.</p></article>
        </div>
      </section>

      <section className="landing-workflow" id="portfolio">
        <div><p className="landing-kicker light"><span /> РАБОТА С ПОРТФЕЛЕМ</p><h2>Все нужные сведения — под рукой.</h2><button type="button" onClick={onOpen}>Открыть каталог <span>→</span></button></div>
        <ol>
          <li><span>01</span><div><h3>Сводка по портфелю</h3><p>Количество записей и полнота заполнения видны на одном экране.</p></div></li>
          <li><span>02</span><div><h3>Быстрый поиск</h3><p>Карточки доступны по названию, правообладателю или номеру.</p></div></li>
          <li><span>03</span><div><h3>Единая карточка</h3><p>Основные сведения и рабочая заметка собраны в одном окне.</p></div></li>
        </ol>
      </section>

      <footer className="landing-footer">
        <div className="landing-brand"><span>К</span><strong>Контроль ИС</strong></div>
        <p>Порядок в карточках товарных знаков.</p>
        <small>© 2026 Контроль ИС</small>
      </footer>
    </main>
  );
}

function ViewHeading({ eyebrow, title, text, action, onAction }: { eyebrow: string; title: string; text: string; action?: string; onAction?: () => void }) {
  return <section className="welcome-row"><div><p className="eyebrow"><span /> {eyebrow}</p><h1>{title}</h1><p>{text}</p></div>{action && <button className="primary-button" type="button" onClick={onAction}>+ {action}</button>}</section>;
}

function FilterTabs({ filter, onChange, counts }: { filter: Filter; onChange: (filter: Filter) => void; counts: Record<Filter, number> }) {
  const options: { value: Filter; label: string }[] = [
    { value: 'all', label: 'Все' },
    { value: 'partial', label: 'Частично' },
    { value: 'filled', label: 'Заполнено' },
    { value: 'draft', label: 'Черновики' },
  ];
  return <section className="filter-tabs" aria-label="Фильтр состояния">{options.map((option) => <button className={filter === option.value ? 'active' : ''} aria-pressed={filter === option.value} key={option.value} type="button" onClick={() => onChange(option.value)}>{option.label} <span>{counts[option.value]}</span></button>)}</section>;
}

function EmptyState({ onClear }: { onClear: () => void }) {
  return <div className="empty-state"><strong>Ничего не найдено</strong><p>Проверьте запрос или сбросьте фильтры.</p><button type="button" onClick={onClear}>Очистить поиск</button></div>;
}

function TrademarkDialog({ item, onClose }: { item: TrademarkRecord; onClose: () => void }) {
  const dialogRef = useDialogFocus(onClose);
  return (
    <div className="dialog-layer" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}>
      <section className="dialog" ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="trademark-title">
        <button className="dialog-close" type="button" onClick={onClose} aria-label="Закрыть">×</button>
        <p className="eyebrow"><span /> КАРТОЧКА ТОВАРНОГО ЗНАКА</p>
        <div className="dialog-title"><span className="monogram large">{item.monogram}</span><div><h2 id="trademark-title">{item.name}</h2><p>{item.registrationNumber}</p></div></div>
        <span className={`status ${item.state}`}>{stateLabels[item.state]}</span>
        <dl className="facts-list">
          <div><dt>Правообладатель</dt><dd>{item.owner}</dd></div>
          <div><dt>Классы МКТУ</dt><dd>{item.classes}</dd></div>
          <div><dt>Тип обозначения</dt><dd>{item.kind}</dd></div>
          <div><dt>Состояние карточки</dt><dd>{stateLabels[item.state]}</dd></div>
        </dl>
        <div className="note-box"><strong>Рабочая заметка</strong><p>{item.note}</p></div>
        <div className="dialog-actions"><button className="secondary-button" type="button" onClick={onClose}>Закрыть</button></div>
      </section>
    </div>
  );
}

function AddTrademarkDialog({ onClose, onSubmit }: { onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  const dialogRef = useDialogFocus(onClose);
  return (
    <div className="dialog-layer" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}>
      <section className="dialog compact" ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="add-title">
        <button className="dialog-close" type="button" onClick={onClose} aria-label="Закрыть">×</button>
        <p className="eyebrow"><span /> НОВАЯ КАРТОЧКА</p><h2 id="add-title">Добавить карточку</h2>
        <form className="add-form" onSubmit={onSubmit}>
          <label><span>Название</span><input name="name" required placeholder="Например, Новый знак" /></label>
          <label><span>Правообладатель</span><input name="owner" required placeholder="Например, ООО «Компания»" /></label>
          <label><span>Классы МКТУ</span><input name="classes" required placeholder="Например, 9, 35" /></label>
          <p>Карточка сохранится только до перезагрузки страницы.</p>
          <div className="dialog-actions"><button className="secondary-button" type="button" onClick={onClose}>Отмена</button><button className="primary-button" type="submit">Добавить</button></div>
        </form>
      </section>
    </div>
  );
}

function useDialogFocus(onClose: () => void) {
  const dialogRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [onClose]);

  return dialogRef;
}
