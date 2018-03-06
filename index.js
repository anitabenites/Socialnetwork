
const express = require('express');
const app = express();
const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const spicedPg = require('spiced-pg');
const compression = require('compression');
const knox = require('knox');
const uidSafe = require('uid-safe');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const config = require('./config');
let db;
/*************implementing the sockets: ***********/
const server = require('http').Server(app);
const io = require('socket.io')(server);
/************************************************/

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cookieSession({
 secret: process.env.SECRET || require('./secrets').secrets,
 maxAge: 1000*60*60*24*14
}))
app.use(cookieParser());
app.use(express.static("public"));

//=======================================================
if (process.env.DATABASE_URL) {
    console.log('process env');
    db = spicedPg(process.env.DATABASE_URL);
} else {
    console.log('localhost');
    const {dbUser, dbPass} = require('./secrets')
    db = spicedPg(`postgres:${dbUser}:${dbPass}@localhost:5432/socialnetwork`);
}
//=======================================================

app.use(compression());



if (process.env.NODE_ENV != 'production') { // production = development
    app.use(
        '/bundle.js',
        require('http-proxy-middleware')({ //we will proxy the request.
            target: 'http://localhost:8081/'
        })
    );
} else {
    app.use('/bundle.js', (req, res) => res.sendFile(`${__dirname}/bundle.js`));
}


let secrets;
if (process.env.NODE_ENV == 'production') {
    secrets = process.env; // in prod the secrets are environment variables
} else {
    secrets = require('./secrets'); // secrets.json is in .gitignore
}

var diskStorage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, __dirname + '/uploads');
    },
    filename: function (req, file, callback) {
      uidSafe(24).then(function(uid) {
          callback(null, uid + path.extname(file.originalname));
      });
    }
});

var uploader = multer({
    storage: diskStorage,
    limits: {
        fileSize: 2097152
    }
});

//For establishing connection with AWS Server
const client = knox.createClient({
    key: secrets.AWS_KEY,
    secret: secrets.AWS_SECRET,
    bucket: 'imageboardwork'
});

function uploadToS3(req, res, next) {
    console.log("running S3 upload");
    console.log(req.file);

    const s3Request = client.put(req.file.filename, {
        'Content-Type': req.file.mimetype,
        'Content-Length': req.file.size,
        'x-amz-acl': 'public-read'
    });

    const readStream = fs.createReadStream(req.file.path);

    readStream.pipe(s3Request);

    s3Request.on('response', s3Response => {
        const wasSuccessful = s3Response.statusCode == 200;
        console.log(s3Response.statusCode);
        if(wasSuccessful){
            next();
        }else {
            res.sendStatus(500);
        }
    });
}


app.post('/profilepic', uploader.single('file'), uploadToS3, (req,res) => {
    console.log('running post upload-image', req.file)

    if(req.file) {
        console.log('this is the req.file:', req.file);
        console.log('this is the req.body:', req.body);
        const q = "UPDATE users SET profile_pic = $1 WHERE id = $2";
        const params = [req.file.filename, req.session.user.id];
        db.query(q, params)
            .then(result => {
                console.log('it worked')
                res.json({success: true})
            })
    } else {
        res.json({success:false})
    }
});

//================= ROUTES ===================//

app.get('/welcome', (req,res) => {
    console.log('this is request.session.user:', req.session.user);
    if(req.session.user) {
        res.redirect('/');
    } else {
        console.log("ok no session dude");
        res.sendFile(__dirname + '/index.html');
    }
});


app.post('/register', (req,res) => {
    console.log('inside.post/register', req.body);
    const {firstname, lastname, email, password} = req.body
    hashPassword(password)
        .then(hashedPassword => {
            const q = `INSERT INTO users
                       (first_name, last_name, email, hashed_pass)
                       VALUES
                       ($1, $2, $3, $4)
                       RETURNING id`
            const params = [firstname,lastname, email, hashedPassword]
            db.query(q, params)
                .then(results => {
                    console.log("INSERT SUCCESSFUL", results.rows);
                    req.session.user = {
                        id: results.rows[0].id,
                        firstname: firstname,
                        lastname: lastname,
                        email: email
                    }
                    res.json({
                        success:true
                    })
                })
        }).catch(function(err) {
            console.log('there is an error in the post-request', err)
            res.render('register', {
                error:true
            })
        })
})

app.post('/login', (request, response) => {
    const { email, password } = request.body
    console.log('Inside-Post/Login: ', email, password)
    const q = 'SELECT * FROM users WHERE email = $1'
    const params = [ request.body.email ]

    // checking if the user exists, we are at the same time, getting that users info, including the hashedPassword
    db.query(q, params)
        .then(results => {
            console.log("results: ", results.rows);
            // if there is no user in our DB
            if(results.rows.length === 0) {
                console.log("no results bro");
                return response.json({
                    error: 'email is not registered'
                })
            }

            console.log('returned user data: ', results.rows)

            // now we are checking if the password the user entered is the correct one by comparing it with the hashedPassword
            checkPassword(password, results.rows[0].hashed_pass)
                .then(doesMatch => {
                    if (doesMatch) {
                        console.log("is the password gut", doesMatch);
                        console.log('the results of the rows:', results.rows);

                        // we´ve confirmed that the user exists, and that the password matches, so we are good to go
                        // so we can now send the session, and then redirect to the logged-in experience
                        request.session.user = {
                            id: results.rows[0].id,
                            email: results.rows[0].email,
                            password: results.rows[0].password
                        }
                        response.json({
                            success:true // we need to send a response to axios!
                        })

                    } else {
                        console.log("password dont match");
                        response.json({
                            error: 'something went wrong with your login :('
                        })
                    }
                })
        })
        .catch((err)=> {
            console.log('this was an  error in post-login', err);
        })
})

//route for logging out the user
app.post('/logout', (request, response) => {
    request.session.user = null;
    response.json({
        success:true
    })
})

// route for getting profile data of logged in user
app.get('/profile', (request, response) => {
    const q = "SELECT * FROM users WHERE id = $1";
    const params = [request.session.user.id];
    db.query(q, params).then(result => {
        if(result.rows[0].profile_pic != null) {
            result.rows[0].profile_pic = config.s3Url + result.rows[0].profile_pic;
        }
        response.json({
            details: result.rows[0]
        })
    })
})

//route for updating bio
app.post('/editbio', (request, response) => {
    const { bio } = request.body;
    const q = "UPDATE users SET bio = $1 WHERE id = $2";
    const params = [bio, request.session.user.id];
    db.query(q, params).then(results => {
        response.json({
            success:true
        })
    })
})

//route for getting profile data for other users
app.post('/profile', (request, response) => {
    //get id of the person whose profile we want to see
    const { id } = request.body;
    //if the id is same as that of the logged in user redirect to the profile page by sending redirect true
    if(id == request.session.user.id)
        return response.json({
            redirect: true
        });
    const q = "SELECT * FROM users WHERE id = $1";
    const params = [id];
    db.query(q, params).then(result => {
        if(result.rows.length == 0)
        //if no user exists of that id redirect to the profile page
            return response.json({
                redirect: true
            })
        //if profile pic exists then replace existing link with the full link by appending it to the config.s3url
        if(result.rows[0].profile_pic != null) {
            result.rows[0].profile_pic = config.s3Url + result.rows[0].profile_pic;
        }
        response.json({
            redirect: false,
            details: result.rows[0]
        })
    })
})

//route for getting friend status
app.post('/getRelStatus', (request, response) => {
    //get userid of whose profile we want to see
    const { userid } = request.body;
    //in first query check logged in user id with user1_id, indirectly checking whether
    //the logged in person sent the friend request to this other user or not
    let q = "SELECT curr_status FROM friends WHERE user1_id = $1 AND user2_id = $2";
    const params = [request.session.user.id, userid];
    let relStatus;
    db.query(q, params).then(result => {
        if(result.rows.length == 0) {
            //if such a row doesnt exist then there exist three possibilites
            //1. there is no frienship existing between the 2 users at all id send relStatus as none
            // status: none
            //2. friendship was initiated by the other user in that case the logged in user should see the option to accept request
            // status: pending but we will send the status accept so as to show the option to accept the request
            // cause pending status has different meanings for both sender and the recipient
            //3. frienship has already been established and was initiated by the other user we will show an unfriend option the logged in user
            // status: friends
            q = "SELECT curr_status FROM friends WHERE user1_id = $2 AND user2_id = $1";
            db.query(q, params).then(result => {
                if(result.rows.length == 0)
                    relStatus = "none";
                else
                    if(result.rows[0].curr_status === "pending")
                          relStatus = "accept";
                    else
                        relStatus = result.rows[0].curr_status;
                response.json({
                    status: relStatus
                })
            })
        }
        else {
            // there can be two conditions possible if the first query is directly succesfull
            //1. The logged in user initiated the friendship and the other person has not yet accepted it
            // hence he will see the delete friend request button - status: pending
            //2. The logged in user initiated the frienship and the other person has accepted it and they both are friends
            // hence he will see the unfriend option - status: friends
            relStatus = result.rows[0].curr_status;
            response.json({
                status: relStatus
            })
        }
    })
})

app.post('/changeRelStatus', (request, response) => {
    const { action, userid } = request.body;
    let q;
    let params
    if(action === "send") {
        params = [request.session.user.id, userid, "pending"];
        //insert new row with status pending
        q = `INSERT INTO friends
                       (user1_id, user2_id, curr_status)
                       VALUES
                       ($1, $2, $3)`;
    }
    else if(action === "cancel") {
        //delete exist row
        params = [request.session.user.id, userid];
        q = "DELETE FROM friends WHERE user1_id = $1 AND user2_id = $2";
    }
    else if(action === "accept") {
        //update status to friends
        params = [request.session.user.id , userid, "friends"];
        q = "UPDATE friends SET curr_status = $3 WHERE user1_id = $2 AND user2_id = $1";
    }
    else if(action == "unfriend") {
        //in case of unfriend there the query differs because the query depends on who initiated the friendship
        //because the one who initiated has his id stored in user1_id coloumn and hence the where clause will thus differ
        params = [request.session.user.id, userid];
        q = "DELETE FROM friends WHERE (user1_id = $1 AND user2_id = $2) OR (user2_id = $1 AND user1_id = $2)"
    }

    db.query(q, params).then(result => {
        response.json({
            success: true
        })
    })
})

function getFriends(currUserId) { // currUserId = id of the login user!
    const params = [currUserId, "friends"]; // array, a string call friends!
    const q = `SELECT users.id, users.first_name, users.last_name, users.profile_pic
               FROM users
               JOIN friends
               ON (user1_id = users.id AND user1_id <> $1)
               OR (user2_id = users.id AND user2_id <> $1)
               WHERE curr_status = $2
               AND (user2_id = $1 OR user1_id = $1)`;
    // we have 2 tables: users and friends
    return new Promise(function(resolve, reject) {
        db.query(q, params).then((result) => {
            result = result.rows.map((row) => {
                if(row.profile_pic) {
                    row.profile_pic = config.s3Url + row.profile_pic;
                }
                return row;
            })
            resolve(result);
        })
    })
}

function getFriendRequests(currUserId) {
    const params = [currUserId, "pending"];
    const q = `SELECT users.id, users.first_name, users.last_name, users.profile_pic
               FROM users
               JOIN friends
               ON (user1_id = users.id)
               WHERE curr_status = $2
               AND (user2_id = $1)`;
    return new Promise(function(resolve, reject) {
        db.query(q, params).then((result) => {
            result = result.rows.map((row) => {
                if(row.profile_pic) {
                    row.profile_pic = config.s3Url + row.profile_pic;
                }
                return row;
            })
           resolve(result);
        })
    })
}

app.get('/getfriends', (request, response) => {
    getFriends(request.session.user.id).then((result) => {
        console.log('friends are ', result);
        response.json({
            friends: result
        })
    })
})

app.get('/getfriendrequests', (request, response) => {
    getFriendRequests(request.session.user.id).then((result) => {
        console.log("friend requests", result);
        response.json({
            friendRequests: result // go to reducers/reducers_friends.js
        })
    })
})

app.post('/unfriend', (request, response) => {
    const { userid } = request.body; // this userid is from the person we want to unfriend.
    console.log(userid);
    let params = [request.session.user.id, userid];
    let q = "DELETE FROM friends WHERE (user1_id = $1 AND user2_id = $2) OR (user2_id = $1 AND user1_id = $2)";
    db.query(q, params).then((data) => {
        getFriends(request.session.user.id).then((result) => { // once the user is deleted we call the function getFriends again!
            // now that we had deleted the row please send me my new friend, so that I can change the redux store, in order to change the data!
            console.log('friends are ', result);
            response.json({
                friends: result
            })
        })
    })
})

app.post('/acceptRequest', (request, response) => {
    let friends= [];
    let friendRequests = [];
    const { userid } = request.body;
    console.log(userid);
    let params = [request.session.user.id , userid, "friends"];
    let q = "UPDATE friends SET curr_status = $3 WHERE user1_id = $2 AND user2_id = $1";
    db.query(q, params).then((result) => {
        getFriends(request.session.user.id).then((result) => {
            friends = result;
            getFriendRequests(request.session.user.id).then((result) => {
                friendRequests = result;
                response.json({
                    friends : friends,
                    friendRequests : friendRequests
                })
            })
        })
    })
})




app.get('*', (req,res) => {
    if(!req.session.user) {
        res.redirect('/welcome');
    } else {
        // res.redirect('/');
        res.sendFile(__dirname + '/index.html');
    }
})

function hashPassword(plainTextPassword) {
    return new Promise(function(resolve, reject) {
        bcrypt.genSalt(function(err, salt) {
            if (err) {
                return reject(err);
            }
            bcrypt.hash(plainTextPassword, salt, function(err, hash) {
                if (err) {
                    return reject(err);
                }
                resolve(hash);
            });
        });
    });
}


function checkPassword(textEnteredInLoginForm, hashedPasswordFromDatabase) {
    return new Promise(function(resolve, reject) {
        bcrypt.compare(textEnteredInLoginForm, hashedPasswordFromDatabase, function(err, doesMatch) {
            if (err) {
                reject(err);
            } else {
                resolve(doesMatch);
            }
        });
    });
}


//********************socket IO ************************//
function getUsersByIds(arrayOfIds) {
    const query = `SELECT * FROM users WHERE id = ANY($1)`;
    return db.query(query, [arrayOfIds]);
}

function getUserProfile(currUserId) {
    const query =  `SELECT * FROM users WHERE id = $1`;
    return db.query(query, [currUserId])
}


const { getSessionFromSocket } = require('socket-cookie-session');
//array of online users
let online = [];

io.on('connection', (socket) => {
    console.log(online);
    console.log('a user connected');
    const session = getSessionFromSocket(socket, {
        secret: require('./secrets').secrets
    })

    if (!session || !session.user) {
        return socket.disconnect(true);
    }

    let userId = session.user.id;
    let obj = {
        userId : userId,
        socketId : socket.id
    }

    console.log(obj);


    let isOnline = online.find((user) => {
        return user.userId == userId;
    })

    if(!isOnline) {
        online.push(obj);
    }

    let onlineUsersData = [];

    let currUserData = {};

    getUserProfile(userId).then((result) => {
        // let id = result.rows[0].id;
        if(result.rows[0].profile_pic)
            result.rows[0].profile_pic = config.s3Url + result.rows[0].profile_pic;
        currUserData = result.rows[0];
        socket.broadcast.emit('userJoined', {
            newUser: currUserData
        })
    })

    let onlineIds = online.map(item => item.userId)

    getUsersByIds(onlineIds).then((result) => {
        onlineUsersData = result.rows.map((row) => {
            if(row.profile_pic) {
                row.profile_pic = config.s3Url + row.profile_pic;
            }
            return row;
        })
        socket.emit('onlineUsers', {
            onlineUsers : onlineUsersData
        })
    })

    socket.on('disconnect', () => {
        online = online.filter(user => user.userId != userId);
        socket.broadcast.emit('userLeft', {
            leftUser : userId
        })
    })
});

//***************socket IO ****************************//

server.listen(8080, function() {
    console.log("I'm listening.");
});
