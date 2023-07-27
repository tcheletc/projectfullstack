const express = require('express');
const router = express.Router();
const Joi = require('joi');
const {getAllObjects, getObjectById, executeQuery, updateObjectById, deleteObjectById, createObject} = require('../mySQLconnection');

router.get('/', (req, res) => {
    const schema = Joi.object({
        userId: Joi.number().min(1),
        partnerId: Joi.number().min(1),
        groupId: Joi.number().min(1),
        limit: Joi.number().min(1),
        offset: Joi.number().min(1)
    });
    getAllObjects(res, 'chats', req.query, schema);
});

router.get('/:chatId', (req, res) => {
    const { chatId } = req.params;
    getObjectById(chatId, res, 'chats', 'Chat');
});

router.post('/', (req, res) => {
    const schema = Joi.object({
        userId: Joi.number().min(1).required(),
        partnerId: Joi.number().min(1),
        groupId: Joi.number().min(1)
    });
    createObject(req.body, res, 'chats', schema, 'Chat');
});

router.put('/:chatId/read', (req, res) => {
    const { chatId } = req.params;
    const schema = Joi.object({
        chatId: Joi.number().min(1).required(),
        is_read: Joi.boolean().required()
    });

    const { error } = schema.validate({chatId, is_read: true});
  
    if (error) {
      res.status(400).json({error: error.details[0].message});
      return;
    }
    
    const query = `UPDATE messages_chats SET is_read = ? WHERE chatId = ?`;
  
    executeQuery(query, [true, chatId], (error, results) => {
      if (error) {
        res.status(500).json({ error });
      } else {
        if (results.affectedRows === 0) {
          res.status(404).json({ message: `Messages in chat not found` });
        } else {
          res.json({ message: `Messages in chat updated successfully` });
        }
      }
    });
});

const deleteChatMessages = (chatId, res, callback) => {
  const query = `DELETE FROM messages_chats WHERE chatId=?`
  executeQuery(query, [chatId], (error, result) => {
    if(error) {
      res.status(500).json({ error });
    } else {
      callback();
    }
  })
}

router.delete('/:chatId', (req, res) => {
    const { chatId } = req.params;
    deleteChatMessages(chatId, res, () => {
      deleteObjectById(chatId, res, 'chats', 'Chat');
    })
});

router.delete('/:chatId/messages', (req, res) => {
  const { chatId } = req.params;
  deleteChatMessages(chatId, res, () => {
    res.json({message: 'Chat messages deleted successfully'});
  })
});

router.delete('/:chatId/messages/:messageId', (req, res) => {
    const { chatId, messageId } = req.params;
    const query = `DELETE FROM messages_chats
    WHERE chatId = ? AND messageId = ?`;
    executeQuery(query, [chatId, messageId], (error, results) => {
        if (error) {
          res.status(500).json({ error });
        } else {
          if (results.affectedRows === 0) {
            res.status(404).json({ message: `Message in chat not found` });
          } else {
              res.json({ message: `Message deleted successfully from chat` });
          }
        }
    })
});

module.exports = router;