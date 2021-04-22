var appserver = require('./appserver')

const port = 3000

appserver.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});

module.exports = appserver;
