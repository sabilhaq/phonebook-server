const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const { collection, doc, getDoc } = require('firebase/firestore');
const bodyParser = require('body-parser');
const { graphqlHTTP } = require('express-graphql');
const cors = require('cors');

var { schema, root } = require('./graphql/PhonebookSchema')

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const app = express();

app.use(bodyParser.json());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('*', cors());

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.use('/graphql', cors(), graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true
}));

module.exports = app;
