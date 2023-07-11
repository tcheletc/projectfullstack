const express = require('express');
const router = express.Router();
const Joi = require('joi');
const {getAllObjects, getObjectById, executeQuery, updateObjectById, deleteObjectById} = require('../mySQLconnection');

router.get('/', (req, res) => {
    const schema = Joi.object({
        chatId: Joi.number().min(1),
        text_: Joi.string().min(1),
        is_read: Joi.boolean(),
        limit: Joi.number().min(1)
    });
    getAllObjects(res, 'messages join messages_chats on messageId=id', req.query, schema);
});

router.get('/:messageId', (req, res) => {
    const { messageId } = req.params;
    getObjectById(messageId, res, 'messages', 'Message');
});

router.delete(':/messageId', (req, res) => {
    const { messageId } = req.params;
    deleteObjectById(messageId, res, 'messages', 'Message');
});

module.exports = router;