/* ============================================================
   EAC — script.js
   Loads ALL content from content/site.json, renders every section,
   and wires up interactions. Pure vanilla JS.
   v4.0 — Hallmark editorial redesign: no emoji, real contact form,
   accessible carousel with pause control.
   ============================================================ */

(function () {
  'use strict';

  /* Add .js class immediately so .js .reveal { opacity:0 } applies only when scripting is on */
  document.documentElement.classList.add('js');

  /* ---------- Helpers ---------- */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  function formatDate(iso) {
    if (!iso) return '';
    try {
      const d = new Date(iso + 'T00:00:00');
      return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch (e) {
      return iso;
    }
  }

  function placeholderSVG(w, h, label) {
    const text = label || 'Image';
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
      <rect fill="%23EFECE4" width="${w}" height="${h}"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
            font-family="system-ui,sans-serif" font-weight="600" font-size="14" fill="%23141B2D">${text}</text>
    </svg>`;
    return `data:image/svg+xml,${svg}`;
  }

  function withFallback(img, label) {
    img.onerror = function () {
      this.onerror = null;
      this.src = placeholderSVG(this.width || 600, this.height || 400, label || 'EAC Togo');
      this.classList.add('img-placeholder');
    };
  }

  /* ---- Inline SVG icon library (replaces all emoji from site.json) ---- */
  const SVG_ICONS = {
    /* Social icons */
    facebook: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`,
    instagram: `<svg viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 0C8.74 0 8.333.015 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.74 0 12c0 3.26.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.26-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0 3.675a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>`,
    youtube: `<svg viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" clip-rule="evenodd" d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
    tiktok: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.7 4.58v-7.1a8.16 8.16 0 004.74 1.52v-3.45a4.85 4.85 0 01-1-.06z"/></svg>`,
    whatsapp: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.47 14.38c-.29-.14-1.7-.84-1.96-.93-.27-.1-.46-.14-.66.14-.2.29-.76.93-.93 1.12-.17.2-.34.22-.63.07-.29-.14-1.22-.45-2.33-1.43-.86-.77-1.44-1.71-1.61-2-.17-.29-.02-.44.13-.59.13-.13.29-.34.43-.51.15-.17.2-.29.29-.49.1-.2.05-.36-.02-.51-.07-.14-.66-1.59-.9-2.18-.24-.57-.48-.49-.66-.5h-.56c-.2 0-.51.07-.78.36s-1.02 1-1.02 2.44 1.05 2.83 1.19 3.02c.15.2 2.06 3.14 4.98 4.41.7.3 1.24.48 1.66.61.7.22 1.33.19 1.83.12.56-.08 1.7-.7 1.94-1.37.24-.68.24-1.26.17-1.38-.07-.12-.27-.19-.56-.34z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M12.05 0C5.49 0 .13 5.35.13 11.93a11.88 11.88 0 0 0 1.6 5.96L0 24l6.3-1.65a11.9 11.9 0 0 0 5.74 1.46h.01c6.55 0 11.92-5.35 11.93-11.93a11.87 11.87 0 0 0-3.46-8.4A11.93 11.93 0 0 0 12.05 0zm0 21.78a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.88 9.88 0 0 1-1.51-5.24c0-5.46 4.44-9.9 9.9-9.9a9.83 9.83 0 0 1 7 2.9 9.83 9.83 0 0 1 2.89 7c-.01 5.46-4.45 9.9-9.91 9.9z"/></svg>`,

    /* Programme icons: emoji key → clean SVG */
    backpack: `<svg viewBox="0 0 24 24"><path d="M20 8v12a2 2 0 01-2 2H6a2 2 0 01-2-2V8a6 6 0 0112 0h4zm-6 0a4 4 0 00-8 0h8zm-3 4v4m-2-2h4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    bowl: `<svg viewBox="0 0 24 24"><path d="M3 12h18c0 4.97-4.03 9-9 9s-9-4.03-9-9zm2-2h14M12 3v3" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    accessibility: `<svg viewBox="0 0 24 24"><circle cx="12" cy="4" r="2" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M12 8v6m-4-4h8m-6 4l-2 6m4-6l2 6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    shield: `<svg viewBox="0 0 24 24"><path d="M12 2l8 4v6c0 5.25-3.45 9.75-8 11-4.55-1.25-8-5.75-8-11V6l8-4z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>`,
    megaphone: `<svg viewBox="0 0 24 24"><path d="M18 8a3 3 0 010 6M4 9v4a1 1 0 001 1h2l7 5V4L7 9H5a1 1 0 00-1 0z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    handshake: `<svg viewBox="0 0 24 24"><path d="M10 14l2-2m-2 2l-3 3a1.41 1.41 0 01-2 0l-1-1a1.41 1.41 0 010-2l6-6m0 0l4 4m2-6l3 3a1.41 1.41 0 010 2l-6 6a1.41 1.41 0 01-2 0L7 8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    star: `<svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>`,
    book: `<svg viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 016.5 17H20M4 4.5A2.5 2.5 0 016.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,

    /* Contact detail icons */
    email: `<svg viewBox="0 0 24 24"><path d="M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm0 2l8 5 8-5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    phone: `<svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.13.96.36 1.9.68 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.91.32 1.85.55 2.81.68a2 2 0 011.72 2.04z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    location: `<svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="10" r="3" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>`,
  };

  /* Map emoji strings from site.json to SVG icon keys */
  const EMOJI_TO_ICON = {
    '\uD83C\uDF92': 'backpack',   // 🎒
    '\uD83C\uDF72': 'bowl',       // 🍲
    '\u267F': 'accessibility',     // ♿
    '\uD83D\uDEE1\uFE0F': 'shield', // 🛡️
    '\uD83D\uDEE1': 'shield',     // 🛡 (without variant selector)
    '\uD83D\uDCE2': 'megaphone',  // 📢
    '\uD83E\uDD1D': 'handshake',  // 🤝
    '\uD83C\uDF1F': 'star',       // 🌟
    '\uD83D\uDCDA': 'book',       // 📚
  };

  /** Convert an emoji or icon string into clean SVG HTML */
  function iconHTML(raw) {
    if (!raw) return '';
    const key = EMOJI_TO_ICON[raw];
    if (key && SVG_ICONS[key]) return SVG_ICONS[key];
    if (SVG_ICONS[raw]) return SVG_ICONS[raw];
    // Fallback: a generic circle for any unmapped emoji
    return `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>`;
  }

  /* ---------- Fetch Data & Bootstrap ---------- */
  fetch('content/site.json')
    .then(r => {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .then(data => {
      render(data);
      initInteractions();
      hideLoader();
    })
    .catch(err => {
      console.error('Erreur de chargement du site :', err);
      hideLoader();
      document.body.innerHTML = `
        <div style="padding:4rem 2rem;text-align:center;font-family:system-ui,sans-serif;max-width:540px;margin:auto;">
          <h1 style="font-size:1.6rem;margin-bottom:.5rem;color:#141B2D;">Contenu en cours de chargement</h1>
          <p style="color:#4A5568;line-height:1.6;">Vérifiez que le fichier <code>content/site.json</code> est bien accessible sur votre serveur.</p>
        </div>`;
    });

  /* ============================================================
     RENDER
     ============================================================ */
  function render(data) {
    // Add section__rule to all section__header elements
    document.querySelectorAll('.section__header').forEach(header => {
      if (!header.querySelector('.section__rule')) {
        const rule = document.createElement('span');
        rule.className = 'section__rule';
        header.insertBefore(rule, header.firstChild);
      }
    });
    const { site, hero, stats, mission, programmes, projets, donation, articles, blog, videos, downloads, testimonials, contact, footer } = data;

    /* --- Site / Header / Brand --- */
    const logoImg = $('#header-logo');
    if (logoImg && site.logo) {
      logoImg.src = site.logo;
      logoImg.alt = site.name;
      withFallback(logoImg, 'EAC');
    }

    const headerName = $('#header-name');
    if (headerName) headerName.textContent = site.name;

    const navList = $('#nav-list');
    if (navList && site.nav) {
      navList.innerHTML = '';
      site.nav.forEach(item => {
        const li = document.createElement('li');
        li.className = 'header__nav-item' + (item.isCta ? ' header__nav-item--cta' : '');
        if (item.isCta) {
          li.innerHTML = `<a href="${item.href}" class="nav-btn nav-btn--donate">${item.label}</a>`;
        } else {
          li.innerHTML = `<a href="${item.href}" class="nav-btn">${item.label}</a>`;
        }
        navList.appendChild(li);
      });
    }

    document.title = site.name + ' : ' + (site.tagline || 'Togo');

    /* --- Hero --- */
    if (hero) {
      const heroImg = $('#hero-img');
      if (heroImg) {
        heroImg.src = hero.image;
        heroImg.alt = hero.imageAlt || 'EAC Togo';
        withFallback(heroImg, 'Enfants du Togo');
      }
      if ($('#hero-headline')) $('#hero-headline').textContent = hero.headline;
      if ($('#hero-sub')) $('#hero-sub').textContent = hero.subheadline;
      // Add kicker if not present
      const hContent = document.querySelector('.hero__content');
      if (hContent && !hContent.querySelector('.hero__kicker')) {
        const kicker = document.createElement('p');
        kicker.className = 'hero__kicker';
        kicker.textContent = 'EAC Togo : Association humanitaire';
        hContent.insertBefore(kicker, hContent.firstChild);
      }
      if (hContent && !hContent.querySelector('.hero__rule')) {
        const rule = document.createElement('span');
        rule.className = 'hero__rule';
        const headline = $('#hero-headline');
        if (headline) hContent.insertBefore(rule, headline.nextSibling);
      }

      const ctaEl = $('#hero-cta');
      if (ctaEl && hero.cta) {
        ctaEl.href = hero.cta.href;
        if ($('#hero-cta-text')) $('#hero-cta-text').textContent = hero.cta.text;
      }
      const cta2El = $('#hero-cta2');
      if (cta2El && hero.ctaSecondary) {
        cta2El.textContent = hero.ctaSecondary.text;
        cta2El.href = hero.ctaSecondary.href;
      }
    }

    /* --- Stats --- */
    const statsRibbon = $('#stats-ribbon');
    if (statsRibbon && stats && stats.length) {
      statsRibbon.innerHTML = '<div class="stats__inner"></div>';
      const statsInner = statsRibbon.querySelector('.stats__inner');
      stats.forEach(s => {
        const div = document.createElement('div');
        div.className = 'stat reveal';
        div.innerHTML = `
          <span class="stat__value" data-target="${s.value}" data-suffix="${s.suffix || ''}">0${s.suffix || ''}</span>
          <span class="stat__label">${s.label}</span>`;
        statsInner.appendChild(div);
      });
    } else if (statsRibbon) {
      statsRibbon.style.display = 'none';
    }

    /* --- Mission --- */
    if (mission && mission.blocks && mission.blocks.length) {
      if ($('#mission-title')) $('#mission-title').textContent = mission.title;
      if ($('#mission-verse')) $('#mission-verse').textContent = mission.verse;
      const mBlocks = $('#mission-blocks');
      if (mBlocks) {
        mBlocks.innerHTML = '';
        mission.blocks.forEach((b, idx) => {
          const div = document.createElement('div');
          div.className = 'mission__block reveal';
          const isLandscape = b.aspectRatio === 'landscape' || (b.image && b.image.includes('equipe'));
          const orientationClass = isLandscape ? 'mission__block-img--landscape' : 'mission__block-img--portrait';
          const imgPosStyle = b.imagePosition ? ` style="object-position:${b.imagePosition};"` : '';
          div.innerHTML = `
            <div class="mission__block-img ${orientationClass}">
              <img class="mission__block-main" src="${b.image}" alt="${b.imageAlt || b.title}" loading="lazy"${imgPosStyle}>
            </div>
            <div class="mission__block-text">
              <p class="mission__block-number">0${idx + 1}</p>
              <h3>${b.title}</h3>
              <p>${b.text}</p>
            </div>`;
          const mainImg = div.querySelector('.mission__block-main');
          mainImg.addEventListener('load', function() {
            if (this.naturalWidth && this.naturalHeight) {
              const container = div.querySelector('.mission__block-img');
              if (container) {
                if (this.naturalWidth > this.naturalHeight * 1.05) {
                  container.classList.remove('mission__block-img--portrait');
                  container.classList.add('mission__block-img--landscape');
                } else {
                  container.classList.remove('mission__block-img--landscape');
                  container.classList.add('mission__block-img--portrait');
                }
              }
            }
          });
          withFallback(mainImg, b.title);
          mBlocks.appendChild(div);
        });
      }
    } else {
      hideSection('mission');
    }

    /* --- Programmes & Parrainage --- */
    if (programmes && programmes.items && programmes.items.length) {
      if ($('#prog-title')) $('#prog-title').textContent = programmes.title;
      if ($('#prog-sub')) $('#prog-sub').textContent = programmes.subtitle;
      const progGrid = $('#prog-grid');
      if (progGrid) {
        progGrid.innerHTML = '';
        programmes.items.forEach((p, idx) => {
          const div = document.createElement('div');
          div.className = 'program-card reveal';
          div.innerHTML = `
            <div class="program-card__top">
              <div class="program-card__icon">${iconHTML(p.icon)}</div>
              <span class="program-card__num">0${idx + 1}</span>
            </div>
            <div class="program-card__body">
              <h3 class="program-card__title">${p.title}</h3>
              <p class="program-card__desc">${p.text}</p>
            </div>`;
          progGrid.appendChild(div);
        });
      }

      const sponsorBox = $('#sponsorship-block');
      if (sponsorBox && programmes.sponsorship) {
        const s = programmes.sponsorship;
        sponsorBox.innerHTML = `
          <div class="sponsorship__header">
            <span class="sponsorship__badge">${s.badge}</span>
            <h3 class="sponsorship__title">${s.title}</h3>
            <p class="sponsorship__subtitle">${s.subtitle}</p>
          </div>
          <div class="sponsorship__grid">
            ${s.types.map(t => `
              <div class="sponsorship-card ${t.highlight ? 'sponsorship-card--featured' : ''} reveal">
                <div class="sponsorship-card__top">
                  <span class="sponsorship-card__tag">${t.tag}</span>
                  <div class="sponsorship-card__icon">${iconHTML(t.icon)}</div>
                </div>
                <h4 class="sponsorship-card__title">${t.title}</h4>
                <p class="sponsorship-card__desc">${t.description}</p>
                <div class="sponsorship-card__details">
                  <span>${t.details}</span>
                </div>
                <a href="${t.href || '#contact'}" class="btn ${t.highlight ? 'btn--primary' : 'btn--outline'} btn--sm btn--full sponsorship-card__btn">
                  ${(t.linkText || '').replace(/\s*→\s*$/, '')}
                </a>
              </div>
            `).join('')}
          </div>`;
      }
    } else {
      hideSection('programmes');
    }

    /* --- Projets --- */
    if (projets && projets.items && projets.items.length) {
      if ($('#proj-title')) $('#proj-title').textContent = projets.title;
      if ($('#proj-sub')) $('#proj-sub').textContent = projets.subtitle;
      const projGrid = $('#proj-grid');
      if (projGrid) {
        projGrid.innerHTML = '';
        projets.items.forEach(item => {
          const card = document.createElement('div');
          card.className = 'project-card reveal';
          const posStyle = item.imagePosition ? ` style="object-position: ${item.imagePosition};"` : '';
          const isComplete = (item.status || '').toLowerCase().includes('réalisé') || (item.status || '').toLowerCase().includes('realise');

          card.innerHTML = `
            <div class="project-card__media">
              <img class="project-card__img" src="${item.image}" alt="${item.imageAlt || item.title}" loading="lazy"${posStyle}>
              <span class="project-card__tag">${item.category}</span>
            </div>
            <div class="project-card__body">
              <div class="project-card__status${isComplete ? ' project-card__status--done' : ''}">
                <span class="status-dot"></span>
                <span>${item.status}</span>
              </div>
              <h3 class="project-card__title">${item.title}</h3>
              <p class="project-card__desc">${item.description}</p>
              <div class="project-card__progress-wrap">
                <div class="project-card__progress-bar">
                  <div class="project-card__progress-fill" style="width: ${item.progress}%"></div>
                </div>
                <div class="project-card__meta">
                  <span><strong>${item.raised}</strong></span>
                  <span>Objectif : ${item.target}</span>
                </div>
              </div>
              ${isComplete ? '' : `
              <a href="#donation" class="btn btn--outline btn--sm btn--full" style="margin-top:var(--space-md);">
                Participer à ce projet
              </a>`}
            </div>`;
          const mainImg = card.querySelector('.project-card__img');
          withFallback(mainImg, item.title);
          projGrid.appendChild(card);
        });
      }
    } else {
      hideSection('projets');
    }

    /* --- Donation Section --- */
    if (donation) {
      const donImg = $('#don-img');
      if (donImg && donation.image) {
        donImg.src = donation.image;
        donImg.alt = donation.imageAlt || 'Donation EAC Togo';
        withFallback(donImg, 'EAC Togo');
      }
      if ($('#don-title')) $('#don-title').textContent = donation.title;
      if ($('#don-sub')) $('#don-sub').textContent = donation.subtitle;
      if ($('#don-verse')) $('#don-verse').textContent = donation.verse;

      const tiersGrid = $('#don-tiers');
      if (tiersGrid && donation.tiers) {
        tiersGrid.innerHTML = '';
        donation.tiers.forEach(t => {
          const card = document.createElement('div');
          card.className = 'donation-tier reveal';
          card.innerHTML = `
            <div class="donation-tier__amount">
              <span class="donation-tier__val">${t.amount}</span>
              <span class="donation-tier__fcfa">${t.fcfa}</span>
            </div>
            <p class="donation-tier__impact">${t.impact}</p>
            <a href="#contact" class="btn btn--primary btn--sm btn--full" style="margin-top:auto;">
              Donner ${t.amount}
            </a>`;
          tiersGrid.appendChild(card);
        });
      }

      const methodsList = $('#don-methods');
      if (methodsList && donation.methods) {
        methodsList.innerHTML = '';
        donation.methods.forEach(m => {
          const card = document.createElement('div');
          card.className = `donation-card ${m.highlight ? 'donation-card--featured' : ''} reveal`;

          let featuresHtml = '';
          if (m.features && m.features.length) {
            featuresHtml = `
              <ul class="donation-card__features">
                ${m.features.map(f => `<li><span class="feat-check">\u2713</span><span>${f}</span></li>`).join('')}
              </ul>`;
          }

          let actionHtml = '';
          if (m.id === 'kofi') {
            actionHtml = `
              <a href="${m.link || 'https://ko-fi.com/eactogo'}" target="_blank" rel="noopener noreferrer" class="btn btn--primary btn--sm btn--full donation-card__btn">
                ${(m.linkText || 'Faire un don sur Ko-fi').replace(/\s*→\s*$/, '')}
              </a>`;
          } else if (m.id === 'crypto') {
            actionHtml = `
              <div class="crypto-action-box">
                <a href="${m.nowpayments ? m.nowpayments.link : '#'}" target="_blank" rel="noopener noreferrer" class="btn btn--secondary btn--sm btn--full donation-card__btn">
                  ${(m.nowpayments && m.nowpayments.linkText || 'Faire un don via NOWPayments').replace(/\s*→\s*$/, '')}
                </a>
                <button type="button" class="btn btn--outline btn--sm btn--full btn-toggle-wallets" id="btn-toggle-wallets" aria-expanded="false">
                  Voir les adresses directes (BTC, USDT...)
                </button>
                <div class="crypto-wallets-pop is-hidden" id="crypto-wallets-list">
                  ${(m.wallets || []).map(w => `
                    <div class="crypto-wallet-item">
                      <div class="crypto-wallet-item__info">
                        <strong>${w.coin}</strong>
                        <span class="crypto-network">${w.network}</span>
                      </div>
                      <div class="crypto-wallet-item__addr-wrap">
                        <code class="crypto-address">${w.address}</code>
                        <button type="button" class="btn-copy-address" data-copy="${w.address}" title="Copier l'adresse">
                          <span class="copy-text">Copier</span>
                        </button>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>`;
          } else if (m.id === 'dpogroup') {
            actionHtml = `
              <div class="dpo-action-box">
                <a href="${m.link || 'https://secure.dpogroup.com/'}" target="_blank" rel="noopener noreferrer" class="btn btn--primary btn--sm btn--full donation-card__btn">
                  ${(m.linkText || 'Payer par Mobile Money / Carte').replace(/\s*→\s*$/, '')}
                </a>
                <a href="${m.infoLink || 'https://dpogroup.com/payment-methods/'}" target="_blank" rel="noopener noreferrer" class="dpo-sublink">
                  Moyens acceptés par DPO Group
                </a>
              </div>`;
          } else if (m.id === 'mixxyas' || m.id === 'tmoney') {
            actionHtml = `
              <div class="mobile-money-action-box">
                <button type="button" class="btn btn--outline btn--sm btn--full btn-toggle-numbers donation-card__btn" aria-expanded="false">
                  Cliquez pour voir les numéros officiels
                </button>
                <div class="mobile-numbers-pop is-hidden">
                  <div class="mobile-numbers-contact">
                    <span class="mobile-numbers-contact__label">Responsable :</span>
                    <strong class="mobile-numbers-contact__name">${m.contactPerson || 'Mme Sanvee'}</strong>
                  </div>
                  <div class="mobile-numbers-section">
                    <span class="mobile-numbers-section__title">Numéros officiels :</span>
                    <div class="mobile-number-item">
                      <span class="mobile-number-badge">Mixx</span>
                      <code class="mobile-number-text">+228 91 07 51 22</code>
                      <button type="button" class="btn-copy-address" data-copy="+228 91 07 51 22" title="Copier le numéro Mixx">
                        <span class="copy-text">Copier</span>
                      </button>
                    </div>
                    <div class="mobile-number-item">
                      <span class="mobile-number-badge">Flooz</span>
                      <code class="mobile-number-text">+228 97 23 57 65</code>
                      <button type="button" class="btn-copy-address" data-copy="+228 97 23 57 65" title="Copier le numéro Flooz">
                        <span class="copy-text">Copier</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>`;
          } else {
            actionHtml = `
              <a href="${m.link || '#contact'}" class="btn btn--outline btn--sm btn--full donation-card__btn">
                ${(m.linkText || 'Contacter notre équipe').replace(/\s*→\s*$/, '')}
              </a>`;
          }

          card.innerHTML = `
            <div class="donation-card__top">
              <span class="donation-card__tag">${(m.tag || '').replace(/[\u2B50\uD83C\uDF10\uD83D\uDCF1\uD83C\uDDF9\uD83C\uDDEC\uD83C\uDFE6\uD83C\uDFDB\uFE0F\uD83E\uDD1D\uD83D\uDCE6]/gu, '').trim()}</span>
              <div class="donation-card__icon">${iconHTML(m.icon)}</div>
            </div>
            <h4 class="donation-card__title">${m.name}</h4>
            <p class="donation-card__desc">${m.details}</p>
            ${featuresHtml}
            <div class="donation-card__action">
              ${actionHtml}
            </div>
          `;
          methodsList.appendChild(card);
        });

        // Toggle mobile money numbers
        methodsList.querySelectorAll('.btn-toggle-numbers').forEach(btn => {
          btn.addEventListener('click', function() {
            const card = this.closest('.donation-card') || this.parentElement;
            const pop = card.querySelector('.mobile-numbers-pop');
            if (pop) {
              const isHidden = pop.classList.toggle('is-hidden');
              this.setAttribute('aria-expanded', !isHidden);
              this.textContent = isHidden
                ? 'Cliquez pour voir les numéros officiels'
                : 'Masquer les numéros officiels';
            }
          });
        });

        // Copy crypto addresses
        methodsList.querySelectorAll('.btn-copy-address').forEach(btn => {
          btn.addEventListener('click', function(e) {
            e.preventDefault();
            const textToCopy = this.getAttribute('data-copy');
            if (navigator.clipboard && textToCopy) {
              navigator.clipboard.writeText(textToCopy).then(() => {
                const label = this.querySelector('.copy-text');
                const prev = label.textContent;
                label.textContent = '\u2713 Copié';
                this.classList.add('is-copied');
                setTimeout(() => {
                  label.textContent = prev;
                  this.classList.remove('is-copied');
                }, 2000);
              });
            }
          });
        });

        // Copy phone
        methodsList.querySelectorAll('.btn-copy-phone').forEach(btn => {
          btn.addEventListener('click', function(e) {
            e.preventDefault();
            const textToCopy = this.getAttribute('data-copy');
            if (navigator.clipboard && textToCopy) {
              navigator.clipboard.writeText(textToCopy).then(() => {
                const label = this.querySelector('.copy-phone-text');
                const prev = label.textContent;
                label.textContent = '\u2713 Numéro copié (+228 91 07 51 22)';
                this.style.borderColor = 'var(--color-secondary)';
                this.style.color = 'var(--color-secondary)';
                setTimeout(() => {
                  label.textContent = prev;
                  this.style.borderColor = '';
                  this.style.color = '';
                }, 2200);
              });
            }
          });
        });

        // Toggle crypto wallets
        const toggleBtn = $('#btn-toggle-wallets');
        const walletsList = $('#crypto-wallets-list');
        if (toggleBtn && walletsList) {
          toggleBtn.addEventListener('click', function() {
            const isHidden = walletsList.classList.toggle('is-hidden');
            this.setAttribute('aria-expanded', !isHidden);
            this.textContent = isHidden
              ? 'Voir les adresses directes (BTC, USDT...)'
              : 'Masquer les adresses directes';
          });
        }
      }
    } else {
      hideSection('donation');
    }

    /* --- Testimonials --- */
    if (testimonials && testimonials.length) {
      const tTrack = $('#testimonial-track');
      const tDots  = $('#testimonial-dots');
      if (tTrack && tDots) {
        tTrack.innerHTML = '';
        tDots.innerHTML = '';
        testimonials.forEach((t, i) => {
          const div = document.createElement('div');
          div.className = 'testimonial';
          div.innerHTML = `
            <p class="testimonial__quote">${t.quote}</p>
            <span class="testimonial__author">${t.author}</span>
            <span class="testimonial__role">${t.role}</span>`;
          tTrack.appendChild(div);

          const dot = document.createElement('button');
          dot.className = 'testimonials__dot' + (i === 0 ? ' is-active' : '');
          dot.setAttribute('aria-label', `Témoignage ${i + 1}`);
          dot.dataset.index = i;
          tDots.appendChild(dot);
        });
      }
    } else {
      const testiSection = $('#testimonials');
      if (testiSection) testiSection.style.display = 'none';
    }

    /* --- Articles --- */
    if (articles && articles.items && articles.items.length) {
      if ($('#art-title')) $('#art-title').textContent = articles.title;
      if ($('#art-sub')) $('#art-sub').textContent = articles.subtitle;
      const artList = $('#art-list');
      if (artList) {
        artList.innerHTML = '';
        articles.items.forEach(a => {
          const div = document.createElement('div');
          div.className = 'article-card reveal';
          const img = document.createElement('img');
          img.className = 'article-card__img';
          img.src = a.image;
          img.alt = a.imageAlt || a.title;
          img.loading = 'lazy';
          if (a.imagePosition) {
            img.style.objectPosition = a.imagePosition;
          }
          withFallback(img, 'EAC Actualité');

          const isLandscape = a.aspectRatio === 'landscape' || (a.image && a.image.includes('equipe'));
          const orientClass = isLandscape ? 'article-card__img-wrap--landscape' : 'article-card__img-wrap--portrait';
          const imgWrap = document.createElement('div');
          imgWrap.className = `article-card__img-wrap ${orientClass}`;
          imgWrap.appendChild(img);

          img.addEventListener('load', function() {
            if (this.naturalWidth && this.naturalHeight) {
              if (this.naturalWidth > this.naturalHeight * 1.05) {
                imgWrap.classList.remove('article-card__img-wrap--portrait');
                imgWrap.classList.add('article-card__img-wrap--landscape');
              } else {
                imgWrap.classList.remove('article-card__img-wrap--landscape');
                imgWrap.classList.add('article-card__img-wrap--portrait');
              }
            }
          });
          div.innerHTML = `
            <div class="article-card__body">
              <span class="article-card__date">${formatDate(a.date)}</span>
              <h3 class="article-card__title">${a.title}</h3>
              <p class="article-card__excerpt">${a.excerpt}</p>
            </div>`;
          div.insertBefore(imgWrap, div.firstChild);
          artList.appendChild(div);
        });
      }
    } else {
      hideSection('articles');
    }

    /* --- Blog --- */
    if (blog && blog.items && blog.items.length) {
      if ($('#blog-title')) $('#blog-title').textContent = blog.title;
      if ($('#blog-sub')) $('#blog-sub').textContent = blog.subtitle;
      const blogGrid = $('#blog-grid');
      if (blogGrid) {
        blogGrid.innerHTML = '';
        blog.items.forEach(b => {
          const card = document.createElement('article');
          card.className = 'blog-card reveal';
          const img = document.createElement('img');
          img.src = b.image;
          img.alt = b.imageAlt || b.title;
          img.loading = 'lazy';
          withFallback(img, b.title);

          card.innerHTML = `
            <div class="blog-card__media"></div>
            <div class="blog-card__body">
              <div class="blog-card__meta">
                <span class="blog-card__cat">${b.category}</span>
                <span class="blog-card__date">${formatDate(b.date)}</span>
              </div>
              <h3 class="blog-card__title">${b.title}</h3>
              <p class="blog-card__excerpt">${b.excerpt}</p>
              <div class="blog-card__author">
                <span>${b.author}</span>
              </div>
            </div>`;
          card.querySelector('.blog-card__media').appendChild(img);
          blogGrid.appendChild(card);
        });
      }
    } else {
      hideSection('blog');
    }

    /* --- Vidéos --- */
    if (videos && videos.items && videos.items.length) {
      if ($('#vid-title')) $('#vid-title').textContent = videos.title;
      if ($('#vid-sub')) $('#vid-sub').textContent = videos.subtitle;
      const vidScroll = $('#vid-scroll');
      if (vidScroll) {
        vidScroll.innerHTML = '';
        videos.items.forEach(v => {
          const div = document.createElement('div');
          div.className = 'media-card reveal';
          const thumbImg = document.createElement('img');
          thumbImg.src = v.thumbnail;
          thumbImg.alt = v.title;
          thumbImg.loading = 'lazy';
          withFallback(thumbImg, 'EAC Togo');

          div.innerHTML = `
            <div class="media-card__video">
              <div class="media-card__play" data-embed="${v.embedUrl}" role="button" aria-label="Lire la vidéo : ${v.title}">
                <div class="media-card__play-circle">
                  <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                </div>
              </div>
            </div>
            <p class="media-card__title">${v.title}</p>`;
          const videoWrap = div.querySelector('.media-card__video');
          videoWrap.insertBefore(thumbImg, videoWrap.firstChild);
          vidScroll.appendChild(div);
        });
      }
    } else {
      hideSection('medias');
    }

    /* --- Downloads --- */
    if (downloads && downloads.items && downloads.items.length) {
      if ($('#dl-title')) $('#dl-title').textContent = downloads.title;
      const dlList = $('#dl-list');
      if (dlList) {
        dlList.innerHTML = '';
        downloads.items.forEach(d => {
          const isDownload = d.file && !d.file.startsWith('#') && !d.file.startsWith('mailto:');
          const li = document.createElement('li');
          li.innerHTML = `
            <a href="${d.file}" class="download-item reveal"${isDownload ? ' download' : ''}>
              <div class="download-item__icon">${d.type}</div>
              <div class="download-item__info">
                <h4>${d.title}</h4>
                <p>${d.description}</p>
              </div>
              <span class="download-item__meta">${d.size}</span>
            </a>`;
          dlList.appendChild(li);
        });
      }
    } else {
      hideSection('downloads');
    }

    /* --- Contact --- */
    if (contact) {
      if ($('#ct-title')) $('#ct-title').textContent = contact.title;
      if ($('#ct-sub')) $('#ct-sub').textContent = contact.subtitle;
      const ctDetails = $('#ct-details');
      if (ctDetails) {
        ctDetails.innerHTML = `
          <div class="contact__detail-row">
            <span class="contact__detail-icon">${SVG_ICONS.email}</span>
            <a href="mailto:${contact.email}">${contact.email}</a>
          </div>
          <div class="contact__detail-row">
            <span class="contact__detail-icon">${SVG_ICONS.phone}</span>
            <a href="tel:${contact.phone.replace(/[^0-9+]/g, '')}">${contact.phone}</a>
          </div>
          <div class="contact__detail-row">
            <span class="contact__detail-icon">${SVG_ICONS.location}</span>
            <span>${contact.address}</span>
          </div>`;
      }

      const ctSocials = $('#ct-socials');
      if (ctSocials && contact.socials) {
        ctSocials.innerHTML = '';
        contact.socials.forEach(s => {
          const a = document.createElement('a');
          a.href = s.url;
          a.className = 'contact__social-link';
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          a.setAttribute('aria-label', s.platform);
          a.setAttribute('title', s.platform);
          const iconKey = (s.icon || s.platform || '').toLowerCase();
          a.innerHTML = SVG_ICONS[iconKey] || s.platform;
          ctSocials.appendChild(a);
        });
      }

      /* Store contact info for form */
      window.__eacContact = contact;
    }

    /* --- Footer --- */
    if (footer) {
      const footerLogo = $('#footer-logo');
      if (footerLogo && site.logo) {
        footerLogo.src = site.logo;
        footerLogo.alt = site.name;
        withFallback(footerLogo, 'EAC');
      }
      if ($('#footer-verse')) $('#footer-verse').textContent = footer.verse;
      if ($('#footer-copy')) $('#footer-copy').textContent = footer.copyright;

      const fLinks = $('#footer-links');
      if (fLinks && site.nav) {
        fLinks.innerHTML = '';
        site.nav.forEach(item => {
          const a = document.createElement('a');
          a.href = item.href;
          a.textContent = item.label;
          fLinks.appendChild(a);
        });
      }

      const fSocials = $('#footer-socials');
      if (fSocials && contact && contact.socials) {
        fSocials.innerHTML = '';
        contact.socials.forEach(s => {
          const a = document.createElement('a');
          a.href = s.url;
          a.className = 'footer__social-link';
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          a.setAttribute('aria-label', s.platform);
          a.setAttribute('title', s.platform);
          const iconKey = (s.icon || s.platform || '').toLowerCase();
          a.innerHTML = SVG_ICONS[iconKey] || s.platform;
          fSocials.appendChild(a);
        });
      }
    }
  }

  /** Hide an empty section */
  function hideSection(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('is-empty');
    // Also hide the corresponding nav link
    $$('.nav-btn').forEach(link => {
      if (link.getAttribute('href') === '#' + id) {
        const li = link.closest('li');
        if (li) li.style.display = 'none';
      }
    });
  }

  /* ============================================================
     INTERACTIONS & ACCESSIBILITY
     ============================================================ */
  function initInteractions() {
    /* --- Mobile Burger Menu & Overlay --- */
    const burger  = $('#burger');
    const nav     = $('#nav');
    const overlay = $('#overlay');

    function closeMenu() {
      if (!burger || !nav || !overlay) return;
      burger.classList.remove('is-active');
      nav.classList.remove('is-open');
      overlay.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('no-scroll');
    }

    function openMenu() {
      if (!burger || !nav || !overlay) return;
      burger.classList.add('is-active');
      nav.classList.add('is-open');
      overlay.classList.add('is-open');
      burger.setAttribute('aria-expanded', 'true');
      document.body.classList.add('no-scroll');
    }

    if (burger && nav && overlay) {
      burger.addEventListener('click', () => {
        nav.classList.contains('is-open') ? closeMenu() : openMenu();
      });
      overlay.addEventListener('click', closeMenu);
      document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && nav.classList.contains('is-open')) closeMenu();
      });
      $$('.nav-btn', nav).forEach(a => a.addEventListener('click', closeMenu));
    }

    /* --- Header scroll & Back-to-top --- */
    const header    = $('#header');
    const backToTop = $('#back-to-top');
    let ticking = false;

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const top = window.scrollY;
          if (header) header.classList.toggle('is-scrolled', top > 30);
          if (backToTop) backToTop.classList.toggle('is-visible', top > 400);
          highlightNav();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

    if (backToTop) {
      backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    /* --- Active Navigation --- */
    const navLinks = $$('.nav-btn');
    const sections = $$('section[id], header[id]');

    function highlightNav() {
      const scrollY = window.scrollY + 120;
      sections.forEach(sec => {
        const top = sec.offsetTop;
        const height = sec.offsetHeight;
        const id = sec.getAttribute('id');
        if (scrollY >= top && scrollY < top + height) {
          navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === '#' + id) {
              link.classList.add('is-active');
            } else if (!link.classList.contains('nav-btn--donate')) {
              link.classList.remove('is-active');
            }
          });
        }
      });
    }

    /* --- Scroll Reveal --- */
    const reveals = $$('.reveal');
    if ('IntersectionObserver' in window) {
      const obs = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        });
      }, { rootMargin: '0px 0px -40px 0px', threshold: 0.1 });
      reveals.forEach(el => obs.observe(el));
    } else {
      reveals.forEach(el => el.classList.add('is-revealed'));
    }

    /* --- Animated Numbers (Stats) --- */
    const statValues = $$('.stat__value');
    if ('IntersectionObserver' in window && statValues.length) {
      let statsDone = false;
      const statsObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !statsDone) {
            statsDone = true;
            statValues.forEach(el => animateValue(el));
            statsObserver.disconnect();
          }
        });
      }, { threshold: 0.3 });
      const statsSection = $('#stats-ribbon');
      const statsTarget = statsSection ? (statsSection.querySelector('.stats__inner') || statsSection) : null;
      if (statsTarget) statsObserver.observe(statsTarget);
    }

    function animateValue(el) {
      const target = parseInt(el.dataset.target, 10);
      const suffix = el.dataset.suffix || '';
      if (isNaN(target)) return;
      const duration = 1600;
      const start = performance.now();
      function step(now) {
        const progress = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(ease * target);
        el.textContent = current.toLocaleString('fr-FR') + suffix;
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    /* --- Testimonials Carousel with Pause --- */
    const track = $('#testimonial-track');
    const dots  = $$('.testimonials__dot');
    const prevBtn = $('#testi-prev');
    const nextBtn = $('#testi-next');
    const pauseBtn = $('#testi-pause');
    let currentIdx = 0;
    const totalSlides = dots.length;
    let autoplayTimer = null;
    let isPaused = false;

    function goToSlide(idx) {
      if (!track || totalSlides === 0) return;
      currentIdx = (idx + totalSlides) % totalSlides;
      track.style.transform = `translateX(-${currentIdx * 100}%)`;
      dots.forEach((d, i) => d.classList.toggle('is-active', i === currentIdx));
    }

    function startAutoplay() {
      stopAutoplay();
      if (!isPaused) {
        autoplayTimer = setInterval(() => goToSlide(currentIdx + 1), 6000);
      }
    }
    function stopAutoplay() {
      if (autoplayTimer) clearInterval(autoplayTimer);
      autoplayTimer = null;
    }

    if (totalSlides > 1) {
      dots.forEach(d => {
        d.addEventListener('click', () => {
          goToSlide(parseInt(d.dataset.index, 10));
          startAutoplay();
        });
      });

      if (prevBtn) {
        prevBtn.addEventListener('click', () => {
          goToSlide(currentIdx - 1);
          startAutoplay();
        });
      }
      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          goToSlide(currentIdx + 1);
          startAutoplay();
        });
      }

      // Pause control
      if (pauseBtn) {
        pauseBtn.addEventListener('click', () => {
          isPaused = !isPaused;
          pauseBtn.textContent = isPaused ? '\u25B6' : 'II';
          pauseBtn.setAttribute('aria-label', isPaused ? 'Reprendre le carrousel' : 'Mettre en pause le carrousel');
          if (isPaused) {
            stopAutoplay();
          } else {
            startAutoplay();
          }
        });
      }

      const carouselEl = $('#testimonials');
      if (carouselEl) {
        carouselEl.addEventListener('mouseenter', stopAutoplay);
        carouselEl.addEventListener('mouseleave', () => { if (!isPaused) startAutoplay(); });

        let startX = 0;
        let diffX  = 0;
        carouselEl.addEventListener('touchstart', e => {
          startX = e.touches[0].clientX;
          diffX = 0;
          stopAutoplay();
        }, { passive: true });
        carouselEl.addEventListener('touchmove', e => {
          diffX = e.touches[0].clientX - startX;
        }, { passive: true });
        carouselEl.addEventListener('touchend', () => {
          if (Math.abs(diffX) > 40) {
            diffX < 0 ? goToSlide(currentIdx + 1) : goToSlide(currentIdx - 1);
          }
          if (!isPaused) startAutoplay();
        });
      }

      startAutoplay();
    }

    /* --- Video Play / Embed On-Demand --- */
    $$('.media-card__play').forEach(btn => {
      btn.addEventListener('click', function () {
        const embedUrl = this.dataset.embed;
        if (!embedUrl) return;
        const parent = this.closest('.media-card__video');
        if (!parent) return;

        if (embedUrl.includes('.mp4')) {
          const video = document.createElement('video');
          video.src = embedUrl;
          video.controls = true;
          video.autoplay = true;
          video.playsInline = true;
          video.className = 'media-card__video-player';
          parent.innerHTML = '';
          parent.appendChild(video);
          video.play().catch(() => {});
        } else {
          const iframe = document.createElement('iframe');
          iframe.src = embedUrl + (embedUrl.includes('?') ? '&' : '?') + 'autoplay=1';
          iframe.title = 'Lecteur vidéo';
          iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
          iframe.allowFullscreen = true;
          iframe.className = 'media-card__iframe';
          parent.innerHTML = '';
          parent.appendChild(iframe);
        }
      });
    });

    /* --- Contact Form: Real WhatsApp action + mailto fallback --- */
    const form = $('#contact-form');
    if (form) {
      form.addEventListener('submit', e => {
        e.preventDefault();

        const name = ($('#cf-name') || {}).value || '';
        const email = ($('#cf-email') || {}).value || '';
        const subject = ($('#cf-subject') || {}).value || '';
        const message = ($('#cf-message') || {}).value || '';

        if (!name.trim() || !message.trim()) {
          return;
        }

        const contactInfo = window.__eacContact || {};
        const phone = (contactInfo.phone || '+228 91 07 51 22').replace(/[^0-9+]/g, '');
        const emailAddr = contactInfo.email || 'info@avenircertain.org';

        // Build WhatsApp message
        const subjectLabels = {
          donation: 'Faire un don / Soutenir un projet',
          parrainage: 'Parrainer un enfant',
          partenariat: 'Partenariat',
          benevolat: 'Devenir bénévole',
          autre: 'Autre demande'
        };
        const subjectText = subjectLabels[subject] || subject;

        const waText = `Bonjour EAC,\n\nNom : ${name}\nE-mail : ${email}\nObjet : ${subjectText}\n\n${message}`;
        const waUrl = `https://wa.me/${phone.replace('+', '')}?text=${encodeURIComponent(waText)}`;

        // Show honest status
        const btn = form.querySelector('button[type="submit"]');
        const origText = btn.textContent;
        btn.textContent = 'Ouverture de WhatsApp\u2026';
        btn.disabled = true;

        // Open WhatsApp
        const waWindow = window.open(waUrl, '_blank');

        // After a beat, show status with mailto fallback
        setTimeout(() => {
          const mailSubject = encodeURIComponent(`[EAC] ${subjectText}`);
          const mailBody = encodeURIComponent(`Nom : ${name}\nE-mail : ${email}\n\n${message}`);
          const mailtoUrl = `mailto:${emailAddr}?subject=${mailSubject}&body=${mailBody}`;

          form.innerHTML = `
            <div class="form-status">
              <h3>Message prêt à envoyer</h3>
              <p>WhatsApp devrait s\u2019ouvrir dans un nouvel onglet. Si ce n\u2019est pas le cas, vous pouvez aussi nous écrire par e-mail.</p>
              <a href="${mailtoUrl}" class="btn btn--outline" style="margin-top:var(--space-md);">Envoyer par e-mail</a>
            </div>`;
        }, 1200);
      });
    }
  }

  /* ---------- Loader ---------- */
  function hideLoader() {
    const l = $('#loader');
    if (!l) return;
    l.classList.add('is-hidden');
    setTimeout(() => l.remove(), 400);
  }

})();
