/*eslint no-console: 0*/
// See https://tinkerpop.apache.org/docs/current/reference/#gremlin-javascript
// Server: https://github.com/bricaud/gremlin-server

const gremlin = require('gremlin');
const traversal = gremlin.process.AnonymousTraversalSource.traversal;
const DriverRemoteConnection = gremlin.driver.DriverRemoteConnection;
// const t = gremlin.process.traversal.t

async function main() {
  console.log(`connecting`);
  const g = traversal().withRemote(
    new DriverRemoteConnection('ws://localhost:8182/gremlin')
  );

  const v1 = await g
    .addV('person')
    .property('name', 'marko')
    .next();
  console.log(`v1`, v1);
}

main();
