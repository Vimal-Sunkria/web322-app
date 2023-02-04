/*********************************************************************************
*  WEB322 – Assignment 02
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Vimal Sunkria Student ID:  158576215 Date: 03-02-2023
*
*  Online (Cyclic) Link: 
*
********************************************************************************/ 

var express = require("express");
var app = express();
var path= require("path");
var dataService = require("./data-service.js");

const PORT = process.env.PORT || 8080;

function onHttpStart() {

    console.log("Express http server listening on "+ PORT);
    return new Promise(function(reslove, reject){
        dataService.initialize().then(function(value){
            console.log(value);
        }).catch(function(reason){
                console.log(reason);
            });
    });

}
  


app.use(express.static('public'));

app.get("/", function(req, res){
    res.sendFile(path.join(__dirname, "/views/home.html"));
});

app.get("/about", function(req, res){
    res.sendFile(path.join(__dirname, "/views/about.html"));
});


app.get("/students", function(req, res){
    dataService.getAllStudents().then((data)=>{
        res.json(data);
    }).catch((error)=>{
        res.json({message, error})
    });
    
});

app.get("/InternationalStudents", function(req,res){
   
   dataService.getInternationalStudents().then(function(data){
        res.json(data);
   }).catch(function(err){
       res.json({message: err});
   });

 
 });


app.get("/programs", function(req,res){
    
    dataService.getPrograms().then(function(data){
        res.json(data);
    }).catch(function(err){
        res.json({message: err});
    });
   
});

app.use(function(req, res){
    res.status(404).send("PAGE NOT FOUND!!!!!!!!!!!");
});

app.listen(PORT, onHttpStart);


