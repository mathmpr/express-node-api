#Requirements

- Node JS >= 15.0.0 (download node from https://nodejs.org/pt-br/download/)

#Getting start

##Install

With Node JS installed, follow these steps:

- Open a terminal and enter in root directory of this project;
- Run: `npm install`;
- Run: `yarn install`.

## Start

- Run `npm start` to run Express + GraphQL server at port 4000;
- Access `http://localhost:4000/graphql` and check an GraphQL client; 
- Possible queries is disponible in right side of window.

## cURL tests

- `curl -d "query={persons{list}}" -X POST http://localhost:4000/graphql?`
- `curl -d "query={persons{list(search: \"ce phi\")}}" -X POST http://localhost:4000/graphql?`

# Conclusions

## My insights into GraphQL

I had heard a little about GraphQL, but had never used it in practice. In several researches done regarding its use with Express and others, the way to assemble the schema is a little confusing and the documentation is not always 100% clear. 

## Possible solutions & Extras

I tried to find a way to assemble the calls to queries and mutations among others, but the most I found was a way to assemble the object-oriented schema, without having to write the schema string. It seemed the most correct way.

In this project, I tried to implement something use both ways in the `routes.js` root file and a parser that converts the traditional way of routes to queries. 

#Consume API

- Consuming a list. List method is located in `controllers/persons.js`
```
{
    persons {
        list
    }    
}
```

- Consuming a list with `search`
```
{
    persons {
        list(search: "ce phi")
    }    
}
```

## Extra & experimental

- Experimental query call to `add` using route parsed
```
{
    persons {
        add(name: "Matheus Prado", email: "matheusprador@gmail.com", password: "xpto")
    }    
}
```

- Experimental query call to `remove` person like a pure GraphQL
```
{
    persons {
        remove(id: 2)
    }    
}
```
