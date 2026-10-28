(function () {
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
})();
