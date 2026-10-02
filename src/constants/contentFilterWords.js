/**
 * Word lists of the content filter, copied from the app
 * (`lib/src/core/moderation/content_filter_words.dart`, WITM 3.5) so the web
 * join page refuses the same inviter names as the app does. Keep both copies
 * in step.
 *
 * Entries are already in the normalised form the filter compares against:
 * lowercase, no diacritics, no leetspeak, no letter stretched beyond two
 * repeats. Keep every entry in that shape or it will never match.
 *
 * Two tiers. BLOCKED_WORDS match a whole token only, because most insults
 * are also the start of harmless words ("con" → "concours"). BLOCKED_STEMS
 * match anywhere inside a token: they are slurs no ordinary word contains.
 */

export const BLOCKED_WORDS = new Set([
  // ── French ──
  'pute', 'putes', 'putain', 'salope', 'salopes', 'salaud', 'salauds',
  'connard', 'connards', 'connasse', 'connasses', 'con', 'conne', 'cons',
  'encule', 'encules', 'enculer', 'batard', 'batards', 'batarde', 'pd',
  'pede', 'pedes', 'tapette', 'tapettes', 'tarlouze', 'gouine', 'gouines',
  'negre', 'negres', 'negresse', 'bougnoule', 'bougnoules', 'bicot',
  'bicots', 'youpin', 'youpins', 'chinetoque', 'chinetoques', 'niakoue',
  'niakoues', 'bamboula', 'raton', 'ratons', 'bite', 'bites', 'couille',
  'couilles', 'chatte', 'chattes', 'nichons', 'branler', 'branlette',
  'branleur', 'branleurs', 'branleuse', 'suce', 'sucer', 'suceuse', 'suceur',
  'baiser', 'baise', 'baisee', 'niquer', 'nique', 'niquee', 'ntm', 'fdp',
  'tg', 'ta gueule', 'ferme ta gueule', 'fils de pute', 'fille de pute',
  'nique ta mere', 'nique ta race', 'sale arabe', 'sale noir', 'sale juif',
  'sale blanc', 'sale pd', 'debile', 'debiles', 'mongol', 'mongols',
  'mongole', 'attarde', 'attardes', 'gros porc', 'grosse vache',
  'grosse truie',
  // ── English ──
  'fuck', 'fucks', 'fucked', 'fucker', 'fuckers', 'fucking', 'motherfucker',
  'motherfuckers', 'shit', 'shits', 'bullshit', 'asshole', 'assholes',
  'bitch', 'bitches', 'bastard', 'bastards', 'cunt', 'cunts', 'dick',
  'dicks', 'dickhead', 'cock', 'cocks', 'pussy', 'pussies', 'whore',
  'whores', 'slut', 'sluts', 'wanker', 'wankers', 'twat', 'twats', 'prick',
  'pricks', 'fag', 'fags', 'faggot', 'faggots', 'dyke', 'dykes', 'tranny',
  'trannies', 'retard', 'retards', 'retarded', 'spastic', 'chink', 'chinks',
  'gook', 'gooks', 'spic', 'spics', 'wetback', 'wetbacks', 'kike', 'kikes',
  'raghead', 'ragheads', 'towelhead', 'towelheads', 'paki', 'pakis', 'coon',
  'coons', 'blowjob', 'blowjobs', 'handjob', 'jerk off', 'suck my',
  'kill yourself', 'kys', 'go die',
  // ── German ──
  'hure', 'huren', 'hurensohn', 'hurensohne', 'schlampe', 'schlampen',
  'fotze', 'fotzen', 'arschloch', 'arschlocher', 'wichser', 'wichserin',
  'missgeburt', 'missgeburten', 'schwuchtel', 'schwuchteln', 'tunte',
  'tunten', 'kanake', 'kanaken', 'kanacke', 'kanacken', 'neger', 'negerin',
  'schlitzauge', 'schlitzaugen', 'kameltreiber', 'itaker', 'spast', 'spasti',
  'spastis', 'mongo', 'mongos', 'behindert', 'behinderter', 'ficken',
  'fick dich', 'fick', 'gefickt', 'schwanz', 'schwanze', 'muschi', 'muschis',
  'blasen', 'bring dich um', 'verreck', 'verrecke', 'halts maul',
  'halt die fresse', 'fresse',
]);

export const BLOCKED_STEMS = new Set([
  'nigg', 'nigger', 'niggas', 'negre', 'negresse', 'bougnoul', 'youpin',
  'chinetoq', 'faggot', 'tranny', 'kike', 'raghead', 'towelhead',
  'hurensohn', 'schwuchtel', 'kanak', 'schlitzaug', 'encule', 'enculer',
  'fils de pute', 'fille de pute', 'nique ta mere', 'nique ta race',
  'kill yourself', 'bring dich um', 'motherfuck',
]);
