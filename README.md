# Duende

This Docker file creates a container running [Gremlin
Tinkerpop](https://github.com/apache/tinkerpop), with a TinkerGraph.

## Usage

```
docker build -t duende .
docker run -p 8182:8182 -v "$PWD"/data:/data -it --name duende duende
```

Connect with a Gremlin client on port 8182.

The graph will be saved into a graphson file, each time the server is shut
down. It will also try to load the graph from this file (if it exists) each
time the server is started.

See the [TinkerGraph configuration
section](http://tinkerpop.apache.org/docs/current/reference/#_configuration_2)
for more details.
