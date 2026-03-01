// const express = require('express')
import express from 'express'
import * as cityController from '../controllers/city.controller.ts'
import {authenticate, authorize} from '../middlewares/protect.ts'

const router = express.Router()

router.route('/')
    .get(cityController.readCities)
    .post(cityController.createCity)

router.route('/all/')
    .get(cityController.readAllCities)

router.route('/liste/')
    .get(cityController.readCityList)

router.route('/:id')    
    .get(authenticate, authorize(['superadmin', 'admin']), cityController.readCityById)
    .put(cityController.updateCityById)
    .delete(cityController.deleteCityById)

export default router