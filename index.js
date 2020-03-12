const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const app = express();
const secretKey = 'thisisverysecretkey'
const port = 1234;

const db = mysql.createConnection({
    host: '127.0.0.1',
    port: '2100',
    user: 'root',
    password: '',
    database: 'node_buah'
})

db.connect((err) => {
    if (err) throw err
    console.log('Database Connected!')
})

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: true
}))

const isAuthorized = (request, result, next) => {
    if (typeof(request.headers['auth-token']) == 'undefined') {
        return result.status(403).json({
            success: false,
            message: 'Unauthorized. Token is not provided'
        })
    }

    let token = request.headers['auth-token']

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return result.status(401).json({
                success: false,
                message: 'Unauthorized. Token is invalid'
            })
        }
    })

    next()
}

app.post('/login', function(request, result) {
  let data = request.body
  var username = data.username;
	var password = data.password;
	if (username && password) {
		db.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
			if (results.length > 0) {
        let token = jwt.sign(data.username + '|' +data.password, secretKey)
        result.json({
          success: true,
          message: 'Logged In',
          token: token
        });
			} else {
				result.json({
          success: false,
          message: 'Invalid Credential!',
        });
			}
			result.end();
		});
	}
});

app.post('/register', (request, result) => {
    let data = request.body

    let sql = `
        insert into users (username, password)
        values ('`+data.username+`', '`+data.password+`');
    `

    db.query(sql, (err, result) => {
        if (err) throw err
    })

    result.json({
        success: true,
        message: 'Your Account Succesfully Registered!'
    })
})

// ***************************** //

app.get('/users', isAuthorized, (req, res) => {
    let sql = `select id, username, created_at from users`
  
    db.query(sql, (err, result) => {
      if (err) throw err
  
      res.json({
        message: "Success Getting All User",
        data:result
      })
    })
  })
  
  app.post('/users', isAuthorized, (req, res) => {
    let data = req.body
  
    let sql = `insert into users (username, password)    `
  
    db.query(sql, (err, result) => {
      if (err) throw err
  
      res.json({
        message: "User Added",
        data: result
      })
    })
  })
  
  app.get('/users/:id', isAuthorized, (req, res) => {
    let sql = `select * from users
    where id = `+req.params.id+`
    limit 1`
  
    db.query(sql, (err, result) => {
      if (err) throw err
  
      res.json({
        message: "Success Getting All User Details",
        data: result[0]
      })
    })
  })
  
  app.put('/users/:id', isAuthorized, (req, res) => {
    let data = req.body
  
    let sql = `
    update users
    set username = '`+data.username+`',
    password = '`+data.password+`'
    where id = '`+req.params.id+`'`
  
    db.query(sql, (err, result) => {
      if (err) throw err
  
      res.json({
        message: "Data Has Been Updated",
        data : result
      })
    })
  })
  
  app.delete('/users/:id', isAuthorized, (req, res) => {
      let sql = `
          delete from users
          where id = '`+req.params.id+`'
      `
  
      db.query(sql, (err, result) => {
          if (err) throw err
  
          res.json({
              message: "Data Has Been Deleted",
              data: result
          })
      })
  })

//   **************************** //
app.get('/buah', isAuthorized, (req, res) => {
    let sql = `
        select id, nama_buah, harga_buah, stock, created_at from books
    `

    db.query(sql, (err, result) => {
        if (err) throw err

        res.json({
            message: "Success Getting All Books",
            data: result
        })
    })
})

app.post('/buah', isAuthorized, (req, res) => {
    let data = req.body

    let sql = `
        insert into buah (nama_buah, harga_buah, stock)
        values ('`+data.nama_buah+`', '`+data.harga_buah+`', '`+data.stock+`')
    `

    db.query(sql, (err, result) => {
        if (err) throw err

        res.json({
            message: "Buah ditambah",
            data: result
        })
    })
})

app.get('/buah/:id', isAuthorized, (req, res) => {
    let sql = `
        select * from buah
        where id = `+req.params.id+`
        limit 1`

    db.query(sql, (err, result) => {
        if (err) throw err

        res.json({
            message: "Sukses buah didapatkan",
            data: result[0]
        })
    })
})

app.put('/buah/:id', isAuthorized, (req, res) => {
    let data = req.body

    let sql = `
        update buah
        set nama_buah = '`+data.nama_buah+`', harga_buah = '`+data.harga_buah+`', stock = '`+data.stock+`'
        where id = '`+req.params.id+`'   `

    db.query(sql, (err, result) => {
        if (err) throw err

        res.json({
            message: "Data buah diupdated",
            data: result
        })
    })
})

app.delete('/buah/:id', isAuthorized, (req, res) => {
    let sql = `
        delete from buah
        where id = '`+req.params.id+`'
    `

    db.query(sql, (err, result) => {
        if (err) throw err

        res.json({
            message: "Data buku dihapus",
            data: result
        })
    })
})

// ********************************** //
app.post('/buah/:id/take', isAuthorized, (req, res) => {
    let data = req.body

    db.query(`
        insert into user_buah (user_id, book_id)
        values ('`+data.user_id+`', '`+req.params.id+`')
    `, (err, result) => {
        if (err) throw err
    })

    db.query(`
        update buah
        set stock = stock - 1
        where id = '`+req.params.id+`'
    `, (err, result) => {
        if (err) throw err
    })

    res.json({
        message: "Buah telah dibeli User"
    })
})

app.get('/users/:id/buah', isAuthorized, (req, res) => {
    db.query(`
        select buah.nama_buah, buah.harga_buah, buah.stock
        from users
        right join buah on users.id = user_buah.user_id
        right join buah on user_buah.buah_id = buah.id
        where users.id = '`+req.params.id+`'
    `, (err, result) => {
        if (err) throw err

        res.json({
            message: "Success mendapatkan user buah",
            data: result
        })
    })
})

// *********************************** //

app.listen(port, () => {
    console.log('App running on port ' + port)
})


