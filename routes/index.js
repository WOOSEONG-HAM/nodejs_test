const { response } = require('express');
const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
// const { isLoggedIn, isNotLoggedIn } = require('./middlewares.js');
const { USERS, BOARD } = require('../models');

const router = express.Router();

/* 화면 출력 */

router.get('/', (req, res, next) => {
    
  res.render('login/login', { title:'로그인' });

}); // 로그인 화면 출력

router.get('/login', (req, res, next) => {
    
  res.render('login/login', { title:'로그인' });

}); // 로그인 화면 출력

router.get('/board/write', (req, res, next) => {

  let userId = req.session.passport.user;  
  res.render('board/write', { title:'게시글작성', userId: userId });

}); // 게시글작성 

router.get('/board/read/:id', function(req, res, next) {
  let rows;
  let userId = req.session.passport.user;  
  try {
    const readItem = BOARD.findAll({
      where: { id: req.params.id }
    })
    .then(response => {
      rows = response;
      res.render('board/read', { title:'상세보기', rows, userId });
    })
    .catch((err) => { return res.status(500).json(err) })
  }
  catch (e) {
    next(e);
  }
}); //게시글 상세보기

router.get('/board/update/:id', function(req, res, next) {
  let rows;
  try {
    const readItem = BOARD.findAll({
      where: { id: req.params.id }
    })
    .then(response => {
      rows = response;
      res.render(`board/update`, { title:'수정하기', rows: rows }); // view 디렉토리에 있는 list 파일로 이동합니다.
    })
    .catch((err) => { return res.status(500).json(err) })
  }
  catch (e) {
    next(e);
  }
}) //게시글수정

/* 회원가입 API */

router.post('/api/register', async (req, res, next) => {
  
    const { userId, password, name } = req.body;

    try {
      const userCheck = await USERS.findOne({ where: { userId } });
      if(userCheck){
        req.flash('registerError', '이미 존재하는 아이디입니다.');
        return res.redirect('/login');
      }
      const hash = await bcrypt.hash(password, 12);
      await USERS.create({
        userId,
        name,
        password: hash,
      });
      return res.redirect('/login');
    } catch (error) {
      return next(error);
    }
}) // 회원가입

/* 로그인, 로그아웃 API */

router.post('/api/login', (req, res, next) => {
  passport.authenticate('local', (authError, user, info) => {
    if (authError) {
      console.error(authError);
      return next(authError);
    }
    if (!user) {
      req.flash('loginError', info.message);
      return res.redirect('/login');
    }
    return req.login(user, (loginError) => {
      if (loginError) {
        console.error(loginError);
        return next(loginError);
      }
      return res.redirect('/api/board/list');
    });
  })(req, res, next);
});

router.get('/api/logout', (req, res) => {
  req.logout();
  req.session.destroy();
  res.redirect('/');
});

/* 게시글 관련 API */

router.get('/api/board/list', async function(req, res, next) {
  let rows;
  try {
    const list = BOARD.findAll()
    .then(response => {
      rows = response;
      res.render('board/list', { title:'게시판 목록', rows: rows }); // view 디렉토리에 있는 list 파일로 이동합니다.
    })
    .catch((err) => { return res.status(500).json(err) })
  } catch (e) {
    next(e);
  }
});

router.post('/api/board/write', function(req, res, next) {
  console.log('생성완료', req.body.title);
  BOARD.create({
    userId: req.body.writer,
    writer: req.body.writer,
    password: req.body.password,
    title: req.body.title,
    content: req.body.content,
    hit: 0,
  })
  .then(
    res.redirect('/api/board/list')
  )
  .catch((err) => { return res.status(500).json(err) })
}) //게시글작성


router.post('/update/:id', function(req, res, next) {
  BOARD.update({
    title: req.body.title,
    content: req.body.content,
    password: req.body.password,
  },{ 
    where: { id: req.params.id } 
  })
  .then(
    res.redirect('/api/board/list')
  )
  .catch((err) => { return res.status(500).json(err) })
}) //게시글수정

router.get('/delete/:id', function(req, res, next) {
  BOARD.destroy({
    where: {id: req.params.id }
  })
  .then( result => {
    res.redirect("/api/board/list");
  })
  .catch((err) => { return res.status(500).json(err) })
}) //게시글삭제

module.exports = router;