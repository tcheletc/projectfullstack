const express = require('express');
const router = express.Router();
const Joi = require('joi');
const {getAllObjects, getObjectById, executeQuery, updateObjectById, deleteObjectById} = require('../mySQLconnection');

router.get('/', (req, res) => {
    const schema = Joi.object({
        userId: Joi.number().min(1),
        name_: Joi.string().min(1),
        is_admin: Joi.boolean(),
        limit: Joi.number().min(1),
        offset: Joi.number().min(0)
    });
    getAllObjects(res, 'groups_ join users_groups on id=groupId', req.query, schema);
});

router.get('/:groupId', (req, res) => {
    const { groupId } = req.params;
    getObjectById(groupId, res, 'groups_ join users_groups on id=groupId', 'Group')
});

router.get('/:groupId/users', (req, res) => {
  const schema = Joi.object({
    groupId: Joi.number().min(1)
  });
  const { groupId } = req.params;
  getAllObjects(res, 'users_groups join users on userId=id', { groupId }, schema);
})

router.post('/', (req, res) => {
    const schema = Joi.object({
      name_: Joi.string().min(1).required(),
      userId: Joi.number().min(1).required(),
      users: Joi.array().required()
    });
  
    const { error } = schema.validate(req.body);
    
    if (error) {
      res.status(400).send(error.details[0].message);
      return;
    }

    const {name_, userId, users} = req.body;
  
    const usersValues = Object.values([userId, ...users]);
    const queryGroup = 'INSERT INTO groups_(name_) values(?)'
  
    executeQuery(queryGroup, [name_], (error, results) => {
      if (error) {
        res.status(500).json({ error });
      } else {
        const usersValuesClosure = users.map(u => `(?, ${results.insertId}, false)`).join(',');
        const usersQuery = `INSERT INTO users_groups
        values(?, ${results.insertId}, true),${usersValuesClosure}`;

        const chatsValuesClosure = users.map(u => `(?, ${results.insertId})`).join(',');
        const chatsQuery = `INSERT INTO chats(userId, groupId)
        values${chatsValuesClosure}`;
        executeQuery(usersQuery, usersValues, (error, result) => {
          if (error) {
            res.status(500).json({ error });
          } else {
            executeQuery(chatsQuery, users, (error, result) => {
              if (error) {
                res.status(500).json({ error });
              } else {
                res.status(201).json({ message: `Group created successfully`, id: results.insertId });
              }
            });
          }
        });
      }
    });
  });

module.exports = router;