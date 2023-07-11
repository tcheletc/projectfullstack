const fetchServer = (url, callback, method = 'GET', body = null, headers = null) => {
    let props = {method};
    if(headers) props = {...props, headers};
    if(body) props = {...props, body};
    fetch(`http://localhost:9000${url}`, props)
    .then(res => {
        if(res.ok) {
            res.json()
            .then(result => callback(result, null, res.status))
            .catch(error => callback(null, error, res.status));
        } else {
            res.json()
            .then(err => callback(null, err, res.status))
            .catch(error => res.text()
                            .then(err => callback(null, err, res.status)
                            .catch(error => callback(null, error, res.status)))
                            .finally(() => console.log('Error response:', res))
                );
        }
    })
    .catch(error => {
        console.log('Fetch error:', error);
        callback(null, error, null);
    });
}
export default fetchServer;