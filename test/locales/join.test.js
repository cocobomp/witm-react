import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

import i18next from 'i18next';

const LANGUAGES = ['en', 'fr', 'de'];

function loadJoin(language) {
  const url = new URL(`../../src/locales/${language}/join.json`, import.meta.url);
  return JSON.parse(readFileSync(url, 'utf8'));
}

function keysOf(object, prefix = '') {
  return Object.entries(object).flatMap(([key, value]) =>
    typeof value === 'object' ? keysOf(value, `${prefix}${key}.`) : [`${prefix}${key}`],
  );
}

const resources = Object.fromEntries(
  LANGUAGES.map((language) => [language, { join: loadJoin(language) }]),
);

describe('join page translations', () => {
  it('have the same keys in every language', () => {
    const englishKeys = keysOf(resources.en.join).sort();
    for (const language of LANGUAGES) {
      assert.deepEqual(keysOf(resources[language].join).sort(), englishKeys, language);
    }
  });

  it('put the inviter name in the invited title', async () => {
    const i18n = i18next.createInstance();
    await i18n.init({ resources, lng: 'en', interpolation: { escapeValue: false } });

    assert.equal(i18n.t('join:titleWithInviter', { lng: 'fr', name: 'Léa' }), "Léa t'invite !");
    assert.equal(i18n.t('join:titleWithInviter', { lng: 'en', name: 'Léa' }), 'Léa invites you!');
    assert.equal(i18n.t('join:titleWithInviter', { lng: 'de', name: 'Léa' }), 'Léa lädt dich ein!');
  });

  it('print a name that looks like a template as plain text', async () => {
    const i18n = i18next.createInstance();
    await i18n.init({ resources, lng: 'en', interpolation: { escapeValue: false } });

    for (const name of ['{{name}}', '$t(join:title)', '{{lng}}']) {
      assert.equal(i18n.t('join:titleWithInviter', { name }), `${name} invites you!`, name);
    }
  });
});
