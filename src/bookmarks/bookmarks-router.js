const express = require('express')
const uuid = require('uuid/v4')
const { bookmarks } = require('../store')
const logger = require('../logger')

const bookmarksRouter = express.Router();
const bodyParser = express.json();

bookmarksRouter
    .route('/bookmarks')
    .get((req, res) =>{
        res
            .json(bookmarks);
    })
    .post(bodyParser, (req, res) =>{
        const { title, url, rating=1, desc='' } = req.body;

        if (!title) {
            logger.error(`Title is required`);
            return res
              .status(400)
              .send('Invalid data');
          }
          
          if (!url) {
            logger.error(`URL is required`);
            return res
              .status(400)
              .send('Invalid data');
          }

          if (!url.includes('www') || !url.includes('http') ) {
            logger.error(`URL is invalid`);
            return res
              .status(400)
              .send('Invalid data');
          }

          const id = uuid();

          const bookmark = {
            id,
            title,
            url,
            rating,
            desc
          };

          bookmarks.push(bookmark);

          logger.info(`Bookmark with id ${id} created`);

          res 
          .status(201)
          .location(`http://localhost:8000/bookmarks/${id}`)
          .json(bookmark);
    });

    bookmarksRouter
    .route('/bookmarks/:id')
    .get((req, res) =>{
        const { id } = req.params;
        const bookmark = bookmarks.find(c => c.id == id);
  
        if (!bookmark) {
        logger.error(`Bookmark with id ${id} not found.`);
        return res
            .status(404)
            .send('Bookmark Not Found');
        }
        res.json(bookmark);
    })
    .delete(bodyParser, (req, res) =>{
        const { id } = req.params;
        const bookmarkIndex = bookmarks.findIndex(bookmark => bookmark.id == id);

        if (bookmarkIndex === -1) {
            logger.error(`Bookmark with id ${id} not found.`);
            return res
              .status(404)
              .send('Not found');
          }

          bookmarks.splice(bookmarkIndex, 1);

            
        logger.info(`Bookmark with id ${id} deleted.`);
    
        res
        .status(204)
        .end();

    });

    module.exports = bookmarksRouter