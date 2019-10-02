/*eslint no-console: 0*/
// See https://tinkerpop.apache.org/docs/current/reference/#gremlin-javascript
// Server: https://github.com/bricaud/gremlin-server

const gremlin = require('gremlin');
const traversal = gremlin.process.AnonymousTraversalSource.traversal;
const DriverRemoteConnection = gremlin.driver.DriverRemoteConnection;
// const t = gremlin.process.traversal.t

async function main() {
  console.log(`connecting`);
  const conn = new DriverRemoteConnection('ws://localhost:8182/gremlin');
  const g = traversal().withRemote(conn);

  try {
    // Drop existing data.
    await g.V().drop().iterate();

    // const v1 = await g
    //   .addV('headword')
    //   .property('canonical_text', 'gráfico')
    //   .property('language', 'es');
    // // .next();
    // console.log(`v1`, v1);

    // const v2 = await g
    //   .addV('headword')
    //   .property('canonical_text', 'graph')
    //   .property('language', 'en');
    // // .next();
    // console.log(`v2`, v2);

    // const v3 = await g
    //   .addV('inflection')
    //   .property('canonical_text', 'graphs')
    //   .property('language', 'en');
    // // .next();
    // console.log(`v3`, v3);

    // // const e1 = await g
    // //   .V(gráfico)
    // //   .addE('translation')
    // //   .to(graph)
    // //   .iterate();
    // // console.log(`e1`, e1);

    // const e1 = await v1
    //   .addE('translation')
    //   .to(v2)
    //   .iterate();
    // console.log(`e1`, e1);

    // // const e2 = await v2
    // //   .addE('translation')
    // //   .to(v1)
    // //   .iterate();
    // // console.log(`e2`, e2);

    // const e3 = await g.V().has('canonical_text', 'graph')
    //   .addE('plural')
    //   .to(v3)
    //   .iterate();
    // console.log(`e3`, e1);

    // const gráfico = await g.V().has('canonical_text', 'gráfico').next();
    // console.log('query', gráfico);

    // const graph = g.V().has('canonical_text', 'graph');
    // const graphs = g.V().has('canonical_text', 'graphs');


    //Canto example

    //strings
    const cantoString = await g
      .addV('string')
      .property('canonical_text', 'canto')
      .iterate();

    const cantarString = await g
      .addV('string')
      .property('canonical_text', 'cantar')
      .iterate();

    const songString = await g
      .addV('string')
      .property('canonical_text', 'song')
      .iterate();

    const singingString = await g
      .addV('string')
      .property('canonical_text', 'singing')
      .iterate();


    //headwords
    const cantarHeadword = await g
      .addV('headword')
      .property('language', 'es')
      .property('sd_id', 1)
      .iterate();
    //console.log(`cantarHeadword`, cantarHeadword);

    const cantoEnHeadword = await g
      .addV('headword')
      .property('language', 'en')
      .property('sd_id', 2)
      .iterate();
    //console.log(`cantoEnHeadword`, cantoEnHeadword);

    const cantoEsHeadword = await g
      .addV('headword')
      .property('language', 'es')
      .property('sd_id', 3)
      .iterate();
    //console.log(`cantoEsHeadword`, cantoEsHeadword);

    const songHeadword = await g
      .addV('headword')
      .property('language', 'en')
      .property('sd_id', 4)
      .iterate();
    //console.log(`songHeadword`, songHeadword);

    const singingHeadword = await g
      .addV('headword')
      .property('language', 'en')
      .property('sd_id', 5)
      .iterate();
    //console.log(`singingHeadword`, singingHeadword);

    //sense
    const cantarSense = await g
      .addV('sense')
      .property('part_of_speech', 'verb')
      .iterate();
    //console.log(`cantarSense`, cantarSense);

    const cantoEnSense = await g
      .addV('sense')
      .property('part_of_speech', 'noun')
      .property('context', 'literature')
      .iterate();
    //console.log(`cantoEnSense`, cantoEnSense);

    const cantoEsSense = await g
      .addV('sense')
      .property('part_of_speech', 'noun')
      .property('context', 'music')
      .iterate();
    //console.log(`cantoEsSense`, cantoEsSense);

    //edges
    var senseVerbCantarVertex = g.V().has('sense', 'part_of_speech', 'verb');
    var cantoStringVertex = g.V().has('string', 'canonical_text', 'canto');
    var e = await senseVerbCantarVertex.addE('conjugation')
            .property('tense', 'present')
            .property('preson', 'first singular')
            .to(cantoStringVertex)
            .iterate();

    var cantarHeadwordVortex = g.V().has('headword', 'sd_id', 1);
    senseVerbCantarVertex = g.V().has('sense', 'part_of_speech', 'verb');
    e = await cantarHeadwordVortex.addE('sense')
      .to(senseVerbCantarVertex)
      .iterate();

    var cantarStringVortex = g.V().has('string', 'canonical_text', 'cantar');
    cantarHeadwordVortex = g.V().has('headword', 'sd_id', 1);
    e = await cantarHeadwordVortex.addE('canonical')
    .to(cantarStringVortex)
    .iterate();

    var cantoEnHeadwordVortex = g.V().has('headword', 'sd_id', 2);
    cantoStringVertex = g.V().has('string', 'canonical_text', 'canto');
    e = await cantoEnHeadwordVortex.addE('canonical')
            .to(cantoStringVertex)
            .iterate();

    var cantoEnSenseVortex = g.V().has('sense', 'context', 'literature');
    cantoEnHeadwordVortex = g.V().has('headword', 'sd_id', 2);
    e = await cantoEnHeadwordVortex.addE('sense')
    .to(cantoEnSenseVortex)
    .iterate();

    var cantoEsHeadwordVortex = g.V().has('headword', 'sd_id', 3);
    cantoStringVertex = g.V().has('string', 'canonical_text', 'canto');
    e = await cantoEsHeadwordVortex.addE('canonical')
            .to(cantoStringVertex)
            .iterate();

    cantoEnSenseVortex = g.V().has('sense', 'context', 'literature');
    cantoEsHeadwordVortex = g.V().has('headword', 'sd_id', 3);
    e = await cantoEnSenseVortex.addE('sense')
    .to(cantoEsHeadwordVortex)
    .iterate();

    cantoEsSenseVortex = g.V().has('sense', 'context', 'music');
    cantoEsHeadwordVortex = g.V().has('headword', 'sd_id', 3);
    e = await cantoEsHeadwordVortex.addE('sense')
    .to(cantoEsSenseVortex)
    .iterate();

    cantoEsSenseVortex = g.V().has('sense', 'context', 'music');
    var songHeadwordVortex = g.V().has('headword', 'sd_id', 4);
    e = await cantoEsSenseVortex.addE('translation')
    .to(songHeadwordVortex)
    .iterate();

    cantoEsSenseVortex = g.V().has('sense', 'context', 'music');
    var singingHeadwordVortex = g.V().has('headword', 'sd_id', 5);
    e = await cantoEsSenseVortex.addE('translation')
    .to(singingHeadwordVortex)
    .iterate();

    var songStringVortex = g.V().has('string', 'canonical_text', 'song');
    songHeadwordVortex = g.V().has('headword', 'sd_id', 4);
    e = await songHeadwordVortex.addE('canonical')
    .to(songStringVortex)
    .iterate();


    var singingStringVortex = g.V().has('string', 'canonical_text', 'singing');
    singingHeadwordVortex = g.V().has('headword', 'sd_id', 5);
    e = await singingHeadwordVortex.addE('canonical')
    .to(singingStringVortex)
    .iterate();

    const canto = await g.V().has('canonical_text', 'canto').next();
    console.log('query', canto);
    
  


  } catch (ex) {
    console.error(ex);
  } finally {
    conn.close();
  }
}

main();
