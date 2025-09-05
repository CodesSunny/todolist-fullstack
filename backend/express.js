const express = require('express');
const server = express();
const port = process.env.PORT || 3000;
const cors = require('cors');
server.use(cors());   //allow cross plateform 
const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, './data.json');
server.use(express.json());   //parse raw json into js object

let todosData = [];    //initialise array to hold tasks, this refers to ram memory not actual db

//read db on get request
server.get('/', (req,res)=>{
    const dbData = fs.readFileSync(filePath, 'utf8');     //string
    todosData = JSON.parse(dbData);         //js object    
    res.json(todosData);        //send response
})


//append data into db on post request
server.post('/', (req,res)=>{
    try {
        // 1 read/access db
    let dbData = fs.readFileSync(filePath, 'utf8');     //string
    todosData = JSON.parse(dbData);         //js object 

    //set id and get task name from req body
    const clientData = { id: Date.now(), task: req.body.newTask.trim()};   
    if(!clientData.task || typeof(clientData.task) !== 'string' || clientData.task == ""){
        return res.status(400).json({message: "bad request"});
    }

    //2 append new data to local array in memory
    todosData.push(clientData);

    //3 update array to db
    fs.writeFileSync(filePath, JSON.stringify(todosData), 'utf8');

    //4 send response new db data 
    res.json(todosData);

    } catch (error) {
        console.log(error );
        res.status(500).json({message: error.message || 'internal server error'})
    }
    
})


//delete task on delete request
server.delete('/:id', (req, res)=>{

    // Extract the task ID from req.params.id
    const taskId = Number(req.params.id);   //string to number

    // Read the current data from the JSON file
    let dbData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    //seperate all data except deleted one
    dbData = dbData.filter(data => data.id !== taskId); 
    
    //update memory array
    todosData = dbData;    

    // update db
    fs.writeFileSync(filePath, JSON.stringify(todosData), 'utf8');
    
    //send response with updated db data 
    res.json(todosData);
    
})


//edit task on patch request
server.patch('/:id', (req,res)=>{
    try {
         // 1read existing db data
        let dbData = fs.readFileSync(filePath, 'utf8');     //string
        todosData = JSON.parse(dbData);        

        //2. find same task in array with id and update without changing id
        const editId = Number(req.params.id);
        const editIndex = todosData.findIndex(item => item.id === editId)  //get index of editing task

        const clientData = {id : editId, task : req.body.editedTask.trim()}; 
        if(!clientData || clientData.task === "" || typeof(clientData.task) !== "string"){
           return res.status(400).json({"message" : "bad request"});
        }

        todosData[editIndex] = clientData;   //update array 

        
        //4. write back array data to db
        fs.writeFileSync(filePath, JSON.stringify(todosData),'utf8');

        //5. send response with updated db data
        res.json( todosData);
        
    } catch (err ) {
        console.log("error occured: ", err  );
        res.status(500).json({message: "internal server error"});
    }

})





server.listen(port, ()=> console.log(`application listening on port no ${port}`)
);
