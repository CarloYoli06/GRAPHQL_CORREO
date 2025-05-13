const {ApolloServer} = require('apollo-server');
const typeDefs = require('./shemas/typeDefs');
const resolvers = require('./controllers/userController');
const server = new ApolloServer({typeDefs,resolvers})

server.listen().then(({url})=>{
    console.log('Servido corriendo en '+url);


});