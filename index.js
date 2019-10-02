/*eslint no-console: 0*/
// See https://tinkerpop.apache.org/docs/current/reference/#gremlin-javascript
// Server: https://github.com/bricaud/gremlin-server

const gremlin = require('gremlin');
const traversal = gremlin.process.AnonymousTraversalSource.traversal;
const DriverRemoteConnection = gremlin.driver.DriverRemoteConnection;
// const t = gremlin.process.traversal.t

async function addHeadword(props) {
  const {lang, handle} = props;
  const g = this;
  const v1 = await g.addV('Headword')
  Object.keys(props).forEach(key => {
    v1.property(key, props[key]);
  });
  await v1.next();
}

async function addString(text) {
  const g = this;
  const v1 = g.addV('String').property('text', text);

  return await v1.next();
}

async function linkStrings(text1, text2, edgeLabel, props = {}) {
  const g = this;
  const s1 = g.V().has('String', 'text', text1);
  const s2 = g.V().has('String', 'text', text2);
  const e = s1.addE(edgeLabel).to(s2);
  Object.keys(props).forEach(key => {
    e.property(key, props[key]);
  });

  e.next();
}

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

    const texts = [
      'estoy embarazada',
      'estoy avergonzada',
      'i am embarrassed',
      'i am pregnant',
      'estar',
      'embarazado',
      'embarazar',
      'avergonzado',
    ];

    const headwords = [
      'estar',
      'i',
      'embarrass',
      'pregnant',
      'to be',
      'embarazado',
      'embarazar',
      'avergonzado',
    ];

    const gAddString = addString.bind(g);
    texts.forEach(gAddString);

    const gLinkStrings = linkStrings.bind(g);

    const gAddHeadword = addHeadword.bind(g)
    headwords.forEach(gAddHeadword)

    function linkStringsToHeadwords() {
      // iterate through all headwords
      // if headword is in a string, add a Contains edge from string to headword
      // g.V().has('text', )
    }

    // await gLinkStringsToHeadwords()

    await gLinkStrings('estoy embarazada', 'estoy avergonzada', 'Mistake', {
      reason: 'false cognate',
      explanation:
        'Embarazada sounds like embarrassed to English speakers but it does not mean embarrassed.',
    });
    await gLinkStrings('estoy avergonzada', 'estar', 'Contains');
    await gLinkStrings('estoy embarazada', 'estar', 'Contains');
    await gLinkStrings('estoy avergonzada', 'avergonzado', 'Contains');
    const inbound = await g.V().has('String', 'text', 'estar').inE().toList()
    console.log(`inbound relationships to estar`, inbound);
    console.log(`done.`);
  } catch (ex) {
    console.error(ex);
  } finally {
    conn.close();
  }
}

main();
