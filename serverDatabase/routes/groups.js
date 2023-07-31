const express = require('express');
const router = express.Router();
const Joi = require('joi');
const {getAllObjects, getObjectById, executeQuery} = require('../mySQLconnection');

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

  router.post('/:groupId/users', (req, res) => {
    const { groupId } = req.params;
    const schema = Joi.object({
      groupId: Joi.number().min(1).required(),
      userId: Joi.number().min(1).required(),
    });

    const { error } = schema.validate({...req.body, groupId});
    if (error) {
      res.status(400).send(error.details[0].message);
      return;
    }
    const {userId} = req.body;
    const userQuery = 'INSERT INTO users_groups(groupId, userId, is_admin) values(?, ?, false)';
    const chatQuery = 'INSERT INTO chats(userId, groupId) values(?, ?)';
    executeQuery(userQuery, [groupId, userId], (error, result) => {
      if(error) {
        res.status(500).json({ error });
      } else {
        executeQuery(chatQuery, [userId, groupId], (error, result) => {
          if(error) {
            res.status(500).json({ error });
          } else {
              res.json({ message: `User added to group successfully`});
          }
        })
      }
    })
  })

  router.put('/:groupId/users/:userId', (req, res) => {
    const { groupId, userId } = req.params;
    const schema = Joi.object({
      groupId: Joi.number().min(1).required(),
      userId: Joi.number().min(1).required(),
      is_admin: Joi.boolean().required()
    });
  
    const { error } = schema.validate({...req.body, groupId, userId});
    if (error) {
      res.status(400).send(error.details[0].message);
      return;
    }

    const {is_admin} = req.body;
    const query = 'UPDATE users_groups SET is_admin=? WHERE groupId=? and userId=?';
    executeQuery(query, [is_admin, groupId, userId], (error, result) => {
      if(error) {
        res.status(500).json({ error });
      } else {
          res.json({ message: `User changed In group successfully`});
      }
    })
  })

  router.delete('/:groupId/users/:userId', (req, res) => {
    const { groupId, userId } = req.params;
    const schema = Joi.object({
      groupId: Joi.number().min(1).required(),
      userId: Joi.number().min(1).required(),
    });
  
    const { error } = schema.validate({groupId, userId});
    if (error) {
      res.status(400).send(error.details[0].message);
      return;
    }
    const groupQuery = `DELETE FROM users_groups WHERE groupId=? and userId=?`;
    const messagesQuery = `DELETE FROM messages_chats WHERE chatId IN 
    (SELECT id FROM chats WHERE groupId=? and userId=?)`;
    const chatQuery = `DELETE FROM chats WHERE groupId=? and userId=?`;
    executeQuery(groupQuery, [groupId, userId], (error, result) => {
      if(error) {
        res.status(500).json({ error });
      } else {
        if(result.affectedRows === 0) {
          res.status(404).json({error: 'User is not in the group'})
        } else {
          executeQuery(messagesQuery, [groupId, userId], (error, result) => {
            if(error) {
              res.status(500).json({ error });
            } else {
                executeQuery(chatQuery, [groupId, userId], (error, result) => {
                  if(error) {
                    res.status(500).json({ error });
                  } else {
                      res.json({ message: `User deleted from group successfully`});
                  }
                })
            }
          })
        }
      }
    })
  });

module.exports = router;