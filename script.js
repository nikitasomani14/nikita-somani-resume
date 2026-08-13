(() => {
  const body = document.body;
  body.classList.add('animations-ready');
  const themeButton = document.querySelector('.theme-toggle');
  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.site-nav');
  const navLinks = [...document.querySelectorAll('.site-nav a')];

  const storage = {
    get(key) {
      try { return localStorage.getItem(key); } catch (_) { return null; }
    },
    set(key, value) {
      try { localStorage.setItem(key, value); } catch (_) { /* Browsing context may block storage. */ }
    }
  };

  const savedTheme = storage.get('nikita-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) body.classList.add('dark');

  const updateThemeLabel = () => {
    const isDark = body.classList.contains('dark');
    themeButton.setAttribute('aria-label', `Switch to ${isDark ? 'light' : 'dark'} theme`);
  };
  updateThemeLabel();

  themeButton.addEventListener('click', () => {
    body.classList.toggle('dark');
    storage.set('nikita-theme', body.classList.contains('dark') ? 'dark' : 'light');
    updateThemeLabel();
  });

  menuButton.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
  navLinks.forEach(link => link.addEventListener('click', () => {
    nav.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
  }));

  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -5% 0px' });
    revealItems.forEach(el => revealObserver.observe(el));
  } else {
    revealItems.forEach(el => el.classList.add('visible'));
  }

  const sections = [...document.querySelectorAll('main section[id]')];
  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navLinks.forEach(link => link.classList.toggle('active', link.hash === `#${entry.target.id}`));
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
    sections.forEach(section => sectionObserver.observe(section));
  }

  const showToast = (message) => {
    const toast = document.querySelector('.toast');
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove('show'), 2200);
  };

  document.querySelectorAll('.filter-chip').forEach(button => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;
      document.querySelectorAll('.filter-chip').forEach(item => {
        const selected = item === button;
        item.classList.toggle('active', selected);
        item.setAttribute('aria-pressed', String(selected));
      });
      document.querySelectorAll('.timeline-item').forEach(item => {
        item.classList.toggle('filtered-out', filter !== 'all' && item.dataset.career !== filter);
      });
    });
  });

  document.querySelectorAll('.role-toggle, .work-toggle').forEach(button => {
    button.addEventListener('click', () => {
      const detail = button.nextElementSibling;
      const expanded = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!expanded));
      detail.hidden = expanded;
    });
  });

  const expertise = {
    teaching: {
      kicker: 'Teaching practice',
      title: 'Making difficult ideas feel approachable.',
      copy: 'A concept-led approach across mathematics, information technology, and physics, with attention to student confidence and structured progress.',
      tags: ['Mathematics', 'Information Technology', 'Physics', 'Student mentoring']
    },
    technology: {
      kicker: 'Technical foundation',
      title: 'Grounded in systems, security, and code.',
      copy: 'Postgraduate computer science training with interest in computer networks, network security, data communication, and practical software development.',
      tags: ['Computer Networks', 'Network Security', 'Data Communication', 'C', 'C++', '.NET']
    },
    leadership: {
      kicker: 'Academic contribution',
      title: 'Supporting the institution beyond lectures.',
      copy: 'Experience contributing to class and MST coordination, admissions, counselling, examination activities, and academic event organization.',
      tags: ['Class coordination', 'MST coordination', 'Admissions', 'Counselling', 'Exam cell', 'Conference coordination']
    },
    personal: {
      kicker: 'Personal perspective',
      title: 'Curiosity continues outside the classroom.',
      copy: 'Fluent in English and Hindi, with interests that reward patience, pattern recognition, and creativity.',
      tags: ['English', 'Hindi', 'Sudoku', 'Drawing', 'Creative problem-solving']
    }
  };
  const expertiseStage = document.querySelector('.expertise-stage');
  document.querySelectorAll('.expertise-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const data = expertise[tab.dataset.expertise];
      document.querySelectorAll('.expertise-tab').forEach(item => {
        const selected = item === tab;
        item.classList.toggle('active', selected);
        item.setAttribute('aria-selected', String(selected));
      });
      expertiseStage.animate([{ opacity: .25, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 280, easing: 'ease-out' });
      document.getElementById('expertise-kicker').textContent = data.kicker;
      document.getElementById('expertise-title').textContent = data.title;
      document.getElementById('expertise-copy').textContent = data.copy;
      document.getElementById('expertise-tags').innerHTML = data.tags.map(tag => `<span>${tag}</span>`).join('');
    });
  });

  const profileDialog = document.getElementById('profile-dialog');
  document.querySelectorAll('[data-open-profile]').forEach(button => {
    button.addEventListener('click', () => profileDialog.showModal());
  });
  document.querySelector('.dialog-close').addEventListener('click', () => profileDialog.close());
  profileDialog.addEventListener('click', event => {
    if (event.target === profileDialog) profileDialog.close();
  });

  document.querySelector('.copy-email').addEventListener('click', async event => {
    const value = event.currentTarget.dataset.copy;
    try {
      await navigator.clipboard.writeText(value);
      showToast('Email copied to clipboard');
    } catch (_) {
      const input = document.createElement('textarea');
      input.value = value;
      body.appendChild(input);
      input.select();
      document.execCommand('copy');
      input.remove();
      showToast('Email copied to clipboard');
    }
  });

  document.querySelectorAll('.print-resume').forEach(button => {
    button.addEventListener('click', () => {
      if (profileDialog.open) profileDialog.close();
      window.print();
    });
  });

  const backToTop = document.querySelector('.back-to-top');
  const progress = document.querySelector('.scroll-progress span');
  const updateScrollUI = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
    backToTop.classList.toggle('visible', window.scrollY > 700);
  };
  window.addEventListener('scroll', updateScrollUI, { passive: true });
  updateScrollUI();
  backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  const signalStrip = document.querySelector('.signal-strip');
  const runCounters = () => {
    document.querySelectorAll('[data-count]').forEach(counter => {
      const target = Number(counter.dataset.count);
      const suffix = counter.dataset.suffix || '';
      const duration = target > 100 ? 900 : 650;
      const start = performance.now();
      const tick = now => {
        const progressValue = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progressValue, 3);
        counter.textContent = `${Math.round(target * eased)}${suffix}`;
        if (progressValue < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  };
  if ('IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        runCounters();
        counterObserver.disconnect();
      }
    }, { threshold: .3 });
    counterObserver.observe(signalStrip);
  } else {
    runCounters();
  }

  document.getElementById('year').textContent = new Date().getFullYear();
})();
