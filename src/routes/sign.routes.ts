// const express = require('express')
import express from 'express'
const router = express.Router()
import * as signController from '../controllers/sign.controller.ts'

// router.route('/inscription')
//     .post(signController.signUp)

router.route('/authentification')
    .post(signController.signIn)

export default router