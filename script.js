// OZK Logistics — інтерактивність сайту. © Олександр Захарчук 2026
document.addEventListener('DOMContentLoaded', () => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const fmt = n => Math.round(n).toLocaleString('uk-UA') + ' ₴';

  /* ---- мобільне меню ---- */
  const burger = $('#burger'), nav = $('#nav');
  burger.addEventListener('click', () => { burger.classList.toggle('open'); nav.classList.toggle('open'); });
  $$('#nav a').forEach(a => a.addEventListener('click', () => { burger.classList.remove('open'); nav.classList.remove('open'); }));

  /* ---- тінь шапки + активний пункт меню ---- */
  const header = $('#header');
  const sections = $$('main section[id]');
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 10);
    let current = '';
    sections.forEach(s => { if (window.scrollY >= s.offsetTop - 120) current = s.id; });
    $$('#nav a').forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + current));
  });

  /* ---- анімація появи блоків ---- */
  $$('.card, .steps li, .adv__item, blockquote, .route-list li, .compare').forEach(el => el.classList.add('reveal'));
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
  }), { threshold: .15 });
  $$('.reveal').forEach(el => io.observe(el));

  /* ---- лічильники ---- */
  const counterIO = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target, target = +el.dataset.count; let cur = 0;
    const step = Math.max(1, Math.ceil(target / 60));
    const t = setInterval(() => { cur = Math.min(target, cur + step); el.textContent = cur.toLocaleString('uk-UA') + (target === 1200 || target === 180 ? '+' : ''); if (cur >= target) clearInterval(t); }, 25);
    counterIO.unobserve(el);
  }), { threshold: .5 });
  $$('[data-count]').forEach(el => counterIO.observe(el));

  /* ---- калькулятор ---- */
  const distances = {
    'Київ': { 'Львів': 540, 'Одеса': 475, 'Дніпро': 480, 'Харків': 480, 'Варшава': 790, 'Берлін': 1360, 'Бухарест': 1150 },
    'Львів': { 'Львів': 10, 'Одеса': 790, 'Дніпро': 1000, 'Харків': 1020, 'Варшава': 390, 'Берлін': 960, 'Бухарест': 950 },
    'Житомир': { 'Львів': 400, 'Одеса': 570, 'Дніпро': 620, 'Харків': 620, 'Варшава': 650, 'Берлін': 1220, 'Бухарест': 1080 },
    'Вінниця': { 'Львів': 370, 'Одеса': 430, 'Дніпро': 570, 'Харків': 680, 'Варшава': 760, 'Берлін': 1290, 'Бухарест': 870 },
    'Рівне': { 'Львів': 210, 'Одеса': 730, 'Дніпро': 810, 'Харків': 810, 'Варшава': 470, 'Берлін': 1030, 'Бухарест': 1040 }
  };
  const foreign = ['Варшава', 'Берлін', 'Бухарест'];
  let mode = 'ftl';
  const ids = ['from', 'to', 'truck', 'distance', 'pallets', 'cargo', 'express', 'customs', 'loyal'];
  const el = Object.fromEntries(ids.map(i => [i, document.getElementById(i)]));

  function updateDistance() { el.distance.value = distances[el.from.value][el.to.value]; }
  function calc() {
    const from = el.from.value, to = el.to.value;
    let price;
    if (mode === 'ftl') {
      const km = Math.max(1, +el.distance.value || 0);
      price = km * +el.truck.value;
    } else {
      const p = Math.min(33, Math.max(1, +el.pallets.value || 1));
      price = p * +el.cargo.value;
      if (foreign.includes(to)) price *= 1.6; // міжнародна доставка збірних вантажів
    }
    if (el.express.checked) price *= 1.15;
    if (el.customs.checked) price += 2500;
    if (el.loyal.checked) price *= 0.9;
    $('#price').textContent = fmt(price);
    $('#priceNote').textContent = `Маршрут ${from} → ${to} · ${mode === 'ftl' ? el.distance.value + ' км, окреме авто' : el.pallets.value + ' пал., збірний вантаж'}`;
    if (foreign.includes(to) && !el.customs.checked) $('#priceNote').textContent += ' · рекомендуємо митне оформлення';
  }
  $$('.tab').forEach(tab => tab.addEventListener('click', () => {
    $$('.tab').forEach(t => t.classList.remove('active')); tab.classList.add('active');
    mode = tab.dataset.mode;
    $('.mode-ftl').classList.toggle('hidden', mode !== 'ftl');
    $('.mode-ltl').classList.toggle('hidden', mode !== 'ltl');
    calc();
  }));
  el.from.addEventListener('change', () => { updateDistance(); calc(); });
  el.to.addEventListener('change', () => { updateDistance(); el.customs.checked = foreign.includes(el.to.value); calc(); });
  ['truck', 'distance', 'pallets', 'cargo', 'express', 'customs', 'loyal'].forEach(i => el[i].addEventListener('input', calc));
  calc();
  $('#calcOrder').addEventListener('click', () => {
    $('#orderForm [name=msg]').value = `${$('#priceNote').textContent}. Розрахунок: ${$('#price').textContent}`;
  });

  /* ---- трекінг (демо-дані) ---- */
  const shipments = {
    'OZK-2026-0417': { route: 'Київ → Варшава', cargo: '8 палет, побутова хімія', status: 'В дорозі', way: true, progress: 62, eta: 'очікується 19.11.2026 до 14:00',
      steps: [['Заявку прийнято', '16.11, 09:12'], ['Завантажено на складі відправника', '16.11, 13:40'], ['Виїхав з хабу Київ', '16.11, 15:05'], ['Пункт пропуску Ягодин — Дорогуськ', 'зараз · черга ~2 год'], ['Митне оформлення в ЄС', ''], ['Доставлено отримувачу', '']], done: 4 },
    'OZK-2026-0102': { route: 'Житомир → Львів', cargo: '2,1 т, будматеріали', status: 'Доставлено', way: false, progress: 100, eta: 'доставлено 12.11.2026 о 11:20',
      steps: [['Заявку прийнято', '11.11, 08:30'], ['Завантажено', '11.11, 12:00'], ['В дорозі', '11.11, 12:15'], ['Доставлено отримувачу · фото підтвердження', '12.11, 11:20']], done: 4 }
  };
  function track(code) {
    const box = $('#trackResult');
    code = code.trim().toUpperCase();
    const s = shipments[code];
    if (!code) { box.innerHTML = '<p class="error">Введіть номер вантажу.</p>'; return; }
    if (!s) { box.innerHTML = `<p class="error">Вантаж «${code.replace(/[<>&"]/g, '')}» не знайдено. Перевірте номер або зверніться до логіста: +38 (044) 123-45-67.</p>`; return; }
    box.innerHTML = `
      <div class="track-card">
        <div class="track-card__head">
          <div><h3>${code}</h3><p>${s.route} · ${s.cargo}</p></div>
          <div><span class="status ${s.way ? 'status--way' : ''}">${s.status}</span><p><small>${s.eta}</small></p></div>
        </div>
        <div class="progress"><i style="width:0"></i></div>
        <ul class="timeline">${s.steps.map((st, i) => `<li class="${i < s.done ? 'done' : ''}"><div>${st[0]}<small>${st[1]}</small></div></li>`).join('')}</ul>
      </div>`;
    requestAnimationFrame(() => setTimeout(() => { $('.progress i', box).style.width = s.progress + '%'; }, 50));
  }
  $('#trackForm').addEventListener('submit', e => { e.preventDefault(); track($('#trackInput').value); });
  $$('[data-demo]').forEach(b => b.addEventListener('click', () => { $('#trackInput').value = b.dataset.demo; track(b.dataset.demo); }));

  /* ---- форма заявки ---- */
  const form = $('#orderForm'), msg = $('#formMsg');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = form.elements.name.value.trim(), phone = form.phone.value.trim(), email = form.email.value.trim();
    let ok = true;
    form.elements.name.classList.toggle('invalid', name.length < 2); if (name.length < 2) ok = false;
    const phoneOk = /^\+?[\d\s()-]{10,}$/.test(phone);
    form.phone.classList.toggle('invalid', !phoneOk); if (!phoneOk) ok = false;
    const emailOk = !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    form.email.classList.toggle('invalid', !emailOk); if (!emailOk) ok = false;
    if (!form.agree.checked) ok = false;
    if (!ok) { msg.className = 'form-msg err'; msg.textContent = 'Перевірте правильність заповнення полів та погодьтеся з обробкою даних.'; return; }
    const orders = JSON.parse(localStorage.getItem('ozkOrders') || '[]');
    const id = 'OZK-2026-' + String(1000 + orders.length + Math.floor(Math.random() * 8000)).padStart(4, '0');
    orders.push({ id, name, phone, email, msg: form.msg.value, date: new Date().toISOString() });
    localStorage.setItem('ozkOrders', JSON.stringify(orders));
    msg.className = 'form-msg ok';
    msg.textContent = `Дякуємо, ${name.split(',')[0]}! Заявку № ${id} прийнято — логіст зателефонує протягом 15 хвилин.`;
    form.reset();
  });
});
