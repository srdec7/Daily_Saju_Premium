import '@fontsource/noto-sans-kr/100.css';
import '@fontsource/noto-sans-kr/300.css';
import '@fontsource/noto-serif-kr/400.css';
import '@fontsource/noto-serif-kr/700.css';
import './style.css';
import { calculateSaju } from './utils/sajuEngine';
import { sajuEngine } from './engine/sajuEngine';
import { getDailyDataByLang, type LanguageCode } from './data/locales/index';
import { uiTranslations } from './data/uiLocales';
import { injectMotif } from './motif';
import { extendedHwadu } from './data/extendedHwadu';
import { supabase } from './lib/supabase';

const App = {
  user: null as any,
  isPremium: false as boolean,
  screens: {
    landing: document.getElementById('landing-screen') as HTMLElement,
    entry: document.getElementById('entry-screen') as HTMLElement,
    meditation: document.getElementById('meditation-screen') as HTMLElement,
    paywall: document.getElementById('paywall-screen') as HTMLElement,
    sample: document.getElementById('sample-screen') as HTMLElement,
  },
  elements: {
    form: document.getElementById('birth-form') as HTMLFormElement,
    yearSelect: document.getElementById('birth-year') as HTMLSelectElement,
    monthSelect: document.getElementById('birth-month') as HTMLSelectElement,
    daySelect: document.getElementById('birth-day') as HTMLSelectElement,
    birthTimeSelect: document.getElementById('birth-time') as HTMLSelectElement,
    nameInput: document.getElementById('user-name') as HTMLInputElement,
    emailInput: document.getElementById('user-email') as HTMLInputElement,
    genderGroup: document.querySelectorAll('input[name="gender"]') as NodeListOf<HTMLInputElement>,
    langToggleBtn: document.getElementById('lang-toggle-btn') as HTMLElement,
    btnReset: document.getElementById('btn-reset') as HTMLButtonElement,
    btnEnter: document.getElementById('ui-btn-enter') as HTMLButtonElement,
    
    // UI targets for data binding
    bgLayer: document.getElementById('bg-layer') as HTMLElement,
    motifContainer: document.getElementById('motif-container') as HTMLElement,
    hwaduChar: document.getElementById('hwadu-char') as HTMLElement,
    hwaduText: document.getElementById('hwadu-text') as HTMLElement,
    actionTitle: document.getElementById('action-title') as HTMLElement,
    actionText: document.getElementById('action-text') as HTMLElement,
    actionCard: document.getElementById('action-card') as HTMLElement,
  },
  
  async verifyStripeSession(sessionId: string) {
    try {
      const res = await fetch(`/api/verify-session?session_id=${sessionId}`);
      const data = await res.json();
      if (res.ok && data.isPremium && data.email) {
        localStorage.setItem('saju_premium_unlocked', 'true');
        localStorage.setItem('saju_premium_plan', data.plan || 'premium');
        localStorage.setItem('saju_user_email', data.email);
        
        // Bulletproof way to clear query params AND reload the state
        const cleanUrl = window.location.protocol + '//' + window.location.host + window.location.pathname;
        window.location.href = cleanUrl;
      } else {
        alert('Payment verification failed or is pending. Please contact support if you were charged.');
        const cleanUrl = window.location.protocol + '//' + window.location.host + window.location.pathname;
        window.location.href = cleanUrl;
      }
    } catch (e) {
      console.error(e);
      alert('Error verifying payment. Please try again or contact support.');
      const cleanUrl = window.location.protocol + '//' + window.location.host + window.location.pathname;
      window.location.href = cleanUrl;
    }
  },

  initAudioUnlock() {
    const audio = document.getElementById('bg-music') as HTMLAudioElement;
    if (!audio) return;
    
    // Attempt to unlock audio on first general interaction
    const unlockAudio = () => {
      if (audio.paused) {
        audio.play().catch(() => {});
      }
      document.removeEventListener('touchstart', unlockAudio);
      document.removeEventListener('click', unlockAudio);
    };

    document.addEventListener('touchstart', unlockAudio, { once: true });
    document.addEventListener('click', unlockAudio, { once: true });
  },

  init() {
    this.initAudioUnlock();

    // Check Stripe success redirect
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
      const sessionId = urlParams.get('session_id');
      if (sessionId) {
        this.verifyStripeSession(sessionId);
      } else {
        // Fallback or old method
        localStorage.setItem('saju_premium_unlocked', 'true');
        const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
        window.history.replaceState({ path: cleanUrl }, '', cleanUrl);
        alert('Payment successful! Your lifetime access is now unlocked.');
      }
    }

    this.populateDateSelects();
    this.initMusicToggle();
    
    // Supabase Auth Integration
    supabase.auth.getSession().then(({ data: { session } }) => {
      this.user = session?.user ?? null;
      if (this.user) {
        this.checkPremiumStatus(this.user.id);
      }
      this.checkStoredUser(); // Load state after auth is checked
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      this.user = session?.user ?? null;
      if (this.user) {
        this.checkPremiumStatus(this.user.id);
      }
    });

    // Old restore logic replaced by Login Modal
    const restoreBtn = document.getElementById('ui-paywall-restore');
    if (restoreBtn) {
      restoreBtn.addEventListener('click', async () => {
        const pin = prompt('Enter your receipt email to restore purchase:');
        if (pin) {
          try {
            const res = await fetch(`/api/check-premium?email=${encodeURIComponent(pin.trim())}`);
            if (!res.ok) throw new Error('Not found');
            const data = await res.json();
            if (data.isPremium) {
              localStorage.setItem('saju_premium_unlocked', 'true');
              localStorage.setItem('saju_premium_plan', data.plan || 'premium');
              localStorage.setItem('saju_user_email', data.email);
              alert('Purchase restored successfully!');
              this.switchScreen('entry');
            } else {
              alert('No premium record found for this email.');
            }
          } catch (e) {
            alert('No premium record found or error checking status.');
          }
        }
      });
    }
    
    // Bind language toggle listener to visually switch state and immediately update UI
    this.elements.langToggleBtn.addEventListener('click', () => {
      const currentLang = this.elements.langToggleBtn.getAttribute('data-lang') as LanguageCode;
      const newLang = currentLang === 'en' ? 'ko' : 'en';
      this.elements.langToggleBtn.setAttribute('data-lang', newLang);
      this.applyUILanguage(newLang);
    });

    this.elements.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSaveUser();
    });

    this.elements.btnReset.addEventListener('click', () => {
      this.resetAndGoHome();
    });

    this.elements.btnEnter.addEventListener('click', () => {
      this.switchScreen('entry');
    });

    // Paywall Plan Selection logic
    const planCards = document.querySelectorAll('.plan-card');
    planCards.forEach(card => {
      card.addEventListener('click', () => {
        planCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        const input = card.querySelector('input') as HTMLInputElement;
        if (input) input.checked = true;

        // Update buttons text dynamically based on selection
        const lang = this.elements.langToggleBtn.getAttribute('data-lang') as LanguageCode || 'en';
        const ui = uiTranslations[lang] || uiTranslations['en'];
        const isPremium = input?.value === 'premium';
        
        const sampleBtn = document.getElementById('ui-view-sample-btn');
        if (sampleBtn) sampleBtn.textContent = isPremium ? ui.btnViewSamplePremium : ui.btnViewSampleStandard;

        const paywallBtn = document.getElementById('ui-paywall-btn');
        if (paywallBtn) paywallBtn.textContent = isPremium ? ui.paywallBtnPremium : ui.paywallBtnStandard;
      });
    });

    // Paywall Checkout Logic
    const paywallBtn = document.getElementById('ui-paywall-btn');
    if (paywallBtn) {
      paywallBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        const selectedPlan = document.querySelector('input[name="plan"]:checked') as HTMLInputElement;
        const planValue = selectedPlan ? selectedPlan.value : 'premium';
        
        let proceedEmail = this.user?.email || localStorage.getItem('saju_user_email');
        if (!proceedEmail) {
          this.showLoginModal();
          return;
        }

        const originalText = paywallBtn.textContent;
        paywallBtn.textContent = 'Loading...';
        paywallBtn.style.opacity = '0.7';

        try {
          const lang = localStorage.getItem('saju_user_lang') || 'en';
          const res = await fetch('/api/create-checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: proceedEmail.trim(), plan: planValue, lang, userId: this.user?.id })
          });
          const data = await res.json();
          if (data.url) {
            window.location.href = data.url;
          } else {
            alert('Failed to generate checkout link. Please try again.');
            paywallBtn.textContent = originalText;
            paywallBtn.style.opacity = '1';
    }
        } catch (err) {
          console.error(err);
          alert('Network error. Failed to connect to secure payment server.');
          paywallBtn.textContent = originalText;
          paywallBtn.style.opacity = '1';
        }
      });
    }

    // Teaser unlock button
    const teaserUnlockBtn = document.getElementById('ui-teaser-unlock-btn');
    if (teaserUnlockBtn) {
      teaserUnlockBtn.addEventListener('click', async () => {
        const planValue = document.querySelector('input[name="teaser_plan"]:checked') ? (document.querySelector('input[name="teaser_plan"]:checked') as HTMLInputElement).value : 'premium';
        let proceedEmail = this.user?.email || localStorage.getItem('saju_user_email');
        
        if (!proceedEmail) {
          this.showLoginModal();
          return;
        }

        const originalText = teaserUnlockBtn.textContent;
        teaserUnlockBtn.textContent = 'Loading...';
        teaserUnlockBtn.style.opacity = '0.7';

        try {
          const lang = localStorage.getItem('saju_user_lang') || 'en';
          const res = await fetch('/api/create-checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: proceedEmail.trim(), plan: planValue, lang, userId: this.user?.id })
          });
          const data = await res.json();
          if (data.url) {
            window.location.href = data.url;
          } else {
            alert('Failed to generate checkout link. Please try again.');
            teaserUnlockBtn.textContent = originalText;
            teaserUnlockBtn.style.opacity = '1';
          }
        } catch (err) {
          console.error(err);
          alert('Network error. Failed to connect to secure payment server.');
          teaserUnlockBtn.textContent = originalText;
          teaserUnlockBtn.style.opacity = '1';
        }
      });
    }

    // Back buttons
    const paywallBackBtn = document.getElementById('ui-paywall-back-btn');
    if (paywallBackBtn) {
      paywallBackBtn.addEventListener('click', () => {
        // Same as reset: log out and clear session so premium can't leak to other users
        this.resetAndGoHome();
      });
    }

    const sampleBackBtn = document.getElementById('ui-sample-back-btn');
    const sampleScreen = document.getElementById('sample-screen');
    if (sampleBackBtn && sampleScreen) {
      sampleBackBtn.addEventListener('click', () => {
        sampleScreen.style.display = 'none';
      });
    }

    // Sample Screen logic
    const viewSampleBtn = document.getElementById('ui-view-sample-btn');
    const closeSampleBtn = document.getElementById('ui-close-sample-btn');
    
    // Legacy single openSample (uses selected paywall plan, or falls back to user's stored plan)
    const openSample = () => {
      const selectedPlan = document.querySelector('input[name="plan"]:checked') as HTMLInputElement;
      // If on the paywall screen, use the selected radio; otherwise use the stored user plan (default: standard)
      const type = selectedPlan ? selectedPlan.value : (localStorage.getItem('saju_premium_plan') || 'standard');
      
      const stdSpan = document.getElementById('sample-content-standard');
      const premSpan = document.getElementById('sample-content-premium');
      if (stdSpan) stdSpan.style.display = type === 'standard' ? 'block' : 'none';
      if (premSpan) premSpan.style.display = type === 'premium' ? 'block' : 'none';

      const titleEl = document.getElementById('ui-sample-title');
      if (titleEl) {
        const lang = this.elements.langToggleBtn.getAttribute('data-lang') as LanguageCode || 'en';
        const ui = uiTranslations[lang] || uiTranslations['en'];
        titleEl.textContent = type === 'standard' ? ui.sampleTitleStandard : ui.sampleTitlePremium;
      }

      if (this.screens.sample) {
        this.screens.sample.style.display = 'block';
        this.screens.sample.classList.add('view-active');
      }
    };
    
    if (viewSampleBtn) viewSampleBtn.addEventListener('click', openSample);

    // New Dual Sample approach for Teaser Actions
    const sampleBtns = document.querySelectorAll('.ui-sample-btn');
    sampleBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        // Prevent clicking the plan card radio toggle
        e.preventDefault();
        e.stopPropagation();
        
        const type = btn.getAttribute('data-type');
        const stdSpan = document.getElementById('sample-content-standard');
        const premSpan = document.getElementById('sample-content-premium');
        if (stdSpan) stdSpan.style.display = 'none';
        if (premSpan) premSpan.style.display = 'none';
        
        const target = document.getElementById(`sample-content-${type}`);
        if (target) target.style.display = 'block';

        // Update dynamic title for teaser buttons
        const titleEl = document.getElementById('ui-sample-title');
        if (titleEl) {
          const lang = this.elements.langToggleBtn.getAttribute('data-lang') as LanguageCode || 'en';
          const ui = uiTranslations[lang] || uiTranslations['en'];
          titleEl.textContent = type === 'standard' ? ui.sampleTitleStandard : ui.sampleTitlePremium;
        }

        if (this.screens.sample) {
          this.screens.sample.style.display = 'block';
          this.screens.sample.classList.add('view-active');
        }
      });
    });

    if (closeSampleBtn) {
      closeSampleBtn.addEventListener('click', () => {
        if (this.screens.sample) {
          this.screens.sample.style.display = 'none';
          this.screens.sample.classList.remove('view-active');
        }
      });
    }

    // Scroll listener for FAB visibility on meditation screen
    const fabContainer = document.getElementById('ui-fab-container');
    const fabTop = document.getElementById('ui-fab-top');
    const fabHome = document.getElementById('ui-fab-home');
    
    if (this.screens.meditation && fabContainer) {
      this.screens.meditation.addEventListener('scroll', () => {
        // Show after scrolling down 300px
        if (this.screens.meditation.scrollTop > 300) {
          fabContainer.classList.remove('fade-hidden');
          fabContainer.classList.add('fade-in');
        } else {
          fabContainer.classList.remove('fade-in');
          fabContainer.classList.add('fade-hidden');
        }
      });
    }

    if (fabTop) {
      fabTop.addEventListener('click', () => {
        this.screens.meditation.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    if (fabHome) {
      fabHome.addEventListener('click', () => {
        this.resetAndGoHome();
      });
    }
  },

  resetAndGoHome() {
    localStorage.removeItem('saju_user_birth');
    localStorage.removeItem('saju_user_gender');
    localStorage.removeItem('saju_user_name');
    localStorage.removeItem('saju_user_email');
    localStorage.removeItem('saju_user_time');
    localStorage.removeItem('saju_premium_unlocked');
    localStorage.removeItem('saju_premium_plan');
    localStorage.removeItem('saju_admin_bypass');
    
    // Sign out the Supabase session so a new user must log in with their own email.
    // This prevents premium plan sharing across different people on the same device.
    supabase.auth.signOut().catch(() => {});
    this.user = null;
    this.isPremium = false;
    
    // Clear visually
    this.elements.nameInput.value = '';
    this.elements.emailInput.value = '';
    this.elements.yearSelect.value = '';
    this.elements.monthSelect.value = '';
    this.elements.daySelect.value = '';
    this.elements.birthTimeSelect.value = '';
    this.elements.genderGroup.forEach(r => r.checked = false);
    const maleRadio = document.getElementById('gender-male') as HTMLInputElement;
    if(maleRadio) maleRadio.checked = true;

    if (this.screens.landing) this.screens.landing.scrollTop = 0;
    this.switchScreen('landing');
  },

  initMusicToggle() {
    const musicBar = document.getElementById('music-bar');
    const bgMusic = document.getElementById('bg-music') as HTMLAudioElement;
    if (!musicBar || !bgMusic) return;

    let isPlaying = false;

    // Handle background app state
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        if (!bgMusic.paused) {
          bgMusic.pause();
          setPlaying(false);
        }
      }
    });

    const setPlaying = (play: boolean) => {
      isPlaying = play;
      musicBar.classList.toggle('playing', play);
      musicBar.classList.toggle('paused', !play);
    };

    // Fade volume from 0 → 1 over ~2.5 seconds
    const fadeIn = () => {
      bgMusic.volume = 0;
      bgMusic.muted = false;
      const interval = setInterval(() => {
        const next = Math.min(1, bgMusic.volume + 0.025);
        bgMusic.volume = next;
        if (next >= 1) clearInterval(interval);
      }, 60);
    };

    // The audio element starts with autoplay+muted (allowed by iOS).
    // As soon as it starts playing, unmute with a fade-in.
    const startFade = () => {
      setPlaying(true);
      fadeIn();
    };

    // If audio is already playing (autoplay succeeded), fade in immediately
    if (!bgMusic.paused) {
      startFade();
    } else {
      // Autoplay might not have started yet — try playing on first interaction
      bgMusic.addEventListener('play', startFade, { once: true });

      // Also try to play immediately (non-muted environments)
      bgMusic.play()
        .then(() => { /* 'play' event will fire startFade */ })
        .catch(() => {
          // Blocked: start on first user touch anywhere
          const startOnFirstTouch = () => {
            bgMusic.play()
              .then(() => { /* 'play' event fires startFade */ })
              .catch(() => {});
          };
          document.addEventListener('touchstart', startOnFirstTouch, { once: true });
          document.addEventListener('pointerdown', startOnFirstTouch, { once: true });
        });
    }

    // Click music bar to toggle pause/resume
    musicBar.addEventListener('click', (e) => {
      e.stopPropagation();
      if (isPlaying) {
        bgMusic.pause();
        setPlaying(false);
      } else {
        bgMusic.muted = false;
        bgMusic.play().then(() => setPlaying(true)).catch(() => {});
      }
    });
  },

  populateDateSelects(lang?: string) {
    const ui = uiTranslations[lang || 'en'] || uiTranslations['en'];
    const currentYear = new Date().getFullYear();

    // Helper: clear & rebuild a select
    const rebuild = (sel: HTMLSelectElement, placeholder: string, options: HTMLOptionElement[]) => {
      sel.innerHTML = '';
      const ph = new Option(placeholder, '');
      ph.disabled = true;
      ph.selected = !sel.value;
      sel.add(ph);
      options.forEach(o => sel.add(o));
    };

    // Year
    const yearOpts: HTMLOptionElement[] = [];
    for (let i = currentYear; i >= 1920; i--)
      yearOpts.push(new Option(i.toString(), i.toString()));
    rebuild(this.elements.yearSelect, ui.yearDefault, yearOpts);

    // Month
    const monthOpts: HTMLOptionElement[] = [];
    for (let i = 1; i <= 12; i++) {
      const v = i.toString().padStart(2, '0');
      monthOpts.push(new Option(v, v));
    }
    rebuild(this.elements.monthSelect, ui.monthDefault, monthOpts);

    // Day
    const dayOpts: HTMLOptionElement[] = [];
    for (let i = 1; i <= 31; i++) {
      const v = i.toString().padStart(2, '0');
      dayOpts.push(new Option(v, v));
    }
    rebuild(this.elements.daySelect, ui.dayDefault, dayOpts);

    // Birth time — rebuild with localized branch names (no animal emojis)
    const branches = [
      { hanja: '子', time: '23–01' }, { hanja: '丑', time: '01–03' },
      { hanja: '寅', time: '03–05' }, { hanja: '卯', time: '05–07' },
      { hanja: '辰', time: '07–09' }, { hanja: '巳', time: '09–11' },
      { hanja: '午', time: '11–13' }, { hanja: '未', time: '13–15' },
      { hanja: '申', time: '15–17' }, { hanja: '酉', time: '17–19' },
      { hanja: '戌', time: '19–21' }, { hanja: '亥', time: '21–23' },
    ];
    const timeEl = this.elements.birthTimeSelect;
    const savedTime = timeEl.value;
    timeEl.innerHTML = '';
    timeEl.add(new Option(ui.birthTimeUnknown, ''));
    branches.forEach((b, i) => {
      const suffix = ui.branchSuffix ? `${b.hanja}${ui.branchSuffix}` : b.hanja;
      timeEl.add(new Option(`${suffix}  (${b.time})`, String(i)));
    });
    if (savedTime) timeEl.value = savedTime;
  },

  applyUILanguage(lang: LanguageCode) {
    const ui = uiTranslations[lang] || uiTranslations['en'];
    const el = (id: string, text: string) => {
      const e = document.getElementById(id);
      if (e) e.innerHTML = text.replace(/\n/g, '<br>');
    };
    const tx = (id: string, text: string) => {
      const e = document.getElementById(id);
      if (e) e.textContent = text;
    };

    // Logo, Date, & description
    const today = new Date();
    const yStr = today.getFullYear();
    const mStr = String(today.getMonth() + 1).padStart(2, '0');
    const dStr = String(today.getDate()).padStart(2, '0');
    tx('ui-today-date', `${yStr}. ${mStr}. ${dStr}.`);
    
    el('ui-logo-title', `매일<span class="logo-kr-accent">사주</span>`);
    tx('ui-logo-subtitle', ui.logoSub);
    el('ui-description', ui.description);
    el('ui-saju-desc', ui.sajuDesc);

    // Form labels
    tx('ui-label-name',   ui.name);
    tx('ui-label-birth',  ui.dateOfBirth);
    tx('ui-label-time',   ui.birthTime);
    tx('ui-optional',     ui.birthTimeOptional);
    tx('ui-optional-email', ui.birthTimeOptional);
    tx('ui-time-tip',     ui.birthTimeTip);
    tx('ui-label-gender', ui.gender);
    tx('ui-label-male',   ui.genderMale);
    tx('ui-label-female', ui.genderFemale);
    tx('ui-label-other',  ui.genderOther);
    tx('ui-label-email',  ui.email);
    tx('ui-email-hint',   ui.emailHint);
    tx('ui-btn-begin',    ui.btnBegin);
    tx('ui-btn-enter',    ui.btnEnter);
    tx('ui-landing-title', ui.landingTitle);
    tx('ui-landing-logo-sub', ui.logoSub);
    el('ui-landing-saju', ui.landingSajuIntro);
    el('ui-landing-tojeong', ui.landingTojeongIntro);
    if (this.elements.btnReset) this.elements.btnReset.textContent = ui.btnReset;
    const fabHome = document.getElementById('ui-fab-home');
    if (fabHome) fabHome.innerHTML = `↩ ${ui.btnReset}`;

    // Paywall elements
    tx('ui-paywall-title', ui.paywallTitle);
    tx('ui-paywall-desc', ui.paywallDesc);
    tx('ui-paywall-btn', ui.paywallBtn);
    tx('ui-plan-standard-name', ui.planStandardName);
    tx('ui-plan-standard-desc', ui.planStandardDesc);
    tx('ui-plan-standard-val', ui.planStandardVal);
    tx('ui-plan-standard-price', ui.planStandardPrice);
    tx('ui-plan-premium-name', ui.planPremiumName);
    tx('ui-plan-premium-desc', ui.planPremiumDesc);
    tx('ui-plan-premium-val', ui.planPremiumVal);
    tx('ui-plan-premium-price', ui.planPremiumPrice);
    
    // Dynamic buttons depending on selected plan
    const selectedPlan = document.querySelector('input[name="plan"]:checked') as HTMLInputElement;
    const isPremium = selectedPlan && selectedPlan.value === 'premium';
    tx('ui-view-sample-btn', isPremium ? ui.btnViewSamplePremium : ui.btnViewSampleStandard);
    tx('ui-paywall-btn', isPremium ? ui.paywallBtnPremium : ui.paywallBtnStandard);
    tx('ui-paywall-restore', ui.btnRestore);
    
    // Teaser elements
    tx('ui-teaser-title', ui.teaserTitle);
    tx('ui-teaser-desc', ui.teaserDesc);
    tx('ui-teaser-unlock-btn', ui.teaserUnlockBtn);
    tx('ui-teaser-standard-name', ui.planStandardName);
    tx('ui-teaser-standard-desc', ui.planStandardDesc);
    tx('ui-teaser-standard-val', ui.planStandardVal);
    tx('ui-teaser-standard-price', ui.planStandardPrice);
    tx('ui-teaser-premium-name', ui.planPremiumName);
    tx('ui-teaser-premium-desc', ui.planPremiumDesc);
    tx('ui-teaser-premium-price', ui.planPremiumPrice);
    
    const langKey = lang === 'ko' ? 'ko' : 'en';
    
    // Sample Button Text (Iterating class bindings)
    document.querySelectorAll('.ui-sample-btn-txt').forEach(el => {
      el.textContent = langKey === 'ko' ? '샘플보기' : 'Sample';
    });
    
    // Sample screen elements
    tx('ui-sample-title', ui.sampleTitle);
    tx('ui-sample-desc', ui.sampleDesc);
    tx('ui-close-sample-btn', ui.btnCloseSample);

    // ── SAMPLE BUILD: uses the real saju engine with a fixed demo date ──────────
    // Fixed demo: 1990-03-06, Ilgan index 0 (甲-Wood). Good variety of content.
    const SAMPLE_STR = '1990-3-6-0';

    const KW_KO_S = ['귀인','재물 상승','재물운','상승','계약','투자','승진','만남','새로운 인연','주의','건강','조심','행운','길운','재물','성공','성취','협력','연애','사업','직업','발전','기회'];
    const KW_EN_S = ['noble helper','wealth rise','financial gain','contract','investment','promotion','new encounter','caution','lucky','good fortune','health','opportunity','success','achievement','career','business','love','partnership','growth'];

    const hlKw = (text: string, lng: string): string => {
      let out = text;
      const kws = lng === 'ko' ? KW_KO_S : KW_EN_S;
      kws.forEach(kw => { out = out.replace(new RegExp(kw, 'g'), `<span class="kw-hl">${kw}</span>`); });
      return out;
    };

    const wrapSample = (text: string, lng: string, isLead = false): string => {
      const hlText = hlKw(text, lng);
      const cls = isLead ? 'tab-para tab-summary-lead' : 'tab-para tab-body-text';
      const sentences = text.split(/(?<=[.!?。])\s+/);
      if (sentences.length <= 2) return `<p class="${cls}">${hlText}</p>`;
      const lead = hlKw(sentences[0], lng);
      const rest = hlKw(sentences.slice(1).join(' '), lng);
      return `<p class="tab-para tab-summary-lead">${lead}</p><p class="tab-para tab-body-text">${rest}</p>`;
    };

    const buildSampleTabsHtml = (plan: 'standard' | 'premium', lng: string): { tabs: {id:string;label:string;html:string}[], watermark: string } => {
      const report = sajuEngine.generateTojeong(SAMPLE_STR, lng === 'ko' ? 'ko' : 'en', plan);

      const L = {
        ko: {
          totalFortune: '✦ 총운 — 올해의 큰 흐름', firstHalf: '✦ 상반기 흐름', secondHalf: '✦ 하반기 흐름',
          wealth: '✦ 재물운', career: '✦ 직업/사업운', relations: '✦ 인간관계/대인운',
          love: '✦ 연애/배우자운', family: '✦ 가족운', health: '✦ 건강/생활리듬',
          caution: '✦ 조심해야 할 시기', strategy: '✦ 복을 키우는 행동 가이드', conclusion: '✦ 올해의 핵심 총평',
          monthly: '✦ 월별 세운 (12개월)',
        },
        en: {
          totalFortune: '✦ Annual Fortune — The Big Picture', firstHalf: '✦ First Half Flow', secondHalf: '✦ Second Half Flow',
          wealth: '✦ Wealth Fortune', career: '✦ Career & Business', relations: '✦ Relationships',
          love: '✦ Love & Partnership', family: '✦ Family Fortune', health: '✦ Health & Rhythm',
          caution: '✦ Caution Periods', strategy: '✦ Strategy for Good Fortune', conclusion: '✦ Annual Summary',
          monthly: '✦ Monthly Forecast (12 months)',
        }
      };
      const lbl = L[lng === 'ko' ? 'ko' : 'en'];

      const tabs: {id:string;label:string;html:string}[] = [];
      const addTab = (id: string, label: string, content: string | undefined) => {
        if (!content) return;
        tabs.push({ id, label, html: `<div class="prem-panel-content">${wrapSample(content, lng)}</div>` });
      };

      addTab('overall', lbl.totalFortune, report.overall);
      addTab('first', lbl.firstHalf, report.firstHalf);
      addTab('second', lbl.secondHalf, report.secondHalf);

      if (plan === 'premium') {
        addTab('wealth', lbl.wealth, report.wealth);
        addTab('career', lbl.career, report.career);
        addTab('relations', lbl.relations, report.relationships);
        addTab('love', lbl.love, report.love);
        addTab('family', lbl.family, report.family);
        addTab('health', lbl.health, report.health);
        addTab('caution', lbl.caution, report.caution);
        addTab('strategy', lbl.strategy, report.strategy);
        addTab('conclusion', lbl.conclusion, report.conclusion);

        if (report.monthly && report.monthly.length > 0) {
          const mData = report.monthly.map(m => ({
            label: hlKw(m.monthLabel, lng),
            content: hlKw(m.content, lng)
          }));
          (window as any).__sampleMonthlyData = mData;

          const gridHtml = report.monthly.map((_m, idx) => {
            const mLabel = lng === 'ko' ? `${idx + 1}월` : `Month ${idx + 1}`;
            return `<button class="monthly-btn ${idx === 0 ? 'active' : ''}" data-idx="${idx}">${mLabel}</button>`;
          }).join('');

          const gridLayoutHtml = `
            <div class="prem-panel-content">
              <div class="monthly-grid-container">
                <div class="monthly-grid" id="sample-monthly-grid">${gridHtml}</div>
                <div class="monthly-detail-box" id="sample-monthly-detail">
                  <h4 class="monthly-det-title" id="sample-mo-title">${mData[0].label}</h4>
                  <p class="monthly-det-desc" id="sample-mo-desc">${mData[0].content}</p>
                </div>
              </div>
            </div>`;
          tabs.push({ id: 'monthly', label: lbl.monthly, html: gridLayoutHtml });
        }
      }

      return { tabs, watermark: plan === 'premium' ? 'PREMIUM<br>SAMPLE' : 'STANDARD<br>SAMPLE' };
    };

    const renderSampleTabBar = (containerId: string, panelId: string, tabs: {id:string;label:string;html:string}[], watermark: string) => {
      const html = `
        <div style="position:relative; width:100%;">
          <div style="position:absolute; inset:0; pointer-events:none; z-index:0; border-radius:12px; clip-path:inset(0 round 12px); -webkit-mask-image:-webkit-radial-gradient(white,black); transform:translateZ(0);">
            <div style="position:absolute; top:40%; left:50%; transform:translate(-50%,-50%) rotate(-15deg); font-size:clamp(3rem,12vw,7rem); line-height:0.9; text-align:center; font-weight:900; color:rgba(255,255,255,0.08); text-shadow: 0 0 15px rgba(255,255,255,0.1); letter-spacing:0.05em; user-select:none;">${watermark}</div>
          </div>
          <div style="position:relative; z-index:1; width:100%;">
            <div class="prem-tab-bar" id="${containerId}" style="cursor:grab;">${tabs.map(t => `<button class="prem-tab-chip sample-chip" data-tab-id="${t.id}" data-panel="${panelId}" type="button">${t.label}</button>`).join('')}</div>
            <div class="tab-motif-line" style="margin-bottom:1.2rem; height:8px;">
              <svg viewBox="0 0 400 10" preserveAspectRatio="none"><path d="M0,5 Q100,10 200,5 T400,5" fill="none" stroke="rgba(200,168,79,0.5)" stroke-width="1.5"/></svg>
            </div>
            <div id="${panelId}" class="prem-tab-panel" style="min-height:280px;"></div>
          </div>
        </div>
      `;
      return html;
    };

    const buildStandardSample = () => {
      const lng = langKey;
      const { tabs, watermark } = buildSampleTabsHtml('standard', lng);
      (window as any).__sampleStdTabs = tabs;
      return renderSampleTabBar('sample-tab-bar-std', 'sample-tab-panel-std', tabs, watermark);
    };

    const buildPremiumSample = () => {
      const lng = langKey;
      const { tabs, watermark } = buildSampleTabsHtml('premium', lng);
      (window as any).__samplePremTabs = tabs;
      return renderSampleTabBar('sample-tab-bar-prem', 'sample-tab-panel-prem', tabs, watermark);
    };

    const bindSampleTabBar = (barId: string, panelId: string, tabs: {id:string;label:string;html:string}[]) => {
      const bar = document.getElementById(barId);
      const panel = document.getElementById(panelId);
      if (!bar || !panel) return;

      // Show a tab by id
      const showTab = (id: string) => {
        const tab = tabs.find(t => t.id === id);
        if (!tab) return;
        panel.innerHTML = tab.html;
        bar.querySelectorAll('.sample-chip').forEach(c => c.classList.toggle('active', c.getAttribute('data-tab-id') === id));

        // Bind monthly grid events after rendering
        if (id === 'monthly') {
          const grid = panel.querySelector<HTMLElement>('#sample-monthly-grid');
          const title = document.getElementById('sample-mo-title');
          const desc = document.getElementById('sample-mo-desc');
          const detailBox = document.getElementById('sample-monthly-detail');
          if (grid && title && desc && detailBox) {
            grid.querySelectorAll<HTMLElement>('.monthly-btn').forEach(btn => {
              btn.addEventListener('click', () => {
                const idx = parseInt(btn.getAttribute('data-idx') || '0');
                const data = (window as any).__sampleMonthlyData?.[idx];
                if (data) {
                  grid.querySelectorAll('.monthly-btn').forEach(b => b.classList.remove('active'));
                  btn.classList.add('active');
                  title.innerHTML = data.label;
                  desc.innerHTML = data.content;
                  detailBox.style.animation = 'none';
                  detailBox.offsetHeight;
                  detailBox.style.animation = 'fadeUpPara 0.4s ease forwards';
                }
              });
            });
          }
        }
      };

      // Drag-to-scroll with threshold: only suppress click when actual drag > 5px
      let dragStartX = 0;
      let dragScrollLeft = 0;
      let isMouseDown = false;
      let hasDragged = false;

      bar.addEventListener('mousedown', e => {
        isMouseDown = true;
        hasDragged = false;
        bar.style.cursor = 'grabbing';
        dragStartX = e.pageX - bar.offsetLeft;
        dragScrollLeft = bar.scrollLeft;
      });
      bar.addEventListener('mouseleave', () => { isMouseDown = false; bar.style.cursor = 'grab'; });
      bar.addEventListener('mouseup', () => { isMouseDown = false; bar.style.cursor = 'grab'; hasDragged = false; });
      bar.addEventListener('mousemove', e => {
        if (!isMouseDown) return;
        const x = e.pageX - bar.offsetLeft;
        const dx = x - dragStartX;
        if (Math.abs(dx) > 5) {
          hasDragged = true;
          e.preventDefault();
          bar.scrollLeft = dragScrollLeft - dx * 1.5;
        }
      });
      bar.addEventListener('wheel', e => { if (e.deltaY !== 0) { e.preventDefault(); bar.scrollLeft += e.deltaY; } }, { passive: false });

      // Click chips — use hasDragged check to ignore accidental clicks during drag
      bar.querySelectorAll<HTMLElement>('.sample-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          if (hasDragged) { hasDragged = false; return; }
          showTab(chip.getAttribute('data-tab-id') || '');
        });
      });

      // Show first tab
      if (tabs.length > 0) showTab(tabs[0].id);
    };

    const bindSampleEvents = () => {
      bindSampleTabBar('sample-tab-bar-std', 'sample-tab-panel-std', (window as any).__sampleStdTabs || []);
      bindSampleTabBar('sample-tab-bar-prem', 'sample-tab-panel-prem', (window as any).__samplePremTabs || []);
    };
    const sampleContent = document.getElementById('ui-sample-content');
    if (sampleContent) {
      sampleContent.innerHTML = `
        <div id="sample-content-standard" style="display:none; width:100%; max-width:100%;">${buildStandardSample()}</div>
        <div id="sample-content-premium" style="display:none; width:100%; max-width:100%;">${buildPremiumSample()}</div>
      `;
      setTimeout(() => bindSampleEvents(), 50);
    }

    // Rebuild date and time selects with localized placeholders
    const prevY = this.elements.yearSelect.value;
    const prevM = this.elements.monthSelect.value;
    const prevD = this.elements.daySelect.value;
    const prevT = this.elements.birthTimeSelect.value;
    
    this.populateDateSelects(lang);
    
    if (prevY) this.elements.yearSelect.value  = prevY;
    if (prevM) this.elements.monthSelect.value = prevM;
    if (prevD) this.elements.daySelect.value   = prevD;
    if (prevT) this.elements.birthTimeSelect.value = prevT;

    // If on the result screen, re-render immediately
    if (this.screens.meditation && this.screens.meditation.classList.contains('view-active')) {
      const savedDate = localStorage.getItem('saju_user_birth');
      if (savedDate) {
        this.presentMeditation(savedDate, langKey);
      }
    }
  },

  async checkPremiumStatus(userId: string) {
    try {
      const { data, error } = await supabase
        .from('saju_users')
        .select('plan, subscription_end_date')
        .eq('id', userId)
        .single();
      
      if (!error && data) {
        const endDate = new Date(data.subscription_end_date).getTime();
        this.isPremium = data.plan === 'premium' && endDate > Date.now();
        if (this.isPremium) {
          localStorage.setItem('saju_premium_unlocked', 'true');
        } else {
          localStorage.removeItem('saju_premium_unlocked');
        }
      } else {
        localStorage.removeItem('saju_premium_unlocked');
      }
    } catch (e) {
      console.error(e);
    }
  },

  showLoginModal() {
    let modal = document.getElementById('saju-login-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'saju-login-modal';
      modal.innerHTML = `
        <div style="position: fixed; inset: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(8px); z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 24px;">
          <div style="background: rgba(20,20,20,0.95); border: 1px solid rgba(200,168,79,0.3); border-radius: 16px; padding: 32px; max-width: 400px; width: 100%; position: relative; box-shadow: 0 10px 40px rgba(0,0,0,0.5);">
            <button id="saju-login-close" style="position: absolute; top: 16px; right: 16px; background: none; border: none; color: #888; font-size: 24px; cursor: pointer;">&times;</button>
            <h2 style="text-align: center; color: var(--gold); margin-bottom: 8px; font-family: 'Noto Serif KR', serif;">안전한 계정 인증</h2>
            <p style="text-align: center; color: #aaa; font-size: 0.9rem; margin-bottom: 24px;">평생 소장 가능한 결제 내역 관리와 데이터 보호를 위해 이메일 인증이 필요합니다. (비밀번호 없음)</p>
            <form id="saju-login-form" style="display: flex; flex-direction: column; gap: 12px;">
              <input type="text" inputMode="email" id="saju-login-email" required placeholder="이메일 주소 (Email address)" style="padding: 14px 16px; border-radius: 8px; background: #111; border: 1px solid #333; color: #fff; font-size: 1rem;" />
              <button type="submit" id="saju-login-submit" style="background: linear-gradient(135deg, #d4af37 0%, #aa8014 100%); color: #000; font-weight: 700; border: none; border-radius: 8px; padding: 14px; cursor: pointer; font-size: 1rem;">로그인 링크 받기</button>
            </form>
            <p id="saju-login-msg" style="text-align: center; font-size: 0.85rem; margin-top: 16px; color: #888;"></p>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      document.getElementById('saju-login-close')?.addEventListener('click', () => {
        modal!.style.display = 'none';
      });

      document.getElementById('saju-login-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const emailInput = document.getElementById('saju-login-email') as HTMLInputElement;
        const submitBtn = document.getElementById('saju-login-submit') as HTMLButtonElement;
        const msgDiv = document.getElementById('saju-login-msg');
        
        if (!emailInput.value) return;

        // ADMIN BYPASS
        if (emailInput.value.trim() === 'master0827') {
          this.isPremium = true;
          localStorage.setItem('saju_premium_unlocked', 'true');
          localStorage.setItem('saju_premium_plan', 'premium');
          localStorage.setItem('saju_admin_bypass', 'true');
          modal!.style.display = 'none';
          
          // Retry the redirect
          const lang = this.elements.langToggleBtn.getAttribute('data-lang') as LanguageCode || 'en';
          const y = this.elements.yearSelect.value;
          const m = this.elements.monthSelect.value;
          const d = this.elements.daySelect.value;
          this.presentMeditation(`${y}-${m}-${d}`, lang);
          return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = '전송 중...';

        const redirectUrl = window.location.origin;
        const { error } = await supabase.auth.signInWithOtp({
          email: emailInput.value.trim(),
          options: { emailRedirectTo: redirectUrl }
        });

        if (error) {
          if (msgDiv) { msgDiv.style.color = '#e74c3c'; msgDiv.textContent = '오류: ' + error.message; }
        } else {
          if (msgDiv) { msgDiv.style.color = '#2ecc71'; msgDiv.textContent = '이메일로 로그인 링크가 전송되었습니다. 받은 편지함을 확인하세요!'; }
        }
        submitBtn.textContent = '로그인 링크 받기';
        submitBtn.disabled = false;
      });
    }
    modal.style.display = 'flex';
  },

  checkStoredUser() {
    const storedBirth  = localStorage.getItem('saju_user_birth');
    const storedGender = localStorage.getItem('saju_user_gender') || 'male';
    const storedLang   = localStorage.getItem('saju_user_lang') as LanguageCode || 'en';
    const storedName   = localStorage.getItem('saju_user_name') || '';
    const storedEmail  = localStorage.getItem('saju_user_email') || '';
    const storedTime   = localStorage.getItem('saju_user_time') || '';
    
    this.elements.langToggleBtn.setAttribute('data-lang', storedLang);
    this.applyUILanguage(storedLang);
    this.elements.nameInput.value  = storedName;
    this.elements.emailInput.value = storedEmail;
    this.elements.birthTimeSelect.value = storedTime;

    if (storedBirth) {
      const [y, m, d] = storedBirth.split('-');
      this.elements.yearSelect.value  = y;
      this.elements.monthSelect.value = m;
      this.elements.daySelect.value   = d;
      
      this.elements.genderGroup.forEach(inp => {
        inp.checked = (inp.value === storedGender);
      });
      this.switchScreen('entry');
    } else {
      this.switchScreen('landing');
    }
  },

  handleSaveUser() {
    const y = this.elements.yearSelect.value;
    const m = this.elements.monthSelect.value;
    const d = this.elements.daySelect.value;
    const dateStr = `${y}-${m}-${d}`;

    let gender = 'male';
    this.elements.genderGroup.forEach(inp => { if(inp.checked) gender = inp.value; });

    const lang      = this.elements.langToggleBtn.getAttribute('data-lang') as LanguageCode || 'en';
    const name      = this.elements.nameInput.value.trim();
    const email     = this.elements.emailInput.value.trim();
    const birthTime = this.elements.birthTimeSelect.value;
    
    localStorage.setItem('saju_user_birth',  dateStr);
    localStorage.setItem('saju_user_gender', gender);
    localStorage.setItem('saju_user_lang',   lang);
    if (name)      localStorage.setItem('saju_user_name',  name);
    if (email)     localStorage.setItem('saju_user_email', email);
    if (birthTime) localStorage.setItem('saju_user_time',  birthTime);

    // SECRET ADMIN BYPASS (Name-based backdoor)
    const isAdmin = name === 'master0827' || localStorage.getItem('saju_admin_bypass') === 'true';
    if (isAdmin) {
      this.isPremium = true;
      localStorage.setItem('saju_premium_unlocked', 'true');
      localStorage.setItem('saju_premium_plan', 'premium');
      localStorage.setItem('saju_admin_bypass', 'true');
      
      this.presentMeditation(dateStr, lang);
      return;
    }

    // LOGIN REQUIREMENT: Force users to sign in before continuing
    if (!this.user) {
      this.showLoginModal();
      return; 
    }

    // 1-Day Free Trial Check using authentic user creation date
    const premiumUnlocked = localStorage.getItem('saju_premium_unlocked') === 'true' || this.isPremium;
    const createdAt = new Date(this.user.created_at).getTime();
    const daysPassed = (Date.now() - createdAt) / (1000 * 60 * 60 * 24);

    if (daysPassed > 1 && !premiumUnlocked) {
      this.switchScreen('paywall');
      return; // Halt transition to meditation
    }

    this.presentMeditation(dateStr, lang);
  },

  switchScreen(target: 'landing' | 'entry' | 'meditation' | 'paywall') {
    // Hide all
    if (this.screens.landing) this.screens.landing.classList.remove('view-active');
    this.screens.entry.classList.remove('view-active');
    this.screens.meditation.classList.remove('view-active');
    if (this.screens.paywall) this.screens.paywall.classList.remove('view-active');
    
    // Show target
    if (this.screens[target]) {
      this.screens[target].classList.add('view-active');
    }
  },

  presentMeditation(birthDateString: string, lang: LanguageCode) {
    const ui = uiTranslations[lang] || uiTranslations['en'];

    // 1. Saju calculation
    const [y, m, d] = birthDateString.split('-').map(Number);
    const saju = calculateSaju(y, m, d);

    // 2. Advanced Multi-Factor Hash for 365 Unique Days
    const today = new Date();
    const dayOfYear = Math.floor(
      (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
    );

    // Create shifting seeds so EVERY day is mathematically unique
    const sElement = (saju.year * 13 + dayOfYear);
    const sHwadu   = (saju.month * 17 + dayOfYear * 2);
    const sColor   = (saju.day * 23 + dayOfYear * 3);
    const sNumber  = (saju.year + saju.month * 7 + dayOfYear * 4);
    const sDir     = (saju.month + saju.day * 11 + dayOfYear * 5);

    // Dynamic daily element (shifts every day)
    const elementsArray = ['wood', 'fire', 'earth', 'metal', 'water'] as const;
    const element = elementsArray[sElement % 5];
    
    const localeData = getDailyDataByLang(lang);
    const fullHwaduList = extendedHwadu[lang] || extendedHwadu['en'];
    const hwaduIdx = sHwadu % fullHwaduList.length;
    const hwadu = fullHwaduList[hwaduIdx];
    // Romanization always lives in the ko list (same index)
    const hwaduRomanization: string = extendedHwadu['ko'][hwaduIdx % extendedHwadu['ko'].length]?.romanization || '';

    // Element display data
    const elementHanja: Record<string, string> = {
      wood: '木', fire: '火', earth: '土', metal: '金', water: '水'
    };
    const elementCss: Record<string, string> = {
      wood: 'el-wood', fire: 'el-fire', earth: 'el-earth', metal: 'el-metal', water: 'el-water'
    };
    const elementColor: Record<string, string> = {
      wood: '#5a9e74', fire: '#c94040', earth: '#c8a84f', metal: '#a8b4c4', water: '#3a6db5'
    };
    const actionTitleMap: Record<string, string> = {
      ko: '오늘의 처방', en: 'Daily Prescription', ja: '今日の処方', zh: '今日处方',
      es: 'Prescripción Diaria', hi: 'दैनिक नुस्खा', fr: 'Prescription du Jour',
      de: 'Tagesrezept', it: 'Prescrizione Quotidiana', pt: 'Prescrição Diária',
      ru: 'Дневной Рецепт', ar: 'وصفة اليوم', tr: 'Günlük Reçete',
      th: 'คำแนะนำประจำวัน', vi: 'Lời Khuyên Hôm Nay', id: 'Resep Harian',
    };

    // ── ① Date pill ─────────────────────────────────────────────
    const yStr = today.getFullYear();
    const mStr = String(today.getMonth() + 1).padStart(2, '0');
    const dStr = String(today.getDate()).padStart(2, '0');
    const datePill = document.getElementById('result-date-text');
    if (datePill) datePill.textContent = `${yStr}. ${mStr}. ${dStr}.`;

    // ── ② Element tag — localized via uiLocales.elements ─────────
    const elTag   = document.getElementById('element-tag');
    const elHanja = document.getElementById('element-hanja');
    const elName  = document.getElementById('element-name');
    if (elTag)   elTag.className    = `element-tag fade-hidden ${elementCss[element] || ''}`;
    if (elHanja) elHanja.textContent = elementHanja[element] || '土';
    if (elName)  elName.textContent  = ui.elements[element as keyof typeof ui.elements] || element;

    // ── ③ Hwadu char (brush animation triggered in step cascade) ─
    this.elements.hwaduChar.textContent = hwadu.char;
    this.elements.hwaduChar.classList.remove('brush-reveal');

    // ── ③.1 Romanization + TTS (English only) ───────────────────
    const romanRow  = document.getElementById('hwadu-roman-row');
    const romanSpan = document.getElementById('hwadu-romanization');
    const ttsBtn    = document.getElementById('btn-tts');
    if (romanRow && romanSpan) {
      if (lang !== 'ko' && hwaduRomanization) {
        romanSpan.textContent = hwaduRomanization;
        romanRow.style.display = 'flex';
      } else {
        romanRow.style.display = 'none';
      }
    }
    if (ttsBtn) {
      ttsBtn.onclick = () => {
        if (!('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();
        const utt = new SpeechSynthesisUtterance(hwadu.char);
        utt.lang = 'ko-KR';
        utt.rate = 0.85;
        utt.pitch = 1.05;
        // Prefer a female Korean voice if available
        const voices = window.speechSynthesis.getVoices();
        const koVoice = voices.find(v => v.lang === 'ko-KR' && /female|yuna|sora/i.test(v.name))
                     || voices.find(v => v.lang === 'ko-KR');
        if (koVoice) utt.voice = koVoice;
        window.speechSynthesis.speak(utt);
        // Brief visual feedback
        ttsBtn.style.borderColor = 'var(--gold)';
        setTimeout(() => { ttsBtn.style.borderColor = 'rgba(255,255,255,0.2)'; }, 800);
      };
    }

    // ── ③.5 Hwadu explanation ────────────────────────────────────
    const hwaduExpl = document.getElementById('hwadu-explanation');
    if (hwaduExpl) hwaduExpl.textContent = ui.hwaduExplLabel;

    // ── ④ Hwadu meaning ──────────────────────────────────────────
    const meaningEl = document.getElementById('hwadu-meaning');
    if (meaningEl) meaningEl.textContent = (hwadu as any).meaning || hwadu.char;

    // ── ⑥ Hwadu description ──────────────────────────────────────
    this.elements.hwaduText.textContent = hwadu.description;

    // ── ⑦ Action card ────────────────────────────────────────────
    const action = localeData.actionGuides.find(a => a.element === element);
    if (action) this.elements.actionText.textContent = `${action.reason} ${action.action}`;
    this.elements.actionTitle.textContent = actionTitleMap[lang] || 'Daily Prescription';
    if (this.elements.btnReset) this.elements.btnReset.textContent = ui.btnReset;

    // ── Fortune Tiles (Decoupled Combinatorial Mix) ─────────────
    const tilesEl = document.getElementById('fortune-tiles');
    const allTiles = localeData.fortuneTiles || [];
    
    if (tilesEl && allTiles.length > 0) {
      // Pick 6 independent fortune elements from the locales array
      const tColor  = allTiles[sColor % allTiles.length];
      const tNumber = allTiles[sNumber % allTiles.length];
      const tDir    = allTiles[sDir % allTiles.length];
      
      const svgColor = `<svg width="17" height="17" viewBox="0 0 24 24" fill="${tColor.luckyColorHex || 'none'}" stroke="rgba(255,255,255,0.85)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22a10 10 0 1 1 10-10c0 1.5-1.5 3-3 3h-2.5a1.5 1.5 0 0 0-1.5 1.5v1.5a1.5 1.5 0 0 1-1.5 1.5Z"/><path d="M7.5 10.5h.01"/><path d="M10.5 7.5h.01"/><path d="M13.5 7.5h.01"/><path d="M16.5 10.5h.01"/></svg>`;
      const svgNum = `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/><line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/></svg>`;
      const svgDir = `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>`;

      const tileData = [
        { icon: svgColor, label: ui.tileColor,     value: tColor.luckyColor },
        { icon: svgNum,   label: ui.tileNumber,    value: tNumber.luckyNumbers },
        { icon: svgDir,   label: ui.tileDirection, value: tDir.direction },
      ];
      tilesEl.innerHTML = tileData.map(t => `
        <div class="ftile">
          <span class="ftile-icon">${t.icon}</span>
          <span class="ftile-label">${t.label}</span>
          <span class="ftile-value">${t.value}</span>
        </div>
      `).join('');
    }

    // ── ⑧.5 Premium Time Secret ────────────────────────────────────
    const ptCard = document.getElementById('premium-time-card');
    const ptLocked = document.getElementById('premium-locked-view');
    const ptUnlocked = document.getElementById('premium-unlocked-view');
    const uBirthTime = this.elements.birthTimeSelect.value;
    
    const uiPremiumTitleHourMap: Record<string, string> = {
      ko: '✦ 시주(태어난 시간) 비밀', en: '✦ Birth Hour Secret', ja: '✦ 生まれた時間の秘密', zh: '✦ 出生时辰秘密'
    };
    const uiPremiumTitleDayMap: Record<string, string> = {
      ko: '✦ 일주(태어난 날) 심층 분석', en: '✦ Birth Day Secret', ja: '✦ 生まれた日の秘密', zh: '✦ 出生日の秘密'
    };
    
    const uiPremiumBtnMap: Record<string, string> = {
      ko: '$2.99 해제', en: 'Unlock $2.99', ja: '$2.99 解除', zh: '$2.99 解锁'
    };
    const ePtTitle = document.getElementById('ui-premium-title');
    const ePtReadTitle = document.getElementById('ui-premium-reading-title');
    const ePtBtn = document.getElementById('ui-premium-btn');
    
    // Set titles based on whether they provided a birth time
    const activeTitleMap = uBirthTime ? uiPremiumTitleHourMap : uiPremiumTitleDayMap;
    if (ePtTitle) ePtTitle.textContent = activeTitleMap[lang] || activeTitleMap['en'];
    if (ePtReadTitle) ePtReadTitle.textContent = activeTitleMap[lang] || activeTitleMap['en'];
    if (ePtBtn) {
      ePtBtn.textContent = uiPremiumBtnMap[lang] || uiPremiumBtnMap['en'];
      
      // Bind click event to trigger checkout via backend
      // Replace outer node to clear old listeners if re-rendered
      const newBtn = ePtBtn.cloneNode(true) as HTMLElement;
      ePtBtn.parentNode?.replaceChild(newBtn, ePtBtn);

      newBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        
        let proceedEmail = this.user?.email || localStorage.getItem('saju_user_email');
        if (!proceedEmail) {
          this.showLoginModal();
          return;
        }

        const originalText = newBtn.textContent;
        newBtn.textContent = 'Loading...';
        newBtn.style.opacity = '0.7';

        try {
          const res = await fetch('/api/create-checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: proceedEmail.trim(), plan: 'premium', userId: this.user?.id })
          });
          const data = await res.json();
          console.log('[API Response]', data);
          if (data.url) {
            window.location.href = data.url;
          } else {
            alert('Failed to generate checkout link. Please try again.');
            newBtn.textContent = originalText;
            newBtn.style.opacity = '1';
          }
        } catch (err) {
          console.error(err);
          alert('Network error. Failed to connect to secure payment server.');
          newBtn.textContent = originalText;
          newBtn.style.opacity = '1';
        }
      });
    }

    if (ptCard && ptLocked && ptUnlocked) {
      // Always keep the bottom bar visible (it contains the Start Over button).
      // Only hide/show the premium ROW based on birth time selection.
      ptCard.style.removeProperty('display');
      const premRow = document.getElementById('premium-locked-view');
      
      const isPremium = localStorage.getItem('saju_premium_unlocked') === 'true';
      if (isPremium) {
        if (premRow) premRow.style.display = 'none';
        ptUnlocked.style.display = 'block';
        
        // --- Advanced Saju Logic (Ilgan x Shiji) ---
        const y = parseInt(this.elements.yearSelect.value);
        const m = parseInt(this.elements.monthSelect.value);
        const d = parseInt(this.elements.daySelect.value);
        
        // Calculate Ilgan (Day Stem 0-9: 甲乙丙丁戊己庚辛壬癸)
        const getIlgan = (year: number, month: number, day: number) => {
          const date = new Date(year, month - 1, day);
          const baseDate = new Date(1900, 0, 1); 
          const diffDays = Math.floor((date.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
          return (diffDays % 10 + 10) % 10;
        };
        
        const ilganIndex = getIlgan(y, m, d);
          
          // Generate report from local engine (no API call needed)
          const engLang = (lang === 'ko') ? 'ko' : 'en';
          const userPlan = (localStorage.getItem('saju_premium_plan') || 'premium') as 'standard' | 'premium';
          const sajuStr = `${y}-${m}-${d}-${ilganIndex}`;
          const report = sajuEngine.generateTojeong(sajuStr, engLang, userPlan);

          // Build UI labels
          const L = {
            ko: {
              totalFortune: '✦ 총운 — 올해의 큰 흐름', firstHalf: '✦ 상반기 흐름', secondHalf: '✦ 하반기 흐름',
              wealth: '✦ 재물운', career: '✦ 직업/사업운', relations: '✦ 인간관계/대인운',
              love: '✦ 연애/배우자운', family: '✦ 가족운', health: '✦ 건강/생활리듬',
              caution: '✦ 조심해야 할 시기', strategy: '✦ 복을 키우는 행동 가이드', conclusion: '✦ 올해의 핵심 총평',
              monthly: '✦ 월별 세운 (12개월)', premiumOnly: '✦ 프리미엄 전용 (업그레이드 필요)',
              upgradeBtn: '프리미엄으로 업그레이드 ($4.99)',
            },
            en: {
              totalFortune: '✦ Annual Fortune — The Big Picture', firstHalf: '✦ First Half Flow', secondHalf: '✦ Second Half Flow',
              wealth: '✦ Wealth Fortune', career: '✦ Career & Business', relations: '✦ Relationships',
              love: '✦ Love & Partnership', family: '✦ Family Fortune', health: '✦ Health & Rhythm',
              caution: '✦ Caution Periods', strategy: '✦ Strategy for Good Fortune', conclusion: '✦ Annual Summary',
              monthly: '✦ Monthly Forecast (12 months)', premiumOnly: '✦ Premium Exclusive (Upgrade Required)',
              upgradeBtn: 'Upgrade to Premium ($4.99)',
            }
          };
          const lbl = L[engLang];

          // ── Keyword highlight helper ─────────────────────────────
          const KW_KO = ['귀인','재물 상승','재물운','상승','계약','투자','승진','만남','새로운 인연','주의','건강','조심','행운','길운','재물','성공','성취','협력','연애','사업','직업','발전','기회'];
          const KW_EN = ['noble helper','wealth rise','financial gain','contract','investment','promotion','new encounter','caution','lucky','good fortune','health','opportunity','success','achievement','career','business','love','partnership','growth'];

          const highlightKeywords = (text: string, lang: 'ko'|'en'): string => {
            const kws = lang === 'ko' ? KW_KO : KW_EN;
            let out = text;
            kws.forEach(kw => {
              out = out.replace(new RegExp(kw, 'g'), `<span class="kw-hl">${kw}</span>`);
            });
            return out;
          };

          // Wraps text in staggered fade-up paragraphs
          const wrapBody = (text: string, isLead = false): string => {
            const cls = isLead ? 'tab-para tab-summary-lead' : 'tab-para tab-body-text';
            // Split on sentence endings for natural paragraph breaks
            const sentences = text.split(/(?<=[.!?。])\s+/);
            if (sentences.length <= 2) {
              return `<p class="${cls}">${highlightKeywords(text, engLang as 'ko'|'en')}</p>`;
            }
            // First sentence = lead, rest = body
            const lead = sentences[0];
            const rest = sentences.slice(1).join(' ');
            return `<p class="tab-para tab-summary-lead">${highlightKeywords(lead, engLang as 'ko'|'en')}</p><p class="tab-para tab-body-text">${highlightKeywords(rest, engLang as 'ko'|'en')}</p>`;
          };

          // ── Tab data builder ─────────────────────────────────────
          type TabData = { id: string; label: string; html: string };
          const tabs: TabData[] = [];

          const addTab = (id: string, label: string, content: string | undefined) => {
            if (!content) return;
            tabs.push({
              id,
              label,
              html: `<div class="prem-panel-content">${wrapBody(content)}</div>`
            });
          };

          // Standard + Premium: core 3
          addTab('overall',  lbl.totalFortune, report.overall);
          addTab('first',    lbl.firstHalf,    report.firstHalf);
          addTab('second',   lbl.secondHalf,   report.secondHalf);

          if (userPlan === 'premium') {
            addTab('wealth',    lbl.wealth,    report.wealth);
            addTab('career',    lbl.career,    report.career);
            addTab('relations', lbl.relations, report.relationships);
            addTab('love',      lbl.love,      report.love);
            addTab('family',    lbl.family,    report.family);
            addTab('health',    lbl.health,    report.health);
            addTab('caution',   lbl.caution,   report.caution);
            addTab('strategy',  lbl.strategy,  report.strategy);
            addTab('conclusion',lbl.conclusion,report.conclusion);

            // Monthly Timeline tab -> Interactive Grid
            if (report.monthly && report.monthly.length > 0) {
              // Store parsed monthly data globally for event delegation inside showTab
              (window as any).__monthlyData = report.monthly.map(m => ({
                label: highlightKeywords(m.monthLabel, engLang as 'ko'|'en'),
                content: highlightKeywords(m.content, engLang as 'ko'|'en')
              }));

              const gridHtml = report.monthly.map((_mo, idx) => {
                const moNum = idx + 1;
                const mLabel = engLang === 'ko' ? `${moNum}월` : `Month ${moNum}`;
                return `<button class="monthly-btn ${idx === 0 ? 'active' : ''}" data-idx="${idx}">${mLabel}</button>`;
              }).join('');

              const initialData = (window as any).__monthlyData[0];
              const gridLayoutHtml = `
              <div class="prem-panel-content">
                <div class="monthly-grid-container">
                  <div class="monthly-grid" id="monthly-grid">${gridHtml}</div>
                  <div class="monthly-detail-box" id="monthly-detail-box">
                    <h4 class="monthly-det-title" id="mo-det-title">${initialData.label}</h4>
                    <p class="monthly-det-desc" id="mo-det-desc">${initialData.content}</p>
                  </div>
                </div>
              </div>`;
              
              tabs.push({ id: 'monthly', label: lbl.monthly, html: gridLayoutHtml });
            }
          } else {
            // Blurred teaser tab for standard users
            tabs.push({
              id: 'upgrade',
              label: lbl.premiumOnly,
              html: `<div class="prem-panel-content">
                <p class="tab-para tab-body-text" style="filter:blur(4px);user-select:none;opacity:0.5;">
                  재물운, 직업운, 연애운, 가족운, 건강운, 월별 세운 12개월이 포함됩니다. 프리미엄으로 업그레이드하여 완전한 운명 로드맵을 열어보세요.
                </p>
                <div style="margin-top:1.2rem;text-align:center;">
                  <button class="prem-upgrade-btn" id="standard-upgrade-btn">${lbl.upgradeBtn}</button>
                </div>
              </div>`
            });
          }

          // ── Render tabs into DOM ─────────────────────────────────
          const tabBar   = document.getElementById('prem-tab-bar');
          const tabPanel = document.getElementById('prem-tab-panel');
          const motifPath = document.getElementById('tab-motif-path') as SVGPathElement | null;

          const triggerMotifAnim = () => {
            if (!motifPath) return;
            motifPath.style.animation = 'none';
            motifPath.getBoundingClientRect(); // reflow
            motifPath.style.animation = '';
          };

          const showTab = (activeId: string) => {
            tabs.forEach(t => {
              const chip = document.getElementById(`chip-${t.id}`);
              if (chip) chip.classList.toggle('active', t.id === activeId);
            });
            const active = tabs.find(t => t.id === activeId);
            if (tabPanel && active) {
              tabPanel.innerHTML = active.html;
              triggerMotifAnim();
              
              // Bind events if we opened the interactive monthly grid
              if (activeId === 'monthly') {
                const grid = document.getElementById('monthly-grid');
                const title = document.getElementById('mo-det-title');
                const desc = document.getElementById('mo-det-desc');
                const detailBox = document.getElementById('monthly-detail-box');
                
                if (grid && title && desc && detailBox) {
                  const btns = grid.querySelectorAll('.monthly-btn');
                  btns.forEach(btn => {
                    btn.addEventListener('click', (e) => {
                      const target = e.currentTarget as HTMLElement;
                      const idx = parseInt(target.getAttribute('data-idx') || '0');
                      const data = (window as any).__monthlyData[idx];
                      if (data) {
                        btns.forEach(b => b.classList.remove('active'));
                        target.classList.add('active');
                        title.innerHTML = data.label;
                        desc.innerHTML = data.content;
                        // Re-trigger fade
                        detailBox.style.animation = 'none';
                        detailBox.offsetHeight; // reflow
                        detailBox.style.animation = 'fadeUpPara 0.4s ease forwards';
                      }
                    });
                  });
                }
              }
            }
          };

          if (tabBar) {
            tabBar.innerHTML = tabs.map(t =>
              `<button class="prem-tab-chip" id="chip-${t.id}" type="button" aria-selected="false">${t.label}</button>`
            ).join('');
            tabs.forEach(t => {
              const chip = document.getElementById(`chip-${t.id}`);
              if (chip) chip.addEventListener('click', () => showTab(t.id));
            });

            // Desktop Drag-to-Scroll support
            let isDown = false;
            let startX = 0;
            let scrollLeft = 0;
            
            tabBar.style.cursor = 'grab';
            tabBar.style.userSelect = 'none'; // Prevent text selection hijacking the drag

            tabBar.addEventListener('mousedown', (e) => {
              isDown = true;
              tabBar.style.cursor = 'grabbing';
              startX = e.pageX - tabBar.offsetLeft;
              scrollLeft = tabBar.scrollLeft;
            });
            
            tabBar.addEventListener('mouseleave', () => {
              isDown = false;
              tabBar.style.cursor = 'grab';
              const chips = tabBar.querySelectorAll('.prem-tab-chip') as NodeListOf<HTMLElement>;
              chips.forEach(c => c.style.pointerEvents = 'auto');
            });
            
            tabBar.addEventListener('mouseup', () => {
              isDown = false;
              tabBar.style.cursor = 'grab';
              // Restore clickability after the mouseup event completes
              setTimeout(() => {
                const chips = tabBar.querySelectorAll('.prem-tab-chip') as NodeListOf<HTMLElement>;
                chips.forEach(c => c.style.pointerEvents = 'auto');
              }, 10);
            });
            
            tabBar.addEventListener('mousemove', (e) => {
              if (!isDown) return;
              e.preventDefault();
              const x = e.pageX - tabBar.offsetLeft;
              const walk = (x - startX) * 2; // Scroll speed multiplier
              
              // If dragged more than 5px, disable clicks on the chips so we don't accidentally switch tabs
              if (Math.abs(walk) > 10) {
                const chips = tabBar.querySelectorAll('.prem-tab-chip') as NodeListOf<HTMLElement>;
                chips.forEach(c => c.style.pointerEvents = 'none');
              }
              
              tabBar.scrollLeft = scrollLeft - walk;
            });
            
            // Mouse wheel horizontal scrolling support
            tabBar.addEventListener('wheel', (e) => {
              // Only intercept vertical scrolls when hovering over the tab bar
              if (e.deltaY !== 0) {
                e.preventDefault();
                tabBar.scrollLeft += e.deltaY;
              }
            }, { passive: false });
          }

          // Time disclaimer
          const userTime = localStorage.getItem('saju_user_time');
          const disclaimerDiv = document.getElementById('prem-time-disclaimer');
          if ((!userTime || userTime === 'unknown') && disclaimerDiv) {
            const timeDesc = engLang === 'ko'
              ? '태어난 시간을 기재하지 않으셨습니다. 본 분석은 연·월·일 3주를 바탕으로 도출한 가장 강력한 기운을 중심으로 풀이했습니다.'
              : 'Birth time was not provided. Analysis is based on the Year, Month, Day pillars and focuses on the strongest universal energies.';
            disclaimerDiv.style.display = 'block';
            disclaimerDiv.innerHTML = `<div style="background:rgba(255,255,255,0.05);border-left:3px solid var(--gold);padding:0.8rem 1rem;margin-bottom:1rem;font-size:0.82rem;color:rgba(255,255,255,0.6);border-radius:0 6px 6px 0;">${timeDesc}</div>`;
          }

          // Show first tab by default
          if (tabs.length > 0) showTab(tabs[0].id);

          // Bind upgrade button (if standard plan)
          const upgradeBtn = document.getElementById('standard-upgrade-btn');
          if (upgradeBtn) {
            upgradeBtn.addEventListener('click', async () => {
              let email = localStorage.getItem('saju_user_email');
              if (!email) {
                email = prompt('이메일 주소를 입력해주세요 / Enter your email:');
                if (!email) return;
                localStorage.setItem('saju_user_email', email.trim());
              }
              upgradeBtn.textContent = 'Loading...';
              try {
                const lang = localStorage.getItem('saju_user_lang') || 'en';
                const res = await fetch('/api/create-checkout', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email: email.trim(), plan: 'premium', lang })
                });
                const data = await res.json();
                if (data.url) window.location.href = data.url;
                else upgradeBtn.textContent = lbl.upgradeBtn;
              } catch { upgradeBtn.textContent = lbl.upgradeBtn; }
            });
          }


      } else {
        if (premRow) premRow.style.display = 'block';
        ptUnlocked.style.display = 'none';
      }
    }


    // ── Background & particles ────────────────────────────────────
    const colorMotif = localeData.colors.find(c => c.element === element);
    if (colorMotif) this.elements.bgLayer.style.background = colorMotif.gradient;

    const particlesEl = document.getElementById('particles-bg');
    if (particlesEl) {
      particlesEl.innerHTML = '';
      const pColor = elementColor[element] || '#c8a84f';
      for (let i = 0; i < 18; i++) {
        const p = document.createElement('span');
        p.className = 'ink-particle';
        const size = 3 + Math.random() * 6;
        p.style.cssText = [
          `width:${size}px`, `height:${size}px`,
          `left:${Math.random() * 100}%`,
          `top:${50 + Math.random() * 60}%`,
          `color:${pColor}`,
          `animation-duration:${6 + Math.random() * 9}s`,
          `animation-delay:${Math.random() * 5}s`,
        ].join(';');
        particlesEl.appendChild(p);
      }
    }

    // ── Switch view ───────────────────────────────────────────────
    this.switchScreen('meditation');
    injectMotif(this.elements.motifContainer, element);

    // ── 9-step animation cascade ──────────────────────────────────
    const steps: [string, number][] = [
      ['result-date-pill', 300],
      ['element-tag',      700],
      ['hwadu-char',      1200],
      ['hwadu-explanation', 1500],
      ['hwadu-meaning',   1800],
      ['hwadu-divider',   2100],
      ['hwadu-text',      2500],
      ['action-card',     3100],
      ['fortune-tiles',   3700],
      ['premium-time-card', 4100],
    ];

    // Reset
    steps.forEach(([id]) => {
      const el = document.getElementById(id);
      if (el) { el.classList.remove('fade-in', 'brush-reveal'); el.classList.add('fade-hidden'); }
    });
    [this.elements.hwaduChar, this.elements.hwaduText, this.elements.actionCard].forEach(el => {
      if (el) { el.classList.remove('fade-in', 'brush-reveal'); el.classList.add('fade-hidden'); }
    });
    
    const pCard = document.getElementById('premium-time-card');
    if (pCard) { pCard.classList.remove('fade-in'); pCard.classList.add('fade-hidden'); }

    // Fire sequence
    steps.forEach(([id, delay]) => {
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          el.classList.remove('fade-hidden');
          el.classList.add('fade-in');
          if (id === 'hwadu-char') setTimeout(() => el.classList.add('brush-reveal'), 50);
        }
      }, delay);
    });
  }

};

App.init();

// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then(registration => {
        console.log('SW registered: ', registration);
      })
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}
