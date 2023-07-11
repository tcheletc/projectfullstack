const express = require('express');
const router = express.Router();
const Joi = require('joi');
const {getAllObjects, getObjectById, executeQuery, updateObjectById, deleteObjectById, createObject} = require('../mySQLconnection');

router.get('/', (req, res) => {
    const schema = Joi.object({
        userId: Joi.number().min(1),
        partnerId: Joi.number().min(1),
        groupId: Joi.number().min(1),
        limit: Joi.number().min(1)
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

router.delete(':/chatId', (req, res) => {
    const { chatId } = req.params;
    deleteObjectById(chatId, res, 'chats', 'Chat');
});

module.exports = router;