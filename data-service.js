

var students = [];
var programs =[];
const fs = require('fs');

module.exports.initialize =function (){
     
    return new Promise(function(resolve, reject){
        try{
            fs.readFile('./data/students.json', (err, data)=>{
                if(err) throw err;
                students = JSON.parse(data);
            });
            fs.readFile('./data/programs.json', (err, data)=>{
                if(err) throw err;
                programs = JSON.parse(data);
            });
        }catch(ex){
            reject('Unable to read file!');
        }
        resolve("")
    });

}




module.exports.getAllStudents = function(){
    var Allstudents =[];
    return new Promise((resolve, reject)=>{
        for(var i=0; i<students.length; i++){
            Allstudents.push(students[i]);
        }
        if(Allstudents.length ==0)
            reject("No result returned");
        resolve(Allstudents);
    });

};

module.exports.getInternationalStudents= function(){
    var InternationalStudentsArray =[];
    return new Promise(function(resolve, reject){
        for(var i=0; i<students.length; i++){
           if(students[i].isInternationalStudent ==true){
            InternationalStudentsArray.push(students[i]);
           }
                
        }
        if(InternationalStudentsArray.length ==0)
            reject("No result returned");
        resolve(InternationalStudentsArray);
    });
};


module.exports.getPrograms= function(){
   
    return new Promise(function(resolve, reject){
       if(programs.length ==0){
           reject('No results returned!')
       }else{
           resolve(programs);
       }
    });
};

