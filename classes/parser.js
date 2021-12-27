let {routes, pure_graphql} = global._require('routes');
let {GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLFloat, GraphQLBoolean} = require('graphql');

let structure_types = {
    'string': GraphQLString,
    'int': GraphQLInt,
    'float': GraphQLFloat,
    'boolean': GraphQLBoolean
}

class parser {

    static types = {};

    static parse() {

        let order = {};

        if (routes && routes instanceof Array) {

            routes.forEach((route) => {
                let path = route.path.split('/');
                if (!order['_' + path.length]) {
                    order['_' + path.length] = [];
                }
                order['_' + path.length].push(route);
            });

            const ordered = Object.keys(order).sort().reduce(
                (obj, key) => {
                    obj[key] = order[key];
                    return obj;
                },
                {}
            );

            routes = [];

            for (let i in ordered) {
                routes = routes.concat(ordered[i]);
            }

            routes.forEach((route) => {

                let path = route.path.split('/');

                path = path.reverse();

                let field;

                path.forEach((str, index) => {
                    if (index === 0) {
                        field = str;
                    } else if (index === 1) {
                        let _function = parser.interpreter(route.controller, route.method);
                        let params = parser.getParamNames(route.controller.prototype[route.method]);
                        let args = {};
                        if (Object.keys(params).length > 0) {
                            for (let i in params) {
                                args[i] = {
                                    type: structure_types[params[i].type]
                                }
                                if (params[i].default) {
                                    args[i].defaultValue = params[i].default;
                                }
                            }
                        }
                        if (_function) {
                            parser.addType(str, field, eval(_function.replace('%s%', 'let c = (new route.controller()); return c[route.method].apply(c, Object.keys(args).map((key) => args[key]))')));
                            if (route.return_type) {
                                parser.types[str].fields[field].type = route.return_type;
                            }
                            parser.types[str].fields[field].args = args;
                            field = str;
                        }
                    } else {
                        parser.addType(str, field);
                        field = str;
                    }
                });
            });
        }

        for (let i in pure_graphql) {
            parser.parsePureGraphQL(pure_graphql[i], i);
        }

        for (let i in parser.types) {
            parser.buildSchema(parser.types[i]);
        }

        let fields = {};

        for (let i in parser.types) {
            fields[i] = {
                type: parser.types[i],
                resolve: () => {
                    return parser.types[i]
                }
            }
        }

        return new GraphQLObjectType({
            name: 'Query',
            fields
        });
    }

    static parsePureGraphQL(initial, type_or_field) {
        if (parser.types[type_or_field]) {
            if (initial.fields) {
                for (let i in initial.fields) {
                    if (initial.fields[i].fields) {
                        parser.parsePureGraphQL(initial.fields[i]);
                    } else {
                        parser.types[type_or_field].fields[i] = initial.fields[i];
                    }
                }
            }
        } else {
            if (initial.fields) {
                for (let i in initial.fields) {
                    if (initial.fields[i].fields) {
                        parser.parsePureGraphQL(initial.fields[i]);
                    } else {
                        parser.addType(type_or_field, i, (initial.fields[i].resolve ? initial.fields[i].resolve : false));
                        if (initial.fields[i].args) {
                            parser.types[type_or_field].fields[i].args = initial.fields[i].args;
                        }
                        if (initial.fields[i].type) {
                            parser.types[type_or_field].fields[i].type = initial.fields[i].type;
                        }
                    }
                }
            }
        }
    }

    static buildSchema(initial) {
        for (let i in initial.fields) {
            if (parser.types[initial.fields[i].type]) {
                parser.buildSchema(parser.types[initial.fields[i].type]);
                initial.fields[i].type = parser.types[initial.fields[i].type];
                initial.fields[i].resolve = () => {
                    return parser.types[initial.fields[i].type];
                }
            } else {
                parser.types[initial.name] = new GraphQLObjectType(initial);
            }
        }
    }

    static addType(name, field, resolve = false) {
        resolve = resolve || false;
        if (!parser.types[name]) {
            parser.types[name] = {
                name: name,
                fields: {}
            }
        }

        if (resolve) {
            parser.types[name].fields[field] = {
                type: GraphQLString,
                resolve
            }
        } else {
            parser.types[name].fields[field] = {
                type: field,
            }
        }

    }

    // interpreter method of the controller and return graphql method call string
    static interpreter(controller, method) {
        if (method in controller.prototype) {
            return '(source, args) => { %s%; }';
        }
        return false;
    }

    // get params of a given function
    static getParamNames(func) {
        let STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
        let ARGUMENT_NAMES = /([^\s,]+)/g;
        let fnStr = func.toString().replace(STRIP_COMMENTS, '');
        let result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
        if (result === null) {
            result = [];
        }
        let params = {};
        let last_param;
        let next_default = false;
        result.forEach((param) => {
            if (next_default) {
                next_default = false;
                params[last_param].default = param;
                params[last_param].optional = true;
                if (['true', 'false'].indexOf(param.toLowerCase())) {
                    params[last_param].type = 'boolean';
                }
                if (!isNaN(param)) {
                    params[last_param].type = 'number';
                }
                if (params[last_param].type === 'number') {
                    if ((Number(param).toString()) === ("" + param) && param % 1 !== 0) {
                        params[last_param].type = 'float';
                        params[last_param].default = parseFloat(param);
                    } else {
                        params[last_param].type = 'int';
                        params[last_param].default = parseInt(param);
                    }
                }
            } else {
                if (param === '=') {
                    next_default = true;
                } else {
                    last_param = param;
                    params[last_param] = {
                        default: null,
                        optional: false,
                        type: 'string'
                    };
                }
            }
        })
        return params;
    }

    static capitalize(string = '') {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
}

module.exports = {
    parser
}
