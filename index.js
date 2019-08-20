const express = require("express");
const next = require("next");
const dev = process.env.NODE_ENV !== 'production';
const app = next({dev});
const handle = app.getRequestHandler();


app.prepare().then(()=>{
  const server = express();

  server.get("*",(req, res)=>{
    return handle(req,res);
  })

  server.get("/i",(req, res)=>{
    res.send("hedsfdsds");
  })
  
  server.listen(8000,function(){
    console.log("Server start at port http://localhost:8000");
    
  })  
})
