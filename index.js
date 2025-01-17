/*eslint no-console: 0*/
// See https://tinkerpop.apache.org/docs/current/reference/#gremlin-javascript
// Server: https://github.com/bricaud/gremlin-server

const prompts = require('prompts');

const gremlin = require('gremlin');
const traversal = gremlin.process.AnonymousTraversalSource.traversal;
const DriverRemoteConnection = gremlin.driver.DriverRemoteConnection;
// const t = gremlin.process.traversal.t

async function addStringV(text) {
  const g = this;
  const v1 = g.addV('String').property('text', text);
  return await v1.iterate();
}

async function addHeadwordV(props, canonicalStringV) {
  const { lang } = props;
  const g = this;
  const v1 = await g.addV('Headword');
  Object.keys(props).forEach(key => {
    v1.property(key, props[key]);
  });
  return await v1
    .addE('Canonical')
    .to(canonicalStringV)
    .iterate();
}

async function linkStrings(text1, text2, edgeLabel, props = {}) {
  const g = this;
  const s1 = g.V().has('String', 'text', text1);
  const s2 = g.V().has('String', 'text', text2);
  const e = s1.addE(edgeLabel).to(s2);
  Object.keys(props).forEach(key => {
    e.property(key, props[key]);
  });

  e.iterate();
}

async function asyncPrompt(message) {
  return await prompts({
    type: 'confirm',
    name: 'value',
    message: message,
    initial: true,
  });
}
async function noopPrompt() {
  return;
}

const prompt = noopPrompt;

async function main() {
  console.log(`connecting`);
  const conn = new DriverRemoteConnection('ws://localhost:8182/gremlin');
  const g = traversal().withRemote(conn);

  try {
    // Drop existing data.
    await g
      .V()
      .drop()
      .iterate();

    const strings = [
      'estoy embarazada',
      'estoy avergonzada',
      'i am embarrassed',
      'i am pregnant',
      'estar',
      'embarazado',
      'embarazar',
      'avergonzado',
      'i',
      'embarrass',
      'pregnant',
      'to be',
      'estoy bien',
      'soy bien',
      'bien',
      'ser',
    ];

    const headwords = [
      { string: 'estar', lang: 'es' },
      { string: 'embarazado', lang: 'es' },
      { string: 'embarazar', lang: 'es' },
      { string: 'avergonzado', lang: 'es' },
      { string: 'i', lang: 'en' },
      { string: 'embarrass', lang: 'en' },
      { string: 'pregnant', lang: 'en' },
      { string: 'to be', lang: 'en' },
      { string: 'ser', lang: 'es' },
      { string: 'bien', lang: 'es' },
    ];

    const gAddString = addStringV.bind(g);
    strings.forEach(gAddString);

    // Create headwords, linked to strings
    const gAddHeadword = addHeadwordV.bind(g);
    headwords.forEach(async ({ string, lang }) => {
      const stringV = await g.V().has('String', 'text', string);
      return await gAddHeadword({ lang }, stringV);
    });

    const gLinkStrings = linkStrings.bind(g);

    await gLinkStrings('estoy avergonzada', 'estar', 'Contains');
    await gLinkStrings('estoy embarazada', 'estar', 'Contains');
    await gLinkStrings('estoy avergonzada', 'avergonzado', 'Contains');
    await gLinkStrings('i am embarrassed', 'i', 'Contains');
    await gLinkStrings('i am embarrassed', 'to be', 'Contains');
    await gLinkStrings('i am embarrassed', 'embarrass', 'Contains');
    await gLinkStrings('i am pregnant', 'i', 'Contains');
    await gLinkStrings('i am pregnant', 'to be', 'Contains');
    await gLinkStrings('i am pregnant', 'pregnant', 'Contains');
    await gLinkStrings('estoy bien', 'estar', 'Contains');
    await gLinkStrings('estoy bien', 'bien', 'Contains');
    await gLinkStrings('soy bien', 'ser', 'Contains');
    await gLinkStrings('soy bien', 'bien', 'Contains');

  } catch (ex) {
    console.error(ex);
  } finally {
    conn.close();
  }
}

main();
