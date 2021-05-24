# Plate*Via* for Javascript

> A javascript parser to parse `Template` or `Expression`, based on AST.

## Install

```shall script
npm install -D platevia
```

## Demo

### Parse `Expression`

```javascript

const { parsePlate } = require('platevia');

const toParseText = '1 + a'

const parsedResult = parsePlate(toParseText).via({a: 100})

console.log(parsedResult); // > 101

```

### Parse `Template`

> In fact, the expression is being parsed, but the template string based on ES6 is replaced

```javascript

const { parsePlate } = require('platevia');

const toParseText = '`Hello ${ yourName }, there are ${ clients.length } clients: ${ each(clients, client => client.name, \', \') }`'

const parsedResult = parsePlate(toParseText).via(
    {
        yourName: 'Weals',
        clients: [
            {
                name: 'Ane'
            },
            {
                name: 'Lee'
            },
            {
                name: 'Joe'
            }
        ],
        each: function(array, each, separator){
            return array.map(each).join(separator);
        }
    }
)

console.log(parsedResult); // > Hello Weals, there are 3 clients: Ane, Lee, Joe

```

## API Documentation

[https://github.com/canguser/platevia/blob/master/docs/modules.md](https://github.com/canguser/platevia/blob/master/docs/modules.md)

