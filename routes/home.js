const express=require('express');
const router = require('express').Router(); 
const{home}=require('../controllers/homeController');
router.route('/login').get(home);
module.exports=router;