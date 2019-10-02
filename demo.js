/*eslint no-console: 0, quotes: 0, no-unused-vars: 0 */

const prompts = require('prompts');

const gremlin = require('gremlin');
const traversal = gremlin.process.AnonymousTraversalSource.traversal;
const DriverRemoteConnection = gremlin.driver.DriverRemoteConnection;

async function addTextV({ label, text, lang }) {
  const g = this;
  return await g
    .addV(label)
    .property('text', text)
    .property('lang', lang)
    .iterate();
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

const prompt = asyncPrompt;

async function main() {
  console.log('Creating graph...');
  const conn = new DriverRemoteConnection('ws://localhost:8182/gremlin');
  const g = traversal().withRemote(conn);

  try {
    // Drop existing data.
    await g
      .V()
      .drop()
      .iterate();

    // Seed the graph.
    const initialEntities = [
      { label: 'Phrase', text: 'de dónde eres', lang: 'es' },
      { label: 'Phrase', text: 'estoy avergonzada', lang: 'es' },
      { label: 'Phrase', text: 'soy bien', lang: 'es' },
      { label: 'Word', text: 'actually', lang: 'en' },
      { label: 'Word', text: 'bizarre', lang: 'en' },
      { label: 'Word', text: 'ser', lang: 'es' },
    ];

    const gAddTextV = addTextV.bind(g);
    initialEntities.forEach(gAddTextV);

    console.log(`done.`);
    await prompt('Add CommonMistake edges');
    console.log(`Adding edges...`);

    const mistakenEntities = [
      { label: 'Phrase', text: 'estoy embarazada', lang: 'es' },
      { label: 'Phrase', text: 'estoy bien', lang: 'es' },
      { label: 'Word', text: 'actualmente', lang: 'es' },
      { label: 'Word', text: 'bizarro', lang: 'es' },
    ];

    mistakenEntities.forEach(gAddTextV);

    const s1 = g.V().has('Phrase', 'text', 'estoy avergonzada');
    const s2 = g.V().has('Phrase', 'text', 'estoy embarazada');
    const mistake1 = s1
      .addE('CommonMistake')
      .to(s2)
      .property('reason', 'false cognate')
      .property(
        'explanation',
        '"Embarazada" sounds like "embarrassed" to English speakers, but it does not mean "embarrassed".'
      );
    await mistake1.iterate();

    const s3 = g.V().has('Phrase', 'text', 'estoy bien');
    const s4 = g.V().has('Phrase', 'text', 'soy bien');
    const mistake2 = s3
      .addE('CommonMistake')
      .to(s4)
      .property('reason', 'ser-estar confusion')
      .property(
        'explanation',
        '"Ser" is used for permanent traits, while "estar" is used for temporary ones.'
      );
    await mistake2.iterate();

    const s5 = g.V().has('Word', 'text', 'actually');
    const s6 = g.V().has('Word', 'text', 'actualmente');
    const mistake3 = s5
      .addE('CommonMistake')
      .to(s6)
      .property('reason', 'false cognate')
      .property(
        'explanation',
        '"Actualamente" sounds like "actually" to English speakers, but it does not mean "actually".'
      );
    await mistake3.iterate();

    console.log(`done.`);
    await prompt('Show Words and Phrases that have CommonMistakes');

    const textsAndTheirCommonMistakes = await g
      .V()
      .has('text')
      .as('phrase/word')
      .out('CommonMistake')
      // .properties('reason')
      .as('mistake')
      .select('phrase/word', 'mistake')
      .by('text')
      // .by('reason')
      .toList();

    console.log(
      'Words/phrases and their common mistakes:\n',
      textsAndTheirCommonMistakes
    );
  } catch (ex) {
    console.error(ex);
  } finally {
    conn.close();
  }
}

main();
