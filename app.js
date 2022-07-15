
const express = require('express');
const bodyParser = require('body-parser');
const date = require(__dirname + '/date.js');
const mongoose = require('mongoose');
const alert = require('alert');
const _ = require('lodash');

mongoose.connect('mongodb+srv://gbengarock:temi1989@gbengarock.dxlti9d.mongodb.net/todolistDB');

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(express.static('public'));

const itemsSchema = new mongoose.Schema({
  name: {
    type: String,
  }
});

const Item = mongoose.model('Item', itemsSchema);


const items = [];

const listSchema = new mongoose.Schema({
  name: {
    type: String,
    },
  items: [itemsSchema]
});

const List = mongoose.model('List', listSchema);



app.get('/', function(req, res){
  
  let day = date();
  Item.find({}, (function(err, foundItems){
    if (err){
      console.log(err);
    } else {
      res.render('list', {
        kindOfList : day,
        newListItems : foundItems
      })}}
  ));
  
  
  });


app.post('/', function(req, res){
  let itemName = req.body.newItem;
  let listName = req.body.list;
  let day = date();

  if (itemName === ""){
    alert("Fiels cannot be empty. Enter new todo");
    return false;
  }
  const item = new Item({
    name: itemName
  });

  if (listName === day){
    item.save();
    res.redirect('/')
  } else {
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect('/' + listName)
    })
  }
  
  })

  app.post('/delete', function(req, res){
    const checkedList = req.body.checkedList;
    const listName = req.body.listName;
    let day = date();

    if (listName === day){
      Item.findByIdAndRemove(checkedList, function(err){
        if (!err){
          res.redirect('/')
      }})
    } else {
      List.findOneAndUpdate({name: listName}, {$pull: {items: {_id:checkedList}}}, function(err, foundList){
        if (!err){
          res.redirect('/' + listName)
      }})

    
  }})
    
     

app.get('/:categoryList', function(req, res){
  let paramList = _.capitalize(req.params.categoryList);
 
    List.findOne({name: paramList}, function(err, foundList){
      if(!err){
        if (!foundList){
          const list = new List({
            name: paramList,
            items: []
          });
      
          list.save();
          
          res.render('/' + paramList)
        }else {
          res.render('list', {
            kindOfList: foundList.name,
            newListItems: foundList.items
          })
        }
        }
    })
    })
    


app.listen(3000, function(){
  console.log('server running on port 3000');
})
