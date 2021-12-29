let {persons} = global._require('controllers/persons');

const {GraphQLJSON} = require('graphql-type-json');
let {GraphQLString, GraphQLInt} = require('graphql');

module.exports = {

    // route way
    routes: [
        {
            path: 'persons/list',
            method: 'list',
            controller: persons,
            return_type: GraphQLJSON
        },
        {
            path: 'persons/find',
            method: 'find',
            controller: persons,
            return_type: GraphQLJSON
        },
        {
            path: 'persons/add',
            method: 'add',
            controller: persons,
            return_type: GraphQLJSON
        },
    ],

    // like original GraphQL OO (same structure but without object usage)
    pure_graphql: {
        persons: {
            fields: {
                remove: {
                    type: GraphQLJSON,
                    args: {
                        id: {
                            type: GraphQLInt
                        }
                    },
                    resolve: (source, args) => {
                        let c = new persons;
                        c.delete.apply(c, args);
                    }
                },
            }
        }
    }

}
