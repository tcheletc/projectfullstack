const express = require('express');
const router = express.Router();
const Joi = require('joi');
const {getAllObjects, getObjectById, executeQuery, updateObjectById} = require('../mySQLconnection');

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

const addMessageToOthersChats = (groupId, partnerId, senderId, messageId, res) => {
    let query, values;
    if(partnerId) {
        query = `INSERT INTO chats(userId, partnerId) values(?,?)`;
        values = [partnerId, senderId];
    } else {
        query = `INSERT INTO chats(userId, groupId)
        select userId, groupId from users_groups WHERE groupId = ?`;
        values = [groupId];
    }
    executeQuery(query, values, (error, results) => {
        let query = `INSERT INTO messages_chats(chatId, messageId, is_read)
        SELECT id,?,false FROM chats where `;
        let values = [messageId]
        if(partnerId) {
            query += `userId = ? and partnerId = ?`;
            values = values.concat([partnerId, senderId]);
        } else {
            query += `groupId = ? and userId <> ?`;
            values = values.concat([groupId, senderId]);
        }
        executeQuery(query, values, (error, results) => {
            if (error) {
                res.status(500).json({ error });
            } else {
                res.status(201).json({ message: `Message created successfully`, id: messageId });
            }
        });
    });
    
}

router.post('/', (req, res) => {
    const schema = Joi.object({
        chatId: Joi.number().min(1).required(),
        text_: Joi.string().min(1).required(),
        senderId: Joi.number().min(1).required(),
        partnerId: Joi.number().min(1),
        groupId: Joi.number().min(1)
    });
    const { error } = schema.validate(req.body);  

    if (error || !req.body.partnerId && !req.body.groupId) {
        res.status(400).send(error?.details[0]?.message||'partnerId or groupId must be sent');
        return;
    }

    const message = Object.fromEntries(
        Object.entries(req.body).filter(([key]) => key == 'text_'||key == 'senderId'));
        console.log(message);
    const messageKeys = Object.keys(message);
    const messageValues = Object.values(message);
    const messageValuesClause = messageValues.map(v => '?').join(', ');
    const messageQuery = `INSERT INTO messages (${messageKeys.join(', ')}) VALUES (${messageValuesClause})`;
    const chat_message = {chatId: req.body.chatId, is_read: true};
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
                    const {groupId, partnerId, senderId} = req.body;
                    addMessageToOthersChats(groupId, partnerId, senderId, results.insertId, res);
                    //res.status(201).json({ message: `Message created successfully`, id: results.insertId });
                }
            });
        }
    });
});

router.delete('/:messageId', (req, res) => {
    const schema = Joi.object({
        deleted: Joi.boolean().required(),
        text_: Joi.string().required()
    });
    const { messageId } = req.params;
    updateObjectById(messageId, {deleted: true, text_: 'deleted'}, res, 'messages', schema, 'Message');
});

module.exports = router;