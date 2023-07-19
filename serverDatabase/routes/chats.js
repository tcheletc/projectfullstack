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

router.delete('/:chatId', (req, res) => {
    const { chatId } = req.params;
    deleteObjectById(chatId, res, 'chats', 'Chat');
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