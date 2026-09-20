const assert = require('node:assert/strict');
const { test } = require('node:test');
const { readFileSync, existsSync } = require('node:fs');
const { resolve, dirname } = require('node:path');
const vm = require('node:vm');

const root = resolve(__dirname, '..');
const script = readFileSync(resolve(root, 'app.js'), 'utf8');

function submitForm(language) {
  const suffix = language === 'es' ? '-es' : '';
  const listeners = {};
  const opened = [];
  const events = [];
  const form = { addEventListener: (name, callback) => { listeners[name] = callback; } };
  const elements = {
    [`order-builder-form${suffix}`]: form,
    [`f-name${suffix}`]: { value: 'Cliente Teste' },
    [`f-bairro${suffix}`]: { value: 'Centro' },
    [`f-kit${suffix}`]: { value: language === 'es' ? 'Kit 10 Viandas' : 'Kit 10 Potes' },
    [`f-obs${suffix}`]: { value: 'Sem cebola' },
  };
  const document = {
    getElementById: id => elements[id] || null,
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener: (name, callback) => { if (name === 'DOMContentLoaded') callback(); },
  };
  vm.runInNewContext(script, {
    document,
    window: { open: url => opened.push(url), addEventListener: () => {}, matchMedia: () => ({ matches: false }) },
    navigator: {},
    fbq: (...args) => events.push(args),
    setTimeout: () => {},
  });
  listeners.submit?.({ preventDefault() {} });
  return { opened, events };
}

for (const language of ['pt', 'es']) {
  test(`formulário ${language} abre WhatsApp com pedido e registra Lead`, () => {
    const { opened, events } = submitForm(language);
    assert.equal(opened.length, 1);
    const url = new URL(opened[0]);
    assert.equal(url.origin, 'https://wa.me');
    assert.equal(url.pathname, '/5551981338580');
    assert.match(url.searchParams.get('text'), /Cliente Teste/);
    assert.match(url.searchParams.get('text'), /Centro/);
    const lead = events.find(event => event[0] === 'track' && event[1] === 'Lead');
    assert.ok(lead);
    assert.equal(lead[2].currency, language === 'es' ? 'PYG' : 'BRL');
    assert.equal(lead[2].value, language === 'es' ? 249000 : 199);
  });
}

test('restrição de verduras em espanhol pertence ao formulário espanhol', () => {
  const html = readFileSync(resolve(root, 'es/index.html'), 'utf8');
  assert.match(html, /<input type="checkbox" name="f-diet-es" value="Más Verduras">/);
});

for (const page of ['index.html', 'es/index.html']) {
  test(`${page}: recursos locais e destinos de âncoras existem`, () => {
    const html = readFileSync(resolve(root, page), 'utf8');
    const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]));
    for (const [, href] of html.matchAll(/\bhref="([^"]+)"/g)) {
      if (href.startsWith('#') && href !== '#') assert.ok(ids.has(href.slice(1)), `${page}: ${href}`);
      if (href && !href.startsWith('#') && !/^https?:/.test(href)) {
        const target = href === '/' ? resolve(root, 'index.html')
          : href === '/es' ? resolve(root, 'es/index.html')
          : resolve(dirname(resolve(root, page)), href.split('?')[0]);
        assert.ok(existsSync(target), `${page}: ${href}`);
      }
    }
  });

  test(`${page}: todos os links diretos de WhatsApp têm destino e mensagem válidos`, () => {
    const html = readFileSync(resolve(root, page), 'utf8');
    const links = [...html.matchAll(/<a\b[^>]*href="(https:\/\/wa\.me\/[^"]+)"[^>]*>/g)];
    assert.ok(links.length >= 5, `${page}: links de conversão ausentes`);
    for (const [, href] of links) {
      const url = new URL(href);
      assert.equal(url.pathname, '/5551981338580');
      if (url.searchParams.has('text')) assert.ok(url.searchParams.get('text').length > 20);
    }
    assert.doesNotMatch(html, /href="https:\/\/instagram\.com"/, 'Instagram genérico não é um perfil da marca');
  });

  test(`${page}: pixel usa o ID esperado no script e no fallback`, () => {
    const html = readFileSync(resolve(root, page), 'utf8');
    assert.match(html, /fbq\('init', '2242030616369158'\)/);
    assert.match(html, /fbq\('track', 'PageView'\)/);
    assert.match(html, /facebook\.com\/tr\?id=2242030616369158&ev=PageView/);
  });

  test(`${page}: seletor de idioma usa rotas canônicas`, () => {
    const html = readFileSync(resolve(root, page), 'utf8');
    assert.doesNotMatch(html, /href="(?:\.\.\/)?(?:es\/)?index\.html"/);
    assert.match(html, /href="\/es"/);
    assert.match(html, /href="\/"/);
  });
}
