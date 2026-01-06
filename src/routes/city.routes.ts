// const express = require('express')
import express from 'express'
const router = express.Router()
import * as cityController from '../controllers/city.controller.ts'
// const {authenticate, authorize} = require('../middlewares/protect')

router.route('/')
    .get(cityController.readCities)
    .post(cityController.createCity)

router.route('/liste/')
    .get(cityController.readCityList)

router.route('/:id')    
    .get(cityController.readCityById)
//     .get(authenticate, authorize(['superadmin','admin']), cityController.readCityById)
    .put(cityController.updateCityById)
    .delete(cityController.deleteCityById)

export default router