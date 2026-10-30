(function () {
  // 阅读进度
  var prog = document.getElementById('prog');
  var col = document.getElementById('doccol');
  var scroller = col || window;
  function onScroll() {
    var el = col || document.documentElement;
    var h = el.scrollHeight - el.clientHeight;
    var top = col ? col.scrollTop : (window.scrollY || el.scrollTop);
    if (prog) prog.style.width = (h > 0 ? (top / h) * 100 : 0) + '%';
  }
  scroller.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // 实时 Star 数
  function getJSON(u) {
    var ctrl = ('AbortController' in window) ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 6000);
    return fetch(u, ctrl ? { signal: ctrl.signal } : undefined)
      .then(function (r) { clearTimeout(timer); return r.ok ? r.json() : null; })
      .catch(function () { clearTimeout(timer); return null; });
  }
  function fmtNum(n) {
    return n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k' : String(n);
  }
  function parseShields(v) {
    if (v == null) return null;
    var m = String(v).trim().match(/^([\d.]+)\s*([kKmM]?)$/);
    if (!m) return null;
    var n = parseFloat(m[1]);
    var suf = m[2].toLowerCase();
    if (suf === 'k') n *= 1000;
    else if (suf === 'm') n *= 1000000;
    return isNaN(n) ? null : Math.round(n);
  }
  function readStarCache(k) {
    try {
      var o = JSON.parse(localStorage.getItem(k) || 'null');
      if (!o || typeof o.n !== 'number') return null;
      if (Date.now() - o.t > 7 * 864e5) return null;
      return o.n;
    } catch (e) { return null; }
  }
  function writeStarCache(k, n) {
    try { localStorage.setItem(k, JSON.stringify({ n: n, t: Date.now() })); } catch (e) {}
  }
  function bindStars(id, sources, cacheKey) {
    var el = document.getElementById(id);
    if (!el) return;
    var cached = cacheKey ? readStarCache(cacheKey) : null;
    if (cached !== null) el.textContent = fmtNum(cached);
    (function next(i) {
      if (i >= sources.length) {
        if (cached === null) el.title = 'Star 数暂时取不到（接口限流），稍后刷新可恢复';
        return;
      }
      var s = sources[i];
      getJSON(s.url).then(function (d) {
        var n = s.pick(d);
        if (typeof n === 'number' && !isNaN(n)) {
          el.textContent = fmtNum(n);
          el.title = 'Stars ' + n;
          if (cacheKey) writeStarCache(cacheKey, n);
        } else { next(i + 1); }
      });
    })(0);
  }
  function pickGiteeStars(d) {
    return d && typeof d.stargazers_count === 'number' ? d.stargazers_count : null;
  }
  var GITEE_API = 'https://gitee.com/api/v5/repos/ncepu-bj/fast-https';
  bindStars('gitee-stars', [
    { url: GITEE_API, pick: pickGiteeStars },
    { url: 'https://api.allorigins.win/raw?url=' + encodeURIComponent(GITEE_API), pick: pickGiteeStars },
    { url: 'https://api.codetabs.com/v1/proxy?quest=' + encodeURIComponent(GITEE_API), pick: pickGiteeStars }
  ], 'fh-gitee-stars');
  bindStars('github-stars', [
    { url: 'https://img.shields.io/github/stars/ncepu-iDealStudio/Fast-Https.json', pick: function (d) { return d ? parseShields(d.value) : null; } },
    { url: 'https://api.github.com/repos/ncepu-iDealStudio/Fast-Https', pick: function (d) { return d && typeof d.stargazers_count === 'number' ? d.stargazers_count : null; } },
    { url: 'https://ungh.cc/repos/ncepu-iDealStudio/Fast-Https', pick: function (d) { return d && d.repo && typeof d.repo.stars === 'number' ? d.repo.stars : null; } }
  ], 'fh-github-stars');

  // TOC scrollspy
  var toc = document.getElementById('TableOfContents');
  if (toc) {
    var links = Array.prototype.slice.call(toc.querySelectorAll('a'));
    var map = {};
    links.forEach(function (a) {
      var id = a.getAttribute('href').slice(1);
      var t = document.getElementById(id);
      if (t) map[id] = a;
    });
    var targets = Object.keys(map).map(function (id) { return document.getElementById(id); });
    if ('IntersectionObserver' in window && targets.length) {
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            links.forEach(function (l) { l.classList.remove('act'); });
            var a = map[e.target.id];
            if (a) a.classList.add('act');
          }
        });
      }, { rootMargin: '0px 0px -75% 0px', threshold: 0 });
      targets.forEach(function (t) { obs.observe(t); });
    }
  }

  // 文档搜索（顶栏内联，结果下拉）
  var input = document.getElementById('searchInput');
  var panel = document.getElementById('searchResults');
  var idx = null, idxPromise = null;

  function loadIndex() {
    if (idxPromise) return idxPromise;
    var meta = document.querySelector('meta[name="search-index"]');
    var indexUrl = meta ? meta.getAttribute('content') : '/search-index.json';
    idxPromise = fetch(indexUrl).then(function (r) { return r.json(); })
      .then(function (d) { idx = d; return d; });
    return idxPromise;
  }
  function hidePanel() {
    if (panel) { panel.hidden = true; panel.innerHTML = ''; }
  }
  function escapeHtml(s) {
    return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; });
  }
  function snippet(text, q) {
    var i = (text || '').toLowerCase().indexOf(q.toLowerCase());
    if (i < 0) return (text || '').slice(0, 80);
    var s = Math.max(0, i - 30);
    return (s > 0 ? '…' : '') + (text || '').slice(s, s + 90) + '…';
  }
  function render(q) {
    if (!idx || !panel) return;
    q = (q || '').trim();
    if (!q) { hidePanel(); return; }
    var terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    var out = [];
    idx.forEach(function (p) {
      var t = (p.title || '').toLowerCase();
      var x = (p.text || '').toLowerCase();
      var hit = terms.every(function (term) { return t.indexOf(term) >= 0 || x.indexOf(term) >= 0; });
      if (hit) {
        var score = terms.reduce(function (a, term) {
          return a + (t.indexOf(term) >= 0 ? 10 : 0) + (x.indexOf(term) >= 0 ? 1 : 0);
        }, 0);
        out.push({ p: p, score: score });
      }
    });
    out.sort(function (a, b) { return b.score - a.score; });
    if (!out.length) {
      panel.innerHTML = '<div class="nav-search-empty">' + escapeHtml(panel.getAttribute('data-empty') || '没有匹配的文档') + '</div>';
      panel.hidden = false;
      return;
    }
    panel.innerHTML = out.slice(0, 8).map(function (o) {
      var p = o.p;
      return '<a href="' + p.url + '"><span class="t">' + escapeHtml(p.title) +
        '</span><span class="s">' + escapeHtml(snippet(p.text || '', q)) + '</span></a>';
    }).join('');
    panel.hidden = false;
  }
  if (input) {
    input.addEventListener('focus', function () {
      loadIndex().then(function () { if (input.value.trim()) render(input.value); }).catch(function () {});
    });
    input.addEventListener('input', function () {
      loadIndex().then(function () { render(input.value); }).catch(function () {});
    });
  }
  if (panel) {
    panel.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('a')) hidePanel();
    });
  }
  document.addEventListener('click', function (e) {
    if (panel && !(e.target.closest && e.target.closest('.nav-search'))) hidePanel();
  });
  document.addEventListener('keydown', function (e) {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (input) { input.focus(); input.select(); }
    } else if (e.key === 'Escape') {
      hidePanel();
      if (input) input.blur();
    }
  });

  // 文档侧边栏：分组折叠
  var docTree = document.querySelector('.doctree');
  if (docTree) {
    Array.prototype.forEach.call(docTree.querySelectorAll('.caret'), function (btn) {
      btn.addEventListener('click', function () {
        var grp = btn.closest('.grp');
        if (!grp) return;
        var collapsed = grp.classList.toggle('collapsed');
        btn.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
      });
    });
    var activeLink = docTree.querySelector('a.on');
    if (activeLink) {
      var node = activeLink.parentNode;
      while (node && node !== docTree) {
        if (node.classList && node.classList.contains('grp')) node.classList.remove('collapsed');
        node = node.parentNode;
      }
    }
  }

  // 了解我们：滚动故事线
  var storyScrolly = document.getElementById('storyScrolly');
  if (storyScrolly) {
    var storyRail = document.getElementById('storyRail');
    var storyProgress = document.getElementById('storyProgress');
    var storyHud = document.getElementById('storyHud');
    var storyObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          if (e.target.dataset.year && storyHud) {
            storyHud.innerHTML = e.target.dataset.year + '<small>CURRENT</small>';
          }
        }
      });
    }, { threshold: 0.35 });
    document.querySelectorAll('.story-node').forEach(function (n) { storyObs.observe(n); });
    function storyOnScroll() {
      var r = storyScrolly.getBoundingClientRect();
      var total = storyScrolly.offsetHeight - window.innerHeight;
      var passed = Math.min(Math.max(-r.top, 0), Math.max(total, 1));
      var pct = total > 0 ? passed / total : 0;
      if (storyRail) storyRail.style.height = (passed + window.innerHeight * 0.5) + 'px';
      if (storyProgress) storyProgress.style.width = (pct * 100) + '%';
    }
    window.addEventListener('scroll', storyOnScroll, { passive: true });
    window.addEventListener('resize', storyOnScroll);
    storyOnScroll();
  }
})();
