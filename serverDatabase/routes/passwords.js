const express = require('express');
const router = express.Router();
const Joi = require('joi');
const {executeQuery} = require('../mySQLconnection');

router.put('/:userId', (req, res) => {
    const { userId } = req.params;
    const schema = Joi.object({
        userId: Joi.number().min(1),
        currentPassword: Joi.string().min(1).required(),
        newPassword: Joi.string().min(1).required(),
    });
    const { error } = schema.validate({...req.body, userId});
  
    if (error) {
        res.status(400).send({error: error.details[0].message});
        return;
    }
    const { currentPassword, newPassword } = req.body;
  
    // Verify the current password before updating
    const verifyQuery = 'SELECT password_ FROM passwords WHERE id = ?';
    executeQuery(verifyQuery, [userId], (error, results) => {
      if (error) {
        res.status(500).json({ error });
      } else {
        if (results.length === 0) {
          res.status(404).json({ message: 'User not found' });
        } else {
          const storedPassword = results[0].password_;
          if (storedPassword !== currentPassword) {
            res.status(401).json({ message: 'Invalid current password' });
          } else {
            // Update the password in the database
            const updateQuery = 'UPDATE passwords SET password_ = ? WHERE id = ?';
            executeQuery(updateQuery, [newPassword, userId], (updateError) => {
              if (updateError) {
                res.status(500).json({ error: updateError });
              } else {
                res.json({ message: 'Password updated successfully' });
              }
            });
          }
        }
      }
    })
});

module.exports = router;