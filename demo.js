/*eslint no-console: 0, quotes: 0, no-unused-vars: 0 */

const prompts = require('prompts');

const gremlin = require('gremlin');
const traversal = gremlin.process.AnonymousTraversalSource.traversal;
const DriverRemoteConnection = gremlin.driver.DriverRemoteConnection;

async function addPhraseV(text) {
  const g = this;
  const v1 = g.addV('Phrase').property('text', text);
  return await v1.iterate();
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
    const phrases = [
      'de donde eres',
      'me llamo',
      'estoy avergonzada',
      'soy bien',
    ];

    phrases.forEach(addPhraseV.bind(g));

    console.log(`done.`);
    await prompt('Add CommonMistake edges');
    console.log(`Adding edges...`);

    const mistakenPhrases = [
      'estoy embarazada',
      'estoy bien',
    ];

    mistakenPhrases.forEach(addPhraseV.bind(g));

    const s1 = g.V().has('Phrase', 'text', 'estoy avergonzada');
    const s2 = g.V().has('Phrase', 'text', 'estoy embarazada');
    const mistake1 = s1
      .addE('CommonMistake')
      .to(s2)
      .property('reason', 'false cognate')
      .property(
        'explanation',
        '"Embarazada" sounds like embarrassed to English speakers but it does not mean "embarrassed".'
      );
    await mistake1.iterate();

    const s3 = g.V().has('Phrase', 'text', 'estoy bien');
    const s4 = g.V().has('Phrase', 'text', 'soy bien');
    const mistake2 = s3
      .addE('CommonMistake')
      .to(s4)
      .property('reason', 'estar-ser confusion')
      .property(
        'explanation',
        '"ser" is used for permanent traits, while "estar" is used for temporary ones'
      );
    await mistake2.iterate();

    console.log(`done.`);
    await prompt('Show Phrases that have CommonMistakes');

    const phrasesAndTheirCommonMistakes = await g
      .V()
      .hasLabel('Phrase')
      .as('phrase')
      .out('CommonMistake')
      .as('mistakes')
      .select('phrase', 'mistakes')
      .by('text')
      .toList();

    console.log(
      'Phrases and their common mistakes:\n',
      phrasesAndTheirCommonMistakes
    );
  } catch (ex) {
    console.error(ex);
  } finally {
    conn.close();
  }
}

main();
