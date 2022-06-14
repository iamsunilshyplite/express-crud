const express=require('express');
const bodyParser=require('body-parser')
const app=express();
const mysql=require('mysql');

const yup = require("yup");

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const conn=mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'',
    database:'test'
})

conn.connect((err)=>{
    if(err) throw err;
    console.log('Mysql Connected with App...')
});


app.get('/api/users',(req,res)=>{

    let fetchAllUsersQuery="select * from Users";
    handleQuery(fetchAllUsersQuery,res)
});


const linkSchema = yup.object({
    body: yup.object({
      name: yup.string().required(),
      email: yup.string().email().required(),
      phone: yup.string().required(),
    }),
  });

  const validate = (schema) => async (req, res, next) => {
    try {
      await schema.validate({
        body: req.body,
      });
      return next();
    } catch (err) {
      return res.status(500).json({ type: err.name, message: err.message });
    }
  };
  
app.post('/api/user', validate(linkSchema),(req,res)=>{
    let data={
        'name':req.body.name,
        'phone':req.body.phone,
        'email':req.body.email,
    };
    let userInsertQuery="Insert into users set ?";

    let query = conn.query(userInsertQuery, data,(err, results) => {
        if(err){
            res.send(apiErrorResponse(err))
        }
        res.send(apiSuccessResponse(results));
    });
})

app.get('/api/users/:id',(req,res)=>{
    let userGetQuery="Select * from users where id="+req.params.id
    handleQuery(userGetQuery,res)
});
app.put('/api/users/:id',(req,res)=>{
    let userUpdateQuery = "update users set name='"+req.body.name+"', phone='"+req.body.phone+"' where id="+req.params.id;
    handleQuery(userUpdateQuery,res)
});
app.delete('/api/users/:id',(req,res)=>{
    let userGetQuery="Delete from users where id="+req.params.id
    handleQuery(userGetQuery,res)
});

function handleQuery(sqlQuery,res){
    let query=conn.query(sqlQuery,(err,results)=>{
        if(err){
            res.send(apiErrorResponse(err))
        }
        res.send(apiSuccessResponse(results))
    })
}

function apiSuccessResponse(results){
    return {
        "status":200,
        "error":null,
        "result":results
    }
}

function apiErrorResponse(error){
    return {
        "status":500,
        "error":error,
        "result":null
    }
}

app.listen(3000,()=>{
    console.log("Server started on port 3000...")
});