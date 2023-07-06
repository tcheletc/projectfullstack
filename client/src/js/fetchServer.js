const fetchServer = (url, callback, method = 'GET', headers= {}, body = {}) => {
    fetch(`http://localhost:9000/api${url}`, {method, body, headers})
    .then(res => {
        if(res.ok) {
            res.json()
            .then(result => callback(result, null, res.status))
            .catch(error => callback(null, error, res.status));
        } else {
            res.text()
            .then(err => callback(null, err, res.status))
            .catch(error => callback(null, error, res.status));
        }
    });
}
export default fetchServer;