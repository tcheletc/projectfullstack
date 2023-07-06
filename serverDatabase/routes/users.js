const express = require('express');
const router = express.Router();
const Joi = require('joi');
const myCustomJoi = Joi.extend(require('joi-phone-number'));
const {getAllObjects, getObjectById, executeQuery, updateObjectById} = require('../mySQLconnection');

/* GET all users. */
router.get('/', (req, res) => {
  const schema = Joi.object({
      fullname: Joi.string().min(1),
      username: Joi.string().min(1),
      email: Joi.string().email(),
      phone: myCustomJoi.string().phoneNumber(),
      limit: Joi.number().min(1)
  });

  getAllObjects(res, 'users', req.query, schema);
});

//get specipic user by ID
router.get('/:userId', (req, res) => {
  const { userId } = req.params;
  getObjectById(userId, res, 'users', 'User');
});

//create new user
router.post('/', (req, res) => {
  const schema = Joi.object({
    fullname: Joi.string().min(1).required(),
    username: Joi.string().min(1).required(),
    email: Joi.string().email().required(),
    phone: myCustomJoi.string().phoneNumber().required(),
    password_: Joi.string().min(6).required()
  });

  let user = Object.fromEntries(Object.entries(req.body).filter(([key]) => key !== 'password_'));
  const { error } = schema.validate(req.body);
  
  if (error) {
    res.status(400).send(error.details[0].message);
    return;
  }

  const userKeys = Object.keys(user);
  const userValues = Object.values(user);
  const userValuesClause = userValues.map(v => '?').join(', ');
  const userQuery = `INSERT INTO users (${userKeys.join(', ')}) VALUES (${userValuesClause})`;

  const passKeys = ['id', 'password_'];
  const passValue = req.body.password_;
  const passValuesClause = passKeys.map(v => '?').join(', ');
  const passQuery = `INSERT INTO passwords (${passKeys.join(', ')}) VALUES (${passValuesClause})`;

  executeQuery(userQuery, userValues, (error, results) => {
    if (error) {
      res.status(500).json({ error });
    } else {
      executeQuery(passQuery, [results.insertId, passValue], (error, result) => {
        if (error) {
          res.status(500).json({ error });
        } else {
          res.status(201).json({ message: `User created successfully`, id: results.insertId });
        }
      });
    }
  });
});

router.post('/login', (req, res) => {
  const schema = Joi.object({
    username: Joi.string().min(1).required(),
    password_: Joi.string().min(6).required(),
    limit: Joi.number().min(1).required()
  });
  const user = req.body;
  user.limit = '1';
  getAllObjects(res, 'users natural join passwords', user, schema);
});

router.put('/:userId', (req, res) => {
  const { userId } = req.params;
  const schema = Joi.object({
    fullname: Joi.string().min(1),
    username: Joi.string().min(1),
    email: Joi.string().email(),
    phone: myCustomJoi.string().phoneNumber(),
  });
  updateObjectById(userId, req.body, res, 'users', schema, 'User');
});

module.exports = router;