require('dotenv').config()
const { request } = require('express')
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')

const app = express()
app.use(express.json())

app.use(cors())

const uri = process.env.MONGODB_URI

mongoose.connect(uri)
  .then(result => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB')
  })

const personSchema = new mongoose.Schema({
  id: String,
  name: String,
  number: String
})

personSchema.set('toJson', {
  transform: (document, returnedObject) => {
    delete returnedObject.__v
  }
})

const Person = mongoose.model('Person', personSchema)

let persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/', (request, response) => {
    response.send('Backend working!!')
})

app.get('/api/persons', (request, response) => {
    Person.find({}).then(person => {
      response.json(person)
    })
})

app.get('/api/persons/:id', (request, response) => {
  Person.findById(request.params.id).then(person => {
    response.json(person)
  })
})

app.post('/api/persons', (request, response) => {
  const body = request.body

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'name or number missing'
    })
  }

  const person = Person({
    id: body.id,
    name: body.name,
    number: body.number
  })

  console.log(person);

  person.save().then(savedPerson => {
    response.json(savedPerson)
  })
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    id: request.params.id,
    name: body.name,
    number: body.number
  }
  console.log(person);
  console.log(request.params.id);
  Person.findOneAndUpdate({ id: request.params.id }, person)
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))

})

app.delete('/api/persons/:id', (request, response) => {
  Person.findOneAndDelete({ id: request.params.id })
    .then(res => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})