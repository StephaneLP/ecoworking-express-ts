// const express = require('express')
import express from 'express'
import * as signController from '../controllers/sign.controller.ts'

const router = express.Router()

// router.route('/inscription')
//     .post(signController.signUp)

router.route('/authentification')
    .post(signController.signIn)

export default router