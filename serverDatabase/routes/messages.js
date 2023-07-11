const express = require('express');
const router = express.Router();
const Joi = require('joi');
const {getAllObjects, getObjectById, executeQuery, updateObjectById, deleteObjectById, createObject} = require('../mySQLconnection');

router.get('/', (req, res) => {
    const schema = Joi.object({
        chatId: Joi.number().min(1),
        text_: Joi.string().min(1),
        senderId: Joi.number().min(1),
        is_read: Joi.boolean(),
        limit: Joi.number().min(1),
        offset: Joi.number().min(1),
        reverse: Joi.boolean()
    });
    getAllObjects(res, 'messages join messages_chats on messageId=id', req.query, schema);
});

router.get('/:messageId', (req, res) => {
    const { messageId } = req.params;
    getObjectById(messageId, res, 'messages', 'Message');
});

router.post('/', (req, res) => {
    const schema = Joi.object({
        chatId: Joi.number().min(1),
        text_: Joi.string().min(1),
        senderId: Joi.number().min(1),
        is_read: Joi.boolean(),
    });
    const { error } = schema.validate(req.body);  

    if (error) {
        res.status(400).send(error.details[0].message);
        return;
    }

    const message = Object.fromEntries(
        Object.entries(req.body).filter(([key]) => key == 'text_'||key == 'senderId'));
        console.log(message);
    const messageKeys = Object.keys(message);
    const messageValues = Object.values(message);
    const messageValuesClause = messageValues.map(v => '?').join(', ');
    const messageQuery = `INSERT INTO messages (${messageKeys.join(', ')}) VALUES (${messageValuesClause})`;
    const chat_message = Object.fromEntries(
            Object.entries(req.body).filter(([key]) => key === 'chatId'||key === 'is_read'));
    const chat_messageKeys = Object.keys(chat_message).concat(['messageId']);;
    const chat_messageValue = Object.values(chat_message);;
    const chat_messageValuesClause = chat_messageKeys.map(v => '?').join(', ');
    const chat_messageQuery = `INSERT INTO messages_chats (${chat_messageKeys.join(', ')}) VALUES (${chat_messageValuesClause})`;
    
    executeQuery(messageQuery, messageValues, (error, results) => {
        if (error) {
        res.status(500).json({ error });
        } else {
            executeQuery(chat_messageQuery, [...chat_messageValue, results.insertId], (error, result) => {
                if (error) {
                res.status(500).json({ error });
                } else {
                res.status(201).json({ message: `Message created successfully`, id: results.insertId });
                }
            });
        }
    });
})

router.delete(':/messageId', (req, res) => {
    const { messageId } = req.params;
    deleteObjectById(messageId, res, 'messages', 'Message');
});

module.exports = router;