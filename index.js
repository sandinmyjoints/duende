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
    await g.V().drop().iterate();

    const v1 = await g
      .addV('headword')
      .property('canonical_text', 'gráfico')
      .property('language', 'es');
    // .next();
    console.log(`v1`, v1);

    const v2 = await g
      .addV('headword')
      .property('canonical_text', 'graph')
      .property('language', 'en');
    // .next();
    console.log(`v2`, v2);

    const v3 = await g
      .addV('inflection')
      .property('canonical_text', 'graphs')
      .property('language', 'en');
    // .next();
    console.log(`v3`, v3);

    // const e1 = await g
    //   .V(gráfico)
    //   .addE('translation')
    //   .to(graph)
    //   .iterate();
    // console.log(`e1`, e1);

    const e1 = await v1
      .addE('translation')
      .to(v2)
      .iterate();
    console.log(`e1`, e1);

    // const e2 = await v2
    //   .addE('translation')
    //   .to(v1)
    //   .iterate();
    // console.log(`e2`, e2);

    const e3 = await g.V().has('canonical_text', 'graph')
      .addE('plural')
      .to(v3)
      .iterate();
    console.log(`e3`, e1);

    const gráfico = await g.V().has('canonical_text', 'gráfico').next();
    console.log('query', gráfico);

    // const graph = g.V().has('canonical_text', 'graph');
    // const graphs = g.V().has('canonical_text', 'graphs');

  } catch (ex) {
    console.error(ex);
  } finally {
    conn.close();
  }
}

main();
