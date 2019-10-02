# Duende

This Docker file creates a container running [Gremlin
Tinkerpop](https://github.com/apache/tinkerpop), with a TinkerGraph.

## Usage

```
docker build -t duende .
docker run -p 8182:8182 -v "$PWD"/data:/data -it --name duende duende
yarn
node index.js
```

Open up index.js and take a look at the Gremlin DSL. Try adding or changing!
https://tinkerpop.apache.org/docs/current/reference/

The graph will be saved into a graphson file, each time the server is shut
down. It will also try to load the graph from this file (if it exists) each
time the server is started.

See the [TinkerGraph configuration
section](http://tinkerpop.apache.org/docs/current/reference/#_configuration_2)
for more details.
