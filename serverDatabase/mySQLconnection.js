const mysql = require('mysql2');

// Create a MySQL connection pool
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    port: 3306,
    password: 'N8821446c',
    database: 'projectfullstack'
});
  
  
  
  // Helper function to execute database queries
const executeQuery = (query, params, callback) => {
    pool.getConnection((error, connection) => {
        if (error) {
        callback(error, null);
        } else {
        connection.query(query, params, (err, results) => {
            connection.release();
            callback(err, results);
        });
        }
    });
};
  
//Helper function to get all objects in table (fit the query if exist)
const getAllObjects = (res, tableName, userQuery, schema) => {
    let query = `SELECT * FROM ${tableName}`;
    let values = [];

    if (Object.keys(userQuery).length > 0) {
        
        const { error } = schema.validate(userQuery);

        if (error) {
        res.status(400).json({error: error.details[0].message});
        return;
        }
        let wheres = userQuery;
        if (wheres.limit || wheres.offset) wheres = Object.fromEntries(
          Object.entries(wheres).filter(([key]) => key != 'limit'&&key != 'offset'&&key != 'reverse'));
        if(Object.keys(wheres).length > 0) {
            const whereClause = Object.keys(wheres).map(field => `${field} = ?`).join(' and ');
            values = Object.values(wheres);
            query += ` WHERE ${whereClause}`;
        }
    }

    if(userQuery.reverse) {
      query += ` ORDER BY id DESC`
    }

    if (userQuery.limit) {
        query += ` LIMIT ${userQuery.limit}`
    }

    if(userQuery.offset) {
      query += ` OFFSET ${userQuery.offset}`
    }

    executeQuery(query, values, (error, results) => {
        if (error) {
        res.status(500).json({ error });
        } else {
            if(userQuery.limit === '1'){
                if(results.length > 0) res.json(results[0]);
                else res.status(404).json({error: 'Not found'});
            }
            else res.json(results);
        }
    });
}
  
  //Helper function to get object by id and send it
const getObjectById = (objectId, res, tableName, objectType) => {
    const query = `SELECT * FROM ${tableName} WHERE id = ?`;
    executeQuery(query, [objectId], (error, results) => {
        if (error) {
        res.status(500).json({ error });
        } else {
        if (results.length === 0) {
            res.status(404).json({ error: `${objectType} not found` });
        } else {
            res.json(results[0]);
        }
        }
    });
};
  
  //Helper function to create new object
const createObject = (body, res, tableName, schema, objectType) => {
    const { error } = schema.validate(body);
  
    if (error) {
      res.status(400).json({error: error.details[0].message});
      return;
    }
  
    const keys = Object.keys(body);
    const values = Object.values(body);
    const valuesClause = values.map(v => '?').join(', ');
  
    const query = `INSERT INTO ${tableName} (${keys.join(', ')}) VALUES (${valuesClause})`;
    pool.query(query, values, (error, results) => {
      if (error) {
        res.status(500).json({ error });
      } else {
        res.status(201).json({ message: `${objectType} created successfully`, id: results.insertId });
      }
    });
}
  
//Helper function to update object by id
const updateObjectById = (objectId, body, res, tableName, schema, objectType) => {
    const updatedFields = body;
    const { error } = schema.validate(updatedFields);
  
    if (error) {
      res.status(400).json({error: error.details[0].message});
      return;
    } else if(Object.keys(updatedFields).length === 0) {
      res.status(400).json({error: "No field to update"});
    }
    
    // Construct SET clause dynamically based on updatedFields
    const setClause = Object.keys(updatedFields).map(field => `${field} = ?`).join(', ');
    const values = Object.values(updatedFields);
  
    const query = `UPDATE ${tableName} SET ${setClause} WHERE id = ?`;
    values.push(objectId);
  
    pool.query(query, values, (error, results) => {
      if (error) {
        res.status(500).json({ error });
      } else {
        if (results.affectedRows === 0) {
          res.status(404).json({ message: `${objectType} not found` });
        } else {
          res.json({ message: `${objectType} updated successfully` });
        }
      }
    });
}
  
//Helper function to delete object by id
const deleteObjectById = (objectId, res, tableName, objectType) => {
    const query = `DELETE FROM ${tableName} WHERE id = ?`;
  
    pool.query(query, [objectId], (error, results) => {
      if (error) {
        res.status(500).json({ error });
      } else {
        if (results.affectedRows === 0) {
          res.status(404).json({ message: `${objectType} not found` });
        } else {
            res.json({ message: `${objectType} deleted successfully` });
        }
      }
    });
}
  
module.exports = {executeQuery, getAllObjects, getObjectById, createObject, updateObjectById, deleteObjectById};
  