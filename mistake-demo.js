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
      { label: 'Word', text: 'ser', lang: 'es' },
    ];

    const gAddTextV = addTextV.bind(g);
    initialEntities.forEach(gAddTextV);

    console.log(`done.`);
    await prompt('Add Mistake edges');
    console.log(`Adding edges...`);

    const mistakenEntities = [
      { label: 'Phrase', text: 'estoy embarazada', lang: 'es' },
      { label: 'Phrase', text: 'estoy bien', lang: 'es' },
      { label: 'Word', text: 'actualmente', lang: 'es' },
    ];

    mistakenEntities.forEach(gAddTextV);

    await g
      .V()
      .has('Phrase', 'text', 'estoy avergonzada')
      .addE('Mistake')
      .to(g.V().has('Phrase', 'text', 'estoy embarazada'))
      .property('reason', 'false cognate')
      .property(
        'explanation',
        '"Embarazada" sounds like "embarrassed" to English speakers, but it does not mean "embarrassed".'
      )
      .iterate();

    await g
      .V()
      .has('Phrase', 'text', 'estoy bien')
      .addE('Mistake')
      .to(g.V().has('Phrase', 'text', 'soy bien'))
      .property('reason', 'ser-estar confusion')
      .property(
        'explanation',
        '"Ser" is used for permanent traits, while "estar" is used for temporary ones.'
      )
      .iterate();

    await g
      .V()
      .has('Word', 'text', 'actually')
      .addE('Mistake')
      .to(g.V().has('Word', 'text', 'actualmente'))
      .property('reason', 'false cognate')
      .property(
        'explanation',
        '"Actualamente" sounds like "actually" to English speakers, but it does not mean "actually".'
      )
      .iterate();

    console.log(`done.`);
    await prompt('Show Words and Phrases that have Mistakes');

    const countsOfKindsOfMistakes = await g
      .E()
      .hasLabel('Mistake')
      .values('reason')
      .groupCount()
      .next();

    console.log(
      `\nCounts of kinds of mistakes:\n`,
      countsOfKindsOfMistakes.value
    );

    const wordsAndTheirMistakes = await g
      .V()
      .has('text')
      .as('phrase/word')
      .out('Mistake')
      .as('mistaken answer')
      .select('phrase/word', 'mistaken answer')
      .by('text')
      .toList();

    console.log(
      '\nWords/phrases and their common mistakes:\n',
      wordsAndTheirMistakes
    );

    // const wordsAndTheirMistakes2 = await g
    //   .V()
    //   .has('text')
    //   .as('phrase/word')
    //   // .project('a')
    //   .aggregate('x')
    //   .by('text')
    //   .cap('x')
    //   // .back('phrase/word')
    //   .outE('Mistake')
    //   .as('mistake')
    //   .aggregate('y')
    //   .by('reason')
    //   .cap('y')
    //   // .back('mistake')
    //   .inV()
    //   .as('mistaken answer')
    //   .aggregate('z')
    //   .by('text')
    //   .cap('z')
    //   // .back('mistaken answer')
    //   .select('phrase/word', 'mistake', 'mistaken answer')
    //   // .select(values)
    //   // .by('text')
    //   // .by('reason')
    //   .toList();

    // console.log(
    //   '\nWords/phrases and their common mistakes:\n',
    //   wordsAndTheirMistakes2
    // );
  } catch (ex) {
    console.error(ex);
  } finally {
    conn.close();
  }
}

main();
