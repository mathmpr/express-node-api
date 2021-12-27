global.root = __dirname + '/';
global._require = (module_name) => {
    return require(__dirname + '/' + module_name);
}

let express = require('express');
let {graphqlHTTP} = require('express-graphql');
let {GraphQLSchema} = require('graphql');

let {parser} = global._require('classes/parser');
let {log_request} = global._require('classes/log_request');

let query = parser.parse();

let schema = new GraphQLSchema({
    query
});

let app = express();

// middleware for logs
app.use(function (req, res, next) {
    req.on('data', (data) => {
        data = data.toString().replaceAll('\\n', '\r\n');
        log_request.log(req, data.toString());
    });
    next();
});

app.use('/graphql', graphqlHTTP({
    schema: schema,
    graphiql: true,
}));

app.listen(4000);
console.log('Running a GraphQL API server at http://localhost:4000/graphql');
