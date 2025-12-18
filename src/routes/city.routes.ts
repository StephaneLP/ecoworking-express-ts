// const express = require('express')
import express from 'express'
const router = express.Router()
import { readCities } from '../controllers/city.controller.ts'
// const {authenticate, authorize} = require('../middlewares/protect')

router.route('/')
    .get(readCities)
//     .post(cityController.createCity)

// router.route('/liste/')
//     .get(cityController.readCityList)

// router.route('/:id')    
//     .get(authenticate, authorize(['superadmin','admin']), cityController.readCityById)
//     // .get(cityController.readCityById)
//     .delete(cityController.deleteCityById)
//     .put(cityController.updateCityById)

export default router