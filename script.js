$(function () {
  var $win = $('.win');
  var zTop = 20;
  var isMobile = function () { return window.matchMedia('(max-width: 760px)').matches; };

  /* ---------- Boot sequence ---------- */
  var bootMsgs = ['Booting portfolio…', 'Loading skills…', 'Compiling coffee…', 'Welcome ✨'];
  var bi = 0;
  var bootTimer = setInterval(function () {
    bi = Math.min(bi + 1, bootMsgs.length - 1);
    $('#bootText').text(bootMsgs[bi]);
  }, 550);
  setTimeout(function () {
    clearInterval(bootTimer);
    $('#boot').addClass('done');
    if (!isMobile()) openWin('about');
  }, 2300);

  /* ---------- Clock ---------- */
  function tick() {
    var d = new Date();
    var t = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    var day = d.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' });
    $('#clock').text(day + '  ' + t);
  }
  tick(); setInterval(tick, 30000);

  /* ---------- Typing effect ---------- */
  var words = ['PHP Developer', 'Laravel Developer', 'API Builder', 'Problem Solver'];
  var w = 0, c = 0, del = false;
  (function type() {
    var word = words[w];
    $('#typed').text(word.substring(0, c));
    if (!del && c < word.length) { c++; setTimeout(type, 90); }
    else if (!del) { del = true; setTimeout(type, 1300); }
    else if (c > 0) { c--; setTimeout(type, 40); }
    else { del = false; w = (w + 1) % words.length; setTimeout(type, 250); }
  })();

  /* ---------- Window manager ---------- */
  function focusWin($w) {
    $win.removeClass('active');
    $w.addClass('active').css('z-index', ++zTop);
    $('#activeTitle').text($w.data('title'));
  }

  function animateIn($w) {
    $w.find('.bar i').each(function () { var $b = $(this); $b.css('width', 0); setTimeout(function () { $b.css('width', $b.data('l') + '%'); }, 120); });
    $w.find('[data-count]').each(function () {
      var $n = $(this), target = +$n.data('count');
      $({ n: 0 }).animate({ n: target }, { duration: 1200, step: function () { $n.text(Math.floor(this.n)); }, complete: function () { $n.text(target + (target >= 25 ? '+' : '')); } });
    });
  }

  function openWin(id) {
    var $w = $('#win-' + id);
    var wasClosed = !$w.hasClass('open') || $w.hasClass('min');
    $w.removeClass('min').addClass('open');
    if (isMobile()) { $win.not($w).removeClass('open'); $('.dock button').removeClass('on'); }
    $('.dock [data-open="' + id + '"]').addClass('on');
    focusWin($w);
    if (wasClosed) animateIn($w);
    if (id === 'terminal') setTimeout(function () { if (!isMobile()) $('#termIn').trigger('focus'); }, 50);
  }

  function closeWin($w) {
    $w.removeClass('open max min');
    $('.dock [data-open="' + $w.attr('id').replace('win-', '') + '"]').removeClass('on');
    $('#activeTitle').text('Finder');
  }

  // Open: desktop icons need a double-click on desktop, a tap on touch screens
  $('.icon').on('dblclick', function () { openWin($(this).data('open')); });
  $('.icon').on('click', function () { if (isMobile() || 'ontouchstart' in window) openWin($(this).data('open')); });
  $('.icon').on('keydown', function (e) { if (e.key === 'Enter') openWin($(this).data('open')); });
  $('.dock button').on('click', function () {
    var id = $(this).data('open'), $w = $('#win-' + id);
    if ($w.hasClass('open') && !$w.hasClass('min') && $w.hasClass('active') && !isMobile()) { $w.addClass('min'); $(this).removeClass('on'); }
    else openWin(id);
  });
  $('#openAboutLogo').on('click', function () { openWin('about'); });

  // Traffic lights
  $('.l-close').on('click', function (e) { e.stopPropagation(); closeWin($(this).closest('.win')); });
  $('.l-min').on('click', function (e) { e.stopPropagation(); var $w = $(this).closest('.win'); $w.addClass('min'); $('.dock [data-open="' + $w.attr('id').replace('win-', '') + '"]').removeClass('on'); });
  $('.l-max, .titlebar').on('click dblclick', function (e) {
    if (isMobile()) return;
    if (e.type === 'click' && !$(e.target).hasClass('l-max')) return;
    if (e.type === 'dblclick' && $(e.target).closest('.lights').length) return;
    $(this).closest('.win').toggleClass('max');
  });

  $win.on('mousedown touchstart', function () { focusWin($(this)); });

  /* ---------- Dragging (mouse + touch via pointer events) ---------- */
  var drag = null;
  $('.titlebar').on('pointerdown', function (e) {
    if (isMobile() || $(e.target).closest('.lights').length) return;
    var $w = $(this).closest('.win');
    if ($w.hasClass('max')) return;
    var parent = $('#desktop')[0].getBoundingClientRect();
    var r = $w[0].getBoundingClientRect();
    drag = { $w: $w, dx: e.clientX - r.left, dy: e.clientY - r.top, px: parent.left, py: parent.top };
    this.setPointerCapture(e.pointerId);
    focusWin($w);
  }).on('pointermove', function (e) {
    if (!drag) return;
    var maxX = window.innerWidth - 80, maxY = window.innerHeight - 120;
    var x = Math.min(Math.max(e.clientX - drag.dx - drag.px, -200), maxX);
    var y = Math.min(Math.max(e.clientY - drag.dy - drag.py, 0), maxY);
    drag.$w.css({ left: x, top: y });
  }).on('pointerup pointercancel', function () { drag = null; });

  /* ---------- Projects filter ---------- */
  $('.f').on('click', function () {
    var f = $(this).data('f');
    $('.f').removeClass('active'); $(this).addClass('active');
    $('.proj').each(function () {
      var show = f === 'all' || $(this).data('c') === f;
      if (show) $(this).removeClass('hide').hide().fadeIn(300); else $(this).addClass('hide');
    });
  });

  /* ---------- Project folders (screenshots) ---------- */
  var fs = { imgs: [], i: 0, title: '' };
  var phIcon = '<svg class="ic" viewBox="0 0 24 24"><use href="#i-image"/></svg>';
  function showShot(i) {
    var n = fs.imgs.length;
    if (!n) { $('#fStage').html('<div class="ph">' + phIcon + '<span>No screenshots yet</span></div>'); $('#fCap').text(''); return; }
    i = (i + n) % n; fs.i = i;
    $('.th').removeClass('on').eq(i).addClass('on');
    var src = fs.imgs[i];
    var $img = $('<img>').attr({ src: src, alt: fs.title + ' screenshot ' + (i + 1) }).on('error', function () {
      $('#fStage').html('<div class="ph">' + phIcon + '<span>Add your screenshot at<br>' + src + '</span></div>');
    });
    $('#fStage').empty().append($img);
    $('#fCap').text(src.split('/').pop() + '  ·  ' + (i + 1) + ' / ' + n);
  }
  function openFolder($p) {
    fs.title = $p.find('h4').text();
    fs.imgs = ($p.data('images') || '').split(',').filter(Boolean);
    $('#fTitle').text(fs.title);
    $('#fDesc').text($p.find('p').first().text());
    $('#fTags').html($p.find('.tags').html());
    $('#fPath').text('~/Projects/' + fs.title);
    $('#fThumbs').empty();
    fs.imgs.forEach(function (src, i) {
      var $b = $('<button type="button" class="th">').attr('aria-label', 'Screenshot ' + (i + 1));
      $('<img>').attr({ src: src, alt: '', loading: 'lazy' }).on('error', function () { $(this).replaceWith('<span class="ph">' + phIcon + '</span>'); }).appendTo($b);
      $b.on('click', function () { showShot(i); });
      $('#fThumbs').append($b);
    });
    $('#fPrev, #fNext').toggle(fs.imgs.length > 1);
    openWin('folder'); showShot(0);
  }
  $('.proj[data-c="personal"]').on('click keydown', function (e) {
    if (e.type === 'keydown' && e.key !== 'Enter') return;
    if ($(e.target).closest('a').length) return;
    openFolder($(this));
  });
  $('#fPrev').on('click', function () { showShot(fs.i - 1); });
  $('#fNext').on('click', function () { showShot(fs.i + 1); });
  $('#fBack').on('click', function () { closeWin($('#win-folder')); openWin('projects'); });
  $(document).on('keydown', function (e) {
    if (!$('#win-folder').is('.open.active')) return;
    if (e.key === 'ArrowLeft') showShot(fs.i - 1);
    if (e.key === 'ArrowRight') showShot(fs.i + 1);
  });

  /* ---------- Wallpaper + theme ---------- */
  var wp = 1;
  $('#wallpaper').addClass('wp-1');
  $('#wallBtn').on('click', function () {
    $('#wallpaper').removeClass('wp-' + wp);
    wp = wp % 3 + 1;
    $('#wallpaper').addClass('wp-' + wp);
  });
  function setTheme(t) { $('html').attr('data-theme', t); }
  $('#themeBtn').on('click', function () { setTheme($('html').attr('data-theme') === 'light' ? 'dark' : 'light'); });

  /* ---------- Terminal ---------- */
  var history = [], hi = 0;
  var cmds = {
    help: function () {
      return ['<span class="pk">Commands:</span>',
        '<code>about</code>  · who I am', '<code>skills</code> · what I use', '<code>projects</code> · things I built',
        '<code>contact</code> · say hi', '<code>open &lt;win&gt;</code> · about | projects | skills | contact',
        '<code>theme</code> · toggle light/dark', '<code>wallpaper</code> · change wallpaper', '<code>joke</code> · a dev joke',
        '<code>whoami</code> · ?', '<code>clear</code> · clean the screen'];
    },
    about: function () { return ['Sanish Maharjan — backend-focused PHP/Laravel developer building scalable, maintainable web solutions.']; },
    skills: function () { return ['PHP / Laravel  ▓▓▓▓▓▓▓▓▓░', 'MySQL / Oracle ▓▓▓▓▓▓▓▓░░', 'MVC / REST APIs ▓▓▓▓▓▓▓▓░░', 'HTML / CSS     ▓▓▓▓▓▓▓▓░░', 'Git / GitLab   ▓▓▓▓▓▓▓▓░░']; },
    projects: function () { return ['<span class="ok">● E-commerce:</span> Jeerami Arts — handicraft products', '<span class="ok">● E-commerce:</span> Giftsland — handmade products', '· Diecast & Collectibles', '· Clothing Store', '· Bike Accessories Store — college project', '· Futsal Booking App — Flutter college project', '· Tours & Travel Website — HTML, CSS, jQuery', '<span class="dim">tip: type "open projects"</span>']; },
    contact: function () { return ['📧 sanish.maharjan001@gmail.com', '📞 +977 9841306385', '🔗 sanish-maharjan.com.np', '🔗 linkedin.com/in/sanish-maharjan-67ab591b2', '<span class="dim">tip: type "open contact"</span>']; },
    whoami: function () { return ['Sanish Maharjan — Backend Developer']; },
    joke: function () {
      var j = ['Why do devs prefer dark mode? Because light attracts bugs.', 'There are 10 kinds of people: those who get binary and those who don\'t.', 'A CSS property walks into a bar… and nobody can center it.'];
      return [j[Math.floor(Math.random() * j.length)]];
    },
    theme: function () { $('#themeBtn').trigger('click'); return ['<span class="ok">Theme switched.</span>']; },
    wallpaper: function () { $('#wallBtn').trigger('click'); return ['<span class="ok">Wallpaper changed.</span>']; },
    sudo: function () { return ['<span class="pk">Nice try. 😄</span>']; },
    clear: function () { $('#termOut').empty(); return []; }
  };

  function print(lines) {
    lines.forEach(function (l) { $('#termOut').append('<p>' + l + '</p>'); });
    var b = $('#termBody')[0]; b.scrollTop = b.scrollHeight;
  }
  function esc(s) { return $('<div>').text(s).html(); }

  $('#termForm').on('submit', function (e) {
    e.preventDefault();
    var raw = $.trim($('#termIn').val());
    $('#termIn').val('');
    if (!raw) return;
    history.push(raw); hi = history.length;
    print(['<span class="pk">guest@sanish:~$</span> ' + esc(raw)]);
    var parts = raw.toLowerCase().split(/\s+/);
    if (parts[0] === 'open') {
      if (['about', 'projects', 'skills', 'contact'].indexOf(parts[1]) > -1) { openWin(parts[1]); print(['<span class="ok">Opening ' + parts[1] + '…</span>']); }
      else print(['Usage: <code>open about|projects|skills|contact</code>']);
    } else if (cmds[parts[0]]) print(cmds[parts[0]]());
    else print(['command not found: ' + esc(parts[0]) + ' — try <code>help</code>']);
  });
  $('#termIn').on('keydown', function (e) {
    if (e.key === 'ArrowUp' && hi > 0) { hi--; $(this).val(history[hi]); e.preventDefault(); }
    if (e.key === 'ArrowDown') { hi = Math.min(hi + 1, history.length); $(this).val(history[hi] || ''); e.preventDefault(); }
  });
  $('#termBody').on('click', function () { $('#termIn').trigger('focus'); });

  /* ---------- Contact form ---------- */
  $('#cForm').on('submit', function (e) {
    var ok = true, $m = $('#cMsg').removeClass('ok err');
    $(this).find('input, textarea').not('[name="website"]').each(function () {
      var v = $.trim($(this).val());
      var bad = !v || (this.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v));
      $(this).toggleClass('bad', bad); if (bad) ok = false;
    });
    if (!ok) { e.preventDefault(); $m.addClass('err').text('Please fill every field with valid info.'); return; }
    $m.addClass('ok').text('Sending your message…');
  });
  $('#cForm').on('input', 'input, textarea', function () { $(this).removeClass('bad'); });

  var contactStatus = new URLSearchParams(window.location.search).get('contact');
  if (contactStatus) {
    openWin('contact');
    if (contactStatus === 'sent') $('#cMsg').addClass('ok').text('Thanks — your message has been sent.');
    else if (contactStatus === 'invalid') $('#cMsg').addClass('err').text('Please provide a valid name, email and message.');
    else $('#cMsg').addClass('err').text('Your message could not be sent. Please try again later.');
  }

  /* ---------- Keyboard: Esc closes active window ---------- */
  $(document).on('keydown', function (e) {
    if (e.key === 'Escape') closeWin($('.win.active'));
  });
});
