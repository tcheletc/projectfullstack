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

module.exports = router;