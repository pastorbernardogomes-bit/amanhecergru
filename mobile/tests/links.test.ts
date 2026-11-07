import assert from 'node:assert/strict';
import test from 'node:test';
import { churchIdentity, parseChurchInput, publicChurchUrl, safeHttpsUrl } from '../src/lib/links';

const origin = 'https://igrejas.example.org';
const id = '7b4ad046-3810-4c58-9cd4-0ce833aa97cd';

test('identifica slug e UUID sem montar filtros arbitrários', () => {
  assert.deepEqual(churchIdentity('rafah-centro'), { field: 'slug', value: 'rafah-centro' });
  assert.deepEqual(churchIdentity(id.toUpperCase()), { field: 'id', value: id });
  for (const invalid of ['', '../igreja', 'slug,or(id.eq.x)', 'igreja com espaço', 'igreja/filial']) {
    assert.equal(churchIdentity(invalid), null);
  }
});

test('aceita identificador digitado e links nativos', () => {
  assert.equal(parseChurchInput(' rafah-centro '), 'rafah-centro');
  assert.equal(parseChurchInput('rafah:///igreja/rafah-centro'), 'rafah-centro');
  assert.equal(parseChurchInput(`rafah://igreja/${id}`), id);
});

test('aceita QR HTTPS somente do domínio público definido', () => {
  assert.equal(parseChurchInput(`${origin}/igreja/rafah-centro`, origin), 'rafah-centro');
  assert.equal(parseChurchInput(`${origin}/igreja/${id}/`, origin), id);
  assert.equal(parseChurchInput('https://outro.example.org/igreja/rafah', origin), null);
  assert.equal(parseChurchInput(`${origin}/igreja/rafah`), null);
});

test('rejeita credenciais, parâmetros, rotas extras e protocolos indevidos', () => {
  for (const value of [
    `${origin}/igreja/rafah?redirect=https://outro.example.org`,
    `${origin}/igreja/rafah#extra`,
    `${origin}/igreja/rafah/check-in`,
    `${origin}/igreja/%2F`,
    `${origin}/igreja/%`,
    'https://user:password@igrejas.example.org/igreja/rafah',
    'rafah://outro/igreja/rafah',
    'javascript:alert(1)',
    'http://igrejas.example.org/igreja/rafah',
  ]) assert.equal(parseChurchInput(value, origin), null);
});

test('gera link público sem depender de instalação', () => {
  assert.equal(publicChurchUrl('rafah-centro', origin), `${origin}/igreja/rafah-centro`);
  assert.equal(publicChurchUrl('rafah-centro'), null);
  assert.equal(publicChurchUrl('../', origin), null);
});

test('restringe imagens e sites a HTTPS sem credenciais', () => {
  assert.equal(safeHttpsUrl('https://example.org/logo.png'), 'https://example.org/logo.png');
  assert.equal(safeHttpsUrl('javascript:alert(1)'), null);
  assert.equal(safeHttpsUrl('https://user:secret@example.org'), null);
  assert.equal(safeHttpsUrl(null), null);
});
